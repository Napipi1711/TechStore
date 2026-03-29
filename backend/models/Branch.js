import mongoose from "mongoose";

 const branchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, match: [/^(0|\+84)\d{9}$/] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Branch", branchSchema);


