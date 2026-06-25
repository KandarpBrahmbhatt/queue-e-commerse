// models/role.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
    name: string;
    permissions: Schema.Types.ObjectId[];
}

const roleSchema = new Schema<IRole>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            uppercase: true
        },

        permissions: [
            {
                type: Schema.Types.ObjectId,
                ref: "Permission"
            }
        ]
    },
    { timestamps: true }
);

export default mongoose.model<IRole>("Role", roleSchema);