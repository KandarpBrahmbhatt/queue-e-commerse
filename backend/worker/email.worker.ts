import { Worker } from "bullmq";
import { connection } from "../config/redis";
// import { sendWelcomeEmail } from "../services/email.service";

// const worker = new Worker( "emailQueue",
//     async (job) => {
//         console.log("Processing Job:", job.id);
//         await sendWelcomeEmail(
//             job.data.email,
//             job.data.name
//         );

//         console.log(`✅ Welcome email sent to ${job.data.email}`);
//     },
//     {
//         connection:connection as any,
//     }
// );


const worker = new Worker(  "emailQueue",
    async (job) => {
        console.log("Processing Job:", job.id);

        console.log(`Sending email to ${job.data.email}`);

        await new Promise((resolve) =>
            setTimeout(resolve, 5000)
        );

        console.log("Email Sent");
    },
    {
        connection : connection as any,
    }
);


worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
    console.log(`Job ${job?.id} failed`);
    console.log(err);
});
