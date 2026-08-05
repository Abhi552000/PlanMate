import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Low",
  },
  dueDate: {
    type: Date,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    default: null,
  },
  key: {
    type: String,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "organization",
  },
  completed: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    default: "To Do",
  },
  issueType: {
    type: String,
    enum: ["Story", "Task", "Bug", "Epic"],
    default: "Task",
  },
  storyPoints: {
    type: Number,
    default: 1,
  },
  subtasks: [
    {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        default: "",
      },
      completed: {
        type: Boolean,
        default: false,
      },
      status: {
        type: String,
        default: "To Do",
      },
      priority: {
        type: String,
        default: "Low",
      },
      dueDate: {
        type: Date,
      },
      storyPoints: {
        type: Number,
        default: 0,
      },
      issueType: {
        type: String,
        default: "Sub-task",
      },
    },
  ],
  history: [
    {
      field: {
        type: String,
        required: true,
      },
      oldValue: {
        type: String,
        default: "",
      },
      newValue: {
        type: String,
        default: "",
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  comments: [
    {
      text: {
        type: String,
        required: true,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  links: [
    {
      linkType: {
        type: String,
        enum: ["blocks", "blocked by", "relates to"],
        required: true,
      },
      targetTask: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);
export default Task;
