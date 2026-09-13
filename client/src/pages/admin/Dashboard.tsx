import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { StatCard } from "../../components/ui";

export function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {
    api.get("/statistics/dashboard").then((r) => {
      setData(r.data.dashboard);
      setActivity(r.data.recentActivity);
    });
  }, []);

  if (!data) return <div className="text-sm text-slate-500">Loading dashboard...</div>;

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Students" value={data.totalStudents} />
        <StatCard label="Verified Students" value={data.verifiedStudents} />
        <StatCard label="Active Drives" value={data.activeDrives} />
        <StatCard label="Applications" value={data.applications} />
        <StatCard label="Shortlisted" value={data.shortlisted} />
        <StatCard label="Selected" value={data.selected} />
        <StatCard label="Companies" value={data.companies} />
        <StatCard label="Placement %" value={`${data.placementPercentage}%`} />
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Recent Activity</h2>
        <div className="space-y-2">
          {activity.map((a) => (
            <div key={a.id} className="card flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{a.action.replace(/_/g, " ")}</span>
              <span className="text-xs text-slate-400">{new Date(a.createdAt).toLocaleString()}</span>
            </div>
          ))}
          {activity.length === 0 && <p className="text-sm text-slate-500">No recent activity.</p>}
        </div>
      </div>
    </div>
  );
}
