import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()

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