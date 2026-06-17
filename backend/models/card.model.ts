// import mongoose, { Document, Schema } from "mongoose";

// export interface ICartItem {
//     product: mongoose.Types.ObjectId;
//     quantity: number;

//     // Price snapshot at the time product was added
//     price: number;

//     // Optional variant support (future use)
//     variant?: string;
// }

// export interface ICart extends Document {
//     user: mongoose.Types.ObjectId;

//     items: ICartItem[];

//     totalItems: number;
//     subtotal: number;

//     couponCode?: string;
//     discountAmount: number;

//     isActive: boolean;

//     expiresAt?: Date;

//     createdAt: Date;
//     updatedAt: Date;
// }

// const cartItemSchema = new Schema<ICartItem>(
//     {
//         product: {
//             type: Schema.Types.ObjectId,
//             ref: "Product",
//             required: true,
//         },

//         quantity: {
//             type: Number,
//             required: true,
//             min: 1,
//             default: 1,
//         },

//         price: {
//             type: Number,
//             required: true,
//             min: 0,
//         },

//         variant: {
//             type: String,
//             trim: true,
//         },
//     },
//     {
//         _id: false,
//     }
// );

// const cartSchema = new Schema<ICart>(
//     {
//         user: {
//             type: Schema.Types.ObjectId,
//             ref: "User",
//             required: true,
//             unique: true, // One active cart per user
//         },

//         items: {
//             type: [cartItemSchema],
//             default: [],
//         },

//         totalItems: {
//             type: Number,
//             default: 0,
//             min: 0,
//         },

//         subtotal: {
//             type: Number,
//             default: 0,
//             min: 0,
//         },

//         couponCode: {
//             type: String,
//             trim: true,
//         },

//         discountAmount: {
//             type: Number,
//             default: 0,
//             min: 0,
//         },

//         isActive: {
//             type: Boolean,
//             default: true,
//         },

//         expiresAt: {
//             type: Date,
//         },
//     },
//     {
//         timestamps: true,
//     }
// );

// /**
//  * Calculate totals before save
//  */
// cartSchema.pre("save", function (next) {
//     this.totalItems = this.items.reduce(
//         (sum, item) => sum + item.quantity,
//         0
//     );

//     this.subtotal = this.items.reduce(
//         (sum, item) => sum + item.quantity * item.price,
//         0
//     );

//     next();
// });


// cartSchema.index({ user: 1 });
// cartSchema.index({ "items.product": 1 });
// cartSchema.index({ isActive: 1 });
// cartSchema.index({ expiresAt: 1 });

// const Cart = mongoose.model<ICart>("Cart", cartSchema);

// export default Cart;


import mongoose, { Schema, Document } from "mongoose";

export interface ICartItem {
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
}

export interface ICart extends Document {
    user: mongoose.Types.ObjectId;
    items: ICartItem[];
}

const cartSchema = new Schema<ICart>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        items: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    default: 1,
                    min: 1,
                },
                price: {
                    type: Number,
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

export const Cart = mongoose.model<ICart>("Cart", cartSchema);