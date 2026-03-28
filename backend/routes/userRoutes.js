const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  listUsers,
  listDevelopers,
  updateUserRole,
  updateUserStatus,
  updateUserProfile,
  deleteUser
} = require("../controllers/userController");

const router = express.Router();

router.use(protect);

router.get("/developers", requireRole("Admin", "ProjectManager"), listDevelopers);
router.get("/", requireRole("Admin"), listUsers);
router.patch("/:userId/role", requireRole("Admin"), updateUserRole);
router.patch("/:userId/status", requireRole("Admin"), updateUserStatus);
router.delete("/:userId", requireRole("Admin"), deleteUser);
router.patch("/:userId/profile", updateUserProfile);

module.exports = router;
