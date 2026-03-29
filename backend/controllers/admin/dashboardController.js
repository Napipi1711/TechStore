import Sale from "../../models/Sale.js";
import SaleDetail from "../../models/SaleDetail.js";
import mongoose from "mongoose";
import Product from "../../models/Product.js";
import StockMovement from "../../models/StockMovement.js";
export const Dashboard = async (req, res) => {
  try {
    const { from, to, groupBy = "day" } = req.query;

    const match = {
      status: "paid",
      paidAt: { $ne: null },
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

    let groupId = { branchId: "$branchId" };
    let dateProject = {};

    switch (groupBy) {
      case "day":
        groupId = {
          ...groupId,
          year: { $year: "$paidAt" },
          month: { $month: "$paidAt" },
          day: { $dayOfMonth: "$paidAt" },
        };
        dateProject = {
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$paidAt" },
          },
        };
        break;

      case "week":
        groupId = {
          ...groupId,
          year: { $isoWeekYear: "$paidAt" },
          week: { $isoWeek: "$paidAt" },
        };
        dateProject = {
          week: "$_id.week",
          year: "$_id.year",
        };
        break;

      case "month":
        groupId = {
          ...groupId,
          year: { $year: "$paidAt" },
          month: { $month: "$paidAt" },
        };
        dateProject = {
          month: "$_id.month",
          year: "$_id.year",
        };
        break;

      case "year":
        groupId = {
          ...groupId,
          year: { $year: "$paidAt" },
        };
        dateProject = {
          year: "$_id.year",
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
        $lookup: {
          from: "branches",
          localField: "_id.branchId",
          foreignField: "_id",
          as: "branch",
        },
      },

      {
        $addFields: {
          branchName: {
            $ifNull: [{ $arrayElemAt: ["$branch.name", 0] }, "Chi nhánh"],
          },
        },
      },

      {
        $project: {
          _id: 0,
          branchId: "$_id.branchId",
          branchName: 1,

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
          branchName: 1,
          year: 1,
          month: 1,
          week: 1,
          day: 1,
        },
      },
    ]);

    return res.json({
      message: "Dashboard data fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
export const topselling = async (req, res) => {
  try {
    let {
      period = "all", // all | month
      month,
      year,
      limit = 10,
      branchId,
    } = req.query;

    limit = Number(limit);

    const match = {
      status: "paid",
      paidAt: { $ne: null },
    };

    // ✅ filter theo chi nhánh (optional)
    if (branchId) {
      match.branchId = new mongoose.Types.ObjectId(branchId);
    }

    // ✅ filter theo tháng
    if (period === "month") {
      if (!month || !year) {
        return res.status(400).json({
          message: "Thiếu month hoặc year",
        });
      }

      month = Number(month);
      year = Number(year);

      const from = new Date(year, month - 1, 1);
      const to = new Date(year, month, 0);
      to.setHours(23, 59, 59, 999);

      match.paidAt = { $gte: from, $lte: to };
    }

    const result = await Sale.aggregate([
      { $match: match },

      // 👉 chỉ lấy field cần thiết (tối ưu RAM)
      {
        $project: {
          _id: 1,
        },
      },

      // 👉 lookup details (pipeline cho nhẹ hơn)
      {
        $lookup: {
          from: "saledetails",
          let: { saleId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$saleId", "$$saleId"] },
              },
            },
            {
              $project: {
                productId: 1,
                quantity: 1,
                lineTotal: 1,
              },
            },
          ],
          as: "details",
        },
      },

      { $unwind: "$details" },

      // 👉 group theo sản phẩm
      {
        $group: {
          _id: "$details.productId",
          totalSold: { $sum: "$details.quantity" },
          totalRevenue: { $sum: "$details.lineTotal" },
        },
      },

      // 👉 lookup product (chỉ lấy name)
      {
        $lookup: {
          from: "products",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$productId"] },
              },
            },
            {
              $project: { name: 1 },
            },
          ],
          as: "product",
        },
      },

      {
        $addFields: {
          productName: {
            $ifNull: [{ $arrayElemAt: ["$product.name", 0] }, "Sản phẩm"],
          },
        },
      },

      {
        $project: {
          _id: 0,
          productId: "$_id",
          productName: 1,
          totalSold: 1,
          totalRevenue: 1,
        },
      },

      { $sort: { totalSold: -1 } },
      { $limit: limit },
    ]);

    return res.json({
      message: "Top selling products fetched successfully",
      period,
      data: result,
    });
  } catch (error) {
    console.error("topSellingProducts error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
export const exportReport = async (req, res) => {
  try {
    const { from, to, branchId } = req.query;

    // ===== MATCH =====
    const match = {
      status: "paid",
      paidAt: { $ne: null },
    };

    // filter thời gian
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

    // filter chi nhánh
    if (branchId) {
      match.branchId = new mongoose.Types.ObjectId(branchId);
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
    console.error("Export error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};