import express from "express";
import {
  create,
  getAll,
  getById,
  update,
  deleteProduct,
} from "../../controllers/admin/productController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import isAdminMiddleware from "../../middlewares/adminMiddleware.js";
import upload from "../../middlewares/upload.js";

const router = express.Router();

router.use(authMiddleware, isAdminMiddleware);

router.get("/", getAll);
router.get("/:id", getById);

router.post(
  "/",
  upload.array("images", 5), 
  create
);

router.put(
  "/:id",
  upload.array("images", 5),
  update
);

router.delete("/:id", deleteProduct);

export default router;
