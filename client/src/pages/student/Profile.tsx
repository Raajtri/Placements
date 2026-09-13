import { useEffect, useState } from "react";
import { api, apiErrorMessage } from "../../api/client";
import { Badge } from "../../components/ui";
import type { Student } from "../../types";

export function StudentProfile() {
  const [student, setStudent] = useState<Student | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/students/me").then((r) => {
      setStudent(r.data.student);
      setForm({
        phone: r.data.student.phone ?? "",
        address: r.data.student.address ?? "",
        gender: r.data.student.gender ?? "",
        cgpa: r.data.student.cgpa ?? "",
        tenthPercent: r.data.student.tenthPercent ?? "",
        twelfthPercent: r.data.student.twelfthPercent ?? "",
        backlogs: r.data.student.backlogs ?? 0,
        skills: (r.data.student.skills ?? []).join(", "),
        projects: r.data.student.projects ?? "",
        internships: r.data.student.internships ?? "",
        linkedinUrl: r.data.student.linkedinUrl ?? "",
        githubUrl: r.data.student.githubUrl ?? "",
        portfolioUrl: r.data.student.portfolioUrl ?? "",
      });
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        phone: form.phone || undefined,
        address: form.address || undefined,
        gender: form.gender || undefined,
        cgpa: form.cgpa === "" ? undefined : Number(form.cgpa),
        tenthPercent: form.tenthPercent === "" ? undefined : Number(form.tenthPercent),
        twelfthPercent: form.twelfthPercent === "" ? undefined : Number(form.twelfthPercent),
        backlogs: Number(form.backlogs) || 0,
        skills: form.skills ? form.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
        projects: form.projects || undefined,
        internships: form.internships || undefined,
        linkedinUrl: form.linkedinUrl || undefined,
        githubUrl: form.githubUrl || undefined,
        portfolioUrl: form.portfolioUrl || undefined,
      };
      const { data } = await api.patch("/students/me", payload);
      setStudent(data.student);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (!student) return <div className="text-sm text-slate-500">Loading profile...</div>;

  return (
    <div>
      <div className="card mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-agi-navy">{student.fullName}</p>
          <p className="text-xs text-slate-500">{student.enrollmentNo} · {student.batch}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone={student.verificationStatus === "VERIFIED" ? "green" : student.verificationStatus === "REJECTED" ? "red" : "amber"}>
            {student.verificationStatus}
          </Badge>
          <span className="text-sm font-semibold text-agi-navy">{student.profileCompletionPercent}% complete</span>
        </div>
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {message && <div className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="card">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Personal Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">Gender</label>
              <input className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Address</label>
              <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Academic Details</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">CGPA</label>
              <input type="number" step="0.01" min="0" max="10" className="input" value={form.cgpa} onChange={(e) => setForm({ ...form, cgpa: e.target.value })} />
            </div>
            <div>
              <label className="label">10th %</label>
              <input type="number" step="0.01" className="input" value={form.tenthPercent} onChange={(e) => setForm({ ...form, tenthPercent: e.target.value })} />
            </div>
            <div>
              <label className="label">12th %</label>
              <input type="number" step="0.01" className="input" value={form.twelfthPercent} onChange={(e) => setForm({ ...form, twelfthPercent: e.target.value })} />
            </div>
            <div>
              <label className="label">Backlogs</label>
              <input type="number" min="0" className="input" value={form.backlogs} onChange={(e) => setForm({ ...form, backlogs: e.target.value })} />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">Institute, program, department and enrollment number are fixed at registration. Contact the Placement Cell to correct these.</p>
        </section>

        <section className="card">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Professional Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Skills (comma-separated)</label>
              <input className="input" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Projects</label>
              <textarea className="input" rows={3} value={form.projects} onChange={(e) => setForm({ ...form, projects: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Internships</label>
              <textarea className="input" rows={3} value={form.internships} onChange={(e) => setForm({ ...form, internships: e.target.value })} />
            </div>
            <div>
              <label className="label">LinkedIn</label>
              <input className="input" value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} />
            </div>
            <div>
              <label className="label">GitHub</label>
              <input className="input" value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} />
            </div>
            <div>
              <label className="label">Portfolio</label>
              <input className="input" value={form.portfolioUrl} onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })} />
            </div>
          </div>
        </section>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
