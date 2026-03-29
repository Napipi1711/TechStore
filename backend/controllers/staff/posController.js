import Product from "../../models/Product.js";
import Inventory from "../../models/Inventory.js";
import mongoose from "mongoose";
//views
export const getPosProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 40;
        const category = req.query.category;

        const branchId = req.user.branchId;

        let filter = { isActive: true };

        if (category) {
            filter.categoryId = new mongoose.Types.ObjectId(category);
        }

        // ===== 1. Lấy product =====
        const products = await Product.find(filter)
            .limit(limit)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const productIds = products.map(p => p._id);

        // ===== 2. Lấy inventory liên quan =====
        const inventories = await Inventory.find({
            branchId,
            productId: { $in: productIds }
        });

        // ===== 3. Map nhanh =====
        const inventoryMap = new Map();
        inventories.forEach(inv => {
            inventoryMap.set(inv.productId.toString(), inv);
        });

        // ===== 4. Merge =====
        const result = products.map(p => {
            const inv = inventoryMap.get(p._id.toString());

            return {
                ...p.toObject(),
                stock: inv ? inv.quantity : 0,
                available: inv ? inv.availableQty : 0 // 👈 BONUS
            };
        });

        res.json({
            success: true,
            products: result
        });

    } catch (error) {
        console.error("POS PRODUCT ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
