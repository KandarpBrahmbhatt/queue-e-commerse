import mongoose from 'mongoose'

const recentlyViewSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
    },
    viewAt:{
        type:Date,
        default:Date.now
    }
},{
    timestamps:true
})

const RecentView = mongoose.model("RecentView",recentlyViewSchema)

export default RecentView