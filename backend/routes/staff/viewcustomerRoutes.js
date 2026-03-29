import express from "express";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { create, getById, getPhone, getAll, getAllPurchase } from "../../controllers/staff/customerController.js";

const router = express.Router();
router.get("/", authMiddleware, getAll);

router.post("/", authMiddleware, create);

router.get("/id/:id", authMiddleware, getById);

router.get("/phone", authMiddleware, getPhone);
router.get("/purchases/all", authMiddleware, getAllPurchase);
export default router;