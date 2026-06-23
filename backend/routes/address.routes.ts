import express from 'express'
import { isAuth } from '../middaleware/auth.middleware'
import { createAddress, deleteAddress, getAddress, updateAddress } from '../controller/address.controller'
import { createAddressValidator, updateAddressValidator } from '../validator/address.validator'

const addressRouter = express.Router()

addressRouter.post("/create",isAuth,createAddressValidator,createAddress)
addressRouter.get("/get",isAuth,getAddress)

addressRouter.put("/:id/update",isAuth,updateAddressValidator,updateAddress)

addressRouter.delete("/:id/delete",isAuth,deleteAddress)

export default addressRouter