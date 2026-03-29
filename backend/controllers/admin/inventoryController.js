import mongoose from "mongoose";
import Inventory from "../../models/Inventory.js";
import InventoryDetail from "../../models/InventoryDetail.js";
import PurchaseDetail from "../../models/PurchaseDetail.js";
import StockMovement from "../../models/StockMovement.js";
import Branch from "../../models/Branch.js";
import Product from "../../models/Product.js";

export const getAll = async (req, res) => {
  try {
    const { branchId, search } = req.query;

    const matchStage = {};
    if (branchId) matchStage.branchId = new mongoose.Types.ObjectId(branchId);

    // Nếu có search, tìm productId phù hợp
    if (search) {
      const regex = new RegExp(search, "i");
      const products = await Product.find({
        $or: [{ name: regex }, { sku: regex }],
      }).select("_id");
      const productIds = products.map((p) => p._id);

      if (productIds.length === 0) {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }

      matchStage.productId = { $in: productIds };
    }

    // Aggregate Inventory + InventoryDetail
    const inventoriesWithQty = await Inventory.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "inventorydetails",
          let: { branchId: "$branchId", productId: "$productId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$branchId", "$$branchId"] },
                    { $eq: ["$productId", "$$productId"] },
                  ],
                },
              },
            },
          ],
          as: "details",
        },
      },
      {
        $addFields: {
          totalOriginal: { $sum: "$details.originalQty" },
          totalRemaining: { $sum: "$details.remainingQty" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "branches",
          localField: "branchId",
          foreignField: "_id",
          as: "branch",
        },
      },
      { $unwind: "$branch" },
      {
        $project: {
          _id: 1,
          branchId: "$branch._id",
          branch: "$branch.name",
          productId: "$product._id",
          product: "$product.name",
          sku: "$product.sku",
          totalOriginal: 1,
          totalRemaining: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: inventoriesWithQty.length,
      data: inventoriesWithQty,
    });
  } catch (error) {
    console.error("Error getAll inventory:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const Details = async (req, res) => {
  try {
    // SỬA Ở ĐÂY: Vì route của bạn là /:branchId/:productId/details 
    // nên phải lấy từ req.params thay vì req.query
    const { branchId, productId } = req.params;

    if (!productId || !branchId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu productId hoặc branchId trong URL params"
      });
    }

    const details = await InventoryDetail.find({ productId, branchId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: details.length,
      data: details,
    });
  } catch (error) {
    console.error("Error getDetails inventory:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};