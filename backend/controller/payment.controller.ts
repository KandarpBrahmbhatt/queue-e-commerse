import { Request, Response } from "express"
import { AuthRequest } from '../models/user.model'
import Order, { OrderStatus, PaymentStatus } from "../models/order.model"
import stripe from "../config/stripe"
import Stripe from "stripe"
import Payment from "../models/payment.model"
import { invoiceQueue } from "../queue/invoice.queue"
import User from "../models/user.model"
import { notificationQueue } from "../queue/notification.queue"
export const createPayment = async (req: Request, res: Response) => {
    try {
        // const userId = req.user?.userId

        // if (!userId) {
        //     return res.status(400).json({message:"unauthorized",success:false})
        // }

        const { orderId } = req.body

        const order = await Order.findById(orderId)

        if (!order) {
            return res.status(400).json({ message: "order not found" })
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",

            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: "Order Payment",
                        },
                        unit_amount: order.totalAmount * 100,
                    },
                    quantity: 1,
                }
            ],

            // Metadata on Checkout Session (used for checkout.session.completed webhook)
            metadata: {
                orderId: order._id.toString(),
                userId: order.user.toString(),
            },

            // Propagate metadata to the underlying PaymentIntent for robustness and Stripe dashboard visibility
            payment_intent_data: {
                metadata: {
                    orderId: order._id.toString(),
                    userId: order.user.toString(),
                }
            },

            success_url: `${process.env.CLIENT_URL}/payment-success`,
            cancel_url: `${process.env.CLIENT_URL}/payment-failed`
        })
        return res.status(200).json({
            success: true,
            sessionId: session.id,
            checkoutUrl: session.url,
        });
    } catch (error) {
        console.log(`createPayment error ${error}`)
        return res.status(400).json({ message: "payment not found", error })
    }
}


export const stripeWebhook = async (
    req: Request,
    res: Response
) => {
    const sig = req.headers["stripe-signature"];

    let event: Stripe.Event;

    try {
        console.log("WEBHOOK HIT")
        // Stripe webhook signature verification requires the raw request body.
        // Since express.raw({ type: "application/json" }) middleware is registered for this route,
        // req.body is a raw Buffer, which is passed here to verify the signature successfully.
        event = stripe.webhooks.constructEvent(
            req.body,
            sig as string,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);

        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case "payment_intent.created":
                console.log("PaymentIntent created. Waiting for customer to complete the checkout payment...");
                break;

            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;

                console.log("Metadata:", session.metadata);

                const orderId = session.metadata?.orderId;
                const userId = session.metadata?.userId;

                console.log("orderId:", orderId);
                console.log("userId:", userId);

                await Payment.create({
                    userId,
                    amount: (session.amount_total ?? 0) / 100,
                    currency: session.currency ?? "inr",
                    paymentIntentId:
                        typeof session.payment_intent === "string"
                            ? session.payment_intent
                            : session.payment_intent?.id,
                    status: "SUCCESS",
                });

                // Update the order status to "CONFIRM" to match the OrderStatus enum defined in order.model.ts.
                const updatedOrder = await Order.findById(orderId);
                if (updatedOrder && updatedOrder.orderStatus !== OrderStatus.CONFIRM) {
                    updatedOrder.paymentStatus = PaymentStatus.PAID;
                    updatedOrder.orderStatus = OrderStatus.CONFIRM;
                    await updatedOrder.save();

                    console.log("Updated Order:", updatedOrder);

                    const userObj = await User.findById(userId);
                    if (userObj) {
                        await notificationQueue.add("notification", {
                            email: userObj.email,
                            phone: userObj.phone,
                            subject: "Order Confirmed",
                            html: `<h1>Order Confirmed</h1><p>Hi ${userObj.name}, your payment is successful, and your order ${updatedOrder.orderNumber} is confirmed.</p>`,
                            sms: `Hi ${userObj.name}, your order ${updatedOrder.orderNumber} has been confirmed. Thank you!`
                        });
                    }

                    console.log("Adding invoice job")
                    
                    await invoiceQueue.add("send-invoice", {
                        orderId,
                        userId,
                    });
                    console.log("email job added")
                }

                break;
            }

            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;

                console.log("PaymentIntent Succeeded Metadata:", paymentIntent.metadata);

                const orderId = paymentIntent.metadata?.orderId;
                const userId = paymentIntent.metadata?.userId;

                console.log("orderId:", orderId);
                console.log("userId:", userId);

                // Prevent creating duplicate payments
                const existingPayment = await Payment.findOne({ paymentIntentId: paymentIntent.id });
                if (!existingPayment) {
                    await Payment.create({
                        userId,
                        amount: (paymentIntent.amount_received ?? 0) / 100,
                        currency: paymentIntent.currency ?? "inr",
                        paymentIntentId: paymentIntent.id,
                        status: "SUCCESS",
                    });
                } else if (existingPayment.status !== "SUCCESS") {
                    existingPayment.status = "SUCCESS";
                    await existingPayment.save();
                }

                if (orderId) {
                    const updatedOrder = await Order.findById(orderId);
                    if (updatedOrder && updatedOrder.orderStatus !== OrderStatus.CONFIRM) {
                        updatedOrder.paymentStatus = PaymentStatus.PAID;
                        updatedOrder.orderStatus = OrderStatus.CONFIRM;
                        await updatedOrder.save();

                        console.log("Updated Order via PaymentIntent:", updatedOrder);

                        const userObj = await User.findById(userId);
                        if (userObj) {
                            await notificationQueue.add("notification", {
                                email: userObj.email,
                                phone: userObj.phone,
                                subject: "Order Confirmed",
                                html: `<h1>Order Confirmed</h1><p>Hi ${userObj.name}, your payment is successful, and your order ${updatedOrder.orderNumber} is confirmed.</p>`,
                                sms: `Hi ${userObj.name}, your order ${updatedOrder.orderNumber} has been confirmed. Thank you!`
                            });
                        }
                    }
                }

                break;
            }

            default:
                console.log(`Unhandled event: ${event.type}`);
        }

        return res.status(200).json({ received: true });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Webhook processing failed",
        });
    }
};