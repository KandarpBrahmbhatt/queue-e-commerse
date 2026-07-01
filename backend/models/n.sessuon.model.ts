import mongoose, { Schema } from "mongoose";
import { Types } from "mongoose";

export interface ISession extends Document{
    userId:Types.ObjectId;
    refreshToken:string;
    deviceName:string,
    browser:string,
    os:string,
    isAddress:string,
    userAgent:string,
    loginAt:Date,
    lastActivity:Date,
    exporesAt:Date,
    isActive:boolean
}


const sessionSchema = new Schema<ISession>({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
        index:true
    },
    refreshToken:{
        type:String,
        required:true
    },
    deviceName:{
        type:String,
        default:"unKnownDevice",
    },
    browser:{
        type:String,
        default:"unknownDevice"
    },
    os:{
        type:String,
        default:"unknown OS"
    },
    isAddress:{
        type:String,
        default:""
    },
    userAgent:{
        type:String,
        default:""
    },
    loginAt:{
        type:Date,
        default:Date.now
    },
    lastActivity:{
        type:Date
    }

})