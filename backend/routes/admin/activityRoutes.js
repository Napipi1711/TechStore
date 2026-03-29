import express from "express";
import { auditLogs, Details } from "../../controllers/admin/activityController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import isAdminMiddleware from "../../middlewares/adminMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.use(isAdminMiddleware);

router.get("/", auditLogs);
router.get("/:id", Details);
export default router;
