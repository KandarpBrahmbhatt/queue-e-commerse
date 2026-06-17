import { Worker } from "bullmq";
import { connection } from "../config/redis";
import {
    sendAbandonedCartEmail,
} from "../services/email.service";

console.log(
    "🚀 Cart Worker Started"
);

new Worker(
    "cartQueue",
    async (job) => {
        console.log(
            `Processing Job ${job.id}`
        );

        if (
            job.name === "abandoned-cart"
        ) {
            const { email } = job.data;

            await sendAbandonedCartEmail(
                email
            );
        }

        console.log(
            `Job ${job.id} completed`
        );
    },
    {
        connection : connection as any,
    }
);