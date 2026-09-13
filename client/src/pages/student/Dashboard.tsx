import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { AnnouncementCard, Badge, DriveCard, StatCard } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

export function StudentDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    api.get("/applications/mine").then((r) => setApplications(r.data.applications));
    api.get("/drives?status=OPEN").then((r) => setDrives(r.data.drives));
    api.get("/announcements").then((r) => setAnnouncements(r.data.announcements.slice(0, 4)));
    api.get("/notifications").then((r) => setNotifications(r.data.notifications.slice(0, 5)));
  }, []);

  const student = user?.student;
  const shortlisted = applications.filter((a) => !["APPLIED", "WITHDRAWN", "REJECTED"].includes(a.status)).length;
  const selected = applications.filter((a) => a.status === "SELECTED").length;

  return (
    <div>
      <h1 className="text-xl font-bold text-agi-navy">Welcome, {student?.fullName ?? user?.email}</h1>

      {student?.verificationStatus !== "VERIFIED" && (
        <div className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          Your profile is <strong>{student?.verificationStatus}</strong>. Complete your profile and upload documents — the Placement
          Cell must verify you before you can apply to drives.
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Profile Completion" value={`${student?.profileCompletionPercent ?? 0}%`} />
        <StatCard label="Eligible Drives" value={drives.length} />
        <StatCard label="Applied" value={applications.length} />
        <StatCard label="Shortlisted+" value={shortlisted} />
        <StatCard label="Selected" value={selected} />
        <StatCard label="Notifications" value={notifications.filter((n) => !n.read).length} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Recently Announced Opportunities</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {drives.slice(0, 4).map((d) => <DriveCard key={d.id} drive={d} />)}
            {drives.length === 0 && <p className="text-sm text-slate-500">No open drives right now.</p>}
          </div>

          <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-slate-500">Application Status</h2>
          <div className="mt-4 space-y-3">
            {applications.slice(0, 5).map((a) => (
              <div key={a.id} className="card flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-agi-navy">{a.drive?.company?.name} — {a.drive?.jobRole}</p>
                  <p className="text-xs text-slate-500">Applied {new Date(a.appliedAt).toLocaleDateString()}</p>
                </div>
                <Badge tone={a.status === "SELECTED" ? "green" : a.status === "REJECTED" ? "red" : "navy"}>{a.status.replace(/_/g, " ")}</Badge>
              </div>
            ))}
            {applications.length === 0 && <p className="text-sm text-slate-500">You haven't applied to any drives yet.</p>}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Announcements</h2>
          <div className="mt-4 space-y-3">
            {announcements.map((a) => <AnnouncementCard key={a.id} announcement={a} />)}
            {announcements.length === 0 && <p className="text-sm text-slate-500">No announcements.</p>}
          </div>
          <Link to="/student/drives" className="mt-6 inline-block text-sm font-semibold text-agi-navy hover:underline">
            Browse all eligible drives &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
