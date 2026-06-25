import express from 'express'
import { createOrder, getaggragationOrder, getCuurentUserOrder, getOrder } from '../controller/order.controller'
import { isAuth, authorizeRole } from '../middaleware/auth.middleware'

const orderRouter = express.Router()

orderRouter.post("/create",isAuth,createOrder)
orderRouter.get("/get", isAuth, authorizeRole("ADMIN"), getOrder)
orderRouter.get("/getaggragationOrder", isAuth, getaggragationOrder)
orderRouter.get("/getCuurentUserOrder",isAuth,getCuurentUserOrder)

export default orderRouter 