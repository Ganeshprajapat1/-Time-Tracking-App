const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const Task = require("../models/Task");

const isPrivileged = (role) => role === "Admin" || role === "ProjectManager";

const getWindowHours = (req) => {
  const fromEnv = process.env.DEADLINE_ALERT_HOURS ? Number(process.env.DEADLINE_ALERT_HOURS) : 24;
  const fromQuery = req.query.hoursAhead ? Number(req.query.hoursAhead) : null;
  const hours = fromQuery != null ? fromQuery : fromEnv;

  if (!Number.isFinite(hours) || hours <= 0) return 24;
  return hours;
};

const upsertDeadlineNotifications = async ({ scopeUserId = null, hoursAhead }) => {
  const now = new Date();
  const end = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

  const match = {
    deadline: { $gte: now, $lte: end },
    status: { $ne: "Completed" },
    assignedTo: { $ne: null }
  };

  if (scopeUserId) {
    match.assignedTo = scopeUserId;
  }

  const tasks = await Task.find(match).select("title deadline projectId assignedTo status");

  // Upsert per task to avoid duplicates across repeated scans.
  const createdFlags = await Promise.all(
    tasks.map(async (task) => {
      const message = `Deadline is near for "${task.title}" (${task.deadline.toISOString()}).`;

      const result = await Notification.updateOne(
        {
          userId: task.assignedTo,
          taskId: task._id,
          type: "DEADLINE_NEAR",
          deadline: task.deadline
        },
        {
          $setOnInsert: {
            userId: task.assignedTo,
            taskId: task._id,
            projectId: task.projectId,
            type: "DEADLINE_NEAR",
            message,
            deadline: task.deadline,
            isRead: false
          }
        },
        { upsert: true }
      );

      return result.upsertedCount && result.upsertedCount > 0 ? 1 : 0;
    })
  );

  const created = createdFlags.reduce((sum, v) => sum + v, 0);
  return { created, totalChecked: tasks.length };
};

const checkDeadlineNear = async (req, res, next) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const hoursAhead = getWindowHours(req);
    const privileged = isPrivileged(req.user.role);

    const scopeUserId = privileged ? null : req.user.id; // non-privileged only for themselves

    const result = await upsertDeadlineNotifications({ scopeUserId, hoursAhead });
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getMyNotifications = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const { unreadOnly, limit } = req.query;
    const unread = unreadOnly === "true";

    const query = { userId: req.user.id };
    if (unread) query.isRead = false;

    const lim = limit ? Number(limit) : 50;
    const safeLimit = Number.isFinite(lim) && lim > 0 ? Math.min(lim, 200) : 50;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(safeLimit);

    return res.status(200).json({ notifications });
  } catch (error) {
    next(error);
  }
};

const simulateIdleWarning = async (req, res, next) => {
  try {
    const { taskId, message } = req.body;
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized." });
    await Notification.create({
      userId: req.user.id,
      taskId: taskId || undefined,
      type: "IDLE_WARNING",
      message: message || "Idle detected (simulated). Consider pausing your timer."
    });
    return res.status(201).json({ message: "Idle warning recorded." });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  checkDeadlineNear,
  getMyNotifications,
  upsertDeadlineNotifications,
  simulateIdleWarning
};

