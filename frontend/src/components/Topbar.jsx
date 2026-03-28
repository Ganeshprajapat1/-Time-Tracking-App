import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getNotifications } from "../api/notificationApi";
import { logout as logoutApi } from "../api/authApi";

export default function Topbar({ onLogout }) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const load = async () => {
    try {
      const res = await getNotifications({ limit: 20 });
      setNotifications(res.data.notifications || []);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-8">
      <div className="flex max-w-xl flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          type="search"
          placeholder="Search projects, tasks…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50"
          >
            <Bell className="h-5 w-5" />
            {unread ? (
              <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold text-white">
                {unread}
              </span>
            ) : null}
          </button>
          {notifOpen ? (
            <div className="absolute right-0 mt-2 w-80 max-h-80 overflow-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              {!notifications.length ? (
                <p className="p-3 text-sm text-slate-500">No notifications</p>
              ) : (
                notifications.map((n) => (
                  <div key={n._id} className="rounded-lg p-2 text-sm hover:bg-slate-50">
                    <p className="font-medium text-slate-800">{n.type.replace(/_/g, " ")}</p>
                    <p className="text-slate-600">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          ) : null}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm shadow-sm hover:bg-slate-50"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
              {user?.name?.slice(0, 1)?.toUpperCase() || "U"}
            </span>
            <span className="hidden md:block">
              <span className="block font-medium text-slate-900">{user?.name}</span>
              <span className="block text-xs text-slate-500">{user?.role}</span>
            </span>
          </button>
          {menuOpen ? (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
              <button
                type="button"
                className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-50"
                onClick={() => navigate("/settings")}
              >
                Settings
              </button>
              <button
                type="button"
                className="block w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                onClick={async () => {
                  try {
                    await logoutApi();
                  } catch {
                    /* still logout locally */
                  }
                  onLogout?.();
                }}
              >
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
