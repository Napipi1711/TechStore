import mongoose from "mongoose";

const inventoryDetailSchema = new mongoose.Schema(
  {
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    purchaseItemId: { // link về đơn nhập
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseDetail",
      required: true,
    },

    lotCode: { // mã lô nhập, tự sinh nếu không có
      type: String,
      trim: true,
      default: () => `LOT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    },

    originalQty: { // số lượng nhập ban đầu
      type: Number,
      required: true,
      min: 1,
    },

    remainingQty: { // còn lại để bán
      type: Number,
      required: true,
      min: 0,
    },

    costPrice: { // 🔥 giá vốn thật của lô này
      type: Number,
      required: true,
      min: 0,
    },

    receivedAt: { // ngày nhập (dùng FIFO / FEFO)
      type: Date,
      default: Date.now,
    },



    status: {
      type: String,
      enum: ["open", "depleted", "cancelled", "returned"],
      default: "open",
    },
  },
  { timestamps: true }
);

// index để query FIFO nhanh
inventoryDetailSchema.index({
  branchId: 1,
  productId: 1,
  receivedAt: 1,
});

export default mongoose.models.InventoryDetail ||
  mongoose.model("InventoryDetail", inventoryDetailSchema);