// payment verification queue

import { Queue } from "bullmq";
import connection from "../config/redis";


export const paymentQueue = new Queue("patmentVerificationQueue",{
    connection:connection as any
})