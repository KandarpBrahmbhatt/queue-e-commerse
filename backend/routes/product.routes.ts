import express from 'express'
import { createProudct, deletedProduct, getAllProduct, updateProduct } from '../controller/prouduct.controller'
import { isAuth } from '../middaleware/auth.middleware'

const productRouter = express.Router()

productRouter.post("/create",createProudct)
productRouter.get("/get",isAuth,getAllProduct)
productRouter.put("/update/:id",updateProduct)
productRouter.delete("/deleted/:id",deletedProduct)

export default productRouter