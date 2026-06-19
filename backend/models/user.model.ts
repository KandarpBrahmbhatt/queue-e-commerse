import mongoose, { Schema, Document } from 'mongoose'

import type { Request } from "express";
export interface AuthRequest extends Request {
    user?: {
        _id?: string;
        userId?: string;
    };
}

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    resetOtp?: string;
    otpExpires?: Date;
    isOtpVerifed: boolean;
}

const userShema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
    },
    password: {
        type: String
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
}, {
    timestamps: true
})

const User = mongoose.model<IUser>("User", userShema)

export default User