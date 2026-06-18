import express from 'express'
import { createOrder, getaggragationOrder, getCuurentUserOrder, getOrder } from '../controller/order.controller'
import { isAuth } from '../middaleware/auth.middleware'

const orderRouter = express.Router()

orderRouter.post("/create",isAuth,createOrder)
orderRouter.get("/get",isAuth,getOrder)
orderRouter.get("/getaggragationOrder", isAuth, getaggragationOrder)
orderRouter.get("/getCuurentUserOrder",isAuth,getCuurentUserOrder)

export default orderRouter 