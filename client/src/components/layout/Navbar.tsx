import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/placements", label: "Placements" },
  { to: "/companies", label: "Companies" },
  { to: "/reports", label: "Reports" },
  { to: "/resources", label: "Resources" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const dashboardPath = user?.role === "STUDENT" ? "/student" : user ? "/admin" : "/login";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-agi-navy text-sm font-bold text-white">AGI</span>
          <span className="text-sm font-semibold text-agi-navy sm:text-base">AGI Placement Cell</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium transition ${isActive ? "text-agi-navy" : "text-slate-600 hover:text-agi-navy"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <Link to={dashboardPath} className="text-sm font-medium text-agi-navy hover:underline">
                Dashboard
              </Link>
              <button
                onClick={async () => {
                  await logout();
                  navigate("/");
                }}
                className="btn-secondary !px-4 !py-2 text-xs"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary !px-4 !py-2 text-xs">
                Student Login
              </Link>
              <Link to="/admin-login" className="text-xs font-medium text-slate-500 hover:text-agi-navy">
                Admin Login
              </Link>
            </>
          )}
        </div>

        <button className="lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="container-page flex flex-col gap-3 py-4">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm font-medium text-slate-700">
                {l.label}
              </Link>
            ))}
            <hr />
            {user ? (
              <>
                <Link to={dashboardPath} onClick={() => setOpen(false)} className="text-sm font-semibold text-agi-navy">
                  Dashboard
                </Link>
                <button
                  onClick={async () => {
                    await logout();
                    setOpen(false);
                    navigate("/");
                  }}
                  className="text-left text-sm font-semibold text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-semibold text-agi-navy">
                  Student Login
                </Link>
                <Link to="/admin-login" onClick={() => setOpen(false)} className="text-sm font-semibold text-slate-600">
                  Admin Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
