import cron from 'node-cron'
import User from '../models/user.model'
import { sendDiscountEmail } from '../services/email.service'

export const startCronJobs = () => {

    // 12 pm  
    cron.schedule("0 12 * * *", async () => {
        try {
            console.log('Running 50% discount cron job')

            // your logic here
            console.log("Send 50% discount logic triggered");
            
             const users = await User.find({});
                // 2. Send email to each user
            for (const user of users) {
                await sendDiscountEmail(user.email, user.name);
            }



            console.log(`Discount emails sent to ${users.length} users`);
        } catch (error) {
        }
    })
}