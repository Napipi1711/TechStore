import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    saleCode: { // mã đơn hàng
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    branchId: { // chi nhánh
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    staffId: { // nhân viên bán hàng
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    totalCostAmount: { // tổng giá vốn
      type: Number,
      default: 0,
      min: 0,
    },
    totalProfitAmount: { // tổng lợi nhuận
      type: Number,
      default: 0,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "CustomerId is required"],
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "visa", "qr"],
      default: "cash",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending",
    },
    paidAt: { // thời gian thanh toán
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

saleSchema.index({ branchId: 1, createdAt: -1 });
saleSchema.index({ staffId: 1, createdAt: -1 });

export default mongoose.models.Sale || mongoose.model("Sale", saleSchema);
