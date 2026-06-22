import mongoose, { Document, Schema } from 'mongoose'

export interface IWishList extends Document {
    user: mongoose.Types.ObjectId;
    product: mongoose.Types.ObjectId;
}

const wishListSchema = new Schema<IWishList>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    }
}, {
    timestamps: true
});

const WishList = mongoose.model<IWishList>("WishList", wishListSchema);

export default WishList;