import mongoose from "mongoose";

const saleDetailSchema = new mongoose.Schema(
  {
    saleId: { // đơn hàng
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      required: true,
      index: true,
    },
    productId: { // sản phẩm
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    lineTotal: { // thành tiền = quantity * price
      type: Number,
      required: true,
      min: 0,
    },
    costAmount: { // giá vốn = quantity * costPrice
      type: Number,
      default: 0,
      min: 0,
    },
    profitAmount: { // lợi nhuận = lineTotal - costAmount
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

saleDetailSchema.index({ saleId: 1, productId: 1 });

export default mongoose.models.SaleDetail || mongoose.model("SaleDetail", saleDetailSchema);
