import { Worker } from "bullmq";
import { sendEmail } from "../services/email.service";
import { sendSMS } from "../services/sms.service";
import connection from "../config/redis";

new Worker("notificationQueue",async (job) => {

        const {email,phone,subject,html,sms,} = job.data;

        if (email) {
            await sendEmail(email, subject, html);
        }

        if (phone) {
            await sendSMS(phone, sms);
        }

        console.log("Notification Sent");
    },
    {
        connection: connection as any,
    }
);