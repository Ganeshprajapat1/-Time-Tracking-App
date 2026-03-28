import { useEffect, useState } from "react";
import { changePassword } from "../api/authApi";
import { updateProfile } from "../api/userApi";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user, refreshProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [hourlyRate, setHourlyRate] = useState(user?.hourlyRate ?? 0);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setHourlyRate(user.hourlyRate ?? 0);
    }
  }, [user]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      await updateProfile(user.id, { name, hourlyRate: Number(hourlyRate) });
      await refreshProfile();
      setMsg("Profile updated.");
    } catch (error) {
      setErr(error?.response?.data?.message || "Could not update profile.");
    } finally {
      setLoading(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMsg("Password changed.");
    } catch (error) {
      setErr(error?.response?.data?.message || "Could not change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-600">Profile and security</p>
      </div>

      {err ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{err}</p> : null}
      {msg ? <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{msg}</p> : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900">Profile</h2>
        <form onSubmit={saveProfile} className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-600">Name</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Hourly rate (for billing)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Save profile
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900">Change password</h2>
        <p className="text-sm text-slate-600">Not available for Google-only accounts.</p>
        <form onSubmit={savePassword} className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-600">Current password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">New password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Confirm new password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Update password
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
