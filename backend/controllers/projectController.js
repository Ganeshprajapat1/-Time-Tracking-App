const mongoose = require("mongoose");
const Project = require("../models/Project");
const Module = require("../models/Module");

const isPmOrAdmin = (role) => role === "ProjectManager" || role === "Admin";

const getProjects = async (req, res, next) => {
  try {
    const privileged = req.user && (req.user.role === "Admin" || req.user.role === "ProjectManager");

    const query = privileged
      ? {}
      : {
          members: req.user.id
        };

    if (!privileged && (!req.user || !req.user.id)) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email role")
      .populate("members", "name email role");

    return res.status(200).json({ projects });
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid projectId." });
    }

    const privileged = req.user && (req.user.role === "Admin" || req.user.role === "ProjectManager");
    const query = privileged ? { _id: projectId } : { _id: projectId, members: req.user.id };

    const project = await Project.findOne(query)
      .populate("createdBy", "name email role")
      .populate("members", "name email role");

    if (!project) return res.status(404).json({ message: "Project not found." });
    return res.status(200).json({ project });
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    if (!isPmOrAdmin(req.user.role)) {
      return res.status(403).json({ message: "Only Project Manager or Admin can create projects." });
    }

    const { title, description, startDate, endDate, members } = req.body;

    if (!title || !startDate || !endDate) {
      return res.status(400).json({ message: "title, startDate, and endDate are required." });
    }

    const project = await Project.create({
      title,
      description: description || "",
      startDate,
      endDate,
      createdBy: req.user.id,
      members: members || []
    });

    await Module.create({
      projectId: project._id,
      name: "General",
      description: "Default module",
      order: 0
    });

    const populated = await Project.findById(project._id)
      .populate("createdBy", "name email role")
      .populate("members", "name email role");

    res.status(201).json({ project: populated });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid projectId." });
    }
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found." });

    if (!isPmOrAdmin(req.user.role)) {
      return res.status(403).json({ message: "Forbidden." });
    }
    if (req.user.role === "ProjectManager" && project.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Forbidden." });
    }

    const { title, description, startDate, endDate, members } = req.body;
    if (title != null) project.title = title;
    if (description != null) project.description = description;
    if (startDate != null) project.startDate = startDate;
    if (endDate != null) project.endDate = endDate;
    if (members != null) project.members = members;
    await project.save();

    const populated = await Project.findById(project._id)
      .populate("createdBy", "name email role")
      .populate("members", "name email role");

    return res.status(200).json({ project: populated });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid projectId." });
    }
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found." });

    if (req.user.role !== "Admin") {
      if (req.user.role !== "ProjectManager" || project.createdBy.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: "Forbidden." });
      }
    }

    const Task = require("../models/Task");
    const TimeLog = require("../models/TimeLog");
    const modules = await Module.find({ projectId }).select("_id");
    const moduleIds = modules.map((m) => m._id);
    const tasks = await Task.find({ projectId }).select("_id");
    const taskIds = tasks.map((t) => t._id);

    await TimeLog.deleteMany({ taskId: { $in: taskIds } });
    await Task.deleteMany({ _id: { $in: taskIds } });
    await Module.deleteMany({ _id: { $in: moduleIds } });
    await project.deleteOne();

    return res.status(200).json({ message: "Project deleted." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
