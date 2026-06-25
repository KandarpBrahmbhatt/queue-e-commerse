import mongoose, { Schema, Document } from "mongoose";

export interface ICoupon extends Document {
    code: string;
    discountPercent: number;
    expiresAt: Date;
    isActive: boolean;
}

const couponSchema = new Schema<ICoupon>(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },
        discountPercent: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        expiresAt: {
            type: Date,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

const Coupon = mongoose.model<ICoupon>("Coupon", couponSchema);
export default Coupon;