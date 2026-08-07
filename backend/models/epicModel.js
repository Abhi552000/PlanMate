import mongoose from "mongoose";

const epicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: "sky", // e.g. sky, green, purple, amber, rose, indigo
  },
  description: {
    type: String,
    default: "",
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "organization",
    required: true,
  },
}, { timestamps: true });

const Epic = mongoose.models.epic || mongoose.model("epic", epicSchema);
export default Epic;
