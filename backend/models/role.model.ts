import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        enum: ["USER", "ADMIN", "MANAGER", "SELLER"],
        default: "USER",
        unique: true
    },
    permissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission"
    }]
}, { timestamps: true });

export default mongoose.model("Role", roleSchema);