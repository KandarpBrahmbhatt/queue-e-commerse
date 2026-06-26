import mongoose from "mongoose";
import { Coupon } from "../models/coupan.model";

// export class CouponService {
//   static async applyCoupon(userId: string, code: string, cartTotal: number) {
//     const coupon = await Coupon.findOne({
//       code: code.toUpperCase(),
//       isActive: true,
//     });

//     if (!coupon) throw new Error("Invalid coupon");

//     if (cartTotal < coupon.minOrderValue) {
//       throw new Error("Minimum order value not met");
//     }

//     let discount = 0;

//     if (coupon.discountType === "percentage") {
//       discount = (cartTotal * coupon.discountValue) / 100;
//     } else {
//       discount = coupon.discountValue;
//     }

//     const finalAmount = Math.max(cartTotal - discount, 0);

//     return {
//       originalAmount: cartTotal,
//       discount,
//       finalAmount,
//     };
//   }
// }


export class CouponService {

  static async applyCoupon(
    userId: string,
    cartTotal: number,
    cartCategories: string[] = []
  ) {

    const coupons = await Coupon.find({
      isActive: true,
      minOrderValue: { $lte: cartTotal },
    });

    const eligibleCoupons = [];

    for (const coupon of coupons) {

      //  expiry check
      const now = new Date();
      if (coupon.startDate && coupon.startDate > now) continue;
      if (coupon.endDate && coupon.endDate < now) continue;

      //  usage limit
      if (coupon.usedCount >= coupon.usageLimit) continue;


const userObjectId = new mongoose.Types.ObjectId(userId);

      // user-specific coupon check
      if (
        coupon.assignedUsers &&
        coupon.assignedUsers.length > 0 &&
        !coupon.assignedUsers.includes(userObjectId)
      ) {
        continue;
      }

      //  category restriction check
      if (
        coupon.applicableCategories &&
        coupon.applicableCategories.length > 0
      ) {
        const match = coupon.applicableCategories.some((cat) =>
          cartCategories.includes(cat)
        );

        if (!match) continue;
      }

      // calculate preview discount
      let discount = 0;

      if (coupon.discountType === "percentage") {
        discount = (cartTotal * coupon.discountValue) / 100;

        if (coupon.maxDiscountValue) {
          discount = Math.min(discount, coupon.maxDiscountValue);
        }
      } else {
        discount = coupon.discountValue;
      }

      eligibleCoupons.push({
        _id: coupon._id,
        code: coupon.code,
        discount,
        finalAmount: cartTotal - discount,
      });
    }

    return eligibleCoupons;
  }
}