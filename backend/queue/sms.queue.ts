import { Queue } from "bullmq";
import connection from "../config/redis";


export const smaSendingQueue = new Queue("smsSendingQueue",{
    connection:connection as any
})