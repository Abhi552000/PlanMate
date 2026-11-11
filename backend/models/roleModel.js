import mongoose from "mongoose";

const permissionsSchema = new mongoose.Schema(
  {
    tickets: {
      create: { type: Boolean, default: true },
      view: { type: Boolean, default: true },
      edit: { type: Boolean, default: true },
      delete: { type: Boolean, default: false },
    },
    boards: {
      create: { type: Boolean, default: false },
      view: { type: Boolean, default: true },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
    sprints: {
      create: { type: Boolean, default: false },
      view: { type: Boolean, default: true },
      manage: { type: Boolean, default: false }, // start, complete sprints
      delete: { type: Boolean, default: false },
    },
    team: {
      invite: { type: Boolean, default: false },
      view: { type: Boolean, default: true },
      approve: { type: Boolean, default: false },
      remove: { type: Boolean, default: false },
    },
    settings: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
    },
    roles: {
      view: { type: Boolean, default: false },
      manage: { type: Boolean, default: false },
    },
  },
  { _id: false }
);

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organization",
      required: true,
      index: true,
    },
    isSystemDefault: {
      type: Boolean,
      default: false,
    },
    permissions: {
      type: permissionsSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

roleSchema.index({ organization: 1, name: 1 }, { unique: true });

const roleModel = mongoose.models.role || mongoose.model("role", roleSchema);

export default roleModel;
