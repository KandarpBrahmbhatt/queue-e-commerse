import express from 'express'
import { clearRecentView, createProudct, deletedProduct, getAggregationProduct, getAllProduct, getCurrentProduct, getRecentViewed, updateProduct } from '../controller/prouduct.controller'
import { isAuth, authorizeRole } from '../middaleware/auth.middleware'
import upload from '../middaleware/multer.middleware'

const productRouter = express.Router()

productRouter.post("/create", isAuth, authorizeRole("ADMIN", "SELLER"), upload.single("image"), createProudct)
productRouter.get("/get",isAuth,getAllProduct)
productRouter.get("/currentProduct/:id",isAuth,getCurrentProduct)
productRouter.put("/update/:id", isAuth, authorizeRole("ADMIN", "SELLER"), updateProduct)
productRouter.delete("/deleted/:id", isAuth, authorizeRole("ADMIN", "SELLER"), deletedProduct)
productRouter.get("/getAggregationProduct",isAuth,getAggregationProduct)
productRouter.get("/recent", isAuth, getRecentViewed);

productRouter.delete("/recent", isAuth, clearRecentView);
export default productRouter