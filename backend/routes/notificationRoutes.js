const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  checkDeadlineNear,
  getMyNotifications,
  simulateIdleWarning
} = require("../controllers/notificationController");

const router = express.Router();

// Trigger a deadline scan and store notifications (deadline-near alerts).
router.post("/check-deadlines", protect, requireRole("Admin", "ProjectManager"), checkDeadlineNear);

// Fetch notifications for the currently authenticated user.
router.get("/", protect, getMyNotifications);

router.post("/idle-sim", protect, simulateIdleWarning);

module.exports = router;

