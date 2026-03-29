import express from "express";
import { getPosProducts } from "../../controllers/staff/posController.js";
import { getAll as getCategories } from "../../controllers/admin/categoriesController.js";
import { searchs } from "../../controllers/staff/searchController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { checkoutPOS, confirmQRPayment, getSaleStatus, Details ,viewHistory } from "../../controllers/staff/salesController.js";

const router = express.Router();

router.get("/products", authMiddleware, getPosProducts);


router.get("/categories", authMiddleware, getCategories);

router.get("/search", authMiddleware, searchs);
router.get("/viewHistory", authMiddleware, viewHistory);
router.post("/checkout", authMiddleware, checkoutPOS);
router.get("/sales/product/:productId", authMiddleware, Details);
router.get("/confirm-qr/:saleId", confirmQRPayment);
router.get("/payment-status/:saleId", getSaleStatus);
export default router;