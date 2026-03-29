import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Email không hợp lệ",
      ],
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "staff"],
      default: "staff",
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },

    dob: {
      type: Date,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^(0|\+84)(3|5|7|8|9)\d{8}$/, "Số điện thoại không hợp lệ"],
    },

    avatar: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: {
      type: Date,
    },
    resetPasswordToken: { //base64
      type: String,
    },

    resetPasswordExpire: {
      type: Date,
    },
  },

  { timestamps: true }
);

export default mongoose.model("User", userSchema);