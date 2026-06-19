import express from 'express'
import { getInvoicePDF } from '../controller/pdf.controller'

const pdfRouter = express.Router()

pdfRouter.get("/", getInvoicePDF)

export default pdfRouter