// import express from 'express'
// import { createOrder, getaggragationOrder, getCuurentUserOrder, getOrder } from '../controller/order.controller'
// import { isAuth } from '../middaleware/auth.middleware'

// const orderRouter = express.Router()

// orderRouter.post("/create",isAuth,createOrder)
// orderRouter.get("/get",isAuth,getOrder)
// orderRouter.get("/getaggragationOrder", isAuth, getaggragationOrder)
// orderRouter.get("/getCuurentUserOrder",isAuth,getCuurentUserOrder)

// export default orderRouter 

import express from "express";
import {
  createOrder,
  getaggragationOrder,
  getCuurentUserOrder,
  getOrder
} from "../controller/order.controller";

import { isAuth } from "../middaleware/auth.middleware";
import { verifySignature } from "../middaleware/verifySignature.middleware";
import dotenv from 'dotenv'
dotenv.config()
const orderRouter = express.Router();

const SECRET = process.env.SIGNATURE_SECRET as string;

// Secure order creation
orderRouter.post(
  "/create",
  isAuth,
  verifySignature(SECRET),
  createOrder
);

orderRouter.get("/get", isAuth, getOrder);
orderRouter.get("/getaggragationOrder", isAuth, getaggragationOrder);
orderRouter.get("/getCuurentUserOrder", isAuth, getCuurentUserOrder);

export default orderRouter;