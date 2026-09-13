import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { Badge, EmptyState } from "../../components/ui";

export function StudentDrives() {
  const [drives, setDrives] = useState<any[]>([]);

  useEffect(() => {
    api.get("/drives").then((r) => setDrives(r.data.drives));
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-lg font-bold text-agi-navy">Placement Drives</h1>
      {drives.length === 0 ? (
        <EmptyState title="No drives available" description="Data to be updated." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {drives.map((d) => (
            <Link to={`/student/drives/${d.id}`} key={d.id} className="card block hover:border-agi-navy">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-agi-navy">{d.company?.name}</p>
                <Badge tone={d.status === "OPEN" ? "green" : "amber"}>{d.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-700">{d.jobRole}</p>
              <p className="mt-1 text-xs text-slate-500">{d.location} · {d.workMode}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
