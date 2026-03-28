import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { logoutUser } = useAuth();

  const handleLogout = () => {
    logoutUser();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar onLogout={handleLogout} />
        <div className="flex min-h-screen flex-1 flex-col pl-64">
          <Topbar onLogout={handleLogout} />
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
