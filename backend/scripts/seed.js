/**
 * Seeds sample users, a project, module, tasks, and time logs.
 * Run: npm run seed  (from backend folder)
 * Requires MONGO_URI and JWT_* not needed for seed.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Project = require("../models/Project");
const Module = require("../models/Module");
const Task = require("../models/Task");
const TimeLog = require("../models/TimeLog");
const Notification = require("../models/Notification");
const Invoice = require("../models/Invoice");
const PasswordResetToken = require("../models/PasswordResetToken");

const clear = async () => {
  await Promise.all([
    TimeLog.deleteMany({}),
    Notification.deleteMany({}),
    Task.deleteMany({}),
    Module.deleteMany({}),
    Invoice.deleteMany({}),
    Project.deleteMany({}),
    PasswordResetToken.deleteMany({}),
    User.deleteMany({})
  ]);
};

const run = async () => {
  await connectDB();
  await clear();

  const admin = await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password: " ",
    role: "Admin",
    isVerified: true,
    termsAccepted: true,
    hourlyRate: 120
  });

  const pm = await User.create({
    name: "Project Manager",
    email: "pm@example.com",
    password: "Manager@123",
    role: "ProjectManager",
    isVerified: true,
    termsAccepted: true,
    hourlyRate: 95
  });

  const dev = await User.create({
    name: "Developer One",
    email: "ganesh@example.com",
    password: "ganesh@123",
    role: "Developer",
    isVerified: true,
    termsAccepted: true,
    hourlyRate: 65
  });

  const start = new Date();
  const end = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);

  const project = await Project.create({
    title: "Acme Platform",
    description: "Sample project for demos",
    startDate: start,
    endDate: end,
    createdBy: pm._id,
    members: [dev._id]
  });

  const mod = await Module.create({
    projectId: project._id,
    name: "Core",
    description: "Core module",
    order: 0
  });

  const task1 = await Task.create({
    title: "Implement auth UI",
    description: "Login and dashboards",
    moduleId: mod._id,
    projectId: project._id,
    assignedTo: dev._id,
    priority: "High",
    status: "In Progress",
    deadline: new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000)
  });

  const task2 = await Task.create({
    title: "API integration",
    description: "Wire frontend to APIs",
    moduleId: mod._id,
    projectId: project._id,
    assignedTo: dev._id,
    priority: "Medium",
    status: "Pending",
    deadline: new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000)
  });

  const t0 = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  await TimeLog.create({
    userId: dev._id,
    taskId: task1._id,
    startTime: t0,
    endTime: new Date(t0.getTime() + 2 * 60 * 60 * 1000),
    duration: 120,
    date: t0,
    isManual: false
  });

  await Invoice.create({
    projectId: project._id,
    clientName: "Acme Corp",
    billableHours: 10,
    hourlyRate: 120,
    amount: 1200,
    status: "sent",
    notes: "Sample invoice",
    createdBy: admin._id
  });

  console.log("Seed complete.");
  console.log("Accounts (all verified):");
  console.log("  admin@example.com    / Admin@123");
  console.log("  pm@example.com       / Manager@123");
  console.log("  dev@example.com      / Developer@123");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
