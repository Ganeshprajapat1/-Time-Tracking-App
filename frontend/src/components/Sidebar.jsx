import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  Clock,
  BarChart3,
  CreditCard,
  Settings,
  Timer
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
    isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
  }`;

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role;

  const adminItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Users", path: "/users", icon: Users },
    { name: "Projects", path: "/projects", icon: FolderKanban },
    { name: "Tasks", path: "/tasks", icon: CheckSquare },
    { name: "Time Logs", path: "/time-logs", icon: Clock },
    { name: "Reports", path: "/reports", icon: BarChart3 },
    { name: "Billing", path: "/billing", icon: CreditCard },
    { name: "Settings", path: "/settings", icon: Settings }
  ];

  const pmItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", path: "/projects", icon: FolderKanban },
    { name: "Tasks", path: "/tasks", icon: CheckSquare },
    { name: "Time Logs", path: "/time-logs", icon: Clock },
    { name: "Reports", path: "/reports", icon: BarChart3 },
    { name: "Settings", path: "/settings", icon: Settings }
  ];

  const devItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "My Tasks", path: "/my-tasks", icon: CheckSquare },
    { name: "Timer", path: "/tracker", icon: Timer },
    { name: "Timesheet", path: "/timesheet", icon: Clock },
    { name: "Reports", path: "/reports", icon: BarChart3 },
    { name: "Settings", path: "/settings", icon: Settings }
  ];

  let items = devItems;
  if (role === "Admin") items = adminItems;
  else if (role === "ProjectManager") items = pmItems;

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-950 text-white">
      <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-lg font-bold">
          ⏱
        </div>
        <div>
          <p className="text-sm font-semibold">TimeTrack</p>
          <p className="text-xs text-slate-400">Workspace</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map((item) => (
          <NavLink key={item.path} to={item.path} className={linkClass} end={item.path === "/dashboard"}>
            <item.icon className="h-4 w-4 opacity-90" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-800 px-4 py-4 text-xs text-slate-500">
        Signed in as <span className="text-slate-300">{user?.email}</span>
      </div>
    </aside>
  );
}
