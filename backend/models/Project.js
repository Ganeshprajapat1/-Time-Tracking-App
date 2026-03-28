const mongoose = require("mongoose");
const User = require("./User");

const projectSchema = new mongoose.Schema(
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
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: async function (value) {
          const u = await User.findById(value).select("role");
          return Boolean(u && (u.role === "ProjectManager" || u.role === "Admin"));
        },
        message: "createdBy must be a Project Manager or Admin."
      }
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true
  }
);

// endDate must be >= startDate
projectSchema.pre("validate", function (next) {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    this.invalidate("endDate", "endDate must be greater than or equal to startDate.");
  }
  next();
});

module.exports = mongoose.model("Project", projectSchema);

