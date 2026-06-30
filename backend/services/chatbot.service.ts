import Product from "../models/product.model";
import Order from "../models/order.model";

/**
 * Interface representing the chatbot response payload.
 */
interface ChatbotResponse {
  reply: string;
  isAi: boolean; // Indicates if the response came from the Gemini AI or the fallback rule engine
}

/**
 * ChatbotService handles the processing of messages sent to the AI chatbot.
 * It integrates with the Google Gemini API using pure HTTP requests (avoiding package compilation issues)
 * and falls back to a smart, contextual database-querying rule engine if the API key is not configured.
 */
export class ChatbotService {

  /**
   * Processes the user message and generates an appropriate response.
   * 
   * @param userId The ID of the authenticated user sending the message.
   * @param userMessage The text message input by the user.
   * @returns A promise resolving to a ChatbotResponse containing the reply.
   */
  public static async getChatbotResponse(userId: string, userMessage: string): Promise<ChatbotResponse> {
    try {
      // 1. Fetch data from database to populate context for either Gemini or Fallback Engine
      const activeProducts = await Product.find({ isDeleted: false, status: "ACTIVE" }).limit(10);
      const userOrders = await Order.find({ user: userId }).sort({ createdAt: -1 }).limit(5);

      const apiKey = process.env.GEMINI_API_KEY;

      // If Gemini API Key exists, we use the generative AI endpoint
      if (apiKey && apiKey.trim() !== "" && apiKey !== "your_key") {
        return await this.callGeminiAPI(apiKey, userId, userMessage, activeProducts, userOrders);
      }

      // If no API Key is provided, use our smart database-connected local rule engine fallback
      return this.processLocalRuleEngine(userMessage, activeProducts, userOrders);
    } catch (error: any) {
      console.error("ChatbotService Error:", error);
      return {
        reply: `I encountered an error trying to process your request: ${error.message || error}. Please try again later.`,
        isAi: false
      };
    }
  }

  /**
   * Sends a request to the Google Gemini API with system instructions and user context.
   */
  private static async callGeminiAPI(
    apiKey: string,
    userId: string,
    userMessage: string,
    products: any[],
    orders: any[]
  ): Promise<ChatbotResponse> {

    // Construct rich context about available products
    const productContext = products.map(p =>
      `- ${p.name} (SKU: ${p.sku}, Price: ₹${p.price}, Stock: ${p.stock}, Desc: ${p.shortDescription || p.description})`
    ).join("\n");

    // Construct rich context about user orders
    const orderContext = orders.length > 0
      ? orders.map(o =>
        `- Order #${o.orderNumber}: Status=${o.orderStatus}, Payment=${o.paymentStatus}, Total=₹${o.totalAmount}, Date=${new Date(o.createdAt).toLocaleDateString()}, Items=${o.items.map((i: any) => `${i.name} (x${i.quantity})`).join(", ")}`
      ).join("\n")
      : "No previous orders placed yet.";

    // Detailed system prompt that instructs Gemini on how to behave, what store data exists, and limits it to store assistance.
    const systemPrompt = `You are a professional, helpful e-commerce customer support chatbot for our store.
You have real-time access to the store's products and the customer's order history.

Customer User ID: ${userId}
Current Date/Time: ${new Date().toLocaleString()}

STORE PRODUCTS CATALOG:
${productContext}

CUSTOMER ORDER HISTORY:
${orderContext}

CRITICAL RULES:
1. Be concise, friendly, and professional. Keep messages compact for a chat window.
2. Use formatting (bolding, bullet points) to make items readable.
3. If the user asks about their order, retrieve and explain the status of the order from their history.
4. If the user wants to buy or searches for products, recommend items from the Catalog. Link names and detail prices in ₹.
5. If a product is out of stock (Stock = 0), mention it politely and recommend another product.
6. Do NOT answer questions unrelated to the store or customer support. Politely steer the conversation back.
7. Always speak in Indian Rupees (₹).`;

    // Construct Gemini contents array
    const requestBody = {
      systemInstruction: {
        parts: [
          {
            text: systemPrompt
          }
        ]
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: userMessage
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500
      }
    };

    // We call the API using a standard POST request
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API responded with status ${response.status}: ${errText}`);
    }

    const data = await response.json();

    // Parse response text from Gemini
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText) {
      throw new Error("Empty response received from Gemini API");
    }

    return {
      reply: replyText.trim(),
      isAi: true
    };
  }

  /**
   * Processes the user message using a smart keyword rule engine that queries the DB.
   * This provides a seamless customer service fallback out-of-the-box.
   */
  private static processLocalRuleEngine(userMessage: string, products: any[], orders: any[]): ChatbotResponse {
    const msgLower = userMessage.toLowerCase().trim();

    // 1. Handle Greetings
    if (msgLower.match(/\b(hi|hello|hey|greetings|hola|good morning|good afternoon)\b/)) {
      return {
        reply: `👋 Hello! I am your store assistant. I can help you search for products, track your orders, or answer general questions.
        
How can I help you today? You can try typing **"track orders"** or **"search products"**!`,
        isAi: false
      };
    }

    // 2. Handle Order Queries
    if (msgLower.includes("order") || msgLower.includes("status") || msgLower.includes("track") || msgLower.includes("ship")) {
      if (orders.length === 0) {
        return {
          reply: `📦 **Order Tracking**
          
It looks like you haven't placed any orders yet. Visit our Shop tab to find something you like, add it to your cart, and complete the checkout!`,
          isAi: false
        };
      }

      // Check if user is asking about a specific order number in their message
      const specificOrderMatch = userMessage.match(/O-\d+/i);
      if (specificOrderMatch) {
        const orderNumber = specificOrderMatch[0].toUpperCase();
        const foundOrder = orders.find(o => o.orderNumber === orderNumber);

        if (foundOrder) {
          return {
            reply: `🔍 **Order Status: ${foundOrder.orderNumber}**
- **Date Placed:** ${new Date(foundOrder.createdAt).toLocaleDateString()}
- **Items:** ${foundOrder.items.map((i: any) => `${i.name} (Qty: ${i.quantity})`).join(", ")}
- **Payment Status:** **${foundOrder.paymentStatus}** (${foundOrder.paymentMethod})
- **Shipping Status:** **${foundOrder.orderStatus}**
- **Total Amount:** ₹${foundOrder.totalAmount.toLocaleString()}

*Need more details? Feel free to ask!*`,
            isAi: false
          };
        }
      }

      // General orders listing
      let reply = `📦 **Your Recent Orders:**\n\n`;
      orders.forEach((o, index) => {
        reply += `**${index + 1}. Order #${o.orderNumber}**\n`;
        reply += `- **Date:** ${new Date(o.createdAt).toLocaleDateString()}\n`;
        reply += `- **Status:** **${o.orderStatus}** | Payment: **${o.paymentStatus}**\n`;
        reply += `- **Items:** ${o.items.map((i: any) => `${i.name} (x${i.quantity})`).join(", ")}\n`;
        reply += `- **Total:** ₹${o.totalAmount.toLocaleString()}\n\n`;
      });
      reply += `*Tip: Type the specific order number (e.g. "O-12345") to inspect it closer.*`;

      return {
        reply,
        isAi: false
      };
    }

    // 3. Handle Product Catalog Queries / Search
    if (msgLower.includes("product") || msgLower.includes("search") || msgLower.includes("recommend") || msgLower.includes("buy") || msgLower.includes("catalog") || msgLower.includes("item")) {
      // Extract search terms (words other than standard commands)
      const searchTerms = msgLower
        .replace("search", "")
        .replace("product", "")
        .replace("products", "")
        .replace("recommend", "")
        .replace("buy", "")
        .replace("for", "")
        .trim();

      let matchedProducts = products;

      // Filter products based on search keyword if provided
      if (searchTerms.length > 2) {
        matchedProducts = products.filter(p =>
          p.name.toLowerCase().includes(searchTerms) ||
          p.description.toLowerCase().includes(searchTerms)
        );
      }

      if (matchedProducts.length === 0) {
        return {
          reply: `🔍 No products matching **"${searchTerms}"** were found in our active catalog. 
          
Here are some of our popular items instead:\n\n` +
            products.slice(0, 3).map(p => `- **${p.name}** - ₹${p.price.toLocaleString()} (${p.stock > 0 ? "In Stock" : "Out of Stock"})`).join("\n"),
          isAi: false
        };
      }

      let reply = `🔍 **Recommended Products:**\n\n`;
      matchedProducts.slice(0, 4).forEach(p => {
        reply += `🛍️ **${p.name}**\n`;
        reply += `- **Price:** ₹${p.price.toLocaleString()}\n`;
        reply += `- **Status:** ${p.stock > 0 ? `🟢 In Stock (${p.stock} available)` : "🔴 Out of Stock"}\n`;
        if (p.shortDescription || p.description) {
          reply += `- **About:** ${p.shortDescription || p.description.slice(0, 80)}...\n`;
        }
        reply += `\n`;
      });

      return {
        reply: reply + `*Check them out on the main shop screen!*`,
        isAi: false
      };
    }

    // 4. Handle Help/Support Queries
    if (msgLower.includes("help") || msgLower.includes("support") || msgLower.includes("menu") || msgLower.includes("do for me")) {
      return {
        reply: `ℹ️ **How can I help you?**
        
I am a chatbot trained to assist you. Here are some options:
1. **Track Orders**: Type **"track orders"** or **"order status"** to review your recent purchases.
2. **Search Products**: Type **"search <keyword>"** or **"recommend products"** to view items from our store.
3. **Contact Support**: Type **"contact"** to get our customer service details.
4. **General Chat**: Type any greeting like **"hello"** to start over.

*(Tip: You can add 'GEMINI_API_KEY' to the '.env' file to enable conversational AI!)*`,
        isAi: false
      };
    }

    // 5. Handle Contact / Policies Info
    if (msgLower.includes("contact") || msgLower.includes("support") || msgLower.includes("email") || msgLower.includes("phone")) {
      return {
        reply: `📞 **Customer Support**
        
Need human support? You can reach us at:
- **Email:** support@example.com (Responds in 24 hours)
- **Phone:** 1-800-E-COMMERCE (Mon-Fri 9am - 5pm IST)
- Or visit our address directory using the **Addresses** tab in the main navigation.`,
        isAi: false
      };
    }

    // 6. Default Fallback
    return {
      reply: `🤖 **Store Assistant**
      
I'm here to help you shop! Try typing:
- **"track orders"** to view your order history.
- **"search products"** to browse our products.
- **"contact support"** for email/phone details.

*(Note: Add the \`GEMINI_API_KEY\` variable in the backend \`.env\` file to enable natural language chat!)*`,
      isAi: false
    };
  }
}
