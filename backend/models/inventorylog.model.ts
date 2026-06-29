import mongoose, { Document, Schema } from "mongoose";

export enum InventoryLogType {
  ORDER = "ORDER",
  RESTOCK = "RESTOCK",
  RETURN = "RETURN",
  CANCEL = "CANCEL",
  MANUAL_UPDATE = "MANUAL_UPDATE",
}

export interface IInventoryLog extends Document {
  inventoryId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  type: InventoryLogType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const inventoryLogSchema = new Schema<IInventoryLog>(
  {
    inventoryId: {
      type: Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },

    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    type: {
      type: String,
      enum: Object.values(InventoryLogType),
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    previousStock: {
      type: Number,
      required: true,
    },

    newStock: {
      type: Number,
      required: true,
    },

    reason: {
      type: String,
      default: "",
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
// inventoryLogSchema.index({inventoryId:1})
inventoryLogSchema.index({productId:1})
inventoryLogSchema.index({type:1})
inventoryLogSchema.index({createdAt:-1})
inventoryLogSchema.index({createdBy:1})

// compound index for product history
inventoryLogSchema.index({productId:1,createdAt:-1})
inventoryLogSchema.index({inventoryId:1,createdAt:-1})
inventoryLogSchema.index({productId:1,type:1})
inventoryLogSchema.index({inventoryId:1,type:1})


export default mongoose.model<IInventoryLog>(
  "InventoryLog",
  inventoryLogSchema
);