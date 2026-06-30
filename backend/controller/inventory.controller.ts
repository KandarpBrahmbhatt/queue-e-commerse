// import { Request, Response } from 'express'
// import Product from '../models/product.model';
// import inventoryModel, { InventoryStatus } from '../models/inventory.model';
// import inventorylogModel, { InventoryLogType } from '../models/inventorylog.model';
// import InventoryLog from '../models/inventorylog.model'

// const updateInventoryStatus = (inventory: any) => {
//     if (inventory.stock <= 0) {
//         inventory.status = InventoryStatus.OUT_OF_STOCK;
//     } else if (inventory.stock <= inventory.lowStockThreshold) {
//         inventory.status = InventoryStatus.LOW_STOCK;
//     } else {
//         inventory.status = InventoryStatus.IN_STOCK;
//     }
// };

// export const createInventory = async (req: Request, res: Response) => {
//     try {
//         const { productId, sku, stock, warehouseLocation, lowStockThreshold, } = req.body;

//         const product = await Product.findById(productId)

//         if (!product) {
//             return res.status(400).json({ message: "product not found" })
//         }

//         const existingProduct = await inventoryModel.findOne({ productId })

//         if (existingProduct) {
//             return res.status(400).json({ message: "Inventory already exiting " })
//         }


//         const inventory = await inventoryModel.create({
//             productId, sku, stock, warehouseLocation, lowStockThreshold,
//         })

//         updateInventoryStatus(inventory);

//         await inventory.save()

//         await inventorylogModel.create({
//             inventoryId: inventory._id,
//             productId,
//             type: InventoryLogType.RESTOCK,
//             quantity: stock,
//             previousStock: 0,
//             newStock: stock,
//             reason: "Initial Stock",
//         })

//         return res.status(200).json({ message: "Inventroy created sucessfully", data: inventory })
//     } catch (error: any) {
//         console.log(`createInventroy error ${error}`)
//         return res.status(500).json({ message: "createInventory error", error: error.message })
//     }
// }


// export const getAlltheInventory = async (req: Request, res: Response) => {
//     try {
//         const page = Number(req.query.page) || 1
//         const limit = Number(req.query.limit) || 10
//         const skip = (page - 1) * limit

//         const search = req.query.search || ""

//         const filter: any = {}

//         if (search) {
//             filter.sku = { $regex: search, $options: "i" }

//         }

//         const inventroy = await inventoryModel.find()
//             .populate("productId")
//             .sort({
//                 createdAt: -1,
//             })
//             .skip(skip)
//             .limit(limit)

//         const total = await inventoryModel.countDocuments(filter)

//         return res.status(200).json({ message: "getAlltheInventory successfully", data: inventroy, total, page, totalPage: Math.ceil(total / limit) })
//     } catch (error: any) {
//         console.log(`getAlltheInventory error ${error}`)
//         return res.status(500).json({ message: "getAlltheinventory error", error: error.message })
//     }
// }


// export const getInventoryById = async (req: Request, res: Response) => {
//     try {
//         const inventory = await inventoryModel.findById(req.params.id).populate("productId")

//         if (!inventory) {
//             return res.status(400).json({ message: "inventroy not found" })
//         }

//         return res.status(200).json({ message: "inventroy getting sucessfully", inventory })
//     } catch (error: any) {
//         console.log(`getInventoryById error ${error}`)
//         return res.status(500).json({ message: "getInventoryById error", error: error.message })
//     }
// }

// export const updateInventory = async (req: Request,res: Response) => {
//     try {
//         const inventory = await inventoryModel.findById(req.params.id);

//         if (!inventory) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Inventory not found",
//             });

//         }

//         const previousStock = inventory.stock;

//         inventory.stock =
//             req.body.stock ?? inventory.stock;

//         inventory.lowStockThreshold =
//             req.body.lowStockThreshold ??
//             inventory.lowStockThreshold;

//         inventory.warehouseLocation =
//             req.body.warehouseLocation ??
//             inventory.warehouseLocation;

//         updateInventoryStatus(inventory);

//         await inventory.save();

//         await InventoryLog.create({

//             inventoryId: inventory._id,

//             productId: inventory.productId,

//             type: InventoryLogType.MANUAL_UPDATE,

//             quantity:
//                 inventory.stock - previousStock,

//             previousStock,

//             newStock: inventory.stock,

//             reason: "Admin Updated Inventory",

//         });

//         return res.status(200).json({

//             success: true,

//             message: "Inventory updated",

//             data: inventory,

//         });

//     } catch (error: any) {

//         return res.status(500).json({

//             success: false,

//             message: error.message,

//         });

//     }

// };


// export const addStock  = async(req:Request,res:Response)=>{
//     try {
//         const {quantity} = req.body

//         const inventory = await inventoryModel.findById(req.params.id)

//         if (!inventory) {
//             return res.status(400).json({message:"invetory not found"})
//         }

//         const previous  = inventory.stock
//         inventory.stock += Number(quantity)

//         updateInventoryStatus(inventory)

//         await inventory.save()

//         await inventorylogModel.create({
//             inventoryId:inventory._id,
//             productId:inventory.productId,
//             type:InventoryLogType.RESTOCK
//         })
//     } catch (error:any) {
//         console.log(`addStock error ${error}`)
//         return res.status(500).json({message:"addStock error",error:error.message})
//     }
// }