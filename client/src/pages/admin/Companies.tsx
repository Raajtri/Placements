import { useEffect, useState } from "react";
import { api, apiErrorMessage } from "../../api/client";
import { EmptyState } from "../../components/ui";

const empty = { name: "", industry: "", website: "", logoUrl: "", description: "" };

export function AdminCompanies() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    api.get("/companies").then((r) => setCompanies(r.data.companies));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/companies", form);
      setForm(empty);
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this company? This cannot be undone.")) return;
    await api.delete(`/companies/${id}`);
    load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {companies.length === 0 ? (
          <EmptyState title="No companies yet" />
        ) : (
          <div className="space-y-3">
            {companies.map((c) => (
              <div key={c.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-semibold text-agi-navy">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.industry ?? "Data to be updated"} · {c.drives?.length ?? 0} drive(s)</p>
                </div>
                <button onClick={() => remove(c.id)} className="text-xs font-semibold text-red-600 hover:underline">Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <form onSubmit={handleSubmit} className="card space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Add Company</h2>
          {error && <div className="rounded-md bg-red-50 p-2 text-xs text-red-700">{error}</div>}
          <input className="input" placeholder="Company name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
          <input className="input" placeholder="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          <textarea className="input" placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? "Saving..." : "Add Company"}</button>
        </form>
      </div>
    </div>
  );
}
