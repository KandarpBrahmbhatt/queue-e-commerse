import mongoose, { Schema } from 'mongoose'

import type { Request } from "express";
export interface AuthRequest extends Request {
    user?: {
        _id?: string;
        userId?: string;
    };
}

export interface IUser extends Document{
    name:string,
    email:string,
    password:string
}


const userShema = new Schema<IUser>({
        name:{
            type:String,
            required:true,
            trim:true
        },
        email:{
            type:String,
        },
        password:{
            type:String
        }
    },{
        timestamps:true
    })

const User  = mongoose.model<IUser>("User",userShema)

export default User