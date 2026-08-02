import mongoose from "mongoose";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("Database Connected")
    );
    await mongoose.connect(`${process.env.MONGODB_URI}/TaskFlow`);

    // Seed default System Admin
    const defaultEmail = "admin@planmate.com";
    const existingAdmin = await User.findOne({ email: defaultEmail });
    if (!existingAdmin) {
      const hashed = await bcrypt.hash("Admin@Planmate123", 10);
      await User.create({
        name: "System Admin",
        email: defaultEmail,
        password: hashed,
        role: "system_admin"
      });
      console.log("Default System Admin seeded successfully (admin@planmate.com / Admin@Planmate123)");
    }
  } catch (error) {
    console.error(error.message);
  }
};

export default connectDB;
