import Branch from "../../models/Branch.js";
import mongoose from "mongoose";

export const getMyBranch = async (req, res) => {
    try {

        const branchId = req.user.branchId;

        if (!branchId || !mongoose.Types.ObjectId.isValid(branchId)) {
            return res.status(400).json({
                message: "Branch ID không hợp lệ",
            });
        }

        const branch = await Branch.findById(branchId)
            .select("name address phone")
            .lean();

        if (!branch) {
            return res.status(404).json({
                message: "Branch not found",
            });
        }

        res.json(branch);

    } catch (err) {

        res.status(500).json({
            message: err.message,
        });

    }
};