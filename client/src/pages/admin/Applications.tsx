import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Badge, EmptyState } from "../../components/ui";

const STATUSES = ["APPLIED", "SHORTLISTED", "APTITUDE_TEST", "TECHNICAL_ROUND", "HR_ROUND", "SELECTED", "REJECTED", "WAITLISTED", "WITHDRAWN"];

export function AdminApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState(STATUSES[1]);

  function load() {
    api.get("/applications", { params: { status: status || undefined, search: search || undefined } }).then((r) => setApplications(r.data.applications));
  }

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search]);

  async function updateStatus(id: string, next: string) {
    await api.patch(`/applications/${id}/status`, { status: next });
    load();
  }

  async function bulkUpdate() {
    if (selectedIds.length === 0) return;
    await api.post("/applications/bulk-status", { applicationIds: selectedIds, status: bulkStatus });
    setSelectedIds([]);
    load();
  }

  function toggle(id: string) {
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input className="input max-w-xs" placeholder="Search student name/enrollment" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input max-w-[200px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>

        {selectedIds.length > 0 && (
          <div className="ml-auto flex items-center gap-2 rounded-md bg-agi-navy/5 p-2">
            <span className="text-xs font-medium text-agi-navy">{selectedIds.length} selected</span>
            <select className="input !py-1 !text-xs" value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
            </select>
            <button onClick={bulkUpdate} className="btn-primary !px-3 !py-1 text-xs">Apply</button>
          </div>
        )}
      </div>

      {applications.length === 0 ? (
        <EmptyState title="No applications found" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-3"><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? applications.map((a) => a.id) : [])} /></th>
                <th className="px-3 py-3">Student</th>
                <th className="px-3 py-3">Drive</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Update</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.id} className="border-t border-slate-100">
                  <td className="px-3 py-3"><input type="checkbox" checked={selectedIds.includes(a.id)} onChange={() => toggle(a.id)} /></td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-slate-800">{a.student?.fullName}</p>
                    <p className="text-xs text-slate-500">{a.student?.program?.name}</p>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{a.drive?.company?.name} — {a.drive?.jobRole}</td>
                  <td className="px-3 py-3"><Badge tone={a.status === "SELECTED" ? "green" : a.status === "REJECTED" ? "red" : "navy"}>{a.status.replace(/_/g, " ")}</Badge></td>
                  <td className="px-3 py-3">
                    <select className="input !py-1 !text-xs" value={a.status} onChange={(e) => updateStatus(a.id, e.target.value)}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
