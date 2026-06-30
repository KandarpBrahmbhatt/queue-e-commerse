import express from 'express'
import { getDashboardSummary } from '../controller/dashboard.controller'


const dashboardRouter = express.Router()

dashboardRouter.get("/get", getDashboardSummary)

export default dashboardRouter