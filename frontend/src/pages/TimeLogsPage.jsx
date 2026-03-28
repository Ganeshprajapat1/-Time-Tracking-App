import { useEffect, useState } from "react";
import { listTimeLogs } from "../api/timeLogApi";
import { getProjects } from "../api/projectApi";

export default function TimeLogsPage() {
  const [logs, setLogs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const res = await listTimeLogs({
        projectId: projectId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });
      setLogs(res.data.timeLogs || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load logs.");
    }
  };

  useEffect(() => {
    getProjects()
      .then((r) => setProjects(r.data.projects || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Time logs</h1>
        <p className="text-sm text-slate-600">Filter by project and date range</p>
      </div>
      <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="rounded-xl border px-3 py-2 text-sm"
        >
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.title}
            </option>
          ))}
        </select>
        <input type="date" className="rounded-xl border px-3 py-2 text-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" className="rounded-xl border px-3 py-2 text-sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <button type="button" onClick={load} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
          Apply
        </button>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Task</th>
              <th className="px-4 py-3">Start</th>
              <th className="px-4 py-3">End</th>
              <th className="px-4 py-3">Minutes</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l._id} className="border-t border-slate-100">
                <td className="px-4 py-3">{l.userId?.name}</td>
                <td className="px-4 py-3">{l.taskId?.title}</td>
                <td className="px-4 py-3">{l.startTime ? new Date(l.startTime).toLocaleString() : "—"}</td>
                <td className="px-4 py-3">
                  {l.endTime ? new Date(l.endTime).toLocaleString() : <span className="text-amber-600">Running</span>}
                </td>
                <td className="px-4 py-3">{l.duration ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
