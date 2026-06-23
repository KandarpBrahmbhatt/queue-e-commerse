import mongoose from "mongoose";
import path from "path";
import dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '../.env') })

const connectdb = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.MONGO_URL!)
        console.log("mongodb is connected")
    } catch (error) {
        console.log("mognodb connection error", error)
        process.exit(1)
    }
}

export default connectdb