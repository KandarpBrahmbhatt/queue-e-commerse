import express from 'express'
// import upload from '../middaleware/multer.middleware'
import { ExportExcel, importExcleProducts } from '../controller/productImport.controller'

const importProductRouter = express.Router()

// importProductRouter.post("/import",upload.single("file"),importProducts)
importProductRouter.get("/export",ExportExcel)
importProductRouter.post("/import",importExcleProducts)
export default importProductRouter