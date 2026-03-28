const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      trim: true,
      required: function requiredPassword() {
        return !this.googleId;
      },
      minlength: 8
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
      trim: true
    },
    role: {
      type: String,
      required: true,
      enum: ["Admin", "ProjectManager", "Developer"],
      default: "Developer"
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active"
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    termsAccepted: {
      type: Boolean,
      default: false
    },
    emailVerificationOtpHash: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    refreshTokenHash: { type: String, select: false },
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date,
      default: null
    },
    hourlyRate: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function hashPassword(next) {
  try {
    if (!this.isModified("password") || !this.password) return next();
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
