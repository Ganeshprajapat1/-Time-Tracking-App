import { useEffect, useState } from "react";
import { getProjects } from "../api/projectApi";
import { listModules } from "../api/moduleApi";
import { listDevelopers } from "../api/userApi";
import { getTasks, createTask, assignTask, deleteTask } from "../api/taskApi";
import { useAuth } from "../context/AuthContext";

export default function TasksPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [modules, setModules] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ projectId: "", status: "", priority: "" });

  const [form, setForm] = useState({
    title: "",
    description: "",
    projectId: "",
    moduleId: "",
    assignedTo: "",
    priority: "Medium",
    deadline: ""
  });
  const [error, setError] = useState("");

  const canManage = user?.role === "Admin" || user?.role === "ProjectManager";

  const load = async () => {
    try {
      const res = await getTasks({
        projectId: filters.projectId || undefined,
        status: filters.status || undefined,
        priority: filters.priority || undefined
      });
      setTasks(res.data.tasks || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load tasks.");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const pRes = await getProjects();
        setProjects(pRes.data.projects || []);
        if (canManage) {
          const dRes = await listDevelopers();
          setDevelopers(dRes.data.users || []);
        }
        if (!form.projectId && pRes.data.projects?.[0]) {
          const pid = pRes.data.projects[0]._id;
          setForm((f) => ({ ...f, projectId: pid }));
          const mRes = await listModules(pid);
          setModules(mRes.data.modules || []);
          const firstMod = mRes.data.modules?.[0]?._id || "";
          setForm((f) => ({ ...f, moduleId: firstMod }));
        }
      } catch {
        setError("Could not load reference data.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  useEffect(() => {
    load();
  }, [filters.projectId, filters.status, filters.priority]);

  useEffect(() => {
    if (!form.projectId) return;
    listModules(form.projectId)
      .then((r) => {
        const mods = r.data.modules || [];
        setModules(mods);
        if (!mods.find((m) => m._id === form.moduleId)) {
          setForm((f) => ({ ...f, moduleId: mods[0]?._id || "" }));
        }
      })
      .catch(() => {});
  }, [form.projectId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!canManage) return;
    setError("");
    try {
      await createTask({
        title: form.title,
        description: form.description,
        moduleId: form.moduleId,
        assignedTo: form.assignedTo,
        priority: form.priority,
        deadline: form.deadline || undefined
      });
      setForm((f) => ({ ...f, title: "", description: "" }));
      load();
    } catch (e) {
      setError(e?.response?.data?.message || "Could not create task.");
    }
  };

  const reassign = async (taskId) => {
    const id = window.prompt("Developer user id");
    if (!id) return;
    await assignTask(taskId, id);
    load();
  };

  const remove = async (taskId) => {
    if (!window.confirm("Delete task?")) return;
    await deleteTask(taskId);
    load();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Tasks</h1>
        <p className="text-sm text-slate-600">Create, filter, and assign work</p>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <select
          className="rounded-xl border px-3 py-2 text-sm"
          value={filters.projectId}
          onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
        >
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.title}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border px-3 py-2 text-sm"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">Any status</option>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Under Review</option>
          <option>Completed</option>
        </select>
        <select
          className="rounded-xl border px-3 py-2 text-sm"
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
        >
          <option value="">Any priority</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>

      {canManage ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-slate-900">New task</h2>
          <form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              className="md:col-span-2 rounded-xl border px-3 py-2 text-sm"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <textarea
              className="md:col-span-2 rounded-xl border px-3 py-2 text-sm"
              placeholder="Description"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <select
              className="rounded-xl border px-3 py-2 text-sm"
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              required
            >
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
            <select
              className="rounded-xl border px-3 py-2 text-sm"
              value={form.moduleId}
              onChange={(e) => setForm({ ...form, moduleId: e.target.value })}
              required
            >
              {modules.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
            <select
              className="rounded-xl border px-3 py-2 text-sm"
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              required
            >
              <option value="">Select developer</option>
              {developers.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} — {d.email}
                </option>
              ))}
            </select>
            <select
              className="rounded-xl border px-3 py-2 text-sm"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <input
              type="date"
              className="rounded-xl border px-3 py-2 text-sm"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
            <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
              Create task
            </button>
          </form>
        </section>
      ) : null}

      <div className="overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Assignee</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t._id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">{t.title}</td>
                <td className="px-4 py-3">{t.assignedTo?.name}</td>
                <td className="px-4 py-3">{t.priority}</td>
                <td className="px-4 py-3">{t.status}</td>
                <td className="space-x-2 px-4 py-3">
                  {canManage ? (
                    <>
                      <button type="button" className="text-xs font-semibold text-indigo-600" onClick={() => reassign(t._id)}>
                        Reassign
                      </button>
                      <button type="button" className="text-xs font-semibold text-rose-600" onClick={() => remove(t._id)}>
                        Delete
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
