import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import type { Institute } from "../../types";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    enrollmentNo: "",
    email: "",
    phone: "",
    instituteId: "",
    programId: "",
    departmentId: "",
    batch: "",
    graduationYear: new Date().getFullYear() + 2,
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    api.get("/public/institutes").then((r) => setInstitutes(r.data.institutes));
  }, []);

  const selectedInstitute = institutes.find((i) => i.id === form.instituteId);
  const selectedProgram = selectedInstitute?.programs?.find((p) => p.id === form.programId);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await register({
        fullName: form.fullName,
        enrollmentNo: form.enrollmentNo,
        email: form.email,
        phone: form.phone || undefined,
        instituteId: form.instituteId,
        programId: form.programId,
        departmentId: form.departmentId,
        batch: form.batch,
        graduationYear: Number(form.graduationYear),
        password: form.password,
      });
      navigate("/student", { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-xl card">
        <h1 className="text-xl font-bold text-agi-navy">Student Registration</h1>
        <p className="mt-1 text-sm text-slate-500">Your account starts unverified — the Placement Cell verifies your profile before you can apply to drives.</p>

        {error && <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Full Name</label>
            <input className="input" required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
          </div>
          <div>
            <label className="label">Enrollment Number</label>
            <input className="input" required value={form.enrollmentNo} onChange={(e) => update("enrollmentNo", e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" required value={form.email} onChange={(e) => update("email", e.target.value)} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
          <div>
            <label className="label">Batch</label>
            <input className="input" placeholder="e.g. 2024-26" required value={form.batch} onChange={(e) => update("batch", e.target.value)} />
          </div>
          <div>
            <label className="label">Institute</label>
            <select className="input" required value={form.instituteId} onChange={(e) => update("instituteId", e.target.value)}>
              <option value="">Select institute</option>
              {institutes.map((i) => <option key={i.id} value={i.id}>{i.code}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Program</label>
            <select className="input" required value={form.programId} onChange={(e) => update("programId", e.target.value)} disabled={!selectedInstitute}>
              <option value="">Select program</option>
              {selectedInstitute?.programs?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Department</label>
            <select className="input" required value={form.departmentId} onChange={(e) => update("departmentId", e.target.value)} disabled={!selectedProgram}>
              <option value="">Select department</option>
              {selectedProgram?.departments?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Graduation Year</label>
            <input type="number" className="input" required value={form.graduationYear} onChange={(e) => update("graduationYear", Number(e.target.value) as any)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" required minLength={8} value={form.password} onChange={(e) => update("password", e.target.value)} />
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input type="password" className="input" required minLength={8} value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary sm:col-span-2">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
