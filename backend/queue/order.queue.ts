// orderEmailWorker.process(async (job) => {
//     console.log(`Sending email for order ${job.data.orderId}`);
// });


//order emailQueue
import { Queue } from "bullmq";
import connection from "../config/redis";

export const orderEmailQueue = new Queue("orderEmailQueue",{
        connection: connection as any,
    }
);