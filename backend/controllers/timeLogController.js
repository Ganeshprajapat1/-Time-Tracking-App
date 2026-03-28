const mongoose = require("mongoose");
const TimeLog = require("../models/TimeLog");
const Task = require("../models/Task");
const Module = require("../models/Module");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isPrivileged = (role) => role === "Admin" || role === "ProjectManager";

const startTimer = async (req, res, next) => {
  try {
    const { taskId } = req.body;

    if (!taskId) {
      return res.status(400).json({ message: "taskId is required." });
    }
    if (!isValidObjectId(taskId)) {
      return res.status(400).json({ message: "Invalid taskId." });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const now = new Date();

    const active = await TimeLog.findOne({
      userId: req.user.id,
      endTime: null
    });

    if (active) {
      return res.status(400).json({
        message: "Stop the active timer before starting another.",
        timeLog: active
      });
    }

    const task = await Task.findById(taskId).select("assignedTo status projectId");
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    if (req.user.role === "Developer") {
      if (!task.assignedTo || task.assignedTo.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: "Forbidden: cannot start another user's task." });
      }
    } else if (!isPrivileged(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: role not allowed." });
    }

    const timeLog = await TimeLog.create({
      userId: req.user.id,
      taskId,
      startTime: now,
      endTime: null,
      duration: null,
      date: now,
      isManual: false
    });

    return res.status(201).json({ timeLog });
  } catch (error) {
    next(error);
  }
};

const stopTimer = async (req, res, next) => {
  try {
    const { timeLogId, taskId } = req.body;

    if (!timeLogId && !taskId) {
      return res.status(400).json({ message: "timeLogId or taskId is required." });
    }

    if (timeLogId && !isValidObjectId(timeLogId)) {
      return res.status(400).json({ message: "Invalid timeLogId." });
    }
    if (!timeLogId && taskId && !isValidObjectId(taskId)) {
      return res.status(400).json({ message: "Invalid taskId." });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const now = new Date();

    let timeLog = null;
    if (timeLogId) {
      timeLog = await TimeLog.findById(timeLogId);
    } else {
      timeLog = await TimeLog.findOne({
        userId: req.user.id,
        taskId,
        endTime: null
      }).sort({ startTime: -1 });
    }

    if (!timeLog) {
      return res.status(404).json({ message: "Time log not found." });
    }

    const privileged = isPrivileged(req.user.role);
    if (!privileged && timeLog.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Forbidden: cannot stop another user's timer." });
    }

    if (timeLog.endTime) {
      return res.status(400).json({ message: "Timer already stopped for this time log." });
    }

    const start = timeLog.startTime ? new Date(timeLog.startTime) : null;
    if (!start) {
      return res.status(400).json({ message: "Invalid time log: missing startTime." });
    }

    const diffMs = now.getTime() - start.getTime();
    const durationMinutes = Math.max(0, Math.round((diffMs / 60000) * 100) / 100);

    timeLog.endTime = now;
    timeLog.duration = durationMinutes;

    await timeLog.save();

    return res.status(200).json({ timeLog });
  } catch (error) {
    next(error);
  }
};

const createManualLog = async (req, res, next) => {
  try {
    const { taskId, startTime, endTime, notes } = req.body;
    if (!taskId || !startTime || !endTime) {
      return res.status(400).json({ message: "taskId, startTime, and endTime are required." });
    }
    if (!isValidObjectId(taskId)) {
      return res.status(400).json({ message: "Invalid taskId." });
    }

    const task = await Task.findById(taskId).select("assignedTo projectId");
    if (!task) return res.status(404).json({ message: "Task not found." });

    if (req.user.role === "Developer" && task.assignedTo.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Forbidden." });
    }
    if (!isPrivileged(req.user.role) && req.user.role !== "Developer") {
      return res.status(403).json({ message: "Forbidden." });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
      return res.status(400).json({ message: "Invalid time range." });
    }

    const diffMs = end.getTime() - start.getTime();
    const durationMinutes = Math.max(0, Math.round((diffMs / 60000) * 100) / 100);

    const timeLog = await TimeLog.create({
      userId: req.user.id,
      taskId,
      startTime: start,
      endTime: end,
      duration: durationMinutes,
      date: start,
      isManual: true,
      notes: notes || ""
    });

    return res.status(201).json({ timeLog });
  } catch (error) {
    next(error);
  }
};

const getLogsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid userId." });
    }

    const privileged = isPrivileged(req.user.role);
    if (!privileged && userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Forbidden." });
    }

    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) {
      const d = new Date(startDate);
      if (Number.isNaN(d.getTime())) return res.status(400).json({ message: "Invalid startDate." });
      dateFilter.$gte = d;
    }
    if (endDate) {
      const d = new Date(endDate);
      if (Number.isNaN(d.getTime())) return res.status(400).json({ message: "Invalid endDate." });
      dateFilter.$lte = d;
    }

    const query = { userId };
    if (Object.keys(dateFilter).length) query.date = dateFilter;

    const logs = await TimeLog.find(query)
      .sort({ startTime: -1 })
      .populate("taskId", "title projectId assignedTo status moduleId");

    return res.status(200).json({ timeLogs: logs });
  } catch (error) {
    next(error);
  }
};

const getLogsByTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    if (!isValidObjectId(taskId)) {
      return res.status(400).json({ message: "Invalid taskId." });
    }

    const task = await Task.findById(taskId).select("assignedTo projectId");
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    const privileged = isPrivileged(req.user.role);
    const filter = { taskId };

    if (!privileged) {
      if (req.user.role === "Developer") {
        if (!task.assignedTo || task.assignedTo.toString() !== req.user.id.toString()) {
          return res.status(403).json({ message: "Forbidden." });
        }
        filter.userId = req.user.id;
      } else {
        return res.status(403).json({ message: "Forbidden." });
      }
    }

    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) {
      const d = new Date(startDate);
      if (Number.isNaN(d.getTime())) return res.status(400).json({ message: "Invalid startDate." });
      dateFilter.$gte = d;
    }
    if (endDate) {
      const d = new Date(endDate);
      if (Number.isNaN(d.getTime())) return res.status(400).json({ message: "Invalid endDate." });
      dateFilter.$lte = d;
    }

    if (Object.keys(dateFilter).length) filter.date = dateFilter;

    const logs = await TimeLog.find(filter)
      .sort({ startTime: -1 })
      .populate("userId", "name email role");

    return res.status(200).json({ timeLogs: logs });
  } catch (error) {
    next(error);
  }
};

const listTimeLogs = async (req, res, next) => {
  try {
    const { userId, projectId, startDate, endDate } = req.query;
    const privileged = isPrivileged(req.user.role);

    const query = {};

    if (userId) {
      if (!isValidObjectId(userId)) return res.status(400).json({ message: "Invalid userId." });
      if (!privileged && userId !== req.user.id.toString()) {
        return res.status(403).json({ message: "Forbidden." });
      }
      query.userId = userId;
    } else if (!privileged) {
      query.userId = req.user.id;
    }

    const dateFilter = {};
    if (startDate) {
      const d = new Date(startDate);
      if (Number.isNaN(d.getTime())) return res.status(400).json({ message: "Invalid startDate." });
      dateFilter.$gte = d;
    }
    if (endDate) {
      const d = new Date(endDate);
      if (Number.isNaN(d.getTime())) return res.status(400).json({ message: "Invalid endDate." });
      dateFilter.$lte = d;
    }
    if (Object.keys(dateFilter).length) query.date = dateFilter;

    let taskFilter = {};
    if (projectId) {
      if (!isValidObjectId(projectId)) return res.status(400).json({ message: "Invalid projectId." });
      const mods = await Module.find({ projectId }).select("_id");
      const moduleIds = mods.map((m) => m._id);
      const tasks = await Task.find({
        $or: [{ projectId }, { moduleId: { $in: moduleIds } }]
      }).select("_id");
      const taskIdList = tasks.map((t) => t._id);
      if (!taskIdList.length) {
        return res.status(200).json({ timeLogs: [] });
      }
      taskFilter = { taskId: { $in: taskIdList } };
    }

    const logs = await TimeLog.find({ ...query, ...taskFilter })
      .sort({ startTime: -1 })
      .limit(500)
      .populate("userId", "name email role")
      .populate("taskId", "title projectId moduleId");

    return res.status(200).json({ timeLogs: logs });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startTimer,
  stopTimer,
  createManualLog,
  getLogsByUser,
  getLogsByTask,
  listTimeLogs
};
