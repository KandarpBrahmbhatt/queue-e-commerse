import express from 'express'
import { applyCoupon, createCoupon, getCoupons } from '../controller/coupon.controller';
import { isAuth } from '../middaleware/auth.middleware';

const couponRouter = express.Router()

couponRouter.post("/create",createCoupon)
couponRouter.post("/apply", isAuth, applyCoupon);
couponRouter.get("/list", isAuth, getCoupons);

export default couponRouter