// notification.service.ts

import { getIO } from "../socket/socket";

export const sendNotification = (
  userId: string,
  data: any
) => {
  const io = getIO();

  io.to(userId).emit("notification", data);
};

// sendNotification(userId, {
//   title: "Order Placed",
//   message: "Your order is confirmed"
// });