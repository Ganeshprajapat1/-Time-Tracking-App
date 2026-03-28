const TimeEntry = require("../models/TimeEntry");

const getTimeEntries = async (req, res, next) => {
  try {
    const entries = await TimeEntry.find().sort({ createdAt: -1 });
    res.status(200).json(entries);
  } catch (error) {
    next(error);
  }
};

const createTimeEntry = async (req, res, next) => {
  try {
    const { description, project, startTime, endTime, durationMinutes } = req.body;

    if (!description || !project || !startTime || !endTime || durationMinutes == null) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const entry = await TimeEntry.create({
      description,
      project,
      startTime,
      endTime,
      durationMinutes
    });

    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTimeEntries,
  createTimeEntry
};
