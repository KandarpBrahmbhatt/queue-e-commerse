import express from 'express'
import { createProudct, deletedProduct, getAggregationProduct, getAllProduct, updateProduct } from '../controller/prouduct.controller'
import { isAuth, authorizeRole } from '../middaleware/auth.middleware'
import upload from '../middaleware/multer.middleware'

const productRouter = express.Router()

productRouter.post("/create", isAuth, authorizeRole("ADMIN", "SELLER"), upload.single("image"), createProudct)
productRouter.get("/get",isAuth,getAllProduct)
productRouter.put("/update/:id", isAuth, authorizeRole("ADMIN", "SELLER"), updateProduct)
productRouter.delete("/deleted/:id", isAuth, authorizeRole("ADMIN", "SELLER"), deletedProduct)
productRouter.get("/getAggregationProduct",isAuth,getAggregationProduct)
export default productRouter