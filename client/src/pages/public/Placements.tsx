import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { DriveCard, EmptyState, LoadingState, SectionHeader } from "../../components/ui";

export function Placements() {
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get("/drives", { params: status ? { status } : {} })
      .then((r) => setDrives(r.data.drives))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div className="container-page py-16">
      <SectionHeader eyebrow="Placement Highlights" title="Placement Drives" description="Companies actively recruiting through the AGI Placement Cell." />

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {["", "OPEN", "UPCOMING", "CLOSED", "COMPLETED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold ${status === s ? "bg-agi-navy text-white" : "bg-slate-100 text-slate-600"}`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {loading ? (
          <LoadingState />
        ) : drives.length === 0 ? (
          <EmptyState title="No drives found" description="Data to be updated." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {drives.map((d) => (
              <DriveCard key={d.id} drive={d} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
