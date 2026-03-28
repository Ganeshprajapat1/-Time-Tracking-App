const mongoose = require("mongoose");
const User = require("../models/User");
const Notification = require("../models/Notification");

const listUsers = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select("-password -refreshTokenHash -emailVerificationOtpHash")
      .sort({ createdAt: -1 });
    return res.status(200).json({ users });
  } catch (e) {
    next(e);
  }
};

const listDevelopers = async (req, res, next) => {
  try {
    const users = await User.find({ role: "Developer", status: "active" })
      .select("-password -refreshTokenHash -emailVerificationOtpHash")
      .sort({ name: 1 });
    return res.status(200).json({ users });
  } catch (e) {
    next(e);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId." });
    }
    const allowed = ["Admin", "ProjectManager", "Developer"];
    if (!role || !allowed.includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }
    if (userId === req.user.id && role !== "Admin" && req.user.role === "Admin") {
      // allow admin to demote self? risky — still permit
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select("-password -refreshTokenHash");
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.status(200).json({ user });
  } catch (e) {
    next(e);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId." });
    }
    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    ).select("-password -refreshTokenHash");
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.status(200).json({ user });
  } catch (e) {
    next(e);
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId." });
    }
    if (userId !== req.user.id && req.user.role !== "Admin") {
      return res.status(403).json({ message: "Forbidden." });
    }
    const { name, hourlyRate } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (name != null) user.name = name;
    if (hourlyRate != null && (req.user.role === "Admin" || req.user.id === userId)) {
      user.hourlyRate = Number(hourlyRate);
    }
    await user.save();
    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        hourlyRate: user.hourlyRate,
        isVerified: user.isVerified
      }
    });
  } catch (e) {
    next(e);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId." });
    }
    if (userId === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own account here." });
    }
    await Notification.deleteMany({ userId });
    await User.findByIdAndDelete(userId);
    return res.status(200).json({ message: "User deleted." });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  listUsers,
  listDevelopers,
  updateUserRole,
  updateUserStatus,
  updateUserProfile,
  deleteUser
};
