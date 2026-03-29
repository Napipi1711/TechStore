import User from "../../models/User.js";
import UserBranch from "../../models/UserBranches.js";
import bcrypt from "bcryptjs";
import cloudinary from "../../ultis/cloudinary.js";
import mongoose from "mongoose";
import { nanoid } from "nanoid";

export const create = async (req, res) => {
  try {
    const { name, email, password, phone, address, gender, dob, role } = req.body;
    if (!password || password.length < 6)
      return res.status(400).json({ message: "Password tối thiểu 6 ký tự" });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: "Email đã tồn tại" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const userCode = `ACC-${nanoid(8)}`;
    let avatar = "";
    if (req.file) {
      if (!req.file.mimetype.startsWith("image/"))
        return res.status(400).json({ message: "File phải là ảnh" });
      const upload = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        { folder: "accounts" }
      );
      avatar = upload.secure_url;
    }
    const user = await User.create({
      userCode,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: role || "staff",
      gender,
      dob,
      address,
      avatar,
    });
    const safe = user.toObject();
    delete safe.password;
    res.status(201).json({ message: "Tạo tài khoản thành công", user: safe });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const listAccounts = async (req, res) => {
  try {
    const { branchId, search } = req.query;


    let users = await User.find({ role: { $ne: "admin" } }) 
      .select("-password")
      .lean()
      .sort({ createdAt: -1 });

    if (search) {
      const regex = new RegExp(search, "i"); // case-insensitive
      users = users.filter(u => regex.test(u.name) || regex.test(u.email));
    }

    const ids = users.map(u => u._id);

    const branchFilter = { userId: { $in: ids } };
    if (branchId) branchFilter.branchId = branchId;

    const branches = await UserBranch.find(branchFilter)
      .populate("branchId", "name")
      .lean();

    const map = {};
    branches.forEach(b => {
      if (!map[b.userId]) map[b.userId] = [];
      map[b.userId].push({ branch: b.branchId, role: b.role });
    });

    const result = users
      .map(u => ({ ...u, branches: map[u._id] || [] }))
      .filter(u => branchId ? u.branches.length > 0 : true);

    res.json({ total: result.length, users: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ================= GET USER BY ID =================
export const getId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "ID không hợp lệ" });

    const user = await User.findById(id).select("-password").lean();
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    const branches = await UserBranch.find({ userId: id })
      .populate("branchId", "name")
      .lean();

    res.json({ ...user, branches });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= UPDATE USER =================
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const oldUser = await User.findById(id);
    if (!oldUser) return res.status(404).json({ message: "User không tồn tại" });

    const updateFields = {};
    const allowed = ["name", "phone", "gender", "dob", "address"];

    allowed.forEach((f) => {
      if (body[f] !== undefined) updateFields[f] = body[f];
    });

    if (body.isActive !== undefined)
      updateFields.isActive = String(body.isActive) === "true";

    // avatar
    if (req.file) {
      if (!req.file.mimetype.startsWith("image/"))
        return res.status(400).json({ message: "File phải là ảnh" });

      const upload = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        { folder: "accounts" }
      );
      updateFields.avatar = upload.secure_url;
    }

    const updated = await User.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json({ message: "Cập nhật thành công", user: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteAccount = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id, { session });
    await UserBranch.deleteMany({ userId: id }, { session });

    await session.commitTransaction();
    res.json({ message: "Đã xóa user và branch liên kết" });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};
