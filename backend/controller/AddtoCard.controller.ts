import { Response } from "express";
import { Cart } from "../models/card.model";
import Product from "../models/product.model";
import User, { AuthRequest } from "../models/user.model";
import { cartQueue } from "../queue/cart.queue";
import mongoose from "mongoose";

export const addToCart = async (req: AuthRequest, res: Response) => {
    try {
        const { productId, quantity = 1 } = req.body;

        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        let cart = await Cart.findOne({
            user: userId,
        });

        if (!cart) {
            cart = await Cart.create({
                user: userId,
                items: [],
            });
        }

        const existingItem = cart.items.find(
            (item) =>
                item.product.toString() === productId
        );

        if (existingItem) {
            existingItem.quantity += Number(quantity);
        } else {
            cart.items.push({
                product: product._id,
                quantity: Number(quantity),
                price: product.price,
            });
        }

        await cart.save();


        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        await cartQueue.add(
            "abandoned-cart",
            {
                userId,
                email: user.email,
            },
            {
                delay: 60 * 1000,
            }
        );

        return res.status(200).json({
            success: true,
            message: "Product added to cart",
            cart,
        });

    } catch (error) {
        console.log("addToCart error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const getCart = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        const cart = await Cart.findOne({ user: userId }).populate("items.product");

        return res.status(200).json({
            success: true,
            cart,
        });

    } catch (error) {
        console.log("getCart error:", error);

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};




export const removeFromCart = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = req.user?.userId;

        const { productId } = req.params;

        const cart = await Cart.findOne({
            user: userId,
        });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found",
            });
        }

        cart.items = cart.items.filter(
            (item) =>
                item.product.toString() !== productId
        );

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart,
        });

    } catch (error) {
        console.log("removeFromCart error:", error);

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};


// export const getAddtoCardAggragation = async(req:Request,res:Response)=>{
//     try {
//         // const userId  = mongoose.Schema.Types.ObjectId(user)
//         const cart = await Cart.aggregate([
//             {
//                 $match:userId
//             }
//         ])
//     } catch (error) {
//         console.log(`getAddtoCardAggragation error ${error}`)
//     }
// }