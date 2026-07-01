import express from 'express'
import { login, resetPassword, sendotp, signup, verifiedOtp, forgotPassword } from '../controller/auth.controller'
import { isAuth } from '../middaleware/auth.middleware'
// import {authSwagger} from "../swagger/auth.swagger"
const authRouter = express.Router()

authRouter.post("/signup",signup)
authRouter.post("/login",login)
authRouter.post("/sendotp", sendotp)
authRouter.post("/verifyotp", verifiedOtp)
authRouter.post("/resetpassword", resetPassword)
authRouter.post("/forgotpassword", isAuth, forgotPassword)

export default authRouter