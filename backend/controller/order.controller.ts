import { Request, Response } from 'express'
import Order from '../models/order.model'
import { Cart } from '../models/card.model'
import { AuthRequest } from '../models/user.model'
import { orderEmailQueue } from '../queue/order.queue'
import mongoose from 'mongoose'

export const createOrder = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId

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


        const order = await Order.create({  
            user: userId,
            items: cart.items,
            totalAmount: cart.totalAmount,
            orderNumber
        })

        cart.items = []
        await cart.save()

        await orderEmailQueue.add(
            "order-confirmation",
            {
                orderId: order._id,
                userId,
            },
            {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 5000,
                },
            }
        );

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



export const getaggragationOrder = async (req: AuthRequest,res: Response) => {
    try {
        const userId = req.user?.userId;

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const orders = await Order.aggregate([
            {
                $match: {
                    user:userId,
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


