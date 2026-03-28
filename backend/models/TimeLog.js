const mongoose = require("mongoose");

const timeLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    default: null
  },
  // Duration in minutes (or any consistent unit you choose)
  duration: {
    type: Number,
    min: 0,
    default: null
  },
  date: {
    type: Date,
    required: true
  },
  isManual: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    default: ""
  }
});

// Validation to ensure stop time makes sense.
timeLogSchema.pre("validate", function (next) {
  if (this.endTime && this.startTime && this.endTime < this.startTime) {
    return next(new Error("endTime must be greater than or equal to startTime."));
  }
  next();
});

// If you want to prevent multiple active timers per user+task, you can add:
// timeLogSchema.index({ userId: 1, taskId: 1, endTime: 1 });

module.exports = mongoose.model("TimeLog", timeLogSchema);

