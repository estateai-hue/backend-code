import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // Check if superadmin already exists
    const existingAdmin = await User.findOne({ role: "superadmin" });

    if (existingAdmin) {
      console.log("SuperAdmin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const superAdmin = await User.create({
      name: "EstateAI Admin",
      email: "admin@estateai.com",
      password: hashedPassword,
      role: "superadmin",   // 🔥 Important
    });

    console.log("SuperAdmin Created Successfully:");
    console.log({
      email: superAdmin.email,
      password: "Admin@123",
    });

    process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedSuperAdmin();