import express from "express";
import {
    create,
    getAll,
    getById,
    update,
    deleteCategory,
} from "../../controllers/admin/categoriesController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import isAdminMiddleware from "../../middlewares/adminMiddleware.js";
const router = express.Router();
router.use(authMiddleware, isAdminMiddleware);
router.post("/", create);
router.get("/", getAll);
router.get("/:id", getById);
router.put("/:id", update);
router.delete("/:id", deleteCategory);
export default router;