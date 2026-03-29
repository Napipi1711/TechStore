import express from "express";
import { getMyBranch } from "../../controllers/staff/viewBranch.js";

import authMiddleware from "../../middlewares/authMiddleware.js";
import isManagerMiddleware from "../../middlewares/managerMiddleware.js";

const router = express.Router();


// lấy branch (chỉ manager)
router.get(
    "/",
    authMiddleware,
    isManagerMiddleware,
    getMyBranch
);

export default router;