import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function Login({ adminMode = false }: { adminMode?: boolean }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(identifier, password);
      const dest = location.state?.from?.pathname ?? (adminMode ? "/admin" : "/student");
      navigate(dest, { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <div className="card">
          <h1 className="text-xl font-bold text-agi-navy">{adminMode ? "Admin / TPO Login" : "Student Login"}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {adminMode ? "For authorized Placement Cell staff only." : "Sign in with your email or enrollment number."}
          </p>

          {error && <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label">{adminMode ? "Email" : "Email or Enrollment Number"}</label>
              <input className="input" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="label">Password</label>
                <Link to="/forgot-password" className="text-xs text-agi-gold hover:underline">Forgot password?</Link>
              </div>
              <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {!adminMode && (
            <p className="mt-6 text-center text-sm text-slate-500">
              New student? <Link to="/register" className="font-semibold text-agi-navy hover:underline">Create an account</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
