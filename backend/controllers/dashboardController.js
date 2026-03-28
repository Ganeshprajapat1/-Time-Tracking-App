const mongoose = require("mongoose");
const User = require("../models/User");
const Project = require("../models/Project");
const Task = require("../models/Task");
const TimeLog = require("../models/TimeLog");

const isPrivileged = (role) => role === "Admin" || role === "ProjectManager";

const adminDashboard = async (req, res, next) => {
  try {
    const [totalUsers, activeProjects, tasksAgg, minutesAgg, recentLogs] = await Promise.all([
      User.countDocuments({ status: "active" }),
      Project.countDocuments(),
      Task.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } }
          }
        }
      ]),
      TimeLog.aggregate([
        { $match: { duration: { $ne: null } } },
        { $group: { _id: null, minutes: { $sum: "$duration" } } }
      ]),
      TimeLog.find({ duration: { $ne: null } })
        .sort({ date: -1 })
        .limit(14)
        .populate("taskId", "title")
    ]);

    const taskStats = tasksAgg[0] || { total: 0, completed: 0, pending: 0 };
    const totalMinutes = minutesAgg[0]?.minutes || 0;

    const trendMap = new Map();
    recentLogs.forEach((log) => {
      const d = log.date ? new Date(log.date) : new Date(log.startTime);
      const key = d.toISOString().slice(0, 10);
      trendMap.set(key, (trendMap.get(key) || 0) + (log.duration || 0));
    });
    const timeTrend = Array.from(trendMap.entries()).map(([date, minutes]) => ({
      date,
      hours: Math.round((minutes / 60) * 100) / 100
    }));

    const statusBreakdown = await Task.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    return res.status(200).json({
      role: "Admin",
      stats: {
        totalUsers,
        activeProjects,
        totalTasks: taskStats.total,
        completedTasks: taskStats.completed,
        pendingTasks: taskStats.pending,
        totalHoursLogged: Math.round((totalMinutes / 60) * 100) / 100
      },
      charts: {
        timeTrend,
        taskStatusPie: statusBreakdown.map((r) => ({ status: r._id, count: r.count }))
      }
    });
  } catch (e) {
    next(e);
  }
};

const managerDashboard = async (req, res, next) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.user.id);
    const projects = await Project.find({ createdBy: uid }).select("_id title endDate");
    const projectIds = projects.map((p) => p._id);

    const [taskStats, minutesAgg] = await Promise.all([
      Task.aggregate([
        { $match: { projectId: { $in: projectIds } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } }
          }
        }
      ]),
      TimeLog.aggregate([
        {
          $lookup: {
            from: Task.collection.name,
            localField: "taskId",
            foreignField: "_id",
            as: "task"
          }
        },
        { $unwind: "$task" },
        { $match: { "task.projectId": { $in: projectIds }, duration: { $ne: null } } },
        { $group: { _id: null, minutes: { $sum: "$duration" } } }
      ])
    ]);

    const ts = taskStats[0] || { total: 0, completed: 0, pending: 0 };
    const totalMinutes = minutesAgg[0]?.minutes || 0;

    return res.status(200).json({
      role: "ProjectManager",
      stats: {
        myProjects: projects.length,
        totalTasks: ts.total,
        completedTasks: ts.completed,
        pendingTasks: ts.pending,
        totalHoursLogged: Math.round((totalMinutes / 60) * 100) / 100
      },
      projects: projects.map((p) => ({ id: p._id, title: p.title, endDate: p.endDate }))
    });
  } catch (e) {
    next(e);
  }
};

const developerDashboard = async (req, res, next) => {
  try {
    const uid = req.user.id;
    const [tasks, logs, hoursAgg] = await Promise.all([
      Task.find({ assignedTo: uid }),
      TimeLog.find({ userId: uid, duration: { $ne: null } })
        .sort({ date: -1 })
        .limit(10)
        .populate("taskId", "title"),
      TimeLog.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(uid), duration: { $ne: null } } },
        { $group: { _id: null, minutes: { $sum: "$duration" } } }
      ])
    ]);

    const completed = tasks.filter((t) => t.status === "Completed").length;
    const pending = tasks.filter((t) => t.status === "Pending").length;
    const totalMinutes = hoursAgg[0]?.minutes || 0;

    return res.status(200).json({
      role: "Developer",
      stats: {
        assignedTasks: tasks.length,
        completedTasks: completed,
        pendingTasks: pending,
        totalHoursLogged: Math.round((totalMinutes / 60) * 100) / 100
      },
      recentLogs: logs
    });
  } catch (e) {
    next(e);
  }
};

const overview = async (req, res, next) => {
  try {
    if (req.user.role === "Admin") return adminDashboard(req, res, next);
    if (req.user.role === "ProjectManager") return managerDashboard(req, res, next);
    return developerDashboard(req, res, next);
  } catch (e) {
    next(e);
  }
};

module.exports = { overview, adminDashboard, managerDashboard, developerDashboard };
