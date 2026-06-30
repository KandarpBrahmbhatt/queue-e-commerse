import { Queue } from "bullmq";
import connection from "../config/redis";



export const notificationQueue = new Queue("notificationQueue",{
    connection:connection as any
})