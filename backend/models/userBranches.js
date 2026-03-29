import mongoose from "mongoose";

const userBranchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    role: {
      type: String,
      enum: ["branch_manager", "staff"],
      required: true,
    },
   
  },
  { timestamps: true }
);

userBranchSchema.index({ userId: 1, branchId: 1 }, { unique: true });

userBranchSchema.index(
  { branchId: 1, role: 1 },
  {
    unique: true,
    partialFilterExpression: { role: "branch_manager" }
  }
);
const UserBranch = mongoose.models.UserBranch || mongoose.model("UserBranch", userBranchSchema);

export default UserBranch;