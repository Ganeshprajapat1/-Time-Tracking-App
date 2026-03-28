const mongoose = require("mongoose");

const timeEntrySchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true
    },
    project: {
      type: String,
      required: true,
      trim: true
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("TimeEntry", timeEntrySchema);
