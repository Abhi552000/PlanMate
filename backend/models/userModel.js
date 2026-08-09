import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "organization",
  },
  role: {
    type: String,
    enum: ["org_admin", "member", "system_admin"],
    default: "member",
  },
  status: {
    type: String,
    enum: ["active", "pending", "rejected"],
    default: "active",
  },
}, { timestamps: true });

userSchema.index({ organization: 1 });

const userModal = mongoose.models.user || mongoose.model("user", userSchema);

export default userModal;
