import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const tabs = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/students", label: "Students" },
  { to: "/admin/companies", label: "Companies" },
  { to: "/admin/drives", label: "Drives" },
  { to: "/admin/applications", label: "Applications" },
  { to: "/admin/announcements", label: "Announcements" },
  { to: "/admin/statistics", label: "Statistics" },
];

export function AdminLayout() {
  const { user } = useAuth();
  return (
    <div className="container-page py-10">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-agi-gold">{user?.role} Console</div>
      <div className="mb-8 flex flex-wrap gap-2 overflow-x-auto border-b border-slate-200 pb-2">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-t-md px-4 py-2 text-sm font-semibold ${isActive ? "bg-agi-navy text-white" : "text-slate-600 hover:bg-slate-100"}`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
