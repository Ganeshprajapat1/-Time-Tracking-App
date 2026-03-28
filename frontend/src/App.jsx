import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import Layout from "./components/Layout.jsx";
import Projects from "./pages/Projects.jsx";
import TimeTracker from "./pages/TimeTracker.jsx";
import Reports from "./pages/Reports.jsx";
import TasksPage from "./pages/TasksPage.jsx";
import Users from "./pages/Users.jsx";
import Billing from "./pages/Billing.jsx";
import TimeLogsPage from "./pages/TimeLogsPage.jsx";
import Settings from "./pages/Settings.jsx";
import MyTasks from "./pages/MyTasks.jsx";
import Timesheet from "./pages/Timesheet.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/signup" element={<Navigate to="/register" replace />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/projects"
        element={
          <PrivateRoute roles={["Admin", "ProjectManager"]}>
            <Layout>
              <Projects />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/tasks"
        element={
          <PrivateRoute>
            <Layout>
              <TasksPage />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/tracker"
        element={
          <PrivateRoute roles={["Developer", "Admin", "ProjectManager"]}>
            <Layout>
              <TimeTracker />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <PrivateRoute>
            <Layout>
              <Reports />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/users"
        element={
          <PrivateRoute roles={["Admin"]}>
            <Layout>
              <Users />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/billing"
        element={
          <PrivateRoute roles={["Admin", "ProjectManager"]}>
            <Layout>
              <Billing />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/time-logs"
        element={
          <PrivateRoute roles={["Admin", "ProjectManager"]}>
            <Layout>
              <TimeLogsPage />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/my-tasks"
        element={
          <PrivateRoute roles={["Developer"]}>
            <Layout>
              <MyTasks />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/timesheet"
        element={
          <PrivateRoute roles={["Developer"]}>
            <Layout>
              <Timesheet />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Layout>
              <Settings />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
