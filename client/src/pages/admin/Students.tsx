import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Badge, EmptyState } from "../../components/ui";

export function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<any>(null);

  function load() {
    api.get("/students", { params: { search: search || undefined, status: status || undefined } }).then((r) => setStudents(r.data.items));
  }

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  async function verify(id: string, next: string) {
    await api.patch(`/students/${id}/verify`, { status: next });
    load();
    if (selected?.id === id) setSelected({ ...selected, verificationStatus: next });
  }

  async function toggleAccount(id: string, active: boolean) {
    await api.patch(`/students/${id}/account-status`, { active });
    load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="mb-4 flex flex-wrap gap-3">
          <input className="input max-w-xs" placeholder="Search name or enrollment no." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="input max-w-[180px]" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="UNVERIFIED">Unverified</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {students.length === 0 ? (
          <EmptyState title="No students found" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Enrollment</th>
                  <th className="px-4 py-3">Program</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{s.fullName}</td>
                    <td className="px-4 py-3 text-slate-600">{s.enrollmentNo}</td>
                    <td className="px-4 py-3 text-slate-600">{s.program?.name}</td>
                    <td className="px-4 py-3">
                      <Badge tone={s.verificationStatus === "VERIFIED" ? "green" : s.verificationStatus === "REJECTED" ? "red" : "amber"}>
                        {s.verificationStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(s)} className="text-xs font-semibold text-agi-navy hover:underline">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        {selected ? (
          <div className="card sticky top-20">
            <p className="font-semibold text-agi-navy">{selected.fullName}</p>
            <p className="text-xs text-slate-500">{selected.enrollmentNo}</p>
            <p className="mt-2 text-xs text-slate-500">{selected.user?.email}</p>
            <p className="mt-1 text-xs text-slate-500">Account: {selected.user?.status}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => verify(selected.id, "VERIFIED")} className="btn-secondary !px-3 !py-1.5 text-xs">Verify</button>
              <button onClick={() => verify(selected.id, "REJECTED")} className="btn-secondary !px-3 !py-1.5 text-xs !border-red-500 !text-red-600 hover:!bg-red-500">Reject</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => toggleAccount(selected.id, selected.user?.status !== "ACTIVE")} className="btn-secondary !px-3 !py-1.5 text-xs">
                {selected.user?.status === "ACTIVE" ? "Suspend Account" : "Activate Account"}
              </button>
            </div>
          </div>
        ) : (
          <EmptyState title="Select a student" description="Choose a student from the list to review and verify their profile." />
        )}
      </div>
    </div>
  );
}
