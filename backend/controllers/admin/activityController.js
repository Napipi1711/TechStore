import mongoose from "mongoose";
import Log from "../../models/Log.js";
import UserBranch from "../../models/userBranches.js";
export const auditLogs = async (req, res) => {
  try {
    const {
      branchId,
      actorId,
      action,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {
      action: { $ne: "LOGIN" }
    };

    if (branchId) filter.branchId = branchId;
    if (actorId) filter.actorId = actorId;

    if (action) filter.action = action;

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      Log.find(filter)
        .populate("actorId", "name email role")
        .populate("branchId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Log.countDocuments(filter),
    ]);

    res.json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      data: logs,
    });

  } catch (error) {
    console.error("AUDIT LOG ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const Details = async (req, res) => {
  try {
    const { id } = req.params;

    const log = await Log.findById(id)
      .populate("actorId", "name email role phone")
      .populate("branchId", "name address");

    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    res.json(log);

  } catch (error) {
    console.error("AUDIT DETAIL ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};