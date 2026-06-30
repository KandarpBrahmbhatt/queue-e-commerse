import { Worker } from "bullmq"


const worker = new Worker("stockQueue",async(job)=>{
    console.log("processing job",job.id)
    console.log("sending email stock queue")
})