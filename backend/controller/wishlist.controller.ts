import { Response } from 'express'
import { AuthRequest } from '../models/user.model'
import WishList from '../models/wishList.model'

/**
 * Adds a product to the user's wishlist.
 * Enforces authentication and assigns the wishlist entry to the requesting user.
 */
export const addtoWishList = async (req: Request, res: Response) => {
    try {
        const { productId } = req.body
        const userId = req.user?.userId

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized - User session not found" })
        }

        const wishlist = await wishlist.findOne(user:userId)

        const wishtList = await WishList.create({
            user: userId,
            products:[productId]
        })
        
        return res.status(200).json({ message: "createwishlist successfully", wishtList })
    } catch (error) {
        console.log(`create wishlist error ${error}`)
        return res.status(500).json({ message: "create wishlist error", error })
    }
}