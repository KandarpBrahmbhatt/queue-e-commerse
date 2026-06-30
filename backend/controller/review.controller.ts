import { Request, Response } from "express"
import Order, { OrderStatus } from "../models/order.model"
import Review from "../models/review.model"
import { updateProductRatings } from "../services/review.service"
import { AuthRequest } from "../models/user.model"

export const createReview = async (req: AuthRequest, res: Response) => {
    try {
        const { productId, rating, comment } = req.body
        console.log(req.body)

        const userId = req.user?.userId
        const deliveryOrder = await Order.findOne({
            user: userId,
            orderStatus: OrderStatus.DELIVERD,
            "items.product": productId
        })

        if (!deliveryOrder) {
            return res.status(400).json({ message: "You review only purchased products deliveryOrder not foud" })
        }

        const reviewExists = await Review.findOne({ userId, productId })

        if (reviewExists) {
            return res.status(400).json({ message: "review already existng in db" })
        }

        const review = await Review.create({
            userId,
            productId,
            rating,
            comment
        })

        await updateProductRatings(productId)

        return res.status(201).json({ message: "review created sucessfully" })
    } catch (error: any) {
        console.log(`created Review error ${error}`)
        return res.status(500).json({ message: "Server error", error: error.message })
    }
}


export const getReview = async (req: AuthRequest, res: Response) => {
    try {
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 10
        const skip = (page - 1) * limit;

        const { productId } = req.params
        const review = await Review.find({ productId })
            .populate("userId","name")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })

        if (!review) {
            return res.status(400).json({ message: "review not found" })
        }

        const total = await Review.countDocuments({ productId })
        return res.status(200).json({ message: "getign review sucessfully", review, total, totalPage: Math.ceil(total / limit) })
    } catch (error: any) {
        console.log(`getReview error ${error}`)
        return res.status(500).json({ message: "Server error", error: error.message })
    }
}

export const updateReview = async (req: AuthRequest, res: Response) => {
    try {
        const reviewId = req.params.id
        const userId = req.user?.userId

        const review = await Review.findOneAndUpdate({ _id: reviewId, userId }, req.body, { new: true })

        if (!review) {
            return res.status(404).json({ message: "Review not found" })
        }

        return res.status(200).json({ message: "review update sucesfully", review })
    } catch (error: any) {
        console.log(`updateReview error ${error}`)
        return res.status(500).json({ message: "Server error", error: error.message })
    }
}


export const deleteReview = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user?.userId;

    const review =
      await Review.findOneAndDelete({
        _id: reviewId,
        userId,
      });

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    await updateProductRatings(
      review.productId.toString()
    );

    return res.status(200).json({
      message: "Review deleted",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};