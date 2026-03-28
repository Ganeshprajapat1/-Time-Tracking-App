const mongoose = require("mongoose");
const Invoice = require("../models/Invoice");
const TimeLog = require("../models/TimeLog");
const Task = require("../models/Task");
const User = require("../models/User");
const Project = require("../models/Project");

const isPrivileged = (role) => role === "Admin" || role === "ProjectManager";

const summary = async (req, res, next) => {
  try {
    const { projectId, startDate, endDate } = req.query;
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "projectId is required." });
    }
    if (!isPrivileged(req.user.role)) {
      return res.status(403).json({ message: "Forbidden." });
    }

    const match = { duration: { $ne: null } };
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }

    const taskIds = (await Task.find({ projectId }).select("_id")).map((t) => t._id);
    match.taskId = { $in: taskIds };

    const agg = await TimeLog.aggregate([
      { $match: match },
      {
        $lookup: {
          from: User.collection.name,
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $group: {
          _id: "$userId",
          name: { $first: "$user.name" },
          totalMinutes: { $sum: "$duration" },
          hourlyRate: { $first: "$user.hourlyRate" }
        }
      },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: 1,
          totalHours: { $divide: ["$totalMinutes", 60] },
          hourlyRate: { $ifNull: ["$hourlyRate", 0] },
          amount: {
            $multiply: [{ $divide: ["$totalMinutes", 60] }, { $ifNull: ["$hourlyRate", 0] }]
          }
        }
      }
    ]);

    const totalBillableHours = agg.reduce((s, r) => s + (r.totalHours || 0), 0);
    const totalAmount = agg.reduce((s, r) => s + (r.amount || 0), 0);

    return res.status(200).json({
      projectId,
      totalBillableHours,
      totalAmount,
      breakdown: agg
    });
  } catch (e) {
    next(e);
  }
};

const listInvoices = async (req, res, next) => {
  try {
    if (!isPrivileged(req.user.role)) {
      return res.status(403).json({ message: "Forbidden." });
    }
    const { projectId } = req.query;
    const q = {};
    if (projectId && mongoose.Types.ObjectId.isValid(projectId)) q.projectId = projectId;
    const invoices = await Invoice.find(q)
      .sort({ createdAt: -1 })
      .populate("projectId", "title")
      .populate("createdBy", "name email");
    return res.status(200).json({ invoices });
  } catch (e) {
    next(e);
  }
};

const createInvoice = async (req, res, next) => {
  try {
    if (!isPrivileged(req.user.role)) {
      return res.status(403).json({ message: "Forbidden." });
    }
    const { projectId, clientName, billableHours, hourlyRate, notes } = req.body;
    if (!projectId || billableHours == null || hourlyRate == null) {
      return res.status(400).json({ message: "projectId, billableHours, and hourlyRate are required." });
    }
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found." });

    const hours = Number(billableHours);
    const rate = Number(hourlyRate);
    const amount = Math.round(hours * rate * 100) / 100;

    const invoice = await Invoice.create({
      projectId,
      clientName: clientName || "",
      billableHours: hours,
      hourlyRate: rate,
      amount,
      notes: notes || "",
      createdBy: req.user.id
    });

    const populated = await Invoice.findById(invoice._id)
      .populate("projectId", "title")
      .populate("createdBy", "name email");

    return res.status(201).json({ invoice: populated });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  summary,
  listInvoices,
  createInvoice
};
