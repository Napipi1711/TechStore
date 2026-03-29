import Log from "../../models/Log.js";
import UserBranch from "../../models/userBranches.js";
import Sale from "../../models/Sale.js";
import SaleDetail from "../../models/SaleDetail.js"
import mongoose from "mongoose";

export const getAllLogs = async (req, res) => {
  try {
    const managerBranchId = req.user?.branchId;
    const managerBranchRole = req.user?.branchRole;

    if (!managerBranchId || managerBranchRole !== "branch_manager") {
      return res.status(403).json({ message: "Only branch manager can view staff logs" });
    }

    const { staffName, date, action, level, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Number(limit), 50);
    const skip = (pageNum - 1) * limitNum;

    // Lấy staff trong branch
    let staffInBranch = await UserBranch.find({
      branchId: managerBranchId,
      role: "staff",
    }).populate({ path: "userId", select: "name" });

    // Filter theo tên nhân viên 
    if (staffName) {
      staffInBranch = staffInBranch.filter(sb =>
        sb.userId.name.toLowerCase().includes(staffName.toLowerCase())
      );
    }

    const staffIds = staffInBranch.map(sb => sb.userId._id);

    if (staffIds.length === 0) {
      return res.json({ total: 0, page: pageNum, totalPages: 0, data: [] });
    }

    // Filter log
    const filter = {
      branchId: managerBranchId,
      actorId: { $in: staffIds },
    };

    if (action) filter.action = action;
    if (level) filter.level = level;

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const [logs, total] = await Promise.all([
      Log.find(filter)
        .populate({ path: "actorId", select: "name email role phone" })
        .populate({ path: "branchId", select: "name address" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Log.countDocuments(filter),
    ]);

    res.json({
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: logs,
    });

  } catch (error) {
    console.error("BRANCH STAFF LOG ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getBranchStaffLogDetails = async (req, res) => {
  try {
    const managerBranchId = req.user?.branchId;
    const managerBranchRole = req.user?.branchRole;
    const { id } = req.params;

    if (!managerBranchId) {
      return res.status(403).json({ message: "Your account is not assigned to any branch" });
    }

    if (managerBranchRole !== "branch_manager") {
      return res.status(403).json({ message: "Only branch manager can view branch staff logs" });
    }

    // Lấy log
    const log = await Log.findById(id)
      .populate("actorId", "name email role phone")
      .populate("branchId", "name address");

    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    const logBranchId = typeof log.branchId === "object" ? log.branchId?._id : log.branchId;
    const logActorId = typeof log.actorId === "object" ? log.actorId?._id : log.actorId;

    // Kiểm tra actorId có thực sự là staff trong branch không
    const actorBranch = await UserBranch.findOne({
      userId: logActorId,
      branchId: managerBranchId,
      role: "staff",
    });

    if (!actorBranch) {
      return res.status(403).json({ message: "Actor is not a staff in this branch" });
    }

    // Kiểm tra branch
    const isCorrectBranch = String(logBranchId) === String(managerBranchId);
    if (!isCorrectBranch) {
      return res.status(403).json({ message: "You are not allowed to view this log" });
    }

    // Lấy sale gần nhất do staff tạo vào thời điểm log
    const sale = await Sale.findOne({
      staffId: logActorId,
      branchId: managerBranchId,
      createdAt: { $lte: log.createdAt },
    }).sort({ createdAt: -1 });

    let saleDetails = [];
    if (sale) {
      saleDetails = await SaleDetail.find({ saleId: sale._id }).populate("productId", "name category");
    }

    res.json({
      data: {
        log,
        sale,
        saleDetails,
      },
    });
  } catch (error) {
    console.error("BRANCH STAFF LOG DETAIL ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
