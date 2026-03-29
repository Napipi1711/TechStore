import bcrypt from "bcryptjs";
import User from "../models/User.js";

const seedAdmin = async () => {
  try {
    const adminEmail = "admin123@gmail.com";

    const existAdmin = await User.findOne({ email: adminEmail });
    if (existAdmin) {
      console.log("Admin đã tồn tại");
      return;
    }

    const hashedPassword = await bcrypt.hash("123456", 10);

    await User.create({
      name: "Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      isActive: true,
      address: "TP.HCM",
    });

    console.log("succuess");
  } catch (err) {
    console.error("Err:", err.message);
  }
};

export default seedAdmin;
