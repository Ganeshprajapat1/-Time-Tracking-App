import { useEffect, useState } from "react";
import { getTasks, updateTaskStatus, addTaskUpdate } from "../api/taskApi";

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await getTasks();
      setTasks(res.data.tasks || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load tasks.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id, status) => {
    await updateTaskStatus(id, status);
    load();
  };

  const addNote = async (id) => {
    const text = window.prompt("Work update");
    if (!text) return;
    await addTaskUpdate(id, text);
    load();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My tasks</h1>
        <p className="text-sm text-slate-600">Update status and submit work notes</p>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="grid gap-3">
        {tasks.map((t) => (
          <div key={t._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{t.title}</h2>
                <p className="text-xs text-slate-500">
                  {t.projectId?.title} · {t.moduleId?.name} · {t.priority} priority
                </p>
              </div>
              <select
                value={t.status}
                onChange={(e) => setStatus(t._id, e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm"
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>Under Review</option>
                <option>Completed</option>
              </select>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => addNote(t._id)}
                className="rounded-xl border px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Add update
              </button>
              <a
                href="/tracker"
                className="rounded-xl bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Open timer
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
