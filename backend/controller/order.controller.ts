import { Request, Response } from 'express'
import Order from '../models/order.model'
import { Cart } from '../models/card.model'
import User, { AuthRequest } from '../models/user.model'
import { orderEmailQueue } from '../queue/order.queue'
import mongoose from 'mongoose'

export const createOrder = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId
        const { shippingAddress, paymentMethod } = req.body // Extracted from request body (added by AI assistant)

        // const cart = await Cart.findOne({ userId })
        const cart = await Cart.findOne({ user: userId })
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "cart is empty " })
        }

        let totalAmount = 0

        for (const item of cart.items) {
            totalAmount += item.price * item.quantity
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


