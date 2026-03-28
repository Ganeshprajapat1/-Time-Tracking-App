const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { summary, listInvoices, createInvoice } = require("../controllers/billingController");

const router = express.Router();

router.get("/summary", protect, summary);
router.get("/invoices", protect, listInvoices);
router.post("/invoices", protect, createInvoice);

module.exports = router;
