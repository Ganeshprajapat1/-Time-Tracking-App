const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  hoursPerProject,
  hoursPerUser,
  taskCompletionStats,
  productivityReport,
  exportCsv
} = require("../controllers/reportController");

const router = express.Router();

router.get("/hours-per-project", protect, hoursPerProject);
router.get("/hours-per-user", protect, hoursPerUser);
router.get("/task-completion-stats", protect, taskCompletionStats);
router.get("/productivity", protect, productivityReport);
router.get("/export/csv", protect, exportCsv);

module.exports = router;

