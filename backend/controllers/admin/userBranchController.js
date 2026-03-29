import UserBranch from "../../models/userBranches.js";
import mongoose from "mongoose";


export const assignManager = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { branchId, userId } = req.body;

    // Bước A: Hạ cấp Manager cũ của chi nhánh này thành 'staff'
    // Nhờ partial index, ta chỉ cần lo việc gỡ role "branch_manager" ra
    await UserBranch.findOneAndUpdate(
      { branchId, role: "branch_manager" },
      { role: "branch_manager" },
      { session }
    );

    // Bước B: Bổ nhiệm Manager mới
    // Sử dụng upsert: nếu user này chưa có trong chi nhánh thì tạo mới, có rồi thì update role
    const manager = await UserBranch.findOneAndUpdate(
      { branchId, userId },
      { role: "branch_manager", isActive: true },
      { upsert: true, new: true, session }
    );

    await session.commitTransaction();
    res.status(200).json({ message: "Bổ nhiệm Manager thành công", manager });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

export const addStaff = async (req, res) => {
  try {
    const { branchId, userId } = req.body;

    // Kiểm tra xem record này đã tồn tại chưa để tránh lỗi trùng index {userId, branchId}
    const existed = await UserBranch.findOne({ userId, branchId });
    if (existed) {
      return res.status(400).json({ message: "Nhân sự này đã thuộc chi nhánh này rồi" });
    }

    const newStaff = await UserBranch.create({
      userId,
      branchId,
      role: "staff"
    });

    res.status(201).json(newStaff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBranchPersonnel = async (req, res) => {
  try {
    const { branchId } = req.params;

    const personnel = await UserBranch.find({ branchId })
      .populate("userId", "name email avatar") 
      .sort({ role: 1 });

    res.status(200).json(personnel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const removeFromBranch = async (req, res) => {
  try {
    const { id } = req.params; 
    await UserBranch.findByIdAndDelete(id);
    res.status(200).json({ message: "Đã xóa nhân sự khỏi chi nhánh" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAssignedUserIds = async (req, res) => {
  try {
    const rows = await UserBranch.find({}, "userId");
    const userIds = [...new Set(rows.map(r => String(r.userId)))];
    return res.status(200).json({ userIds });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};
