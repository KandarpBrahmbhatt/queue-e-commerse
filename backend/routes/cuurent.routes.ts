import express from 'express'
import { cuurentUser, updateCurrentUserProfile } from '../controller/cuurentUser.controller'
import { isAuth } from '../middaleware/auth.middleware'

const currentProfileRouter = express.Router()

currentProfileRouter.get("/currentProfile",isAuth,cuurentUser)
currentProfileRouter.put("/update",isAuth,updateCurrentUserProfile)

export default currentProfileRouter