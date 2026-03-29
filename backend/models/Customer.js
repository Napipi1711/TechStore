import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            default: "",
        },
        phone: {
            type: String,
            trim: true,
            unique: true, 
            required: true,
        },
        email: {
            type: String,
            trim: true,
            default: "",
        },
        address: {
            type: String,
            trim: true,
            default: "",
        },
    },
    { timestamps: true }
);

customerSchema.index({ phone: 1 });

export default mongoose.models.Customer || mongoose.model("Customer", customerSchema);