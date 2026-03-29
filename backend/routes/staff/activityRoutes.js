import express from "express";
import {
  getAllLogs,
  getBranchStaffLogDetails,
} from "../../controllers/staff/activityController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import managerMiddleware from "../../middlewares/managerMiddleware.js";

const router = express.Router();

router.use(authMiddleware, managerMiddleware);

router.get("/", getAllLogs);
router.get("/:id", getBranchStaffLogDetails);

export default router;