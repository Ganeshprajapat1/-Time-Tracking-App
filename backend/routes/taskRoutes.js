const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getTasks,
  getTaskById,
  updateTaskStatus,
  addTaskUpdate,
  requestHelp,
  createTask,
  assignTask,
  deleteTask
} = require("../controllers/taskController");

const router = express.Router();

router.get("/", protect, getTasks);
router.post("/", protect, createTask);
router.put("/:taskId/status", protect, updateTaskStatus);
router.put("/:taskId/assign", protect, assignTask);
router.post("/:taskId/update", protect, addTaskUpdate);
router.put("/:taskId/help", protect, requestHelp);
router.delete("/:taskId", protect, deleteTask);
router.get("/:taskId", protect, getTaskById);

module.exports = router;
