import { Worker } from "bullmq";
import connection from "../config/redis";
import connectdb from "../config/db";
import Order from "../models/order.model";
import User from "../models/user.model";
import Product from "../models/product.model";

import { generateInvoice } from "../utils/pdf";
import { sendInvoiceEmail } from "../services/email.service";

connectdb();

const worker = new Worker("invoiceQueue",
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


worker.on("active", (job) => {
    console.log(`Invoice Job ${job.id} active (processing)`);
});

worker.on("completed", (job) => {
    console.log(`Invoice Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
    console.error(`Invoice Job ${job?.id} failed:`, err);
});