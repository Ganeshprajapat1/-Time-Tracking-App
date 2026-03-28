const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },
    clientName: { type: String, default: "", trim: true },
    billableHours: { type: Number, required: true, min: 0 },
    hourlyRate: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["draft", "sent", "paid"],
      default: "draft"
    },
    notes: { type: String, default: "" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
