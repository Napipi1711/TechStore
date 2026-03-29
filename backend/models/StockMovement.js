import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    lotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryDetail",
      default: null,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    type: {
      type: String,
      enum: ["in", "out", "adjustment"],
      required: true,
    },
    source: {
      type: String,
      enum: ["purchase", "sale", "return", "adjustment"],
      required: true,
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    unitCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

stockMovementSchema.index({ branchId: 1, productId: 1, createdAt: -1 });

export default mongoose.models.StockMovement || mongoose.model("StockMovement", stockMovementSchema);
