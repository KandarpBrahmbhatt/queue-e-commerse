import { Request, Response } from "express"
import Order from "../models/order.model"


export const assignDeliveryPerson = async (req: any, res: any) => {
  try {
    const { orderId, deliveryPersonId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.deliveryPerson = deliveryPersonId;
    order.orderStatus = "SHIPPED";

    order.trackingHistory.push({
      status: "SHIPPED",
      updatedAt: new Date(),
    });

    await order.save();

    return res.status(200).json({
      message: "Delivery person assigned",
      data: order,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};


export const updateOrderStatus = async (req: any, res: any) => {
  try {
    const { orderId, status } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;

    order.trackingHistory.push({
      status,
      updatedAt: new Date(),
    });

    await order.save();

    return res.status(200).json({
      message: "Order status updated",
      data: order,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};