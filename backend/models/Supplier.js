import mongoose from "mongoose";
const supplierSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  address: String,
  isActive: Boolean,
}, { timestamps: true });
export default mongoose.model("Supplier", supplierSchema);