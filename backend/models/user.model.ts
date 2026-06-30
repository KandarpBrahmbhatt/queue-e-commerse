import mongoose, { Schema, Document } from 'mongoose'
import "./role.model";

import type { Request } from "express";
export interface AuthRequest extends Request {
    user?: {
        _id?: string;
        userId?: string;
        role?: string;
        permissions?: string[];
    };
}

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    phone?: string;
    resetOtp?: string;
    otpExpires?: Date;
    isOtpVerifed: boolean;
    role: mongoose.Types.ObjectId,
    permissions: mongoose.Types.ObjectId
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
    phone: {
        type: String,
        default: null
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
        type: Schema.Types.ObjectId,
        ref: "Role",
        required: true
    },
    permissions: {
        type: Schema.Types.ObjectId,
        ref: "Permission",
    }
}, {
    timestamps: true
})

const User = mongoose.model<IUser>("User", userShema)

export default User