import express from "express";
import {
  createBrand,
  listBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
} from "../../controllers/admin/brandController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import isAdminMiddleware from "../../middlewares/adminMiddleware.js";
import upload from "../../middlewares/upload.js";

const router = express.Router();

router.use(authMiddleware, isAdminMiddleware);

router.get("/", listBrands);

router.get("/:id", getBrandById);

router.post(
  "/",
  upload.single("logo"),
  createBrand
);

router.put(
  "/:id",
  upload.single("logo"),
  updateBrand
);

router.delete("/:id", deleteBrand);

export default router;
