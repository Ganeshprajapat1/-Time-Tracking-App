const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  startTimer,
  stopTimer,
  createManualLog,
  getLogsByUser,
  getLogsByTask,
  listTimeLogs
} = require("../controllers/timeLogController");

const router = express.Router();

router.get("/", protect, listTimeLogs);
router.post("/start", protect, startTimer);
router.post("/stop", protect, stopTimer);
router.post("/manual", protect, createManualLog);

router.get("/user/:userId", protect, getLogsByUser);
router.get("/task/:taskId", protect, getLogsByTask);

module.exports = router;
