import Branch from "../../models/Branch.js";
import UserBranch from "../../models/UserBranches.js";
import mongoose from "mongoose";

export const create = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { name, code, address, phone } = req.body;
    const existed = await Branch.findOne({ code });
    if (existed) return res.status(400).json({ message: "Code đã tồn tại" });
    const branch = await Branch.create(
      [{ name, code, address, phone }],
      { session }
    );

    await session.commitTransaction();
    res.status(201).json({
      message: "Succeccfully created branch",
      branch: branch[0]
    });

  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

export const getAllBranch = async (req, res) => {
    try {
        const branches = await Branch.find().sort({ createdAt: -1 }).lean();

        const result = await Promise.all(branches.map(async (b) => {
            const managerRel = await UserBranch.findOne({ 
                branchId: b._id, 
                role: "branch_manager" 
            }).populate("userId", "name email phone avatar");

            return {
                ...b,
                manager: managerRel ? managerRel.userId : null
            };
        }));

        res.json({ total: result.length, branches: result });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getBranchById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: "ID không hợp lệ" });

        const branch = await Branch.findById(id).lean();
        if (!branch) return res.status(404).json({ message: "Không tìm thấy chi nhánh" });

        const allUsers = await UserBranch.find({ branchId: id })
            .populate("userId", "name email phone avatar")
            .lean();

        const manager = allUsers.find(u => u.role === "branch_manager")?.userId || null;
        const staff = allUsers.filter(u => u.role === "staff").map(s => s.userId);

        res.json({
            ...branch,
            manager,
            staff
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const update = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        const { managerId, ...updateData } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: "ID chi nhánh không hợp lệ" });

        const branch = await Branch.findByIdAndUpdate(id, updateData, { 
            new: true, session 
        });

        if (managerId) {

            const conflict = await UserBranch.findOne({
                userId: managerId,
                role: "branch_manager",
                branchId: { $ne: id }
            });

            if (conflict) {
                throw new Error("Nhân sự này đã là Manager của một chi nhánh khác");
            }

            await UserBranch.updateMany(
                { branchId: id, role: "branch_manager" },
                { role: "staff" },
                { session }
            );

            await UserBranch.findOneAndUpdate(
                { branchId: id, userId: managerId },
                { role: "branch_manager" },
                { upsert: true, session }
            );
        }

        await session.commitTransaction();
        res.json({ message: "Cập nhật thành công", branch });
    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({ message: err.message });
    } finally {
        session.endSession();
    }
};

/* DELETE BRANCH */
export const deleteBranch = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;

        const branch = await Branch.findByIdAndDelete(id, { session });
        if (!branch) throw new Error("Chi nhánh không tồn tại");

        await UserBranch.deleteMany({ branchId: id }, { session });

        await session.commitTransaction();
        res.json({ message: "Đã xóa chi nhánh và tất cả nhân sự liên quan" });
    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({ message: err.message });
    } finally {
        session.endSession();
    }
};