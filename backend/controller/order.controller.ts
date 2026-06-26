import { Request, Response } from 'express'
import Order, { OrderStatus, ReplacementStatus, ReturnStatus } from '../models/order.model'
import { Cart } from '../models/card.model'
import User, { AuthRequest } from '../models/user.model'
import Coupon from '../models/coupan.model'
import { orderEmailQueue } from '../queue/order.queue'
import mongoose from 'mongoose'

export const createOrder = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId
        const { shippingAddress, paymentMethod, couponCode } = req.body // Extracted from request body (added by AI assistant)

        // const cart = await Cart.findOne({ userId })
        const cart = await Cart.findOne({ user: userId })
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "cart is empty " })
        }

        let subtotal = 0

        for (const item of cart.items) {
            subtotal += item.price * item.quantity
        }

        let discountAmount = 0;
        let totalAmount = subtotal;

        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
            if (coupon) {
                if (subtotal >= coupon.minOrderValue) {
                    if (coupon.discountType === "percentage") {
                        discountAmount = (subtotal * coupon.discountValue) / 100;
                    } else {
                        discountAmount = coupon.discountValue;
                    }
                    discountAmount = Math.min(discountAmount, subtotal);
                    totalAmount = subtotal - discountAmount;
                }
            }
        }

        const orderNumber = `ORD-${Date.now()}`;

        // Map incoming frontend address properties (mobile, pincode) to match the Order schema (phoneNumber, postalCode)
        let mappedAddress = undefined
        if (shippingAddress) {
            mappedAddress = {
                fullName: shippingAddress.fullName,
                phoneNumber: shippingAddress.phoneNumber || shippingAddress.mobile,
                addressLine1: shippingAddress.addressLine1,
                addressLine2: shippingAddress.addressLine2,
                city: shippingAddress.city,
                state: shippingAddress.state,
                postalCode: shippingAddress.postalCode || shippingAddress.pincode,
                country: shippingAddress.country || 'India'
            }
        }

        const order = await Order.create({
            user: userId,
            items: cart.items,
            subtotal: subtotal,
            discountAmount: discountAmount,
            totalAmount: totalAmount,
            orderNumber,
            shippingAddress: mappedAddress, // Saved shipping address (added by AI assistant)
            paymentMethod: paymentMethod || 'CARD' // Saved payment method or default (added by AI assistant)
        })

        cart.items = []
        await cart.save()

        // await orderEmailQueue.add(
        //     "order-confirmation",
        //     {
        //         orderId: order._id,
        //         userId,
        //     },
        //     {
        //         attempts: 3,
        //         backoff: {
        //             type: "exponential",
        //             delay: 5000,
        //         },
        //     }
        // );
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        await orderEmailQueue.add(
            "order-confirmation",
            {
                email: user.email,
                name: user.name,
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount,
            },
            {
                attempts: 3,

                backoff: {
                    type: "exponential",
                    delay: 5000,
                },
            }
        );
        console.log("User Data:", user);

        console.log("User Email:", user.email);

        console.log("User Name:", user.name);
        return res.status(201).json({ message: "Order created", order })
    } catch (error) {
        console.log(`create order error ${error}`)

        return res.status(500).json({ message: "order created error", error })
    }
}


export const getOrder = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 10

        const skip = ((page - 1) * limit)

        const order = await Order.find()
            .populate("user", "name email")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })

        if (!order) {
            return res.status(400).json({ message: "order not foubd" })
        }

        return res.status(200).json({ messsage: "getting order successfully", order })
    } catch (error) {
        console.log(`getOrder error ${error}`)
        return res.status(500).json({ message: "gettiing order error", error })
    }
}

export const getCuurentUserOrder = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId
        const order = await Order.find({ user: userId }).sort({ createdAt: -1 })

        if (!order || order.length === 0) {
            return res.status(200).json({ message: "order not found", order: [] })
        }
        return res.status(200).json({ message: "getCurrentUserOrder successfully", order })

    } catch (error) {
        console.log(`getCurrentUserOrder error ${error}`)
        return res.status(500).json({ message: "getCurrentUserOrder successfully", error })
    }
}


export const cancelOrder = async (req: AuthRequest, res: Response) => {
    try {
        const { orderId } = req.params

        if (!orderId) {
            return res.status(400).json({ message: "order not found invalid orderId" })
        }

        const order = await Order.findById(orderId)

        if (!order) {
            return res.status(400).json({ message: "order not found" })
        }

        // Customer can cancel only their own order
        if (order.user.toString() !== req.user?.userId) {
            return res.status(403).json({ message: "Unauthorized" })
        }

        // Already cancelled
        if (order.orderStatus === "CANCELLED") {
            return res.status(400).json({ message: "orderCanceled alredat cancelled" })
        }

        //  Cannot cancel after shipping

        const blockStatus = [
            "SHIPPED",
            "DELIVERD",
        ]

        if (blockStatus.includes(order.orderStatus)) {
            return res.status(400).json({ message: "order cannot be cancelled now" })
        }

        const orderTime = new Date(order.createdAt).getTime()
        const now = Date.now()

        const DiffMinutes = (now - orderTime) / (1000 * 60)
        //  order can cancel 30 minute after than order can not ableto cancel
        if (DiffMinutes > 30) {
            return res.status(400).json({ message: "Canecelltion time expire" })
        }

        order.orderStatus = OrderStatus.CANCELLED;
        await order.save()


        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            data: order,
        });
    } catch (error) {
        console.log(`cancelOrder error ${error}`)
        return res.status(500).json({ message: "Order cancelled error" });
    }
}

export const requestReturn = async (req: AuthRequest, res: Response) => {
    try {
        const { orderId } = req.params
        const { reason } = req.body

        const order = await Order.findById(orderId)

        if (!order) {
            return res.status(400).json({ message: "order not found" })
        }

        if (order.orderStatus !== OrderStatus.DELIVERD) {
            return res.status(400).json({ message: "Only delivery order can be returned" })
        }

        const diffDays = (Date.now() - new Date(order.deliveredAt!).getTime()) / (1000 * 60 * 60 * 24);

        if (diffDays > 7) {
            return res.status(400).json({ message: "Return window expired (7 days)" });
        }

        order.returnStatus = ReturnStatus.REQUESTED
        order.returnReason = reason

        await order.save()

        return res.status(200).json({ message: "requestResturn successfully", order })
    } catch (error: any) {
        console.log(`requestReturn error ${error}`)
        return res.status(500).json({ message: "requestResturn error", error: error.message })

    }
}

export const requestReplacement = async (req: AuthRequest, res: Response) => {
    try {
        const { orderId } = req.params;
        const { reason } = req.body;
        // const userId = req.user?.userId;

        const order = await Order.findById(orderId);

        if (!order) return res.status(404).json({ message: "Order not found" });

        // if (order.user.toString() !== userId)
        //     return res.status(403).json({ message: "Unauthorized" });

        if (order.orderStatus !== OrderStatus.DELIVERD) {
            return res.status(400).json({ message: "Only delivered orders can be replaced" });
        }

        const diffDays =(Date.now() - new Date(order.deliveredAt!).getTime()) /(1000 * 60 * 60 * 24);

        if (diffDays > 7) {
            return res.status(400).json({ message: "Replacement window expired" });
        }

        order.replacementStatus = ReplacementStatus.REQUESTED;
        order.replacementRequestedAt = new Date();
        order.replacementReason = reason;

        await order.save();

        return res.json({
            success: true,
            message: "Replacement request submitted"
        });

    } catch (error) {
        return res.status(500).json({ message: "Server error", error });
    }
};

export const getaggragationOrder = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const userObjectId = new mongoose.Types.ObjectId(userId);

        const orders = await Order.aggregate([
            {
                $match: {
                    user: userObjectId,
                },
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
            {
                $facet: {
                    orders: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                orderNumber: 1,
                                totalAmount: 1,
                                orderStatus: 1,
                                paymentStatus: 1,
                                createdAt: 1,
                                itemCount: {
                                    $size: "$items",
                                },
                            },
                        },
                    ],
                    total: [
                        {
                            $count: "count",
                        },
                    ],
                },
            },
        ]);

        return res.json({
            success: true,
            data: orders[0].orders,
            total: orders[0].total[0]?.count || 0,
            page,
            limit,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
        });
    }
};

// apprve admin system

export const approveReturn = async (req: AuthRequest, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: "Not found" });

    order.returnStatus = ReturnStatus.APPROVED;

    await order.save();

    return res.json({ message: "Return approved" });
};


//admin
export const markAsShipped = async (req: Request, res: Response) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.orderStatus = OrderStatus.SHIPPED;
  order.shippedAt = new Date();

  await order.save();

  return res.json({
    message: "Order marked as shipped",
    order,
  });
};

//admin
export const markAsDelivered = async (req: Request, res: Response) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.orderStatus = OrderStatus.DELIVERD;
  order.deliveredAt = new Date();

  await order.save();

  return res.json({
    message: "Order delivered successfully",
    order,
  });
};