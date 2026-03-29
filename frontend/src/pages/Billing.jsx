import { useEffect, useState } from "react";
import { getProjects } from "../api/projectApi";
import { billingSummary, listInvoices, createInvoice } from "../api/billingApi";

export default function Billing() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [summary, setSummary] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState({ clientName: "", billableHours: "", hourlyRate: "", notes: "" });
  const [error, setError] = useState("");

  const loadProjects = async () => {
    const res = await getProjects();
    const list = res.data.projects || [];
    setProjects(list);
    if (!projectId && list[0]) setProjectId(list[0]._id);
  };

  const loadSummary = async () => {
    if (!projectId) return;
    setError("");
    try {
      const res = await billingSummary({ projectId });
      setSummary(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Could not load summary.");
    }
  };

  const loadInvoices = async () => {
    try {
      const res = await listInvoices(projectId ? { projectId } : {});
      setInvoices(res.data.invoices || []);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    loadProjects().catch(() => {});
  }, []);

  useEffect(() => {
    if (projectId) {
      loadSummary();
      loadInvoices();
    }
  }, [projectId]);

  const create = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createInvoice({
        projectId,
        clientName: form.clientName,
        billableHours: Number(form.billableHours),
        hourlyRate: Number(form.hourlyRate),
        notes: form.notes
      });
      loadInvoices();
    } catch (e2) {
      setError(e2?.response?.data?.message || "Could not create invoice.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Billing</h1>
        <p className="text-sm text-slate-600">Billable hours and invoices</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-slate-600">Project</label>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="rounded-xl border px-3 py-2 text-sm"
        >
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {summary ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500">Billable hours</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {summary.totalBillableHours?.toFixed?.(2) ?? summary.totalBillableHours}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500">Estimated amount</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              ₹{summary.totalAmount?.toFixed?.(2) ?? summary.totalAmount}
            </p>
          </div>
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900">Create invoice</h2>
        <form onSubmit={create} className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="Client name"
            value={form.clientName}
            onChange={(e) => setForm({ ...form, clientName: e.target.value })}
          />
          <input
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="Billable hours"
            type="number"
            value={form.billableHours}
            onChange={(e) => setForm({ ...form, billableHours: e.target.value })}
            required
          />
          <input
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="Hourly rate"
            type="number"
            value={form.hourlyRate}
            onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
            required
          />
          <input
            className="md:col-span-2 rounded-xl border px-3 py-2 text-sm"
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
            Save invoice
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900">Invoices</h2>
        <div className="mt-4 space-y-2">
          {!invoices.length ? <p className="text-sm text-slate-600">No invoices yet.</p> : null}
          {invoices.map((inv) => (
            <div key={inv._id} className="flex flex-wrap items-center justify-between rounded-xl border px-4 py-3">
              <div>
                <p className="font-medium text-slate-900">{inv.projectId?.title || "Project"}</p>
                <p className="text-xs text-slate-500">
                  {inv.billableHours}h × ₹{inv.hourlyRate} = ₹{inv.amount} — {inv.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
