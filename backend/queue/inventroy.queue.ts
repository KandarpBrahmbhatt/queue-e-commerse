import {Queue} from 'bullmq'
import {connection} from '../config/redis'

export const inventroyQueue = new Queue("emailQueue",{
    connection:connection as any
})