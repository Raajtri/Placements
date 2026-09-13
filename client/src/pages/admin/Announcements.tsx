import { useEffect, useState } from "react";
import { api, apiErrorMessage } from "../../api/client";
import { AnnouncementCard, EmptyState } from "../../components/ui";

const emptyForm = { title: "", description: "", category: "GENERAL", priority: "NORMAL" };

export function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    api.get("/announcements").then((r) => setAnnouncements(r.data.announcements));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.post("/announcements", form);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this announcement?")) return;
    await api.delete(`/announcements/${id}`);
    load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {announcements.length === 0 ? (
          <EmptyState title="No announcements yet" />
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="relative">
                <AnnouncementCard announcement={a} />
                <button onClick={() => remove(a.id)} className="absolute right-4 top-4 text-xs font-semibold text-red-600 hover:underline">Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="card space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">New Announcement</h2>
        {error && <div className="rounded-md bg-red-50 p-2 text-xs text-red-700">{error}</div>}
        <input className="input" placeholder="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea className="input" placeholder="Description" rows={4} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {["PLACEMENT_DRIVE", "INTERNSHIP", "TRAINING", "WORKSHOP", "RECRUITMENT", "GENERAL"].map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
        </select>
        <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
          {["LOW", "NORMAL", "HIGH"].map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? "Publishing..." : "Publish"}</button>
      </form>
    </div>
  );
}
