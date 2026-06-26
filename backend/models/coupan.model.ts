import mongoose, { Schema, Document } from "mongoose";

export interface ICoupon extends Document {
    code: string;
    discountType: string;
    discountValue: number;
    minOrderValue: number;
    isActive: boolean;
    startDate?: Date;
    endDate?: Date;
    usedCount: number;
    usageLimit: number;
    assignedUsers?: mongoose.Types.ObjectId[];
    applicableCategories?: string[];
    maxDiscountValue?: number;
    expiresAt?: Date;
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
        discountType: {
            type: String,
            required: true,
            enum: ["percentage", "fixed"]
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0
        },
        minOrderValue: {
            type: Number,
            required: true,
            default: 0
        },
        isActive: {
            type: Boolean,
            default: true
        },
        startDate: {
            type: Date
        },
        endDate: {
            type: Date
        },
        usedCount: {
            type: Number,
            default: 0
        },
        usageLimit: {
            type: Number,
            default: 1000000
        },
        assignedUsers: [
            {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        applicableCategories: [
            {
                type: String
            }
        ],
        maxDiscountValue: {
            type: Number
        },
        expiresAt: {
            type: Date
        }
    },
    { timestamps: true }
);

export const Coupon = mongoose.model<ICoupon>("Coupon", couponSchema);
export default Coupon;