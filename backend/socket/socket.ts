
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { ChatbotService } from "../services/chatbot.service";

let io: Server;

/**
 * Initializes the Socket.IO server and registers event handlers for connections.
 * 
 * @param server The HTTP server instance to bind Socket.IO to.
 */
export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  // SOCKET AUTHENTICATION MIDDLEWARE
  // Validates incoming client socket connections using their JWT token.
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) return next(new Error("No token provided"));

    try {
      // Verify token signature against JWT secret
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as any;

      // Extract userId from token payload (which is stored under 'userId' key)
      // and attach it to socket.data.user for subsequent event handlers.
      socket.data.user = {
        id: decoded.userId || decoded.id,
        role: decoded.role || "user"
      };

      next();
    } catch (err) {
      console.error("Socket authentication error:", err);
      return next(new Error("Authentication failed"));
    }
  });

  // CONNECTION LIFECYCLE EVENT HANDLER
  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    const userId = socket.data.user.id;

    // Join a private socket room named after the user's ID.
    // This allows targetting specific clients via: io.to(userId).emit(...)
    socket.join(userId);

    // Join admin room if the user is an admin.
    if (socket.data.user.role === "admin") {
      socket.join("admin-room");
    }

    // CHAT MESSAGE HANDLER
    // Handles client messaging, routing user-to-user chat and user-to-chatbot chat.
    socket.on("send-message", async (data) => {
      // Intercept message if it is addressed to the AI Chatbot module
      if (data.receiverId === "ai-chatbot") {
        try {
          // 1. Emit typing event back to client to show the bot is formulating a reply
          socket.emit("typing", { senderId: "ai-chatbot", isTyping: true });

          // 2. Fetch conversational / database response from the Chatbot Service
          const botResult = await ChatbotService.getChatbotResponse(userId, data.message);

          // 3. Turn off typing indicator
          socket.emit("typing", { senderId: "ai-chatbot", isTyping: false });

          // 4. Send the response message back to the user room
          socket.emit("receive-message", {
            senderId: "ai-chatbot",
            receiverId: userId,
            message: botResult.reply,
            isAi: botResult.isAi,
            createdAt: new Date().toISOString()
          });
        } catch (error) {
          console.error("Chatbot socket message error:", error);
          socket.emit("typing", { senderId: "ai-chatbot", isTyping: false });
          socket.emit("receive-message", {
            senderId: "ai-chatbot",
            receiverId: userId,
            message: "Sorry, I am having trouble connecting to my brain right now.",
            isAi: false,
            createdAt: new Date().toISOString()
          });
        }
      } else {
        // Forward standard peer-to-peer messages to their designated recipient room
        socket.to(data.receiverId).emit(
          "receive-message",
          data
        );
      }
    });

    // TYPING STATE HANDLER
    // Broadcasts user's typing activity to the recipient.
    socket.on("typing", (data) => {
      if (data.receiverId !== "ai-chatbot") {
        socket.to(data.receiverId).emit(
          "typing",
          data
        );
      }
    });

    // DISCONNECT EVENT HANDLER
    socket.on("disconnect", () => {
      console.log("User Disconnected:", socket.id);
    });
  });
};

export const getIO = () => io;