const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const timeEntryRoutes = require("./routes/timeEntryRoutes");
const authRoutes = require("./routes/authRoutes");
const timeLogRoutes = require("./routes/timeLogRoutes");
const reportRoutes = require("./routes/reportRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { upsertDeadlineNotifications } = require("./controllers/notificationController");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const userRoutes = require("./routes/userRoutes");
const billingRoutes = require("./routes/billingRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const { protect } = require("./middleware/authMiddleware");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Time Tracking API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/time-entries", protect, timeEntryRoutes);
app.use("/api/time-logs", timeLogRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startDeadlineNotifier = () => {
  const intervalMinutes = process.env.DEADLINE_CHECK_INTERVAL_MINUTES
    ? Number(process.env.DEADLINE_CHECK_INTERVAL_MINUTES)
    : 15;

  const intervalMs =
    Number.isFinite(intervalMinutes) && intervalMinutes > 0 ? intervalMinutes * 60 * 1000 : null;

  const run = async () => {
    try {
      const hoursAhead = process.env.DEADLINE_ALERT_HOURS ? Number(process.env.DEADLINE_ALERT_HOURS) : 24;
      await upsertDeadlineNotifications({ scopeUserId: null, hoursAhead });
    } catch (error) {
      console.error("Deadline notifier error:", error.message);
    }
  };

  run();

  if (intervalMs) {
    setInterval(run, intervalMs);
  }
};

connectDB().then(() => {
  startDeadlineNotifier();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
