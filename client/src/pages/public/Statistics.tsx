import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { EmptyState, LoadingState, SectionHeader, StatCard } from "../../components/ui";

export function Statistics() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/statistics").then((r) => setStats(r.data.statistics)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-page py-16">
      <SectionHeader eyebrow="Track record" title="Placement Statistics" description="Academic-year wise placement outcomes across AGI institutes." />
      <div className="mt-10">
        {loading ? (
          <LoadingState />
        ) : stats.length === 0 ? (
          <EmptyState title="No published statistics yet" description="Data to be updated." />
        ) : (
          <div className="space-y-8">
            {stats.map((s) => (
              <div key={s.id} className="card">
                <p className="text-sm font-semibold text-agi-navy">
                  {s.academicYear} {s.isDemoData && <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Demo data</span>}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <StatCard label="Students Placed" value={s.studentsPlaced} />
                  <StatCard label="Total Offers" value={s.totalOffers} />
                  <StatCard label="Recruiters" value={s.recruiterCount} />
                  <StatCard label="Highest Package" value={s.highestPackage ? `₹${s.highestPackage} LPA` : "—"} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
