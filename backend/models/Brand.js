import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },

        slug: { // ví dụ name là Apple 13 Pro Max thì slug sẽ là apple-13-pro-max  tạo URL /brand/65b2f123abc98f123
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        logo: {
            type: String,
            default: "",
        },

        description: {
            type: String,
            trim: true,
            default: "",
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Brand", brandSchema);
