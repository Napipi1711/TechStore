import express from "express";
import { getAllProducts } from "../../controllers/staff/viewProduct.js";

import authMiddleware from "../../middlewares/authMiddleware.js";
import isManagerMiddleware from "../../middlewares/managerMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, isManagerMiddleware, getAllProducts);

export default router; 
