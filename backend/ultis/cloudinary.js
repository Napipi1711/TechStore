import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

if (process.env.CLOUDINARY_NAME) {
  console.log(" Cloudinary Config Loaded");
} else {
  console.log(" Cloudinary Config Failed: Missing Envs");
}

export default cloudinary;