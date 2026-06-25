import mongoose, { Schema } from "mongoose";
import { Document } from "mongoose";

export interface IReview extends Document{
    userId:mongoose.Types.ObjectId;
    productId:mongoose.Types.ObjectId;
    rating:number;
    comment:string
}

const reviewSchema = new Schema<IReview>({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    productId:{
        type:Schema.Types.ObjectId,
        ref:"Product"
    },
    rating:{
        type:Number,
        required:true,
        min:1,
        max:5
    },
    comment:{
        type:String,
        trim:true,
        maxLength:500
    }
},{
    timestamps:true
})

reviewSchema.index({userId:1,productId:1},{unique:true})

const Review = mongoose.model<IReview>("Review",reviewSchema)

export default Review