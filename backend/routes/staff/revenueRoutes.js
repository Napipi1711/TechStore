import express from "express";
import authMiddleware from "../../middlewares/authMiddleware.js";
import isManagerMiddleware from "../../middlewares/managerMiddleware.js";
import { DashboardManager, ReportManager } from "../../controllers/staff/revenueController.js";

const router = express.Router();

router.use(authMiddleware, isManagerMiddleware);

router.get("/", DashboardManager);
router.get("/export", ReportManager);
export default router;