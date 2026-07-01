import mongoose, { Document, Schema } from "mongoose";

export enum LoginStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export interface ILoginHistory extends Document {
  userId?: mongoose.Types.ObjectId;
  email: string;
  ipAddress: string;
  browser: string;
  os: string;
  deviceName: string;
  location: string;
  status: LoginStatus;
  failureReason?: string;
  loginTime: Date;
}

const loginHistorySchema = new Schema<ILoginHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref:"User"
    },

    email: {
      type: String,
      required: true,
    },

    ipAddress: {
      type: String,
      default: "",
    },

    browser: {
      type: String,
      default: "Unknown",
    },

    os: {
      type: String,
      default: "Unknown",
    },

    deviceName: {
      type: String,
      default: "Unknown Device",
    },

    location: {
      type: String,
      default: "Unknown",
    },

    status: {
      type: String,
      enum: Object.values(LoginStatus),
      required: true,
    },

    failureReason: {
      type: String,
      default: ""
    },

    loginTime: {
      type: Date,
      default: Date.now()
    },
  },
  {
    timestamps: true
  }
);

export default mongoose.model<ILoginHistory>("LoginHistory", loginHistorySchema);