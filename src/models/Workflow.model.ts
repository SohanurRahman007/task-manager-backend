import mongoose from "mongoose";

const workflowStageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  order: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    default: "#6B7280",
  },
});

const workflowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    stages: [workflowStageSchema],
    isDefault: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Ensure unique order within workflow
workflowStageSchema.pre("save", function (next) {
  // This validation will be handled in the service layer
  next();
});

export default mongoose.model("Workflow", workflowSchema);
