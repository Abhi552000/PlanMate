import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  remark: {
    type: String,
    default: "",
  },
  taskCounter: {
    type: Number,
    default: 0,
  },
  statuses: {
    type: [String],
    default: ["To Do", "In Progress", "Done"],
  },
});

const organizationModel =
  mongoose.models.organization ||
  mongoose.model("organization", organizationSchema);

export default organizationModel;
