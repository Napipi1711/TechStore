import express from "express";
import {
  getAllBranch,
  getBranchById,
  create,
  update,
  deleteBranch,
} from "../../controllers/admin/branchController.js";

import authMiddleware from "../../middlewares/authMiddleware.js";
import isAdminMiddleware from "../../middlewares/adminMiddleware.js";

const router = express.Router();

router.use(authMiddleware, isAdminMiddleware);

router.get("/", getAllBranch);

router.get("/:id", getBranchById);

router.post("/", create);

router.put("/:id", update);

router.delete("/:id", deleteBranch);

export default router;
