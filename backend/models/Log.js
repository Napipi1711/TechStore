import mongoose from "mongoose";

const { Schema, Types } = mongoose;
const ObjectId = Types.ObjectId;

const logSchema = new Schema(
  {
    level: {
      type: String,
      enum: ["INFO", "WARN", "ERROR"],
      default: "INFO",
    },

    actorId: {
      type: ObjectId,
      ref: "User",
      required: true,
    },

    branchId: {
      type: ObjectId,
      ref: "Branch",
      default: null,
    },

    action: {
      type: String,
      required: true,
      index: true,
    },

    targetType: String,
    targetId: ObjectId,

    message: String,
    details: Schema.Types.Mixed,

    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      default: "SUCCESS",
    },

    ip: String,
    device: String,
  },
  { timestamps: true }
);

logSchema.index({ createdAt: -1 });
logSchema.index({ actorId: 1 });
logSchema.index({ branchId: 1 });
logSchema.index({ action: 1 });

export default mongoose.model("Log", logSchema, "logs");
