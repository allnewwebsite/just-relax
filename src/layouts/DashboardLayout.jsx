import { useState } from "react";
import { ChevronLeft, ChevronRight, FileText, LogOut, Users } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout() {
  const { user, profile, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebar-collapsed") === "true");
  const toggleSidebar = () => setCollapsed((current) => {
    localStorage.setItem("sidebar-collapsed", String(!current));
    return !current;
  });
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="no-print fixed inset-x-0 top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white px-4 lg:px-7">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-700 text-white"><FileText size={19} /></div>
          <div><p className="text-sm font-extrabold tracking-[.16em] text-navy">JUST RELAX</p><p className="text-[10px] text-slate-500">Invoice management</p></div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden text-right sm:block"><p className="max-w-48 truncate text-sm font-semibold text-slate-700">{user?.email}</p><p className="text-[11px] text-slate-400">Signed in</p></div>
          <button onClick={logout} className="icon-button" aria-label="Log out"><LogOut size={18} /></button>
        </div>
      </header>
      <aside className={`no-print fixed bottom-0 left-0 top-16 z-20 hidden border-r border-slate-200 bg-white transition-[width] duration-200 lg:block ${collapsed ? "w-[72px] p-3" : "w-60 p-4"}`}>
        <button onClick={toggleSidebar} className="absolute -right-3 top-6 grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-blue-300 hover:text-blue-700" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
        {!collapsed && <p className="px-3 pb-3 pt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Workspace</p>}
        <NavLink to="/invoices" title={collapsed ? "Retail Invoice" : undefined} className={({isActive}) => `sidebar-link ${collapsed ? "justify-center px-0" : ""} ${isActive ? "sidebar-link-active" : ""}`}><FileText size={18} /><span className={collapsed ? "hidden" : ""}>Retail Invoice</span></NavLink>
        {profile?.role === "admin" && <NavLink to="/users" title={collapsed ? "User Management" : undefined} className={({isActive}) => `sidebar-link mt-1 ${collapsed ? "justify-center px-0" : ""} ${isActive ? "sidebar-link-active" : ""}`}><Users size={18} /><span className={collapsed ? "hidden" : ""}>User Management</span></NavLink>}
      </aside>
      <main className={`pt-16 transition-[padding] duration-200 ${collapsed ? "lg:pl-[72px]" : "lg:pl-60"}`}><Outlet /></main>
    </div>
  );
}
