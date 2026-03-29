import express from "express";
import {
    login,
    getProfile,
    forgotPassword,
    resetPassword
} from "../controllers/UserController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// auth
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// protected
router.use(authMiddleware);
router.get("/profile", getProfile);

export default router;