const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task"
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project"
    },
    type: {
      type: String,
      required: true,
      enum: ["DEADLINE_NEAR", "TASK_ASSIGNED", "IDLE_WARNING"]
    },
    message: {
      type: String,
      required: true
    },
    deadline: {
      type: Date
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);

