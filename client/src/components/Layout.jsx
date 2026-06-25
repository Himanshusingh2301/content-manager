import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FolderKanban, LogOut, FileText, Menu, User, X } from "lucide-react";
import { useState } from "react";

export default function Layout({ children }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 shadow-xl lg:shadow-none transform transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:inset-auto`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shadow-sm shadow-violet-200">
                  <FileText size={18} className="text-white" />
                </div>
                <div>
                  <span className="font-bold text-gray-900 text-base">ContentHub</span>
                  <p className="text-xs text-gray-400">Purple Media</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600 p-1">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 py-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Navigation</p>
            <Link
              to="/projects"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${location.pathname.startsWith("/projects")
                  ? "bg-violet-600 text-white shadow-sm shadow-violet-200"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
            >
              <FolderKanban size={18} />
              Projects
            </Link>
          </nav>

          {/* User section */}
          <div className="px-4 py-4 border-t border-gray-100">
            {user && (
              <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-gray-50 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                  {user.displayName?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{user.displayName}</p>
                  <p className="text-xs text-gray-400 truncate">@{user.username}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut size={17} />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600 p-1">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center">
              <FileText size={13} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">ContentHub</span>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
