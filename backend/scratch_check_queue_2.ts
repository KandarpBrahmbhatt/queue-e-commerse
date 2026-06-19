import { invoiceQueue } from "./queue/invoice.queue";
import { orderEmailQueue } from "./queue/order.queue";

async function main() {
    console.log("Checking Queue Jobs...");
    const invoiceJobs = await invoiceQueue.getJobs();
    console.log(`Invoice Queue Jobs: ${invoiceJobs.length}`);
    for (const job of invoiceJobs) {
        console.log(`Job ${job.id}: Name=${job.name}, State=${await job.getState()}, Data=${JSON.stringify(job.data)}, FailedReason=${job.failedReason}`);
    }
    process.exit(0);
}

main().catch(console.error);
