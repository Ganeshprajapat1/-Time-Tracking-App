const express = require("express");
const { getTimeEntries, createTimeEntry } = require("../controllers/timeEntryController");

const router = express.Router();

router.route("/").get(getTimeEntries).post(createTimeEntry);

module.exports = router;
