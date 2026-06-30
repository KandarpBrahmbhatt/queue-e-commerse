import { Request, Response } from "express";
import User from "../models/user.model";
import Order, {
  OrderStatus,
  PaymentStatus,
} from "../models/order.model";
import Inventory from "../models/inventory.model";
import Coupon from "../models/coupan.model";

export const getDashboardSummary = async (req: Request,res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const monthStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    const [totalUsers,lowStockProducts,couponStats,orderAnalytics,] = await Promise.all([
      User.countDocuments(),

      Inventory.countDocuments({
        $expr: {
          $lte: ["$stock", "$lowStockThreshold"],
        },
      }),

      Coupon.aggregate([
        {
          $group: {
            _id: null,
            couponsUsed: {
              $sum: "$usedCount",
            },
          },
        },
      ]),

      Order.aggregate([
        {
          $facet: {
            totalOrders: [
              {
                $count: "count",
              },
            ],

            todayOrders: [
              {
                $match: {
                  createdAt: {
                    $gte: today,
                    $lt: tomorrow,
                  },
                },
              },
              {
                $count: "count",
              },
            ],

            monthlyRevenue: [
              {
                $match: {
                  paymentStatus: PaymentStatus.PAID,
                  createdAt: {
                    $gte: monthStart,
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  revenue: {
                    $sum: "$totalAmount",
                  },
                },
              },
            ],

            cancelledOrders: [
              {
                $match: {
                  orderStatus: OrderStatus.CANCELLED,
                },
              },
              {
                $count: "count",
              },
            ],

            pendingOrders: [
              {
                $match: {
                  orderStatus: OrderStatus.PENDING,
                },
              },
              {
                $count: "count",
              },
            ],

            deliveredOrders: [
              {
                $match: {
                  orderStatus: OrderStatus.DELIVERD,
                },
              },
              {
                $count: "count",
              },
            ],

            bestSellingProducts: [
              {
                $unwind: "$items",
              },
              {
                $group: {
                  _id: "$items.product",
                  totalSold: {
                    $sum: "$items.quantity",
                  },
                },
              },
              {
                $sort: {
                  totalSold: -1,
                },
              },
              {
                $limit: 5,
              },
              {
                $lookup: {
                  from: "products",
                  localField: "_id",
                  foreignField: "_id",
                  as: "product",
                },
              },
              {
                $unwind: "$product",
              },
              {
                $project: {
                  _id: 1,
                  totalSold: 1,
                  productName: "$product.name",
                  price: "$product.price",
                  image: {
                    $arrayElemAt: ["$product.images", 0],
                  },
                  category: "$product.category",
                },
              },
            ],

            topCustomers: [
              {
                $group: {
                  _id: "$user",
                  totalOrders: {
                    $sum: 1,
                  },
                  totalSpent: {
                    $sum: "$totalAmount",
                  },
                },
              },
              {
                $sort: {
                  totalSpent: -1,
                },
              },
              {
                $limit: 5,
              },
              {
                $lookup: {
                  from: "users",
                  localField: "_id",
                  foreignField: "_id",
                  as: "user",
                },
              },
              {
                $unwind: "$user",
              },
              {
                $project: {
                  _id: 1,
                  name: "$user.name",
                  email: "$user.email",
                  totalOrders: 1,
                  totalSpent: 1,
                },
              },
            ],
          },
        },
      ]),
    ]);

    const dashboard = orderAnalytics[0];

    return res.status(200).json({
      success: true,
      message: "Dashboard fetched successfully",

      data: {
        totalUsers,

        totalOrders:
          dashboard.totalOrders[0]?.count || 0,

        todayOrders:
          dashboard.todayOrders[0]?.count || 0,

        monthlyRevenue:
          dashboard.monthlyRevenue[0]?.revenue || 0,

        cancelledOrders:
          dashboard.cancelledOrders[0]?.count || 0,

        pendingOrders:
          dashboard.pendingOrders[0]?.count || 0,

        deliveredOrders:
          dashboard.deliveredOrders[0]?.count || 0,

        lowStockProducts,

        couponsUsed:
          couponStats[0]?.couponsUsed || 0,

        bestSellingProducts:
          dashboard.bestSellingProducts,

        topCustomers:
          dashboard.topCustomers,
      },
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};