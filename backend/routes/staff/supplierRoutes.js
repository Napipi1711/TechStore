import express from "express";
import { getSuppliers, getSupplierById, } from "../../controllers/admin/supplierController.js";

import authMiddleware from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getSuppliers);
router.get("/:id", authMiddleware, getSupplierById);
export default router;