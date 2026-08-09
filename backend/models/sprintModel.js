import mongoose from "mongoose";

const sprintSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["planned", "active", "completed", "closed"],
    default: "planned",
  },
  goal: {
    type: String,
    default: "",
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "organization",
    required: true,
  },
}, { timestamps: true });

sprintSchema.index({ organization: 1 });

const Sprint = mongoose.models.sprint || mongoose.model("sprint", sprintSchema);
export default Sprint;
