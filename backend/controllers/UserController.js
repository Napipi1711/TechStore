import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Log from "../models/Log.js";
import UserBranch from "../models/UserBranches.js";
import crypto from "crypto";
import { sendResetEmail } from "../ultis/mailer.js";
/** Generate JWT */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

/**
 * LOGIN
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Missing email or password",
      });
    }

    // tìm user
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        message: "Email not found",
      });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Wrong password",
      });
    }

    /**
     * =========================
     * ADMIN LOGIN
     * =========================
     */

    if (user.role === "admin") {
      await User.updateOne(
        { _id: user._id },
        { $set: { lastLoginAt: new Date() } }
      );

      const token = generateToken({
        id: user._id.toString(),
        role: user.role,
        branchId: null,
        branchRole: null,
      });

      return res.json({
        message: "Admin login success",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          branchId: null,
          branchRole: null,
        },
      });
    }

    /**
     * =========================
     * STAFF / BRANCH LOGIN
     * =========================
     */

    if (!user.isActive) {
      return res.status(403).json({
        message: "Account has been blocked",
      });
    }

    // tìm branch user
    const userBranch = await UserBranch.findOne({
      userId: user._id,
    });

    if (!userBranch) {
      return res.status(403).json({
        message: "User not assigned to any branch",
      });
    }

    // update last login
    await User.updateOne(
      { _id: user._id },
      { $set: { lastLoginAt: new Date() } }
    );

    // tạo token
    const token = generateToken({
      id: user._id.toString(),
      role: user.role,
      branchId: userBranch.branchId.toString(),
      branchRole: userBranch.role,
    });

    /**
     * CREATE LOGIN LOG
     */
    Log.create({
      level: "INFO",
      actorId: user._id,
      branchId: userBranch.branchId,
      action: "LOGIN",
      targetType: "USER",
      targetId: user._id,
      message: "Staff login success",
      status: "SUCCESS",
      ip: req.ip,
      device: req.headers["user-agent"],
    }).catch((err) => {
      console.error("LOG ERROR:", err);
    });

    return res.json({
      message: "Login success",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branchId: userBranch.branchId,
        branchRole: userBranch.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

/**
 * GET PROFILE
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    let branch = null;
    let branchRole = null;
    if (user.role !== "admin") {
      const userBranch = await UserBranch.findOne({
        userId: user._id,
      }).populate("branchId", "name address");

      if (userBranch) {
        branch = userBranch.branchId;
        branchRole = userBranch.role;
      }
    }

    res.status(200).json({
      ...user.toObject(),
      branch,
      branchRole,
    });

  } catch (error) {
    console.error("Error getProfile:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim() });

    // Bảo mật: Luôn trả về 200 để tránh lộ user, chỉ gửi mail nếu user tồn tại
    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");

      // Lưu token đã băm vào DB để bảo mật cao hơn
      user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
      user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 phút

      await user.save();

      // Gửi mail (hàm này được tách riêng bên dưới)
      const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      await sendResetEmail(user.email, resetLink);
    }

    res.status(200).json({
      success: true,
      message: "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được liên kết đặt lại mật khẩu.",
    });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Đã xảy ra lỗi hệ thống." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Băm token từ params để so sánh với bản lưu trong DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Liên kết không hợp lệ hoặc đã hết hạn." });
    }

    // Cập nhật mật khẩu và xóa token tạm
    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Đặt lại mật khẩu thành công!" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Đã xảy ra lỗi hệ thống." });
  }
};