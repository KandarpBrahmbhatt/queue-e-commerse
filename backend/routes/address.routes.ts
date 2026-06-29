import express from 'express'
import { isAuth } from '../middaleware/auth.middleware'
import { createAddress, getAddress, updateAddress, deleteAddress, getAddressListing, getAllAddressListing } from '../controller/address.controller'

// Changes implemented by AI assistant:
// Added get, update, and delete endpoints, all protected with isAuth middleware.
const addressRouter = express.Router()

addressRouter.post("/create", isAuth, createAddress)
addressRouter.get("/get", isAuth, getAddress)
addressRouter.put("/update/:id", isAuth, updateAddress)
addressRouter.delete("/delete/:id", isAuth, deleteAddress)
addressRouter.get("/getAddressListing",isAuth,getAddressListing)
addressRouter.get("/getAllAddressListing",getAllAddressListing)
export default addressRouter