import express from "express";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { getAll, Details } from "../../controllers/staff/inventoryController.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/", getAll);
router.get("/:productId/details", Details);

export default router;