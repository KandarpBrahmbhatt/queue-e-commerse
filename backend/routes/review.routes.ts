
import express from 'express'
import { createReview, getReview, updateReview, deleteReview } from '../controller/review.controller'
import { isAuth } from '../middaleware/auth.middleware'

const reviewRouter = express.Router()

reviewRouter.post("/create", isAuth, createReview)
reviewRouter.get("/get/:productId", isAuth, getReview)
reviewRouter.put("/update/:id", isAuth, updateReview)
reviewRouter.delete("/delete/:id", isAuth, deleteReview)

export default reviewRouter