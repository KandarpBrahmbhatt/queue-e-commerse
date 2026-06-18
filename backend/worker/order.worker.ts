import { Worker } from "bullmq";
import connection from "../config/redis";


// bullmq store in job in redis this of redis is a waiting room 
// Customer
    // ↓
// Order API
    // ↓
// Redis Queue

import { sendOrderConfirmationEmail } from "../services/email.service";
import connectdb from "../config/db";
import Order from "../models/order.model";
import User from "../models/user.model";

// Connect to MongoDB database to allow worker to query order and user details
connectdb();

const worker = new Worker("orderEmailQueue", async (job) => {
        // Change: Extract fields from job.data, and add a fallback query to MongoDB
        // in case the job was created with only orderId/userId (backward compatibility for legacy jobs in the queue).
        let email = job.data.email;
        let name = job.data.name;
        let orderNumber = job.data.orderNumber;
        let totalAmount = job.data.totalAmount;

        if (!email && job.data.orderId) {
            console.log(`[Queue Fix] Email is missing in job payload. Fetching order ${job.data.orderId} from MongoDB...`);
            const order = await Order.findById(job.data.orderId);
            if (order) {
                orderNumber = order.orderNumber;
                totalAmount = order.totalAmount;
                
                const userObj = await User.findById(order.user || job.data.userId);
                if (userObj) {
                    email = userObj.email;
                    name = userObj.name;
                }
            }
        }

        console.log(`Sending email to ${email}`);

        await sendOrderConfirmationEmail(
            email,
            name,
            orderNumber,
            totalAmount
        );

        console.log("Email sent successfully");
    },
    {
        connection: connection as any,
    }
);

worker.on("active", (job) => {
    console.log(`Processing Job ${job.id}`);
});

worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
    console.log(`Job ${job?.id} failed: ${err.message}`);
});