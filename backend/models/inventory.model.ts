import { NextFunction } from "express";
import mongoose, { Document, Schema } from "mongoose";

export enum InventoryStatus {
  IN_STOCK = "IN_STOCK",
  LOW_STOCK = "LOW_STOCK",
  OUT_OF_STOCK = "OUT_OF_STOCK",
}

export interface IInventory extends Document {
  productId: mongoose.Types.ObjectId;
  sku: string;
  stock: number;
  reservedStock: number;
  lowStockThreshold: number;
  warehouseLocation: string;
  status: InventoryStatus;
  createdAt: Date;
  updatedAt: Date;
}

const inventorySchema = new Schema<IInventory>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
      index:true
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index:true
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      index:true
    },

    reservedStock: {
      type: Number,
      default: 0,
      min: 0,
      index:true
    },

    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0,
      index:true
    },

    warehouseLocation: {
      type: String,
      default: "Main Warehouse",
      index:true
    },

    status: {
      type: String,
      enum: Object.values(InventoryStatus),
      default: InventoryStatus.IN_STOCK,
      index:true
    },
  },
  {
    timestamps: true,
  }
);




//Automatically update inventory status before saving
inventorySchema.pre("save", function () {
  if (this.stock <= 0) {
    this.status = InventoryStatus.OUT_OF_STOCK;
  } else if (this.stock <= this.lowStockThreshold) {
    this.status = InventoryStatus.LOW_STOCK;
  } else {
    this.status = InventoryStatus.IN_STOCK;
  }

//   next();
});

export default mongoose.model<IInventory>(
  "Inventory",
  inventorySchema
);