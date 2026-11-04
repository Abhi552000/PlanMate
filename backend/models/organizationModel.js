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
  industry: {
    type: String,
    default: "",
  },
  companySize: {
    type: String,
    default: "",
  },
  website: {
    type: String,
    default: "",
  },
  location: {
    type: String,
    default: "",
  },
  phone: {
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
  priorities: {
    type: [String],
    default: ["Low", "Medium", "High"],
  },
  boardFeatures: {
    storyPoints: { type: Boolean, default: true },
    timeTracking: { type: Boolean, default: true },
    dueDates: { type: Boolean, default: true },
    labels: { type: Boolean, default: true },
    subtasks: { type: Boolean, default: true },
    issueLinking: { type: Boolean, default: true },
  },
  customFields: [
    {
      id: { type: String, required: true },
      name: { type: String, required: true },
      type: {
        type: String,
        enum: ["text", "number", "dropdown", "date"],
        default: "text",
      },
      options: [String],
      required: { type: Boolean, default: false },
    },
  ],
  subscription: {
    planId: {
      type: String,
      default: "free",
    },
    planName: {
      type: String,
      default: "Starter",
    },
    maxMembers: {
      type: Number,
      default: 5,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "past_due", "expired"],
      default: "active",
    },
    billingCycle: {
      type: String,
      default: "monthly",
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    paymentMethod: {
      type: String,
      default: "dummy_gateway",
    },
    transactionId: {
      type: String,
      default: "",
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      default: null,
    },
  },
});

organizationSchema.index({ admin: 1 });
organizationSchema.index({ isActive: 1 });
organizationSchema.index({ "subscription.planId": 1 });

const organizationModel =
  mongoose.models.organization ||
  mongoose.model("organization", organizationSchema);

export default organizationModel;
