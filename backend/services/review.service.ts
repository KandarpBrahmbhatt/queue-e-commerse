// services/review.service.ts

import mongoose from "mongoose";
import Review from "../models/review.model";
import Product from "../models/product.model";

export const updateProductRatings = async (
  productId: string
) => {
  const stats = await Review.aggregate([
    {
      $match: {
        productId:
          new mongoose.Types.ObjectId(productId),
      },
    },

    {
      $group: {
        _id: "$productId",

        avgRating: {
          $avg: "$rating",
        },

        totalReviews: {
          $sum: 1,
        },
      },
    },
  ]);

  await Product.findByIdAndUpdate(productId, {
    ratingsAverage:
      stats[0]?.avgRating || 0,

    ratingsQuantity:
      stats[0]?.totalReviews || 0,
  });
};