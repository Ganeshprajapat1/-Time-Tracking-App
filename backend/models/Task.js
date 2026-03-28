const mongoose = require("mongoose");
const User = require("./User");
const Module = require("./Module");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: async function validateAssignee(value) {
          const dev = await User.findById(value).select("role");
          return Boolean(dev && dev.role === "Developer");
        },
        message: "assignedTo must be a Developer."
      }
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "In Progress", "Completed", "Under Review"],
      default: "Pending"
    },
    updates: [
      {
        text: String,
        date: { type: Date, default: Date.now }
      }
    ],
    helpRequested: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      required: true,
      enum: ["High", "Medium", "Low"],
      default: "Medium"
    },
    deadline: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

taskSchema.pre("validate", async function syncProjectFromModule(next) {
  try {
    if (this.moduleId) {
      const mod = await Module.findById(this.moduleId).select("projectId");
      if (mod && mod.projectId) {
        this.projectId = mod.projectId;
      }
    }
    next();
  } catch (e) {
    next(e);
  }
});

module.exports = mongoose.model("Task", taskSchema);
