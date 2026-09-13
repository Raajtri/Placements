import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { CompanyCard, EmptyState, LoadingState, SectionHeader } from "../../components/ui";

export function Companies() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const handle = setTimeout(() => {
      api
        .get("/companies", { params: search ? { search } : {} })
        .then((r) => setCompanies(r.data.companies))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [search]);

  return (
    <div className="container-page py-16">
      <SectionHeader eyebrow="Recruiters" title="Corporate Partners" description="Verified recruiter information maintained by the Placement Cell." />
      <div className="mx-auto mt-8 max-w-md">
        <input className="input" placeholder="Search companies..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="mt-8">
        {loading ? (
          <LoadingState />
        ) : companies.length === 0 ? (
          <EmptyState title="No companies found" description="Data to be updated." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {companies.map((c) => (
              <CompanyCard key={c.id} company={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
