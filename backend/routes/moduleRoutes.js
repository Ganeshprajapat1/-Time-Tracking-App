const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  listModules,
  createModule,
  updateModule,
  deleteModule
} = require("../controllers/moduleController");

const router = express.Router();

router.get("/", protect, listModules);
router.post("/", protect, createModule);
router.put("/:moduleId", protect, updateModule);
router.delete("/:moduleId", protect, deleteModule);

module.exports = router;
