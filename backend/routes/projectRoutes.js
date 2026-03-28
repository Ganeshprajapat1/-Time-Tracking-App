const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} = require("../controllers/projectController");

const router = express.Router();

router.get("/", protect, getProjects);
router.get("/:projectId", protect, getProjectById);
router.post("/", protect, createProject);
router.put("/:projectId", protect, updateProject);
router.delete("/:projectId", protect, deleteProject);

module.exports = router;
