import mongoose, { Document, Schema } from "mongoose";

import { Types } from "mongoose";

export interface ISession extends Document {
  userId: Types.ObjectId;
  refreshToken: string;
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string;
  userAgent: string;
  loginAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    refreshToken: {
      type: String,
      required: true,
    },

    deviceName: {
      type: String,
      default: "Unknown Device",
    },

    browser: {
      type: String,
      default: "Unknown Browser",
    },

    os: {
      type: String,
      default: "Unknown OS",
    },

    ipAddress: {
      type: String,
      default: "",
    },

    userAgent: {
      type: String,
      default: "",
    },

    loginAt: {
      type: Date,
      default: Date.now,
    },

    lastActivity: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// One user can have many sessions

sessionSchema.index({
  user: 1,
  isActive: 1,
});

//Remove expired sessions automatically
// MongoDB TTL Monitor checks about once a minute.

sessionSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  }
);

export const SessionModel = mongoose.model<ISession>(
  "Session",
  sessionSchema
);

export default mongoose.model<ISession>("Session", sessionSchema);