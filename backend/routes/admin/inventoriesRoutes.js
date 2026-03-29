import express from "express";
import { getAll, Details } from "../../controllers/admin/inventoryController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import isAdminMiddleware from "../../middlewares/adminMiddleware.js";
const router = express.Router();
router.use(authMiddleware, isAdminMiddleware);
router.get("/", getAll);
router.get("/:branchId/:productId/details", Details); // FIFO 
export default router;  