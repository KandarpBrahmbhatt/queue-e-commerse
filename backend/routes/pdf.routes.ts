import express from 'express'
import { getInvoicePDF } from '../controller/pdf.controller'
import { isAuth } from '../middaleware/auth.middleware'

const pdfRouter = express.Router()

pdfRouter.get("/", isAuth, getInvoicePDF)

export default pdfRouter