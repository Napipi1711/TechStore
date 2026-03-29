import express from "express";

import { getInvoiceById } from "../../controllers/staff/invoiceController.js";

import authMiddleware from "../../middlewares/authMiddleware.js";

const router = express.Router();


router.use(authMiddleware);
router.get("/invoice/:saleId", authMiddleware, getInvoiceById);

export default router;