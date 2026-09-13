import React from "react";

export function SectionHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-wide text-agi-gold">{eyebrow}</p>}
      <h2 className="mt-2 text-2xl font-bold text-agi-navy sm:text-3xl">{title}</h2>
      {description && <p className="mt-3 text-sm text-slate-600">{description}</p>}
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="card text-center">
      <p className="text-2xl font-bold text-agi-navy sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
  );
}

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return <div className="p-10 text-center text-sm text-slate-500">{label}</div>;
}

export function ErrorState({ message }: { message: string }) {
  return <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</div>;
}

export function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "green" | "amber" | "red" | "navy" }) {
  const tones: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-700",
    navy: "bg-agi-navy/10 text-agi-navy",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function DriveCard({ drive }: { drive: any }) {
  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-agi-navy">{drive.company?.name ?? "Company"}</p>
        <Badge tone={drive.status === "OPEN" ? "green" : drive.status === "UPCOMING" ? "amber" : "slate"}>{drive.status}</Badge>
      </div>
      <p className="text-sm font-medium text-slate-800">{drive.jobRole}</p>
      <p className="text-xs text-slate-500">
        {drive.location ?? "Location TBA"} • {drive.workMode}
        {drive.packageMin ? ` • ₹${drive.packageMin}-${drive.packageMax ?? drive.packageMin} LPA` : ""}
      </p>
      <p className="text-xs text-slate-400">Apply by {new Date(drive.applicationEnd).toLocaleDateString()}</p>
    </div>
  );
}

export function CompanyCard({ company }: { company: any }) {
  return (
    <div className="card flex flex-col gap-2">
      <p className="font-semibold text-agi-navy">{company.name}</p>
      <p className="text-xs text-slate-500">{company.industry ?? "Data to be updated"}</p>
      {company.website && (
        <a href={company.website} target="_blank" rel="noreferrer" className="text-xs text-agi-gold hover:underline">
          Visit website
        </a>
      )}
      <p className="text-xs text-slate-400">{company.drives?.length ?? 0} drive(s) on record</p>
    </div>
  );
}

export function TestimonialCard({ name, sub, text, photoUrl }: { name: string; sub: string; text: string; photoUrl?: string | null }) {
  return (
    <div className="card">
      <p className="text-sm italic text-slate-700">"{text}"</p>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-agi-navy/10 text-sm font-semibold text-agi-navy">
          {photoUrl ? <img src={photoUrl} alt={name} className="h-10 w-10 rounded-full object-cover" /> : name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{name}</p>
          <p className="text-xs text-slate-500">{sub}</p>
        </div>
      </div>
    </div>
  );
}

export function AnnouncementCard({ announcement }: { announcement: any }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <Badge tone={announcement.priority === "HIGH" ? "red" : "navy"}>{announcement.category.replace(/_/g, " ")}</Badge>
        <span className="text-xs text-slate-400">{new Date(announcement.createdAt).toLocaleDateString()}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-800">{announcement.title}</p>
      <p className="mt-1 text-sm text-slate-600">{announcement.description}</p>
    </div>
  );
}
