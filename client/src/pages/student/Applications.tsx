import { useEffect, useState } from "react";
import { api, apiErrorMessage } from "../../api/client";
import { Badge, EmptyState } from "../../components/ui";

const STAGES = ["APPLIED", "SHORTLISTED", "APTITUDE_TEST", "TECHNICAL_ROUND", "HR_ROUND", "SELECTED"];

export function StudentApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [error, setError] = useState("");

  function load() {
    api.get("/applications/mine").then((r) => setApplications(r.data.applications));
  }

  useEffect(() => {
    load();
  }, []);

  async function withdraw(id: string) {
    setError("");
    try {
      await api.patch(`/applications/${id}/withdraw`);
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-lg font-bold text-agi-navy">My Applications</h1>
      {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {applications.length === 0 ? (
        <EmptyState title="No applications yet" description="Browse eligible drives to apply." />
      ) : (
        <div className="space-y-5">
          {applications.map((a) => {
            const stageIndex = STAGES.indexOf(a.status);
            const isTerminalNegative = ["REJECTED", "WAITLISTED", "WITHDRAWN"].includes(a.status);
            return (
              <div key={a.id} className="card">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-agi-navy">{a.drive?.company?.name} — {a.drive?.jobRole}</p>
                    <p className="text-xs text-slate-500">Applied {new Date(a.appliedAt).toLocaleDateString()}</p>
                  </div>
                  <Badge tone={a.status === "SELECTED" ? "green" : isTerminalNegative ? "red" : "navy"}>{a.status.replace(/_/g, " ")}</Badge>
                </div>

                {!isTerminalNegative && (
                  <div className="mt-4 flex items-center gap-1">
                    {STAGES.map((s, i) => (
                      <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= stageIndex ? "bg-agi-navy" : "bg-slate-200"}`} title={s} />
                    ))}
                  </div>
                )}

                {a.status === "APPLIED" && (
                  <button onClick={() => withdraw(a.id)} className="mt-4 text-xs font-semibold text-red-600 hover:underline">
                    Withdraw Application
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
