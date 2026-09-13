import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { LoadingState, SectionHeader } from "../../components/ui";

export function Policy() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/public/policy").then((r) => setSections(r.data.sections)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-page py-16">
      <SectionHeader eyebrow="Guidelines" title="Placement Policy" description="Official policy sections, published by the Placement Cell." />
      <div className="mx-auto mt-10 max-w-3xl space-y-4">
        {loading ? (
          <LoadingState />
        ) : (
          sections.map((s) => (
            <div key={s.id} className="card">
              <p className="font-semibold text-agi-navy">{s.section}</p>
              <p className="mt-2 text-sm text-slate-600">{s.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
