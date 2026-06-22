import Order from "../models/order.model"
import Product from "../models/product.model"
import User from "../models/user.model"
import roles from "../models/role.model"
import { Request, Response } from "express"

/**
 * Retrieves high-level dashboard metrics including order counts, user counts, 
 * product counts, and paid revenue. Restricted to Admin/SuperAdmin.
 */
export const getDashboardOverView = async (req: Request, res: Response) => {
    try {
        const totalOrders = await Order.countDocuments()
        const totalUsers = await User.countDocuments()
        const totalProduct = await Product.countDocuments()

        const revenuResult = await Order.aggregate([
            {
                $match: { paymentStatus: "PAID" }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" }
                }
            }
        ])

        const totalRevenue = revenuResult[0]?.totalRevenue || 0

        return res.status(200).json({ message: "getingDashboardOverview successfully", totalOrders, totalUsers, totalProduct, totalRevenue })

    } catch (error) {
        console.log(`getDashBoardOverView error : ${error}`)
        return res.status(500).json({ message: "gettingDashboardOverView error", error })
    }
}

/**
 * Retrieves a list of all registered users in the database, populating their role documents.
 */
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find().populate("role").select("-password");
        return res.status(200).json({ success: true, users });
    } catch (error) {
        console.error("getAllUsers error:", error);
        return res.status(500).json({ success: false, message: "Error fetching users", error });
    }
};

/**
 * Assigns a new role (e.g. USER, ADMIN, SUPER_ADMIN) to a specific user.
 */
export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { roleName } = req.body;

        if (!roleName) {
            return res.status(400).json({ success: false, message: "roleName is required" });
        }

        const targetRole = await roles.findOne({ role: roleName });
        if (!targetRole) {
            return res.status(400).json({ success: false, message: "Role not found" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { role: targetRole._id },
            { new: true }
        ).populate("role");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, message: `User role updated to ${roleName}`, user });
    } catch (error) {
        console.error("updateUserRole error:", error);
        return res.status(500).json({ success: false, message: "Error updating user role", error });
    }
};

/**
 * Blocks or unblocks a specific user. Blocked users are automatically rejected by isAuth.
 */
export const blockOrUnblockUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { isBlocked } = req.body;

        if (typeof isBlocked !== "boolean") {
            return res.status(400).json({ success: false, message: "isBlocked must be a boolean" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { isBlocked },
            { new: true }
        ).populate("role");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const actionText = isBlocked ? "blocked" : "unblocked";
        return res.status(200).json({ success: true, message: `User successfully ${actionText}`, user });
    } catch (error) {
        console.error("blockOrUnblockUser error:", error);
        return res.status(500).json({ success: false, message: "Error updating user block status", error });
    }
};