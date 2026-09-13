import { useEffect, useState } from "react";
import { api, apiErrorMessage } from "../../api/client";
import { Badge, EmptyState } from "../../components/ui";

const emptyForm = {
  companyId: "",
  jobRole: "",
  packageMin: "",
  packageMax: "",
  location: "",
  workMode: "ONSITE",
  minCgpa: "",
  maxBacklogs: "",
  applicationStart: "",
  applicationEnd: "",
  driveDate: "",
  jobDescription: "",
  requiredSkills: "",
  selectionProcess: "",
  instituteId: "",
  programId: "",
};

export function AdminDrives() {
  const [drives, setDrives] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [institutes, setInstitutes] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    api.get("/drives").then((r) => setDrives(r.data.drives));
  }

  useEffect(() => {
    load();
    api.get("/companies").then((r) => setCompanies(r.data.companies));
    api.get("/public/institutes").then((r) => setInstitutes(r.data.institutes));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/drives", {
        companyId: form.companyId,
        jobRole: form.jobRole,
        packageMin: form.packageMin ? Number(form.packageMin) : undefined,
        packageMax: form.packageMax ? Number(form.packageMax) : undefined,
        location: form.location || undefined,
        workMode: form.workMode,
        minCgpa: form.minCgpa ? Number(form.minCgpa) : undefined,
        maxBacklogs: form.maxBacklogs ? Number(form.maxBacklogs) : undefined,
        applicationStart: new Date(form.applicationStart).toISOString(),
        applicationEnd: new Date(form.applicationEnd).toISOString(),
        driveDate: form.driveDate ? new Date(form.driveDate).toISOString() : undefined,
        jobDescription: form.jobDescription,
        requiredSkills: form.requiredSkills ? form.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean) : [],
        selectionProcess: form.selectionProcess || undefined,
        eligibility: form.instituteId ? [{ instituteId: form.instituteId, programId: form.programId || undefined }] : [],
        rounds: [],
      });
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(id: string, status: string) {
    await api.patch(`/drives/${id}/status`, { status });
    load();
  }

  const selectedInstitute = institutes.find((i) => i.id === form.instituteId);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {drives.length === 0 ? (
          <EmptyState title="No drives created yet" />
        ) : (
          <div className="space-y-3">
            {drives.map((d) => (
              <div key={d.id} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-agi-navy">{d.company?.name} — {d.jobRole}</p>
                    <p className="text-xs text-slate-500">{d.location} · {d.workMode} · Apply by {new Date(d.applicationEnd).toLocaleDateString()}</p>
                  </div>
                  <Badge tone={d.status === "OPEN" ? "green" : d.status === "COMPLETED" ? "slate" : "amber"}>{d.status}</Badge>
                </div>
                <div className="mt-3 flex gap-2">
                  {["UPCOMING", "OPEN", "CLOSED", "COMPLETED"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(d.id, s)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${d.status === s ? "bg-agi-navy text-white" : "bg-slate-100 text-slate-600"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <form onSubmit={handleSubmit} className="card space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Create Drive</h2>
          {error && <div className="rounded-md bg-red-50 p-2 text-xs text-red-700">{error}</div>}

          <select className="input" required value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>
            <option value="">Select company</option>
            {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input className="input" placeholder="Job role" required value={form.jobRole} onChange={(e) => setForm({ ...form, jobRole: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input className="input" placeholder="Package min (LPA)" value={form.packageMin} onChange={(e) => setForm({ ...form, packageMin: e.target.value })} />
            <input className="input" placeholder="Package max (LPA)" value={form.packageMax} onChange={(e) => setForm({ ...form, packageMax: e.target.value })} />
          </div>
          <input className="input" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <select className="input" value={form.workMode} onChange={(e) => setForm({ ...form, workMode: e.target.value })}>
            <option value="ONSITE">Onsite</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input className="input" placeholder="Min CGPA" value={form.minCgpa} onChange={(e) => setForm({ ...form, minCgpa: e.target.value })} />
            <input className="input" placeholder="Max backlogs" value={form.maxBacklogs} onChange={(e) => setForm({ ...form, maxBacklogs: e.target.value })} />
          </div>
          <div>
            <label className="label">Application Start</label>
            <input type="datetime-local" className="input" required value={form.applicationStart} onChange={(e) => setForm({ ...form, applicationStart: e.target.value })} />
          </div>
          <div>
            <label className="label">Application Deadline</label>
            <input type="datetime-local" className="input" required value={form.applicationEnd} onChange={(e) => setForm({ ...form, applicationEnd: e.target.value })} />
          </div>
          <textarea className="input" placeholder="Job description" required rows={3} value={form.jobDescription} onChange={(e) => setForm({ ...form, jobDescription: e.target.value })} />
          <input className="input" placeholder="Required skills (comma-separated)" value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} />
          <textarea className="input" placeholder="Selection process" rows={2} value={form.selectionProcess} onChange={(e) => setForm({ ...form, selectionProcess: e.target.value })} />

          <div>
            <label className="label">Eligible Institute</label>
            <select className="input" value={form.instituteId} onChange={(e) => setForm({ ...form, instituteId: e.target.value, programId: "" })}>
              <option value="">All institutes</option>
              {institutes.map((i) => <option key={i.id} value={i.id}>{i.code}</option>)}
            </select>
          </div>
          {selectedInstitute && (
            <div>
              <label className="label">Eligible Program</label>
              <select className="input" value={form.programId} onChange={(e) => setForm({ ...form, programId: e.target.value })}>
                <option value="">All programs</option>
                {selectedInstitute.programs?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}

          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? "Creating..." : "Create Drive"}</button>
        </form>
      </div>
    </div>
  );
}
