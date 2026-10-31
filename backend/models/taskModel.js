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
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    default: null,
  },
  labels: [
    {
      type: String,
      trim: true,
    },
  ],
  key: {
    type: String,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "organization",
  },
  sprint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "sprint",
    default: null,
  },
  epic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "epic",
    default: null,
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
  originalEstimate: {
    type: Number,
    default: 0,
  },
  timeLogged: {
    type: Number,
    default: 0,
  },
  workLogs: [
    {
      hoursSpent: {
        type: Number,
        required: true,
      },
      description: {
        type: String,
        default: "",
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
        enum: [
          "blocks",
          "blocked by",
          "is blocked by",
          "relates to",
          "duplicates",
          "is duplicated by",
          "clones",
          "is cloned by",
        ],
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

taskSchema.index({ organization: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ organization: 1, createdAt: -1 });
taskSchema.index({ organization: 1, key: 1 });
taskSchema.index({ organization: 1, sprint: 1 });

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);
export default Task;
