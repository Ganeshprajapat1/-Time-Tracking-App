const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  register,
  verifyEmail,
  resendVerification,
  login,
  refresh,
  logout,
  me,
  googleAuth,
  forgotPassword,
  resetPassword,
  changePassword
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false
});

router.post("/register", authLimiter, register);
router.post("/signup", authLimiter, register);
router.post("/verify-email", authLimiter, verifyEmail);
router.post("/resend-verification", authLimiter, resendVerification);
router.post("/login", loginLimiter, login);
router.post("/refresh", authLimiter, refresh);
router.post("/google", authLimiter, googleAuth);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

router.get("/me", protect, me);
router.post("/logout", protect, logout);
router.put("/change-password", protect, changePassword);

module.exports = router;
