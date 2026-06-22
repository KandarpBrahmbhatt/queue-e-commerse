import express from 'express'
import { login, resetPassword, sendotp, signup, verifiedOtp } from '../controller/auth.controller'

const authRouter = express.Router()

authRouter.post("/signup",signup)
authRouter.post("/login",login)
authRouter.post("/sendotp", sendotp)
authRouter.post("/verifyotp", verifiedOtp)
authRouter.post("/resetpassword", resetPassword)

export default authRouter