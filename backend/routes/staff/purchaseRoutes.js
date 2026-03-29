import express from "express";
import {
    createPurchase,
    getAllPurchases,
    getPurchaseById,
    updatePurchase,
    confirmPurchase,
    cancelPurchase,
    deletePurchase,
    returnPurchase
} from "../../controllers/staff/purchaseController.js";
//của thằng manager
import authMiddleware from "../../middlewares/authMiddleware.js";
import isManagerMiddleware from "../../middlewares/managerMiddleware.js";

const router = express.Router();

// GET all purchases
router.get("/", authMiddleware, isManagerMiddleware, getAllPurchases);

// GET purchase by id
router.get("/:id", authMiddleware, isManagerMiddleware, getPurchaseById);

// CREATE purchase (staff + manager)
router.post("/", authMiddleware, isManagerMiddleware, createPurchase);

// UPDATE purchase (chỉ sửa khi pending)
router.put("/:id", authMiddleware, isManagerMiddleware, updatePurchase);

// CONFIRM purchase (manager)
router.patch("/:id/confirm", authMiddleware, isManagerMiddleware, confirmPurchase);

// CANCEL purchase (manager)
router.patch("/:id/cancel", authMiddleware, isManagerMiddleware, cancelPurchase);

// DELETE purchase (manager)
router.delete("/:id", authMiddleware, isManagerMiddleware, deletePurchase);

// RETURN purchase (manager)
router.patch("/:id/return", authMiddleware, isManagerMiddleware, returnPurchase);
export default router;