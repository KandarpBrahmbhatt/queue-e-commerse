import express from 'express'
import { 
  cancelOrder, 
  createOrder, 
  getaggragationOrder, 
  getCuurentUserOrder, 
  getOrder, 
  requestReplacement, 
  requestReturn,
  approveReturn,
  markAsShipped,
  markAsDelivered
} from '../controller/order.controller'
import { isAuth, allowRoles } from '../middaleware/auth.middleware'

const orderRouter = express.Router()

orderRouter.post("/create",isAuth,createOrder)
orderRouter.get("/get", isAuth, allowRoles("ADMIN"), getOrder)
orderRouter.get("/getaggragationOrder", isAuth, getaggragationOrder)
orderRouter.get("/getCuurentUserOrder",isAuth,getCuurentUserOrder)
orderRouter.patch("/cancel/:orderId",isAuth,cancelOrder)
orderRouter.post("/return/:orderId",isAuth,requestReturn)
orderRouter.post("/replace/:orderId",isAuth,requestReplacement)
orderRouter.patch("/approve-return/:orderId", isAuth, allowRoles("ADMIN"), approveReturn)
orderRouter.patch("/shipped/:orderId", isAuth, allowRoles("ADMIN"), markAsShipped)
orderRouter.patch("/delivered/:orderId", isAuth, allowRoles("ADMIN"), markAsDelivered)
export default orderRouter 