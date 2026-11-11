import mongoose from "mongoose";

const customFieldSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["text", "number", "dropdown", "date"],
    default: "text",
  },
  options: {
    type: [String],
    default: [],
  },
  required: {
    type: Boolean,
    default: false,
  },
});

const boardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      default: "",
    },
    environment: {
      type: String,
      enum: ["development", "sit", "uat", "staging", "production", "other"],
      default: "sit",
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organization",
      required: true,
      index: true,
    },
    taskCounter: {
      type: Number,
      default: 0,
    },
    statuses: {
      type: [String],
      default: ["To Do", "In Progress", "In Review", "Done"],
    },
    priorities: {
      type: [String],
      default: ["Low", "Medium", "High", "Critical"],
    },
    boardFeatures: {
      storyPoints: { type: Boolean, default: true },
      timeTracking: { type: Boolean, default: true },
      dueDates: { type: Boolean, default: true },
      labels: { type: Boolean, default: true },
      subtasks: { type: Boolean, default: true },
      issueLinking: { type: Boolean, default: true },
    },
    customFields: {
      type: [customFieldSchema],
      default: [],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

boardSchema.index({ organization: 1, key: 1 }, { unique: true });

const boardModel = mongoose.models.board || mongoose.model("board", boardSchema);

export default boardModel;
