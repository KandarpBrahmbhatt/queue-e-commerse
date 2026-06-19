import { Worker } from "bullmq";
import connection from "../config/redis";
import connectdb from "../config/db";
import Order from "../models/order.model";
import User from "../models/user.model";

import { generateInvoice } from "../utils/pdf";
import { sendInvoiceEmail } from "../services/email.service";

connectdb();

const worker = new Worker(
    "invoiceQueue",
    async (job) => {

        const { orderId, userId } = job.data;

        const order = await Order.findById(orderId)
            .populate("items.product");

        const user = await User.findById(userId);

        if (!order || !user) {
            throw new Error("Order or User not found");
        }

        const pdfPath = await generateInvoice(order, user);

        await sendInvoiceEmail(
            user.email,
            user.name,
            order.orderNumber,
            pdfPath
        );

        console.log("Invoice email sent");
    },
    {
        connection: connection as any,
    }
);