import { useEffect, useState } from "react";
import { api, apiErrorMessage } from "../../api/client";
import { EmptyState } from "../../components/ui";

const emptyForm = { academicYear: "", studentsPlaced: "0", totalOffers: "0", recruiterCount: "0", highestPackage: "", averagePackage: "", medianPackage: "", eligibleStudents: "0" };

export function AdminStatistics() {
  const [stats, setStats] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    api.get("/statistics").then((r) => setStats(r.data.statistics));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/statistics", {
        academicYear: form.academicYear,
        studentsPlaced: Number(form.studentsPlaced) || 0,
        totalOffers: Number(form.totalOffers) || 0,
        recruiterCount: Number(form.recruiterCount) || 0,
        highestPackage: form.highestPackage ? Number(form.highestPackage) : undefined,
        averagePackage: form.averagePackage ? Number(form.averagePackage) : undefined,
        medianPackage: form.medianPackage ? Number(form.medianPackage) : undefined,
        eligibleStudents: Number(form.eligibleStudents) || 0,
        isDemoData: true,
      });
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {stats.length === 0 ? (
          <EmptyState title="No statistics published yet" />
        ) : (
          <div className="space-y-3">
            {stats.map((s) => (
              <div key={s.id} className="card">
                <p className="font-semibold text-agi-navy">{s.academicYear} {s.isDemoData && <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Demo</span>}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Placed: {s.studentsPlaced} · Offers: {s.totalOffers} · Recruiters: {s.recruiterCount} · Highest: {s.highestPackage ?? "—"} LPA
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="card space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Add / Update Statistic</h2>
        {error && <div className="rounded-md bg-red-50 p-2 text-xs text-red-700">{error}</div>}
        <input className="input" placeholder="Academic year e.g. 2025-26" required value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} />
        <input className="input" placeholder="Students placed" value={form.studentsPlaced} onChange={(e) => setForm({ ...form, studentsPlaced: e.target.value })} />
        <input className="input" placeholder="Total offers" value={form.totalOffers} onChange={(e) => setForm({ ...form, totalOffers: e.target.value })} />
        <input className="input" placeholder="Recruiter count" value={form.recruiterCount} onChange={(e) => setForm({ ...form, recruiterCount: e.target.value })} />
        <input className="input" placeholder="Highest package (LPA)" value={form.highestPackage} onChange={(e) => setForm({ ...form, highestPackage: e.target.value })} />
        <input className="input" placeholder="Average package (LPA)" value={form.averagePackage} onChange={(e) => setForm({ ...form, averagePackage: e.target.value })} />
        <input className="input" placeholder="Eligible students" value={form.eligibleStudents} onChange={(e) => setForm({ ...form, eligibleStudents: e.target.value })} />
        <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? "Saving..." : "Save Statistic"}</button>
      </form>
    </div>
  );
}
