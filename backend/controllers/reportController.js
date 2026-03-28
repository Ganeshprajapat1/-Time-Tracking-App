const mongoose = require("mongoose");
const TimeLog = require("../models/TimeLog");
const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");

const isPrivileged = (role) => role === "Admin" || role === "ProjectManager";

const parseDateOrNull = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

const hoursPerProject = async (req, res, next) => {
  try {
    const { startDate, endDate, projectId } = req.query;

    const start = parseDateOrNull(startDate);
    const end = parseDateOrNull(endDate);

    if (startDate && !start) return res.status(400).json({ message: "Invalid startDate." });
    if (endDate && !end) return res.status(400).json({ message: "Invalid endDate." });
    if (projectId && !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid projectId." });
    }

    const privileged = isPrivileged(req.user.role);

    const match = {};
    if (!privileged) match.userId = req.user.id;
    if (start || end) {
      match.date = {};
      if (start) match.date.$gte = start;
      if (end) match.date.$lte = end;
    }

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: Task.collection.name,
          localField: "taskId",
          foreignField: "_id",
          as: "task"
        }
      },
      { $unwind: { path: "$task", preserveNullAndEmptyArrays: false } },
      ...(projectId ? [{ $match: { "task.projectId": new mongoose.Types.ObjectId(projectId) } }] : []),
      {
        $lookup: {
          from: Project.collection.name,
          localField: "task.projectId",
          foreignField: "_id",
          as: "project"
        }
      },
      { $unwind: { path: "$project", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$task.projectId",
          projectTitle: { $first: "$project.title" },
          totalMinutes: { $sum: "$duration" }
        }
      },
      {
        $project: {
          _id: 0,
          projectId: "$_id",
          projectTitle: { $ifNull: ["$projectTitle", null] },
          totalHours: { $divide: ["$totalMinutes", 60] }
        }
      },
      { $sort: { totalHours: -1 } }
    ];

    const result = await TimeLog.aggregate(pipeline);
    return res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

const hoursPerUser = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const start = parseDateOrNull(startDate);
    const end = parseDateOrNull(endDate);

    if (startDate && !start) return res.status(400).json({ message: "Invalid startDate." });
    if (endDate && !end) return res.status(400).json({ message: "Invalid endDate." });

    // hours-per-user tends to be sensitive; restrict to Admin/ProjectManager
    const privileged = isPrivileged(req.user.role);

    const match = {};
    if (!privileged) match.userId = req.user.id;
    if (start || end) {
      match.date = {};
      if (start) match.date.$gte = start;
      if (end) match.date.$lte = end;
    }

    const pipeline = [
      { $match: match },
      { $group: { _id: "$userId", totalMinutes: { $sum: "$duration" } } },
      {
        $lookup: {
          from: User.collection.name,
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: "$user.name",
          email: "$user.email",
          totalHours: { $divide: ["$totalMinutes", 60] }
        }
      }
    ];

    const result = await TimeLog.aggregate(pipeline);
    return res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

const taskCompletionStats = async (req, res, next) => {
  try {
    const { projectId } = req.query;

    if (projectId && !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid projectId." });
    }

    const privileged = isPrivileged(req.user.role);

    const conditions = {};
    if (projectId) conditions.projectId = new mongoose.Types.ObjectId(projectId);

    if (!privileged) {
      if (req.user.role === "Developer") conditions.assignedTo = req.user.id;
      else return res.status(403).json({ message: "Forbidden." });
    }

    const pipeline = [
      { $match: conditions },
      {
        $group: {
          _id: "$projectId",
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
          },
          pendingTasks: {
            $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] }
          },
          inProgressTasks: {
            $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: Project.collection.name,
          localField: "_id",
          foreignField: "_id",
          as: "project"
        }
      },
      { $unwind: { path: "$project", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          projectId: "$_id",
          projectTitle: "$project.title",
          totalTasks: 1,
          completedTasks: 1,
          pendingTasks: 1,
          inProgressTasks: 1,
          completionRate: {
            $cond: [
              { $eq: ["$totalTasks", 0] },
              0,
              { $divide: ["$completedTasks", "$totalTasks"] }
            ]
          }
        }
      },
      { $sort: { completionRate: -1 } }
    ];

    const result = await Task.aggregate(pipeline);
    return res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

const productivityReport = async (req, res, next) => {
  try {
    const { startDate, endDate, userId } = req.query;

    const start = parseDateOrNull(startDate);
    const end = parseDateOrNull(endDate);

    if (startDate && !start) return res.status(400).json({ message: "Invalid startDate." });
    if (endDate && !end) return res.status(400).json({ message: "Invalid endDate." });
    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId." });
    }

    const privileged = isPrivileged(req.user.role);

    let userIds = null;
    if (!privileged) {
      userIds = [req.user.id];
    } else if (userId) {
      userIds = [userId];
    }

    const matchTime = {};
    if (start || end) {
      matchTime.date = {};
      if (start) matchTime.date.$gte = start;
      if (end) matchTime.date.$lte = end;
    }
    if (userIds) matchTime.userId = { $in: userIds };

    const hoursPipeline = [
      { $match: matchTime },
      { $group: { _id: "$userId", totalMinutes: { $sum: "$duration" } } }
    ];

    const hoursAgg = await TimeLog.aggregate(hoursPipeline);
    const hourMap = new Map(hoursAgg.map((r) => [r._id.toString(), r.totalMinutes]));

    // Only developers have assignedTo in Task model, so use that for productivity
    const matchTasks = {};
    if (userIds) matchTasks.assignedTo = { $in: userIds };

    const tasksAgg = await Task.aggregate([
      { $match: matchTasks },
      {
        $group: {
          _id: "$assignedTo",
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
          }
        }
      }
    ]);

    const userIdsFromTasks = tasksAgg.map((r) => r._id);
    const uniqueUserIds = userIds ? userIds : userIdsFromTasks;

    const users = await User.find({ _id: { $in: uniqueUserIds } }).select("name email role");
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const result = uniqueUserIds.map((uid) => {
      const uidStr = uid.toString();
      const minutes = hourMap.get(uidStr) || 0;
      const tasks = tasksAgg.find((t) => t._id.toString() === uidStr);

      const totalTasks = tasks ? tasks.totalTasks : 0;
      const completedTasks = tasks ? tasks.completedTasks : 0;
      const completionRate = totalTasks === 0 ? 0 : completedTasks / totalTasks;

      const user = userMap.get(uidStr);
      return {
        userId: uidStr,
        name: user ? user.name : null,
        email: user ? user.email : null,
        totalHours: minutes / 60,
        totalTasks,
        completedTasks,
        completionRate
      };
    });

    return res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

const exportCsv = async (req, res, next) => {
  try {
    const { startDate, endDate, projectId } = req.query;
    const privileged = isPrivileged(req.user.role);

    const match = { duration: { $ne: null } };
    if (!privileged) match.userId = req.user.id;

    if (startDate || endDate) {
      match.date = {};
      if (startDate) {
        const d = parseDateOrNull(startDate);
        if (!d) return res.status(400).json({ message: "Invalid startDate." });
        match.date.$gte = d;
      }
      if (endDate) {
        const d = parseDateOrNull(endDate);
        if (!d) return res.status(400).json({ message: "Invalid endDate." });
        match.date.$lte = d;
      }
    }

    const logs = await TimeLog.find(match)
      .sort({ startTime: -1 })
      .limit(5000)
      .populate("userId", "name email")
      .populate({
        path: "taskId",
        select: "title projectId",
        populate: { path: "projectId", select: "title" }
      });

    const rows = logs.filter((l) => {
      if (!projectId) return true;
      if (!mongoose.Types.ObjectId.isValid(projectId)) return false;
      const pid = l.taskId?.projectId?._id?.toString() || l.taskId?.projectId?.toString();
      return pid === projectId;
    });

    const header = ["userName", "email", "task", "project", "start", "end", "durationMinutes", "manual"];
    const lines = [header.join(",")];
    rows.forEach((l) => {
      const safe = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      lines.push(
        [
          l.userId?.name,
          l.userId?.email,
          l.taskId?.title,
          l.taskId?.projectId?.title,
          l.startTime ? new Date(l.startTime).toISOString() : "",
          l.endTime ? new Date(l.endTime).toISOString() : "",
          l.duration ?? "",
          l.isManual ? "yes" : "no"
        ]
          .map(safe)
          .join(",")
      );
    });

    const csv = lines.join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=time-logs.csv");
    return res.status(200).send(csv);
  } catch (e) {
    next(e);
  }
};

module.exports = {
  hoursPerProject,
  hoursPerUser,
  taskCompletionStats,
  productivityReport,
  exportCsv
};

