import mongoose, { Schema, Types } from 'mongoose'

export enum OrderStatus{
    PENDING = "PENDING",
    CONFIRM="CONFIRM",
    PROCESSED="PROCESSED",
    SHIPPED="SHIPPED",
    DELIVERD="DELIVERD",
    CANCELLED="CANCELLED",
    RETURN="RETURNED"
}

export enum PaymentStatus{
    PENDING = "PENDING",
    PAID="PAID",
    FAILED="FAILED",
    REFUNDED="REFUNDED"
}

export enum PaymentMethod {
    COD="COD",
    CARD="CARD",
    UPI="UPI",
    NET_BANKING="NET_BANKING",
    WALLET = "WALLET"
}

export interface IOrderItem {
    product: Types.ObjectId;

    name: string;

    image: string;

    sku?: string;

    quantity: number;

    price: number;

    totalPrice: number;
}

export interface IShippingAddress {
    fullName: string;

    phoneNumber: string;

    addressLine1: string;

    addressLine2?: string;

    city: string;

    state: string;

    postalCode: string;

    country: string;
}

export interface IOrder extends Document {
    user: Types.ObjectId;

    orderNumber: string;

    items: IOrderItem[];

    shippingAddress: IShippingAddress;

    paymentMethod: PaymentMethod;

    paymentStatus: PaymentStatus;

    paymentId?: string;

    transactionId?: string;

    orderStatus: OrderStatus;

    subtotal: number;

    taxAmount: number;

    shippingAmount: number;

    discountAmount: number;

    totalAmount: number;

    notes?: string;

    deliveredAt?: Date;

    cancelledAt?: Date;

    createdAt: Date;

    updatedAt: Date;
}


const OrderItemSchema = new Schema<IOrderItem>(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            
        },

        name: {
            type: String,
            // 
            trim: true,
        },

        image: {
            type: String,
            // 
        },

        sku: {
            type: String,
        },

        quantity: {
            type: Number,
            
            min: 1,
        },

        price: {
            type: Number,
            // 
            min: 0,
        },

        totalPrice: {
            type: Number,
            // 
            min: 0,
        },
    },
    { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
    {
        fullName: {
            type: String,
            
            trim: true,
        },

        phoneNumber: {
            type: String,
            
        },

        addressLine1: {
            type: String,
                
            trim: true,
        },

        addressLine2: {
            type: String,
            trim: true,
        },

        city: {
            type: String,
            
        },

        state: {
            type: String,
            
        },

        postalCode: {
            type: String,
            
        },

        country: {
            type: String,
            
            default: "India",
        },
    },
    { _id: false }
);


const OrderSchema = new Schema<IOrder>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            
            // index: true,
        },

        orderNumber: {
            type: String,
            
            // unique: true,
        },

        items: {
            type: [OrderItemSchema],
            
            validate: {
                validator: (items: IOrderItem[]) => items.length > 0,
                message: "Order must contain at least one item",
            },
        },

        shippingAddress: {
            type: ShippingAddressSchema,
            
        },

        paymentMethod: {
            type: String,
            enum: Object.values(PaymentMethod),
            
        },

        paymentStatus: {
            type: String,
            enum: Object.values(PaymentStatus),
            default: PaymentStatus.PENDING,
        },

        paymentId: {
            type: String,
            trim: true,
        },

        transactionId: {
            type: String,
            trim: true,
        },

        orderStatus: {
            type: String,
            enum: Object.values(OrderStatus),
            default: OrderStatus.PENDING,
            // index: true,
        },

        subtotal: {
            type: Number,
            
            min: 0,
        },

        taxAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        shippingAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        discountAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        totalAmount: {
            type: Number,
            
            min: 0,
        },

        notes: {
            type: String,
            maxlength: 500,
        },

        deliveredAt: {
            type: Date,
        },

        cancelledAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

OrderSchema.index({ user: 1, createdAt: -1 });

OrderSchema.index({ orderStatus: 1 });

OrderSchema.index({ paymentStatus: 1 });

OrderSchema.index({ createdAt: -1 });

OrderSchema.index({ orderNumber: 1 }, { unique: true });

// shot of product data is stored inside the order, so product changes won't affect past orders.

// Supports COD, UPI, Cards, Wallets, and Net Banking.

// Tracks payment and order lifecycle separately.

// Indexed for fast dashboard and user order queries.

// Stores transaction details for payment gateway integrations.

// Includes timestamps and delivery/cancellation tracking.

// Works well with BullMQ queues for invoice generation


const Order = mongoose.model<IOrder>("Order", OrderSchema);

export default Order;