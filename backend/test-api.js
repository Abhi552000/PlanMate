import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
import "./models/userModel.js";

dotenv.config();

const uri = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

async function run() {
  try {
    await mongoose.connect(`${uri}/TaskFlow`);
    const User = mongoose.model("user");
    const user = await User.findOne();
    if (!user) {
      console.log("No user found.");
      process.exit(1);
    }
    console.log("Found user:", user.email, "ID:", user._id);

    // Sign token
    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    console.log("Generated token:", token);

    // Call local api
    console.log("Requesting http://localhost:4000/api/tasks/gp...");
    const start = Date.now();
    const response = await axios.get("http://localhost:4000/api/tasks/gp", {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Response status:", response.status);
    console.log("Tasks count:", response.data.tasks?.length);
    console.log("Response time:", Date.now() - start, "ms");
    process.exit(0);
  } catch (err) {
    console.error("API request failed:", err.message);
    if (err.response) {
      console.error("Response status:", err.response.status);
      console.error("Response data:", err.response.data);
    }
    process.exit(1);
  }
}
run();
