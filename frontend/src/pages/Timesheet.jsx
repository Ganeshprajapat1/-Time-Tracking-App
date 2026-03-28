import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getTasks } from "../api/taskApi";
import { getLogsByUser, createManualLog } from "../api/timeLogApi";

export default function Timesheet() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [taskId, setTaskId] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    if (!user?.id) return;
    try {
      const [tRes, lRes] = await Promise.all([getTasks(), getLogsByUser({ userId: user.id })]);
      setTasks(tRes.data.tasks || []);
      setLogs(lRes.data.timeLogs || []);
      if (!taskId && tRes.data.tasks?.[0]) setTaskId(tRes.data.tasks[0]._id);
    } catch (e) {
      setError(e?.response?.data?.message || "Could not load timesheet.");
    }
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const submitManual = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createManualLog({ taskId, startTime: start, endTime: end, notes });
      setStart("");
      setEnd("");
      setNotes("");
      load();
    } catch (e) {
      setError(e?.response?.data?.message || "Could not save entry.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Timesheet</h1>
        <p className="text-sm text-slate-600">Manual time entries and recent logs</p>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900">Add manual time</h2>
        <form onSubmit={submitManual} className="mt-4 grid gap-3 md:grid-cols-2">
          <select
            className="rounded-xl border px-3 py-2 text-sm md:col-span-2"
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            required
          >
            {tasks.map((t) => (
              <option key={t._id} value={t._id}>
                {t.title}
              </option>
            ))}
          </select>
          <input
            type="datetime-local"
            className="rounded-xl border px-3 py-2 text-sm"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
          />
          <input
            type="datetime-local"
            className="rounded-xl border px-3 py-2 text-sm"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            required
          />
          <input
            className="md:col-span-2 rounded-xl border px-3 py-2 text-sm"
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
            Save entry
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900">Recent entries</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {logs.slice(0, 20).map((l) => (
            <li key={l._id} className="flex justify-between rounded-xl bg-slate-50 px-3 py-2">
              <span>{l.taskId?.title}</span>
              <span>
                {l.duration != null ? `${l.duration} min` : "Running"} {l.isManual ? "(manual)" : ""}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
