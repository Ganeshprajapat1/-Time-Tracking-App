const mongoose = require("mongoose");
const Module = require("../models/Module");
const Project = require("../models/Project");

const isPmOrAdmin = (role) => role === "ProjectManager" || role === "Admin";

const assertProjectAccess = async (projectId, user) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    const err = new Error("Invalid projectId.");
    err.statusCode = 400;
    throw err;
  }
  const project = await Project.findById(projectId);
  if (!project) {
    const err = new Error("Project not found.");
    err.statusCode = 404;
    throw err;
  }
  if (user.role === "Admin") return project;
  if (user.role === "ProjectManager" && project.createdBy.toString() === user.id.toString()) {
    return project;
  }
  const err = new Error("Forbidden.");
  err.statusCode = 403;
  throw err;
};

const listModules = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "projectId query is required." });
    }
    await assertProjectAccess(projectId, req.user);
    const modules = await Module.find({ projectId }).sort({ order: 1, createdAt: 1 });
    return res.status(200).json({ modules });
  } catch (e) {
    if (e.statusCode) return res.status(e.statusCode).json({ message: e.message });
    next(e);
  }
};

const createModule = async (req, res, next) => {
  try {
    if (!isPmOrAdmin(req.user.role)) {
      return res.status(403).json({ message: "Forbidden." });
    }
    const { projectId, name, description, order } = req.body;
    if (!projectId || !name) {
      return res.status(400).json({ message: "projectId and name are required." });
    }
    await assertProjectAccess(projectId, req.user);
    const mod = await Module.create({
      projectId,
      name,
      description: description || "",
      order: order != null ? order : 0
    });
    return res.status(201).json({ module: mod });
  } catch (e) {
    if (e.statusCode) return res.status(e.statusCode).json({ message: e.message });
    next(e);
  }
};

const updateModule = async (req, res, next) => {
  try {
    if (!isPmOrAdmin(req.user.role)) {
      return res.status(403).json({ message: "Forbidden." });
    }
    const { moduleId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      return res.status(400).json({ message: "Invalid moduleId." });
    }
    const mod = await Module.findById(moduleId);
    if (!mod) return res.status(404).json({ message: "Module not found." });
    await assertProjectAccess(mod.projectId.toString(), req.user);

    const { name, description, order } = req.body;
    if (name != null) mod.name = name;
    if (description != null) mod.description = description;
    if (order != null) mod.order = order;
    await mod.save();
    return res.status(200).json({ module: mod });
  } catch (e) {
    if (e.statusCode) return res.status(e.statusCode).json({ message: e.message });
    next(e);
  }
};

const deleteModule = async (req, res, next) => {
  try {
    if (!isPmOrAdmin(req.user.role)) {
      return res.status(403).json({ message: "Forbidden." });
    }
    const { moduleId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
      return res.status(400).json({ message: "Invalid moduleId." });
    }
    const mod = await Module.findById(moduleId);
    if (!mod) return res.status(404).json({ message: "Module not found." });
    await assertProjectAccess(mod.projectId.toString(), req.user);

    const Task = require("../models/Task");
    const taskCount = await Task.countDocuments({ moduleId: mod._id });
    if (taskCount > 0) {
      return res.status(400).json({ message: "Cannot delete module with tasks." });
    }
    await mod.deleteOne();
    return res.status(200).json({ message: "Module deleted." });
  } catch (e) {
    if (e.statusCode) return res.status(e.statusCode).json({ message: e.message });
    next(e);
  }
};

module.exports = {
  listModules,
  createModule,
  updateModule,
  deleteModule
};
