// models/permission.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IPermission extends Document {
    name: string;
}

const permissionSchema = new Schema<IPermission>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            uppercase: true
        },

    },
    { timestamps: true }
);

export default mongoose.model<IPermission>(
    "Permission",
    permissionSchema
);