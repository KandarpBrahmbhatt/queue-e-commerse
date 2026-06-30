import {Worker} from 'bullmq'

import {connection} from "../config/redis"
// import { resolve } from 'node:dns'

const worker = new Worker("inventroyQueue",async(job)=>{
    console.log("processing job",job.id)
    console.log(`sending email inveontry queue ${job.data.email}`)
    await new Promise((resolve)=>
        setTimeout(resolve,5000)
);
console.log("Email send")
},{
    connection :connection as any
}
)



worker.on("completed",(job)=>{
    console.log(`job ${job.id} completed`)
})

worker.on("failed",(job, err)=>{
    console.log(`job ${job?.id} is failed`)
    console.log(err)
})