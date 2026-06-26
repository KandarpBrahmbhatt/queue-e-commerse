import jwt from 'jsonwebtoken'
import User, { AuthRequest } from '../models/user.model'
import { Response } from 'express'
import bcrypt from 'bcryptjs'

export const cuurentUser = async(req:AuthRequest,res:Response)=>{
    try {
        const user = await User.findById(req.user?.userId).select("-password")
    
        if (!user) {
            return res.status(404).json({message:"User not found"}
        }

        return res.status(200).json({message:"profile fatched successfully",data:user})
    } catch (error:any) {
        console.log(`cuurent user error ${error}`)
        return res.status(500).json({message:"cuurent user error",error:error.message})
    }
}

export const updateCurrentUserProfile = async(req:AuthRequest,res:Response)=>{
    try {
        const {name,email,password}  = req.body

        const user  = await User.findById(req.user?.userId)

        if (!user) {
            return res.status(404).json({message:"User not found"})
        }

        if (email && email !== user.email) {
            const existUser = await User.findOne({email})

            if (existUser) {
                return res.status(400).json({message:"Email already in use"})
            }

            user.email = email
        }

        if (name) {
            user.name = name
        }

        if (password) {
            user.password = await bcrypt.hash(password, 10)
        }

        await user.save()

        const { password: _, ...updatedUser } = user.toObject();

        return res.status(200).json({message:"Profile updated successfully",data:updatedUser})
    } catch (error:any) {
        console.log(`updateCurrentProfile error ${error}`)
        return res.status(500).json({message:"Error updating profile",error:error.message})
    }
}