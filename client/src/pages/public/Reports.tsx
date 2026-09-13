import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { EmptyState, LoadingState, SectionHeader } from "../../components/ui";

export function Reports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/public/reports").then((r) => setReports(r.data.reports)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-page py-16">
      <SectionHeader eyebrow="Reports" title="Placement Reports" description="Published summaries covering company-wise recruitment, packages and department-wise placement." />
      <div className="mt-10 mx-auto max-w-3xl">
        {loading ? (
          <LoadingState />
        ) : reports.length === 0 ? (
          <EmptyState title="No reports published yet" description="Data to be updated." />
        ) : (
          <div className="space-y-4">
            {reports.map((r) => (
              <div key={r.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-semibold text-agi-navy">{r.title}</p>
                  <p className="text-xs text-slate-500">{r.academicYear}</p>
                </div>
                {r.fileUrl && (
                  <a href={r.fileUrl} target="_blank" rel="noreferrer" className="btn-secondary !px-3 !py-1.5 text-xs">
                    View
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
