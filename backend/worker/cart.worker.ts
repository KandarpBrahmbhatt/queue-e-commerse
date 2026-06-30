import { Worker } from "bullmq";
import { connection } from "../config/redis";
import {
    sendAbandonedCartEmail,
} from "../services/email.service";
import connectdb from "../config/db";
import { Cart } from "../models/card.model";

console.log(
    "Cart Worker Started"
);

// Establish database connection
connectdb();

new Worker("cartQueue",
    async (job) => {
        console.log(`Processing Job ${job.id}`);

        if (job.name === "abandoned-cart") {
            const { userId, email } = job.data;

            try {
                // Fetch the user's cart
                const cart = await Cart.findOne({ user: userId });

                // Only send the email if the cart exists and has items
                if (cart && cart.items && cart.items.length > 0) {
                    await sendAbandonedCartEmail(email);
                } else {
                    console.log(`Cart is empty or not found for user ${userId}. Skipping email.`);
                }
            } catch (error) {
                console.error(`Error processing job ${job.id} for user ${userId}:`, error);
                throw error;
            }
        }

        console.log(`Job ${job.id} completed`);
    },
    {
        connection : connection as any,
    }
);