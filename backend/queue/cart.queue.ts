import {Queue} from 'bullmq'

import { connection } from '../config/redis'

export const cartQueue = new Queue("cartQueue",{
    connection:connection as any
})