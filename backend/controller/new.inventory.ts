import { Request, Response } from "express";
import mongoose from "mongoose";

import Inventory, {
    InventoryStatus,
} from "../models/inventory.model";

import InventoryLog, {
    InventoryLogType,
} from "../models/inventorylog.model";

import Product from "../models/product.model";
import inventoryModel from "../models/inventory.model";

/**
 * Update Inventory Status
 */

const updateInventoryStatus = (inventory: any) => {
    if (inventory.stock <= 0) {
        inventory.status = InventoryStatus.OUT_OF_STOCK;
    } else if (inventory.stock <= inventory.lowStockThreshold) {
        inventory.status = InventoryStatus.LOW_STOCK;
    } else {
        inventory.status = InventoryStatus.IN_STOCK;
    }
};
// create inventory
export const createInventory = async (req: Request, res: Response) => {
    try {
        const { productId, sku, stock, warehouseLocation, lowStockThreshold, } = req.body;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const exists = await Inventory.findOne({ productId, });

        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Inventory already exists",
            });
        }

        const inventory = await Inventory.create({
            productId,
            sku,
            stock,
            warehouseLocation,
            lowStockThreshold,
        });

        updateInventoryStatus(inventory);

        await inventory.save();

        await InventoryLog.create({
            inventoryId: inventory._id,
            productId,
            type: InventoryLogType.RESTOCK,
            quantity: stock,
            previousStock: 0,
            newStock: stock,
            reason: "Initial Stock",
        });

        return res.status(201).json({
            success: true,
            message: "Inventory created successfully",
            data: inventory,
        });

    } catch (error: any) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};
// getAll inventory

export const getAllInventory = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = req.query.search || "";

        const skip = (page - 1) * limit;

        const filter: any = {};

        if (search) {
            filter.sku = {
                $regex: search,
                $options: "i",
            };
        }

        const inventory = await Inventory.find(filter)
            .populate("productId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Inventory.countDocuments(filter);

        return res.status(200).json({
            success: true,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            data: inventory,
        });

    } catch (error: any) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};


export const getAllInventoryAggragation = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 10
        const skip = (page - 1) * limit

        const search = (req.query.search as string) || ""
        const matchStage: any = {}

        if (search) {
            matchStage.sku = {
                $regex: search,
                $options: "i"
            }
        }


        const inventory = await Inventory.aggregate([
            {
                $match: matchStage
            },
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "product"
                }
            },

            {
                $unwind: {
                    path: "$product",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    sku: 1,
                    stock: 1,
                    reservedStock: 1,
                    lowStockThreshold: 1,
                    warehouseLocation: 1,
                    status: 1,
                    createdAt: 1,
                    "product._id": 1,
                    "product.productName": 1,
                    "product.price": 1,
                    "product.images": 1,
                    "product.category": 1,
                },
            },
            {
                $sort: {
                    createdAt: -1
                }
            },

            {
                $facet: {
                    data: [
                        {
                            $skip: skip
                        },
                        {
                            $limit: limit
                        },
                    ],

                    totalCount: [
                        {
                            $count: "count"
                        }
                    ]
                }
            }
        ])

        const total = await inventoryModel.countDocuments()
        return res.status(200).json({ message: "getAllInventroyAggragation successfully", inventory, total, totalPages: Math.ceil(total / limit), page, limit })
    } catch (error: any) {
        console.log(`getAllInventoryAggragation error ${error}`)
        return res.status(500).json({ message: "getAllInventoryAggragation error", error: error.message })
    }
}


// getInventoryById

export const getInventoryById = async (req: Request, res: Response) => {
    try {
        const inventory = await Inventory.findById(req.params.id).populate("productId");

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: "Inventory not found",
            });

        }

        return res.status(200).json({
            success: true,
            data: inventory,
        });

    } catch (error: any) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};

// update inventory
export const updateInventory = async (
    req: Request,
    res: Response
) => {

    try {

        const inventory = await Inventory.findById(
            req.params.id
        );

        if (!inventory) {

            return res.status(404).json({
                success: false,
                message: "Inventory not found",
            });

        }

        const previousStock = inventory.stock;

        inventory.stock =
            req.body.stock ?? inventory.stock;

        inventory.lowStockThreshold =
            req.body.lowStockThreshold ??
            inventory.lowStockThreshold;

        inventory.warehouseLocation =
            req.body.warehouseLocation ??
            inventory.warehouseLocation;

        updateInventoryStatus(inventory);

        await inventory.save();

        await InventoryLog.create({

            inventoryId: inventory._id,

            productId: inventory.productId,

            type: InventoryLogType.MANUAL_UPDATE,

            quantity:
                inventory.stock - previousStock,

            previousStock,

            newStock: inventory.stock,

            reason: "Admin Updated Inventory",

        });

        return res.status(200).json({

            success: true,

            message: "Inventory updated",

            data: inventory,

        });

    } catch (error: any) {

        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};

// add stock

export const addStock = async (
    req: Request,
    res: Response
) => {

    try {

        const { quantity } = req.body;

        const inventory = await Inventory.findById(
            req.params.id
        );

        if (!inventory) {

            return res.status(404).json({
                success: false,
                message: "Inventory not found",
            });

        }

        const previous = inventory.stock;

        inventory.stock += Number(quantity);

        updateInventoryStatus(inventory);

        await inventory.save();

        await InventoryLog.create({

            inventoryId: inventory._id,

            productId: inventory.productId,

            type: InventoryLogType.RESTOCK,

            quantity,

            previousStock: previous,

            newStock: inventory.stock,

            reason: "Stock Added",

        });

        return res.status(200).json({

            success: true,

            message: "Stock added successfully",

            data: inventory,

        });

    } catch (error: any) {

        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};

// remove stock

export const removeStock = async (
    req: Request,
    res: Response
) => {

    try {

        const { quantity } = req.body;

        const inventory = await Inventory.findById(
            req.params.id
        );

        if (!inventory) {

            return res.status(404).json({

                success: false,

                message: "Inventory not found",

            });

        }

        if (inventory.stock < quantity) {

            return res.status(400).json({

                success: false,

                message: "Insufficient Stock",

            });

        }

        const previous = inventory.stock;

        inventory.stock -= quantity;

        updateInventoryStatus(inventory);

        await inventory.save();

        await InventoryLog.create({

            inventoryId: inventory._id,

            productId: inventory.productId,

            type: InventoryLogType.ORDER,

            quantity,

            previousStock: previous,

            newStock: inventory.stock,

            reason: "Stock Removed",

        });

        return res.status(200).json({

            success: true,

            message: "Stock removed successfully",

            data: inventory,

        });

    } catch (error: any) {

        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};

// deletestock

export const deleteInventory = async (
    req: Request,
    res: Response
) => {

    try {

        const inventory = await Inventory.findByIdAndDelete(req.params.id);
        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: "Inventory not found",
            });

        }
        return res.status(200).json({
            success: true,
            message: "Inventory deleted successfully",
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message,

        });

    }

};

// low stock product

export const getLowStockProducts = async (
    req: Request,
    res: Response
) => {

    try {

        const inventory = await Inventory.find({

            $expr: {
                $lte: [
                    "$stock",
                    "$lowStockThreshold",
                ],
            },

        }).populate("productId");

        return res.status(200).json({

            success: true,

            count: inventory.length,

            data: inventory,

        });

    } catch (error: any) {

        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};

// inventroy history

export const getInventoryHistory = async (
    req: Request,
    res: Response
) => {

    try {

        const history =
            await InventoryLog.find({

                inventoryId: req.params.id,

            }).sort({

                createdAt: -1,

            });

        return res.status(200).json({

            success: true,

            count: history.length,

            data: history,

        });

    } catch (error: any) {

        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};