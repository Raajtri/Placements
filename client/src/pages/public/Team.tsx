import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { EmptyState, LoadingState, SectionHeader } from "../../components/ui";

export function Team() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/public/team").then((r) => setTeam(r.data.team)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-page py-16">
      <SectionHeader eyebrow="Meet the team" title="Placement Team" description="Official Placement Cell contacts across AGI institutes." />
      <div className="mt-10">
        {loading ? <LoadingState /> : team.length === 0 ? (
          <EmptyState title="Team directory not published yet" description="Data to be updated." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m) => (
              <div key={m.id} className="card text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-agi-navy/10 text-lg font-semibold text-agi-navy">
                  {m.photoUrl ? <img src={m.photoUrl} className="h-16 w-16 rounded-full object-cover" /> : m.fullName.charAt(0)}
                </div>
                <p className="mt-3 font-semibold text-agi-navy">{m.fullName}</p>
                <p className="text-xs text-slate-500">{m.designation}</p>
                <p className="text-xs text-slate-500">{m.institute?.name ?? ""}</p>
                <p className="mt-2 text-xs text-agi-gold">{m.user?.email}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
