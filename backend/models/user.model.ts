import mongoose, { Schema, Document, mongo } from 'mongoose'

import type { Request } from "express";
export interface AuthRequest extends Request {
    user?: {
        _id?: string;
        userId?: string;
        role: string
    };
}

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    resetOtp?: string;
    otpExpires?: Date;
    isOtpVerifed: boolean;
    role: mongoose.Types.ObjectId,
    permission: mongoose.Types.ObjectId
}

const userShema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique:true
    },
    password: {
        type: String,
        required:true
    },
    resetOtp: {
        type: String,
        default: null,
    },

    otpExpires: {
        type: Date,
        default: null,
    },
    isOtpVerifed: {
        type: Boolean,
        default: false
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
        // required: true   
    },
    permission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER",
    }
}, {
    timestamps: true
})

const User = mongoose.model<IUser>("User", userShema)

export default User