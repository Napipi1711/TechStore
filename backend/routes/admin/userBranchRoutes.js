import express from "express";
import {
  assignManager,
  addStaff,
  getBranchPersonnel,
  removeFromBranch,
  getAssignedUserIds, 
} from "../../controllers/admin/userBranchController.js";

import authMiddleware from "../../middlewares/authMiddleware.js";
import isAdminMiddleware from "../../middlewares/adminMiddleware.js";

const router = express.Router();

router.use(authMiddleware, isAdminMiddleware);

/**
 * @route   
 * @desc   
 */
router.get("/branch/:branchId", getBranchPersonnel);

/**
 * @route   
 * @desc    
 */
router.get("/assigned-user-ids", getAssignedUserIds);

/**
 * @route   
 * @desc    
 */
router.post("/assign-manager", assignManager);

/**
 * @route   
 * @desc   
 */
router.post("/add-staff", addStaff);

/**
 * @route  
 * @desc    
 */
router.delete("/:id", removeFromBranch);

export default router;
