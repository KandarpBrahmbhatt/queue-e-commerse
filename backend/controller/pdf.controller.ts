import { Request, Response } from "express";
import mongoose from "mongoose";
import { generateInvoice } from "../utils/pdf";
import Order from "../models/order.model";
import User from "../models/user.model";

export const getInvoicePDF = async (req: Request, res: Response) => {
    try {
        const { orderId, userId } = req.query;

        const cleanOrderId = orderId ? String(orderId).trim() : undefined;
        const cleanUserId = userId ? String(userId).trim() : undefined;

        if (!cleanOrderId) {
            return res.status(400).json({ message: "orderId query parameter is required" });
        }

        if (!mongoose.Types.ObjectId.isValid(cleanOrderId)) {
            return res.status(400).json({ message: "Invalid orderId format" });
        }

        if (cleanUserId && !mongoose.Types.ObjectId.isValid(cleanUserId)) {
            return res.status(400).json({ message: "Invalid userId format" });
        }

        // Fetch order and populate items.product to ensure product name is available for the invoice
        const order = await Order.findById(cleanOrderId).populate("items.product");
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Fetch user based on query parameter or fallback to the user linked to the order
        const targetUserId = cleanUserId || order.user;
        if (!targetUserId) {
            return res.status(400).json({ message: "User reference not found on order and not provided in query" });
        }
        
        const cleanTargetUserId = String(targetUserId).trim();
        if (!mongoose.Types.ObjectId.isValid(cleanTargetUserId)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }

        const user = await User.findById(cleanTargetUserId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const pdfPath = await generateInvoice(order, user);

        // Send PDF file as an attachment
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=invoice-${order.orderNumber || order._id}.pdf`);
        return res.sendFile(pdfPath);

    } catch (error: any) {
        console.error("getInvoicePDF error:", error);
        return res.status(500).json({ message: "Failed to generate invoice PDF", error: error.message });
    }
};
