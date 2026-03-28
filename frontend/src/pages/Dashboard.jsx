import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { getDashboard } from "../api/dashboardApi";
import { getProjects } from "../api/projectApi";
import { getTasks } from "../api/taskApi";
import { getLogsByUser, startTimer, stopTimer } from "../api/timeLogApi";
import { useAuth } from "../context/AuthContext";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899"];

export default function Dashboard() {
  const { user } = useAuth();
  const userId = user?.id;

  const [overview, setOverview] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = async () => {
    const res = await getDashboard();
    setOverview(res.data);
  };

  const fetchSecondary = async () => {
    if (!userId) return;
    const [projectsRes, tasksRes, logsRes] = await Promise.all([
      getProjects(),
      getTasks(selectedProjectId),
      getLogsByUser({ userId })
    ]);
    setProjects(projectsRes.data?.projects || []);
    setTasks(tasksRes.data?.tasks || []);
    setTimeLogs(logsRes.data?.timeLogs || []);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        await loadOverview();
        await fetchSecondary();
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, selectedProjectId]);

  const activeLog = timeLogs.find((l) => l.endTime == null);
  const activeTaskId = activeLog?.taskId?._id?.toString?.() || activeLog?.taskId?.toString?.();

  const start = async (taskId) => {
    setError("");
    try {
      await startTimer({ taskId });
      await fetchSecondary();
    } catch (e) {
      setError(e?.response?.data?.message || "Could not start timer.");
    }
  };

  const stop = async (taskId) => {
    setError("");
    try {
      await stopTimer({ taskId });
      await fetchSecondary();
    } catch (e) {
      setError(e?.response?.data?.message || "Could not stop timer.");
    }
  };

  const stats = overview?.stats || {};
  const charts = overview?.charts || {};

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-600">
          Hello {user?.name} — <span className="font-medium text-slate-800">{user?.role}</span>
        </p>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {loading ? <p className="text-sm text-slate-600">Loading…</p> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {typeof value === "number" && key.toLowerCase().includes("hour") ? value.toFixed(2) : value}
            </p>
          </div>
        ))}
      </div>

      {user?.role === "Admin" && charts?.timeTrend ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Time tracking trend</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.timeTrend}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Task status mix</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={charts.taskStatusPie || []} dataKey="count" nameKey="status" outerRadius={90} label>
                    {(charts.taskStatusPie || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
            <h2 className="text-sm font-semibold text-slate-900">Project performance (hours)</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.taskStatusPie || []}>
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Quick actions — your tasks</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedProjectId("all")}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                selectedProjectId === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              All
            </button>
            {projects.map((p) => (
              <button
                key={p._id}
                type="button"
                onClick={() => setSelectedProjectId(p._id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  selectedProjectId === p._id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {tasks.map((t) => {
            const tid = t._id?.toString?.();
            const running = activeTaskId === tid;
            return (
              <div
                key={t._id}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
                  running ? "border-emerald-200 bg-emerald-50/40" : "border-slate-100 bg-slate-50"
                }`}
              >
                <div>
                  <p className="font-medium text-slate-900">{t.title}</p>
                  <p className="text-xs text-slate-500">{t.status}</p>
                </div>
                {running ? (
                  <button
                    type="button"
                    onClick={() => stop(t._id)}
                    className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Stop
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => start(t._id)}
                    className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Start
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
