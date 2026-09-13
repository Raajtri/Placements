import { useEffect, useState } from "react";
import { api, apiErrorMessage } from "../../api/client";
import { Badge } from "../../components/ui";
import type { DocumentRecord } from "../../types";

const DOC_TYPES = [
  "RESUME",
  "PHOTOGRAPH",
  "ID_PROOF",
  "TENTH_MARKSHEET",
  "TWELFTH_MARKSHEET",
  "SEMESTER_MARKSHEET",
  "GRADUATION_CERTIFICATE",
  "OTHER",
];

export function StudentDocuments() {
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [type, setType] = useState(DOC_TYPES[0]);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  function load() {
    api.get("/documents/mine").then((r) => setDocs(r.data.documents));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("type", type);
      fd.append("file", file);
      await api.post("/documents", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setFile(null);
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="card mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Upload Document</h2>
        {error && <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={handleUpload} className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="label">Document Type</label>
            <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
              {DOC_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div>
            <label className="label">File (PDF/JPEG/PNG, max 5MB)</label>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required />
          </div>
          <button type="submit" disabled={uploading || !file} className="btn-primary">
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {docs.length === 0 && <p className="text-sm text-slate-500">No documents uploaded yet.</p>}
        {docs.map((d) => (
          <div key={d.id} className="card flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-agi-navy">{d.type.replace(/_/g, " ")}</p>
              <p className="text-xs text-slate-500">{d.fileName} · uploaded {new Date(d.uploadedAt).toLocaleDateString()}</p>
              {d.reviewNote && <p className="text-xs text-red-500">Note: {d.reviewNote}</p>}
            </div>
            <Badge tone={d.status === "VERIFIED" ? "green" : d.status === "REJECTED" ? "red" : "amber"}>{d.status}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
