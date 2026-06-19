import express from 'express'
import { createPayment } from '../controller/payment.controller'
import { isAuth } from '../middaleware/auth.middleware'

const paymentRouter = express.Router()


paymentRouter.post("/create",isAuth,createPayment)

export default paymentRouter