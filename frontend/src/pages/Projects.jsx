import { useEffect, useState } from "react";
import { getProjects, createProject, updateProject, deleteProject } from "../api/projectApi";
import { listModules, createModule } from "../api/moduleApi";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [modules, setModules] = useState([]);
  const [newModuleName, setNewModuleName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    try {
      const res = await getProjects();
      setProjects(res.data.projects || []);
    } catch {
      setError("Failed to load projects");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const loadModules = async (projectId) => {
    const res = await listModules(projectId);
    setModules(res.data.modules || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) {
      setError("Title and dates are required.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      if (editingId) {
        await updateProject(editingId, {
          title,
          description,
          startDate,
          endDate
        });
        setEditingId(null);
      } else {
        await createProject({
          title,
          description,
          startDate,
          endDate,
          members: []
        });
      }
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      fetchProjects();
    } catch {
      setError("Operation failed. Ensure you are PM/Admin and dates are valid.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project) => {
    setTitle(project.title);
    setDescription(project.description || "");
    setStartDate(project.startDate?.slice(0, 10) || "");
    setEndDate(project.endDate?.slice(0, 10) || "");
    setEditingId(project._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project and related data?")) return;
    try {
      await deleteProject(id);
      fetchProjects();
    } catch {
      setError("Delete failed");
    }
  };

  const addModule = async (projectId) => {
    if (!newModuleName.trim()) return;
    try {
      await createModule({ projectId, name: newModuleName.trim() });
      setNewModuleName("");
      loadModules(projectId);
    } catch {
      setError("Could not create module");
    }
  };

  const progress = (p) => {
    const end = p.endDate ? new Date(p.endDate).getTime() : null;
    const start = p.startDate ? new Date(p.startDate).getTime() : null;
    if (!end || !start) return 0;
    const now = Date.now();
    const t = Math.min(1, Math.max(0, (now - start) / (end - start)));
    return Math.round(t * 100);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
        <p className="text-sm text-slate-600">Create projects; each gets a default “General” module.</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900">{editingId ? "Edit project" : "New project"}</h2>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            className="rounded-xl border px-3 py-2 text-sm md:col-span-2"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="md:col-span-2 rounded-xl border px-3 py-2 text-sm"
            placeholder="Description"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input type="date" className="rounded-xl border px-3 py-2 text-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <input type="date" className="rounded-xl border px-3 py-2 text-sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {editingId ? "Save changes" : "Create project"}
            </button>
            {editingId ? (
              <button
                type="button"
                className="ml-2 rounded-xl border px-4 py-2 text-sm font-semibold text-slate-700"
                onClick={() => {
                  setEditingId(null);
                  setTitle("");
                  setDescription("");
                  setStartDate("");
                  setEndDate("");
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <div key={p._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{p.title}</h3>
                <p className="text-xs text-slate-500">
                  {p.startDate?.slice(0, 10)} → {p.endDate?.slice(0, 10)}
                </p>
              </div>
              <div className="flex gap-2 text-xs">
                <button type="button" className="font-semibold text-indigo-600" onClick={() => handleEdit(p)}>
                  Edit
                </button>
                <button type="button" className="font-semibold text-rose-600" onClick={() => handleDelete(p._id)}>
                  Delete
                </button>
              </div>
            </div>
            <div className="mt-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-indigo-500" style={{ width: `${progress(p)}%` }} />
              </div>
              <p className="mt-1 text-xs text-slate-500">Timeline progress (approx.)</p>
            </div>
            <button
              type="button"
              className="mt-4 text-sm font-semibold text-indigo-600"
              onClick={() => {
                setExpanded(p._id);
                loadModules(p._id);
              }}
            >
              {expanded === p._id ? "Hide modules" : "Manage modules"}
            </button>
            {expanded === p._id ? (
              <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <ul className="space-y-1 text-sm text-slate-700">
                  {modules.map((m) => (
                    <li key={m._id}>• {m.name}</li>
                  ))}
                </ul>
                <div className="mt-2 flex gap-2">
                  <input
                    className="flex-1 rounded-lg border px-2 py-1 text-sm"
                    placeholder="New module name"
                    value={newModuleName}
                    onChange={(e) => setNewModuleName(e.target.value)}
                  />
                  <button
                    type="button"
                    className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
                    onClick={() => addModule(p._id)}
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
