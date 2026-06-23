import express from 'express'
import { login, resetPassword, sendotp, signup, verifiedOtp } from '../controller/auth.controller'
import { loginValidation, resetPasswordValidation, sendOtpValidation, signupValidation, verifiedOtpValidation } from '../validator/auth.validator'
import { validate } from '../validator/validate'
import { loginLimiter, signupLimiter } from '../middaleware/ratelimit.middleware'

const authRouter = express.Router()

authRouter.post("/signup", signupValidation,signupLimiter ,validate, signup)
authRouter.post("/login", loginValidation,loginLimiter ,validate, login)
authRouter.post("/sendotp", sendOtpValidation, validate, sendotp)
authRouter.post("/verifyotp", verifiedOtpValidation, validate, verifiedOtp)
authRouter.post("/resetpassword", resetPasswordValidation, validate, resetPassword)

export default authRouter