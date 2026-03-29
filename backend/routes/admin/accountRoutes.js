import express from "express";
import {
  create,
  listAccounts,
  getId,
  update,
  deleteAccount,
} from "../../controllers/admin/accountController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import isAdminMiddleware from "../../middlewares/adminMiddleware.js";
import upload from "../../middlewares/upload.js";

const router = express.Router();

router.use(authMiddleware, isAdminMiddleware);

router.get("/", listAccounts);
router.get("/:id", getId);

router.post(
  "/",
  upload.single("avatar"),
  create
);

router.put(
  "/:id",
  upload.single("avatar"),
  update
);

router.delete("/:id", deleteAccount);

export default router;
