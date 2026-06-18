import { Worker } from "bullmq";
import connection from "../config/redis";

const worker = new Worker("orderEmailQueue",async (job) => {
    
        console.log(`Sending confirmation email for order ${job.data.orderId}`);

        /*
            send email here
        */

        console.log("Email sent");
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