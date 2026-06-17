import {Response,NextFunction } from "express";
import jwt from 'jsonwebtoken'
import { AuthRequest } from "../models/user.model";

export const isAuth = async(req:AuthRequest,res:Response,next:NextFunction)=>{
    try {
        const token = req.cookies?.AccessToken

        if (!token) {
            return res.status(400).json({message:"not Authenticated unauthorized - Token missing"})
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET!) as{userId:string}
        req.user = decoded
        next()
    } catch (error) {
        console.log("isAuth error",error)
        return res.status(401).json({message:"isAuth error Invalid token",error})
    }
}