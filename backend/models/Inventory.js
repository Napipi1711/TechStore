import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
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
    quantity: { // số lượng tồn kho
      type: Number,
      default: 0,
      min: 0,
    },
    avgCost: { // giá vốn trung bình(dùng để vẽ biểu đồ giá vốn theo thời gian)
      type: Number,
      default: 0,
      min: 0,
    },
    lastPurchasePrice: { // giá mua gần nhất
      type: Number,
      default: 0,
      min: 0,
    },
    reservedQty: { // số lượng đã đặt hàng nhưng chưa nhận (dành cho đơn hàng mua)
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

inventorySchema.index({ productId: 1, branchId: 1 }, { unique: true });
inventorySchema.virtual("availableQty").get(function () {
  return Math.max((this.quantity || 0) - (this.reservedQty || 0), 0);
});

export default mongoose.models.Inventory || mongoose.model("Inventory", inventorySchema);
