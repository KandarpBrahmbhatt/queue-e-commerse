import { Request, Response } from "express";
import { AuthRequest } from "../models/user.model";
import { CouponService } from "../services/coupon.services";
import { Coupon } from "../models/coupan.model";

// controllers/coupon.controller.ts


export const createCoupon = async (req: Request, res: Response) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderValue,
      isActive,
    } = req.body;

    // 1. check duplicate coupon
    const existing = await Coupon.findOne({
      code: code.toUpperCase(),
    });

    if (existing) {
      return res.status(400).json({
        message: "Coupon already exists",
      });
    }

    // 2. create coupon
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderValue,
      isActive: isActive ?? true,
    });

    return res.status(201).json({
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
export const applyCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { code, cartTotal } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User ID missing"
      });
    }

    const result = await CouponService.applyCoupon(
      userId!,
      cartTotal,
      []
    );

    const eligible = result.find((c: any) => c.code === code.toUpperCase());
    if (!eligible) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon or minimum order value not met"
      });
    }

    res.status(200).json({
      success: true,
      message: "Coupon applied",
      data: eligible,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    res.status(200).json({
      success: true,
      data: coupons
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const getAllAggregateCoupen = async (req: Request, res: Response) => {
  try {

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.page) || 10
    const skip = (page - 1) * limit

    const coupen = await Coupon.aggregate([
      {
        $match: {
          isActive: true
        }
      }, 
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $project: {
          code: 1,
          discountType: 1,
          discountValue: 1,
          minOrderValue: 1,
          isActive: 1,
          startDate: 1,
          endDate: 1,
          usedCount: 1,
          usageLimit: 1,
          expiresAt: 1
        }
      }
    ])

    const total = await Coupon.countDocuments()
    return res.status(200).json({
      message: "getAllAggragationCoupen successfully",
      coupen,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error: any) {
    console.log(`getAllAggragateCoupen error ${error}`)
    return res.status(500).json({ message: "getAllAggragateCoupen error", error: error.message })
  }
}