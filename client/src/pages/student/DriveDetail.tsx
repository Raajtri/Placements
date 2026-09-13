import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, apiErrorMessage } from "../../api/client";
import { Badge } from "../../components/ui";

export function StudentDriveDetail() {
  const { id } = useParams();
  const [drive, setDrive] = useState<any>(null);
  const [eligibility, setEligibility] = useState<{ eligible: boolean; reasons: string[] } | null>(null);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);

  function load() {
    api.get(`/drives/${id}`).then((r) => {
      setDrive(r.data.drive);
      setEligibility(r.data.eligibility);
    });
    api.get("/applications/mine").then((r) => setApplied(r.data.applications.some((a: any) => a.driveId === id)));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleApply() {
    setError("");
    setApplying(true);
    try {
      await api.post("/applications", { driveId: id });
      setApplied(true);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setApplying(false);
    }
  }

  if (!drive) return <div className="text-sm text-slate-500">Loading drive...</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-agi-navy">{drive.company?.name}</p>
            <p className="text-sm text-slate-700">{drive.jobRole}</p>
          </div>
          <Badge tone={drive.status === "OPEN" ? "green" : "amber"}>{drive.status}</Badge>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600 sm:grid-cols-3">
          <p><strong>Location:</strong> {drive.location ?? "—"}</p>
          <p><strong>Mode:</strong> {drive.workMode}</p>
          <p><strong>Package:</strong> {drive.packageMin ? `₹${drive.packageMin}-${drive.packageMax} LPA` : "—"}</p>
          <p><strong>Min CGPA:</strong> {drive.minCgpa ?? "—"}</p>
          <p><strong>Max Backlogs:</strong> {drive.maxBacklogs ?? "—"}</p>
          <p><strong>Apply by:</strong> {new Date(drive.applicationEnd).toLocaleDateString()}</p>
        </div>

        <div className="mt-4">
          <p className="text-sm font-semibold text-slate-700">Job Description</p>
          <p className="mt-1 text-sm text-slate-600">{drive.jobDescription}</p>
        </div>

        {drive.requiredSkills?.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-slate-700">Required Skills</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {drive.requiredSkills.map((s: string) => <Badge key={s}>{s}</Badge>)}
            </div>
          </div>
        )}

        {drive.rounds?.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-slate-700">Selection Process</p>
            <ol className="mt-1 list-decimal pl-5 text-sm text-slate-600">
              {drive.rounds.map((r: any) => <li key={r.id}>{r.name}</li>)}
            </ol>
          </div>
        )}

        <div className="mt-6 border-t border-slate-200 pt-4">
          {error && <div className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          {applied ? (
            <Badge tone="green">You have applied to this drive</Badge>
          ) : eligibility?.eligible ? (
            <button onClick={handleApply} disabled={applying} className="btn-primary">
              {applying ? "Applying..." : "Apply Now"}
            </button>
          ) : eligibility ? (
            <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
              <p className="font-semibold">Not Eligible</p>
              <ul className="mt-1 list-disc pl-5">
                {eligibility.reasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
