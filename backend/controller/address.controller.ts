import Address from "../models/address.model"
import { Response } from 'express'
import { AuthRequest } from "../models/user.model"

// 1. Used AuthRequest type for 'req' to access the authenticated user's ID (req.user.userId).
// 2. Updated createAddress to save the userId and handle the default address option (clearing previous defaults if new one is default).
// 3. Fixed getAddress to only return addresses belonging to the logged-in user.
// 4. Fixed updateAddress to find and update the address belonging to the user, handled setting/resetting of default address, and returned the updated address.
// 5. Fixed deleteAddress to find and delete the address belonging to the user and returned a success JSON response.

export const createAddress = async (req: AuthRequest, res: Response) => {
    try {
        const { fullName, mobile, addressLine1, addressLine2, city, state, pincode, country, isDefault } = req.body
        console.log(req.body)
        const userId = req.user?.userId

        // If the new address is marked as default, unset isDefault for all other addresses of this user
        if (isDefault) {
            await Address.updateMany({ userId }, { isDefault: false })
        }

        // Create the address and link it to the authenticated userId
        const address = await Address.create({
            userId,
            fullName,
            mobile,
            addressLine1,
            addressLine2,
            city,
            state,
            pincode,
            country: country || "India",
            isDefault: !!isDefault
        })

        return res.status(201).json({ message: "Address created successfully", address })
    } catch (error: any) {
        console.log(`createAddress error`, error)
        return res.status(500).json({ message: "createAddress error", error: error.message })
    }
}

export const getAddress = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId
        // Find only addresses associated with the current user
        const address = await Address.find({ userId })

        if (!address) {
            return res.status(404).json({ message: "Address not found" })
        }
        
        return res.status(200).json({ message: "gettingAddress successfully", address })
    } catch (error: any) {
        console.log(`getAddress error ${error}`)
        // Fixed: Change response status to 500 on error instead of 200
        return res.status(500).json({ message: "gettingAddress error", error: error.message })
    }
}

export const updateAddress = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId
        const { fullName, mobile, addressLine1, addressLine2, city, state, pincode, country, isDefault } = req.body

        // If this address is updated to be the default, unset default status for all other addresses of this user
        if (isDefault) {
            await Address.updateMany({ userId }, { isDefault: false })
        }

        // Find by address ID and userId to ensure a user can only edit their own address
        const address = await Address.findOneAndUpdate(
            { _id: req.params.id, userId },
            {
                fullName,
                mobile,
                addressLine1,
                addressLine2,
                city,
                state,
                pincode,
                country: country || "India",
                isDefault: !!isDefault
            },
            { new: true } // returns the updated document
        )

        if (!address) {
            return res.status(404).json({ message: "Address not found or unauthorized" })
        }

        // Fixed: Added missing success JSON response
        return res.status(200).json({ message: "Address updated successfully", address })
    } catch (error: any) {
        console.log(`updateAddress error ${error}`)
        return res.status(500).json({ message: "updateAddress error", error: error.message })
    }
}

export const deleteAddress = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId
        
        // Find and delete the address matching ID and userId to prevent deleting other users' addresses
        const address = await Address.findOneAndDelete({ _id: req.params.id, userId })

        if (!address) {
            return res.status(404).json({ message: "Address not found or unauthorized" })
        }

        // Fixed: Added missing success JSON response
        return res.status(200).json({ message: "Address deleted successfully", address })
    } catch (error: any) {
        console.log(`Deleted address error ${error}`)
        return res.status(500).json({ message: "deleteAddress error", error: error.message })
    }
}