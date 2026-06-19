import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        amount:{
            type:Number,
            required:true
        },
        currency:{
            type:String,
            default:"inr"
        },
        paymentIntentId:String,

        status:{
            type:String,
            enum:["PENDING","SUCCESS","FAILED"],
            default:"PENDING"
        }
    },{
    timestamps:true
    }
)


const Payment =  mongoose.model("Payment",paymentSchema)

export default Payment