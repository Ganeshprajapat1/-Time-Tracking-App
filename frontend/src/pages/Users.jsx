import { useEffect, useState } from "react";
import { listUsers, updateUserRole, updateUserStatus, deleteUser } from "../api/userApi";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listUsers();
      setUsers(res.data.users || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (userId, role) => {
    await updateUserRole(userId, role);
    load();
  };

  const toggleStatus = async (userId, status) => {
    await updateUserStatus(userId, status);
    load();
  };

  const remove = async (userId) => {
    if (!window.confirm("Delete this user?")) return;
    await deleteUser(userId);
    load();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">User management</h1>
        <p className="text-sm text-slate-600">Assign roles and suspend accounts</p>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {loading ? (
        <p className="text-sm text-slate-600">Loading…</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u._id, e.target.value)}
                      className="rounded-lg border px-2 py-1 text-xs"
                    >
                      <option value="Admin">Admin</option>
                      <option value="ProjectManager">ProjectManager</option>
                      <option value="Developer">Developer</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        u.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="space-x-2 px-4 py-3">
                    <button
                      type="button"
                      className="text-xs font-semibold text-indigo-600"
                      onClick={() => toggleStatus(u._id, u.status === "active" ? "suspended" : "active")}
                    >
                      {u.status === "active" ? "Suspend" : "Activate"}
                    </button>
                    <button type="button" className="text-xs font-semibold text-rose-600" onClick={() => remove(u._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
