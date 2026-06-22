import express from 'express'
import { createProudct, deletedProduct, getAggregationProduct, getAllProduct, updateProduct } from '../controller/prouduct.controller'
import { allowRoles, isAuth } from '../middaleware/auth.middleware'

const productRouter = express.Router()

productRouter.post("/create",isAuth,  allowRoles("ADMIN", "SELLER"),createProudct)
productRouter.get("/get",isAuth,getAllProduct)
productRouter.put("/update/:id",updateProduct)
productRouter.delete("/deleted/:id",deletedProduct)
productRouter.get("/getAggregationProduct",getAggregationProduct)
export default productRouter