import { Request, Response } from "express"
import Order, { OrderStatus } from "../models/order.model"


export const assignDeliveryPerson = async (req: any, res: any) => {
  try {
    const { orderId, deliveryPersonId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.deliveryPerson = deliveryPersonId;
    order.orderStatus = OrderStatus.SHIPPED;

    order.trackingHistory.push({
      status: OrderStatus.SHIPPED,
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

    order.orderStatus = status as OrderStatus;

    order.trackingHistory.push({
      status: status,
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


export const getOrderTracking = async (req: any, res: any) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("deliveryPerson", "name email")
      .select("status trackingHistory deliveryPerson");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({
      message: "Tracking fetched",
      data: order,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};