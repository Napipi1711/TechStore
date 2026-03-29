import express from "express";
import {
  getSuppliers,
  getSupplierById,
  create,
  update,
  deleteSupplier,
} from "../../controllers/admin/supplierController.js";

import authMiddleware from "../../middlewares/authMiddleware.js";
import isAdminMiddleware from "../../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getSuppliers);

router.get("/:id", authMiddleware, getSupplierById);

router.post("/", authMiddleware, isAdminMiddleware, create);

router.put("/:id", authMiddleware, isAdminMiddleware, update);

router.delete("/:id", authMiddleware, isAdminMiddleware, deleteSupplier);

export default router;