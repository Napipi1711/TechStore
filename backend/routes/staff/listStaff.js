import express from "express";
import { lists ,getSaleStatus} from "../../controllers/staff/listStaffController.js";

import authMiddleware from "../../middlewares/authMiddleware.js";
import isManagerMiddleware from "../../middlewares/managerMiddleware.js";

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    isManagerMiddleware,
    lists
);
router.get(
    "/sale-status",
    authMiddleware,
    isManagerMiddleware,
    getSaleStatus
);
export default router;