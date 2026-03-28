import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import {
  hoursPerProject,
  taskCompletionStats,
  hoursPerUser,
  productivityReport,
  exportReportsCsv
} from "../api/reportApi";

const COLORS = ["#22c55e", "#f59e0b", "#3b82f6", "#a855f7"];

export default function Reports() {
  const [projectData, setProjectData] = useState([]);
  const [taskStats, setTaskStats] = useState([]);
  const [userData, setUserData] = useState([]);
  const [productivity, setProductivity] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(projectId && { projectId })
      };

      const [res1, res2, res3, res4] = await Promise.all([
        hoursPerProject(params),
        taskCompletionStats(params),
        hoursPerUser(params),
        productivityReport(params)
      ]);

      setProjectData(res1.data.data || []);

      const list = res2.data.data || [];
      const totals = list.reduce(
        (acc, p) => ({
          completed: acc.completed + (p.completedTasks || 0),
          pending: acc.pending + (p.pendingTasks || 0),
          inProgress: acc.inProgress + (p.inProgressTasks || 0)
        }),
        { completed: 0, pending: 0, inProgress: 0 }
      );
      setTaskStats([
        { name: "Completed", value: totals.completed },
        { name: "Pending", value: totals.pending },
        { name: "In Progress", value: totals.inProgress }
      ]);

      setUserData(res3.data.data || []);
      setProductivity(res4.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const downloadCsv = async () => {
    await exportReportsCsv({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      projectId: projectId || undefined
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-600">Analytics and exports</p>
        </div>
        <button
          type="button"
          onClick={downloadCsv}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <input type="date" className="rounded-xl border px-3 py-2 text-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" className="rounded-xl border px-3 py-2 text-sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <input
          className="min-w-[200px] rounded-xl border px-3 py-2 text-sm"
          placeholder="Project id (optional)"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        />
        <button type="button" onClick={fetchReports} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
          Apply filters
        </button>
      </div>

      {loading ? <p className="text-sm text-slate-600">Loading reports…</p> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Hours per project</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectData}>
                <XAxis dataKey="projectTitle" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalHours" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Task status</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={taskStats} dataKey="value" nameKey="name" outerRadius={100} label>
                  {taskStats.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Hours per user</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userData}>
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalHours" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Productivity (hours vs completion)</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productivity}>
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="totalHours" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
