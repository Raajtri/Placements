import { NavLink, Outlet } from "react-router-dom";

const tabs = [
  { to: "/student", label: "Dashboard", end: true },
  { to: "/student/profile", label: "Profile" },
  { to: "/student/documents", label: "Documents" },
  { to: "/student/drives", label: "Drives" },
  { to: "/student/applications", label: "Applications" },
];

export function StudentLayout() {
  return (
    <div className="container-page py-10">
      <div className="mb-8 flex gap-2 overflow-x-auto border-b border-slate-200 pb-2">
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
