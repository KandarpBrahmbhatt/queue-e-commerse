import mongoose, { Document, Schema } from "mongoose";

export const ProductStatus = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
    DRAFT: "DRAFT",
} as const;

export type ProductStatus =
    typeof ProductStatus[keyof typeof ProductStatus];
export interface IProduct extends Document {
    name: string;
    slug: string;
    description: string;
    shortDescription?: string;

    sku: string;

    price: number;
    discountPrice?: number;
    currency: string;

    stock: number;
    sold: number;

    // category: mongoose.Types.ObjectId;
    category: string

    images: string[];


    status: ProductStatus;

    averageRating: number;
    totalReviews: number;

    isDeleted: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
        },

        shortDescription: {
            type: String,
            maxlength: 500,
        },

        sku: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        discountPrice: {
            type: Number,
            min: 0,
        },

        currency: {
            type: String,
            default: "INR",
        },

        stock: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },

        sold: {
            type: Number,
            default: 0,
            min: 0,
        },

        category: {
            type: String
            // type: Schema.Types.ObjectId,
            // ref: "Category",
            // required: true,
        },

        images: {
            type: [String],
            default: [],
        },

        status: {
            type: String,
            enum: Object.values(ProductStatus),
            default: ProductStatus.ACTIVE,
        },

        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },

        totalReviews: {
            type: Number,
            default: 0,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

productSchema.index({ name: "text", description: "text" })

productSchema.index({ slug: 1 })

productSchema.index({ sku: 1 })

productSchema.index({ category: 1 })

productSchema.index({ status: 1 })

productSchema.index({ isDeleted: 1 })

const Product = mongoose.model<IProduct>("Product", productSchema)

export default Product