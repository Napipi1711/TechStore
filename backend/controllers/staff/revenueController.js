import Sale from "../../models/Sale.js";
import SaleDetail from "../../models/SaleDetail.js";
import mongoose from "mongoose";
import Product from "../../models/Product.js";
import StockMovement from "../../models/StockMovement.js";
export const DashboardManager = async (req, res) => {
  try {
    const { from, to, groupBy = "day" } = req.query;

    if (!req.user.branchId) {
      return res.status(400).json({
        message: "Không xác định được chi nhánh của manager",
      });
    }

    // ===== MATCH =====
    const match = {
      status: "paid",
      paidAt: { $ne: null },
      branchId: new mongoose.Types.ObjectId(req.user.branchId),
    };

    if (from || to) {
      match.paidAt = {};
      if (from) {
        const d = new Date(from);
        d.setHours(0, 0, 0, 0);
        match.paidAt.$gte = d;
      }
      if (to) {
        const d = new Date(to);
        d.setHours(23, 59, 59, 999);
        match.paidAt.$lte = d;
      }
    }

    // ===== GROUP =====
    let groupId = {};
    let dateProject = {};

    switch (groupBy) {
      case "day":
        groupId = {
          year: { $year: "$paidAt" },
          month: { $month: "$paidAt" },
          day: { $dayOfMonth: "$paidAt" },
        };
        dateProject = {
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: "$_id.month",
                  day: "$_id.day",
                },
              },
            },
          },
        };
        break;

      case "week":
        groupId = {
          year: { $isoWeekYear: "$paidAt" },
          week: { $isoWeek: "$paidAt" },
        };
        dateProject = {
          date: {
            $concat: [
              "Tuần ",
              { $toString: "$_id.week" },
              " - ",
              { $toString: "$_id.year" },
            ],
          },
        };
        break;

      case "month":
        groupId = {
          year: { $year: "$paidAt" },
          month: { $month: "$paidAt" },
        };
        dateProject = {
          date: {
            $concat: [
              { $toString: "$_id.month" },
              "/",
              { $toString: "$_id.year" },
            ],
          },
        };
        break;

      case "year":
        groupId = {
          year: { $year: "$paidAt" },
        };
        dateProject = {
          date: { $toString: "$_id.year" },
        };
        break;

      default:
        return res.status(400).json({ message: "groupBy không hợp lệ" });
    }

    const result = await Sale.aggregate([
      { $match: match },

      {
        $lookup: {
          from: "saledetails",
          localField: "_id",
          foreignField: "saleId",
          as: "details",
        },
      },

      { $unwind: { path: "$details", preserveNullAndEmptyArrays: true } },

      {
        $group: {
          _id: groupId,
          totalOrders: { $addToSet: "$_id" },
          totalQuantity: { $sum: { $ifNull: ["$details.quantity", 0] } },
          totalRevenue: { $sum: { $ifNull: ["$details.lineTotal", 0] } },
          totalCost: { $sum: { $ifNull: ["$details.costAmount", 0] } },
          totalProfit: { $sum: { $ifNull: ["$details.profitAmount", 0] } },
        },
      },

      {
        $addFields: {
          totalOrders: { $size: "$totalOrders" },
        },
      },

      {
        $project: {
          _id: 0,
          ...dateProject,
          totalOrders: 1,
          totalQuantity: 1,
          totalRevenue: 1,
          totalCost: 1,
          totalProfit: 1,
        },
      },

      {
        $sort: {
          year: 1,
          month: 1,
          week: 1,
          day: 1,
        },
      },
    ]);

    return res.json({
      message: "Dashboard manager fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Dashboard Manager error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};


export const ReportManager = async (req, res) => {
  try {
    const { from, to } = req.query;

   
    if (!req.user.branchId) {
      return res.status(400).json({
        message: "Không xác định được chi nhánh của manager",
      });
    }

    // ===== MATCH =====
    const match = {
      status: "paid",
      paidAt: { $ne: null },
      branchId: new mongoose.Types.ObjectId(req.user.branchId), // chỉ chi nhánh của manager
    };

    // filter theo thời gian
    if (from || to) {
      match.paidAt = {};

      if (from) {
        const d = new Date(from);
        d.setHours(0, 0, 0, 0);
        match.paidAt.$gte = d;
      }

      if (to) {
        const d = new Date(to);
        d.setHours(23, 59, 59, 999);
        match.paidAt.$lte = d;
      }
    }

    // ===== AGGREGATE =====
    const result = await Sale.aggregate([
      { $match: match },

      {
        $lookup: {
          from: "branches",
          localField: "branchId",
          foreignField: "_id",
          as: "branch",
        },
      },

      {
        $lookup: {
          from: "saledetails",
          localField: "_id",
          foreignField: "saleId",
          as: "details",
        },
      },

      { $unwind: "$details" },

      {
        $lookup: {
          from: "products",
          localField: "details.productId",
          foreignField: "_id",
          as: "product",
        },
      },

      {
        $project: {
          _id: 0,
          saleCode: 1,
          paidAt: 1,
          branchName: {
            $ifNull: [{ $arrayElemAt: ["$branch.name", 0] }, ""],
          },
          productName: {
            $ifNull: [{ $arrayElemAt: ["$product.name", 0] }, ""],
          },
          quantity: "$details.quantity",
          price: "$details.price",
          cost: "$details.costPrice",
          revenue: "$details.lineTotal",
          profit: "$details.profitAmount",
        },
      },

      { $sort: { paidAt: -1 } },
    ]);

    return res.json({
      message: "Export data ready",
      data: result,
    });
  } catch (error) {
    console.error("Export Manager error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};