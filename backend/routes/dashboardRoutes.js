const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { overview } = require("../controllers/dashboardController");

const router = express.Router();

router.get("/", protect, overview);

module.exports = router;
