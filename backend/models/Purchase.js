import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    purchaseCode: { // mã đơn hàng 
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    supplierId: { // nhà cung cấp
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    branchId: { // chi nhánh
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    managerId: { // người quản lý đơn hàng 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },


    totalAmount: {// tổng
      type: Number,
      default: 0,
      min: 0,
    },
    status: { // trạng thái 
      type: String,
      enum: ["pending", "confirmed", "cancelled", "returned"],
      default: "pending",
    },
    note: { // ghi chú 
      type: String,
      trim: true,
      default: "",
    },
    confirmedAt: { // xác nhận lúc nào
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

purchaseSchema.index({ branchId: 1, createdAt: -1 });
purchaseSchema.index({ supplierId: 1, createdAt: -1 });

export default mongoose.models.Purchase || mongoose.model("Purchase", purchaseSchema);
