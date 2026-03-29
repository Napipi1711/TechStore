import Inventory from "../../models/Inventory.js";
import UserBranch from "../../models/userBranches.js";
import StockMovement from "../../models/StockMovement.js";
import Log from "../../models/Log.js";
import mongoose from "mongoose";
import Product from "../../models/Product.js";
import Branch from "../../models/Branch.js";
import PurchaseDetail from "../../models/PurchaseDetail.js";
import Purchase from "../../models/Purchase.js";
const getManagerBranchId = async (userId) => {
  if (!userId) return null;

  const userBranch = await UserBranch.findOne({
    userId,
    role: "branch_manager",
  });

  return userBranch?.branchId || null;
};

// GET ALL INVENTORIES
export const getAll = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const branchId = await getManagerBranchId(userId);
    if (!branchId) {
      return res.status(403).json({
        success: false,
        message: "Manager is not assigned to any branch",
      });
    }

    const inventories = await Inventory.find({ branchId })
      .populate("productId", "name sku price")
      .populate("branchId", "name address")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: inventories.length,
      data: inventories,
    });
  } catch (error) {
    console.error("Error fetching manager inventories:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET INVENTORY DETAILS
export const Details = async (req, res) => {
  try {
    const { productId } = req.params;
    const { type, source, from, to } = req.query; // thêm from/to
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const branchId = await getManagerBranchId(userId);
    if (!branchId) {
      return res.status(403).json({
        success: false,
        message: "Manager is not assigned to any branch",
      });
    }

    const inventory = await Inventory.findOne({ branchId, productId })
      .populate("productId", "name sku price")
      .populate("branchId", "name address");

    if (!inventory) {
      return res.status(404).json({ success: false, message: "Inventory not found" });
    }

    // ===== Build dynamic filter cho StockMovement =====
    const movementFilter = { branchId, productId };
    if (type) movementFilter.type = type;
    if (source) movementFilter.source = source;

    // filter theo thời gian
    if (from || to) {
      movementFilter.createdAt = {};
      if (from) movementFilter.createdAt.$gte = new Date(from);
      if (to) movementFilter.createdAt.$lte = new Date(to);
    }

    const movements = await StockMovement.find(movementFilter)
      .populate({
        path: "lotId",
        populate: {
          path: "purchaseItemId",
          model: "PurchaseDetail",
          populate: {
            path: "purchaseId",
            model: "Purchase",
            select: "supplierId totalAmount status createdAt",
          },
        },
      })
      .sort({ createdAt: -1 });

    // ===== Build dynamic filter cho Logs =====
    const logFilter = { branchId, "details.productId": productId };
    if (from || to) {
      logFilter.createdAt = {};
      if (from) logFilter.createdAt.$gte = new Date(from);
      if (to) logFilter.createdAt.$lte = new Date(to);
    }

    const logs = await Log.find(logFilter)
      .populate("actorId", "name email role")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({
      success: true,
      data: { inventory, movements, logs },
    });
  } catch (error) {
    console.error("Error fetching inventory details:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};