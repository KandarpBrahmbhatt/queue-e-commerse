import { Queue } from "bullmq";
import connection from "../config/redis";


export const invoiceQueue = new Queue("invoiceQueue",{
    connection:connection as any
})