import express from 'express'
import { clearRecentView, createProudct, deletedProduct, getAggregationProduct, getAllProduct, getCurrentProduct, getRecentViewed, updateProduct } from '../controller/prouduct.controller'
import { allowRoles, isAuth } from '../middaleware/auth.middleware'

const productRouter = express.Router()

productRouter.post("/create",isAuth,  allowRoles("ADMIN", "SELLER"),createProudct)
productRouter.get("/get",isAuth,getAllProduct)
productRouter.get("/currentProduct/:id",isAuth,getCurrentProduct)
productRouter.put("/update/:id", isAuth, allowRoles("ADMIN", "SELLER"), updateProduct)
productRouter.delete("/deleted/:id", isAuth, allowRoles("ADMIN", "SELLER"), deletedProduct)
productRouter.get("/getAggregationProduct",isAuth,getAggregationProduct)
productRouter.get("/recent", isAuth, getRecentViewed);

productRouter.delete("/recent", isAuth, clearRecentView);
export default productRouter