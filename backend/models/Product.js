import mongoose from "mongoose";
//done 
const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        sku: { type: String, required: true, unique: true },
        barcode: { type: String, unique: true, sparse: true },

        price: { type: Number, required: true },


        description: String,
        images: [String],

        categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
        brandId: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
        unit: { type: String, default: "pcs", trim: true },

        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model("Product", productSchema);
