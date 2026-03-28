const mongoose = require("mongoose");
const Task = require("../models/Task");
const Module = require("../models/Module");
const Notification = require("../models/Notification");

const isPmOrAdmin = (role) => role === "ProjectManager" || role === "Admin";

const notifyAssigned = async (task) => {
  await Notification.create({
    userId: task.assignedTo,
    taskId: task._id,
    projectId: task.projectId,
    type: "TASK_ASSIGNED",
    message: `You were assigned task "${task.title}".`
  });
};

const buildProjectFilterFromProjectId = async (projectId) => {
  const mods = await Module.find({ projectId }).select("_id");
  return { moduleId: { $in: mods.map((m) => m._id) } };
};

const getTasks = async (req, res, next) => {
  try {
    const privileged = req.user && (req.user.role === "Admin" || req.user.role === "ProjectManager");
    const { projectId, moduleId, status, priority } = req.query;

    const query = {};
    if (moduleId) {
      if (!mongoose.Types.ObjectId.isValid(moduleId)) {
        return res.status(400).json({ message: "Invalid moduleId." });
      }
      query.moduleId = moduleId;
    } else if (projectId) {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ message: "Invalid projectId." });
      }
      Object.assign(query, await buildProjectFilterFromProjectId(projectId));
    }
    if (status) query.status = status;
    if (priority) query.priority = priority;

    if (!privileged) {
      if (req.user.role === "Developer") {
        query.assignedTo = req.user.id;
      } else {
        return res.status(403).json({ message: "Forbidden." });
      }
    }

    const tasks = await Task.find(query)
      .sort({ deadline: 1, createdAt: -1 })
      .populate("projectId", "title startDate endDate")
      .populate("moduleId", "name")
      .populate("assignedTo", "name email role");

    return res.status(200).json({ tasks });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid taskId." });
    }

    const privileged = req.user && (req.user.role === "Admin" || req.user.role === "ProjectManager");
    const q = { _id: taskId };
    if (!privileged) {
      q.assignedTo = req.user.id;
    }

    const task = await Task.findOne(q)
      .populate("projectId", "title")
      .populate("moduleId", "name")
      .populate("assignedTo", "name email role");

    if (!task) return res.status(404).json({ message: "Task not found." });
    return res.status(200).json({ task });
  } catch (error) {
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid taskId." });
    }

    const task = await Task.findById(taskId);

    if (!task) return res.status(404).json({ message: "Task not found." });

    if (req.user.role === "Developer" && task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden." });
    }
    if (!isPmOrAdmin(req.user.role) && req.user.role !== "Developer") {
      return res.status(403).json({ message: "Forbidden." });
    }

    task.status = status;
    await task.save();

    return res.status(200).json({ task });
  } catch (error) {
    next(error);
  }
};

const addTaskUpdate = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid taskId." });
    }

    const task = await Task.findById(taskId);

    if (!task) return res.status(404).json({ message: "Task not found." });

    if (req.user.role === "Developer" && task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden." });
    }

    task.updates.push({ text });
    await task.save();

    return res.status(200).json({ task });
  } catch (error) {
    next(error);
  }
};

const requestHelp = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid taskId." });
    }

    const task = await Task.findById(taskId);

    if (!task) return res.status(404).json({ message: "Task not found." });

    if (req.user.role === "Developer" && task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden." });
    }

    task.helpRequested = true;
    await task.save();

    return res.status(200).json({ task });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    if (!isPmOrAdmin(req.user.role)) {
      return res.status(403).json({ message: "Only Project Manager or Admin can create tasks." });
    }

    const { title, description, moduleId, assignedTo, priority, deadline } = req.body;

    if (!title || !moduleId || !assignedTo) {
      return res.status(400).json({ message: "title, moduleId, and assignedTo are required." });
    }
    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      return res.status(400).json({ message: "Invalid moduleId." });
    }

    const mod = await Module.findById(moduleId);
    if (!mod) return res.status(404).json({ message: "Module not found." });

    const task = await Task.create({
      title,
      description: description || "",
      moduleId,
      projectId: mod.projectId,
      assignedTo,
      priority: priority || "Medium",
      deadline: deadline || undefined
    });

    await notifyAssigned(task);

    const populated = await Task.findById(task._id)
      .populate("projectId", "title")
      .populate("moduleId", "name")
      .populate("assignedTo", "name email role");

    res.status(201).json({ task: populated });
  } catch (error) {
    next(error);
  }
};

const assignTask = async (req, res, next) => {
  try {
    if (!isPmOrAdmin(req.user.role)) {
      return res.status(403).json({ message: "Forbidden." });
    }
    const { taskId } = req.params;
    const { assignedTo } = req.body;
    if (!mongoose.Types.ObjectId.isValid(taskId) || !mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({ message: "Invalid ids." });
    }
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found." });

    task.assignedTo = assignedTo;
    await task.save();
    await notifyAssigned(task);

    const populated = await Task.findById(task._id)
      .populate("projectId", "title")
      .populate("moduleId", "name")
      .populate("assignedTo", "name email role");

    return res.status(200).json({ task: populated });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    if (!isPmOrAdmin(req.user.role)) {
      return res.status(403).json({ message: "Forbidden." });
    }
    const { taskId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid taskId." });
    }
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found." });

    const TimeLog = require("../models/TimeLog");
    await TimeLog.deleteMany({ taskId });
    await Notification.deleteMany({ taskId });
    await task.deleteOne();
    return res.status(200).json({ message: "Task deleted." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskById,
  updateTaskStatus,
  addTaskUpdate,
  requestHelp,
  createTask,
  assignTask,
  deleteTask
};
