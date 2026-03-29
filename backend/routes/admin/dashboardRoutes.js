import express from "express";
import { Dashboard, topselling, exportReport } from "../../controllers/admin/dashboardController.js";

import authMiddleware from "../../middlewares/authMiddleware.js";
import isAdminMiddleware from "../../middlewares/adminMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(isAdminMiddleware);

router.get("/", Dashboard);
router.get("/top-selling", topselling);
router.get("/export-report", exportReport);
export default router;