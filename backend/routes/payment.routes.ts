import express from 'express'
import { createPayment } from '../controller/payment.controller'
import { isAuth } from '../middaleware/auth.middleware'
import { verifySignature } from '../middaleware/verifySignature.middleware';
import dotenv from 'dotenv'
dotenv.config()

const paymentRouter = express.Router()


// paymentRouter.post("/create",isAuth,createPayment)
paymentRouter.post(
  "/create",
  isAuth,
  verifySignature(process.env.SIGNATURE_SECRET as string),
  createPayment
);
export default paymentRouter