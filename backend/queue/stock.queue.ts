import { Queue } from "bullmq";

import {connection} from "../config/redis"


export const stockQueue = new Queue("stockqueue",{
    connection:connection as any
})