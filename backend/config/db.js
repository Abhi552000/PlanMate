import dns from "dns";
import mongoose from "mongoose";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch {}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const cleanMongoUri = (rawUri) => {
  if (!rawUri) return "";
  // Strip any accidental leading/trailing single or double quotes
  let uri = rawUri.trim().replace(/^['"]|['"]$/g, "");
  // If it already ends with /TaskFlow, keep it clean
  return uri;
};

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const rawUri = process.env.MONGODB_URI;
    if (!rawUri) {
      throw new Error("MONGODB_URI environment variable is missing.");
    }

    const uri = cleanMongoUri(rawUri);

    const opts = {
      dbName: "TaskFlow",
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    };

    console.log("Connecting to MongoDB Atlas...");
    cached.promise = mongoose.connect(uri, opts).then(async (mongooseInstance) => {
      console.log("Database Connected successfully");

      // Non-blocking background seed of default system admin
      try {
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
          console.log("Default System Admin seeded successfully");
        }
      } catch (seedErr) {
        console.warn("Admin seed check skipped:", seedErr.message);
      }

      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    console.error("MongoDB Connection Failed:", error.message);
    throw error;
  }
};

export default connectDB;
