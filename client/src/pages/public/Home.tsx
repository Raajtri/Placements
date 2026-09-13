import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { AnnouncementCard, DriveCard, SectionHeader, StatCard, TestimonialCard } from "../../components/ui";

export function Home() {
  const [drives, setDrives] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    api.get("/drives?status=OPEN").then((r) => setDrives(r.data.drives.slice(0, 3))).catch(() => {});
    api.get("/companies").then((r) => setCompanies(r.data.companies.slice(0, 8))).catch(() => {});
    api.get("/statistics").then((r) => setStats(r.data.statistics.slice(0, 4))).catch(() => {});
    api.get("/announcements").then((r) => setAnnouncements(r.data.announcements.slice(0, 3))).catch(() => {});
    api.get("/public/alumni-testimonials").then((r) => setTestimonials(r.data.testimonials.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div>
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="container-page grid gap-10 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-agi-gold">AGI Placement Cell</p>
            <h1 className="mt-3 text-3xl font-extrabold text-agi-navy sm:text-4xl lg:text-5xl">Aditya Group of Institution</h1>
            <p className="mt-4 text-lg font-medium text-slate-700">Connecting Talent with Opportunity</p>
            <p className="mt-4 max-w-lg text-sm text-slate-600">
              The official placement portal coordinating industry engagement, internships and final placements across AIMSR and ACAAD —
              built on a transparent, verified and student-first placement process.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/placements" className="btn-primary">Explore Placements</Link>
              <Link to="/companies" className="btn-secondary">View Recruiters</Link>
              <Link to="/statistics" className="btn-secondary">Placement Statistics</Link>
              <Link to="/login" className="btn-gold">Student Login</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Institutes" value="2" hint="AIMSR & ACAAD" />
            <StatCard label="Programs" value="5+" />
            <StatCard label="Corporate Partners" value={companies.length || "Data to be updated"} />
            <StatCard label="Active Drives" value={drives.length || "0"} />
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeader eyebrow="Opportunities" title="Latest Placement Drives" description="Live and upcoming recruitment drives open to eligible students." />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {drives.length === 0 && <p className="col-span-full text-center text-sm text-slate-500">Data to be updated — no open drives currently published.</p>}
          {drives.map((d) => <DriveCard key={d.id} drive={d} />)}
        </div>
        <div className="mt-8 text-center">
          <Link to="/placements" className="text-sm font-semibold text-agi-navy hover:underline">View all placement drives &rarr;</Link>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="container-page">
          <SectionHeader eyebrow="Recruiters" title="Corporate Partners" description="Organizations that have engaged with the AGI Placement Cell." />
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {companies.length === 0 && <p className="col-span-full text-center text-sm text-slate-500">Data to be updated.</p>}
            {companies.map((c) => (
              <div key={c.id} className="card flex h-20 items-center justify-center text-center text-sm font-semibold text-agi-navy">
                {c.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeader eyebrow="Track record" title="Placement Statistics" description="Academic-year wise placement outcomes." />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.length === 0 && <p className="col-span-full text-center text-sm text-slate-500">Data to be updated.</p>}
          {stats.map((s) => (
            <div key={s.id} className="card">
              <p className="text-xs font-semibold uppercase text-slate-500">{s.academicYear}{s.isDemoData ? " (demo)" : ""}</p>
              <p className="mt-2 text-xl font-bold text-agi-navy">{s.studentsPlaced} placed</p>
              <p className="text-xs text-slate-500">Highest: {s.highestPackage ?? "—"} LPA</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-agi-navy py-16 text-white">
        <div className="container-page grid gap-10 lg:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold">Why Recruit From AGI</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-200">
              <li>Structured pre-placement training, mock interviews and grooming workshops.</li>
              <li>Dedicated placement coordination across management, technology, architecture and design programs.</li>
              <li>Verified student profiles with academic and document verification before eligibility.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Placement Process</h3>
            <ol className="mt-4 space-y-2 text-sm text-slate-200">
              <li>01 — Student Preparation</li>
              <li>02 — Profile &amp; Resume</li>
              <li>03 — Eligibility &amp; Drive Publication</li>
              <li>04 — Selection Rounds</li>
              <li>05 — Final Offer &amp; Placement Record</li>
            </ol>
            <Link to="/process" className="mt-4 inline-block text-sm font-semibold text-agi-gold hover:underline">View full process &rarr;</Link>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Announcements</h3>
            <div className="mt-4 space-y-3">
              {announcements.length === 0 && <p className="text-sm text-slate-300">Data to be updated.</p>}
              {announcements.map((a) => (
                <div key={a.id} className="rounded-md bg-white/10 p-3 text-sm">
                  <p className="font-semibold">{a.title}</p>
                  <p className="text-xs text-slate-300">{a.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeader eyebrow="Voices" title="Alumni Testimonials" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.length === 0 && <p className="col-span-full text-center text-sm text-slate-500">Data to be updated.</p>}
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} name={t.name} sub={`${t.batch} · ${t.organization}`} text={t.testimonial} photoUrl={t.photoUrl} />
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-16 text-center">
        <SectionHeader title="Have a question for the Placement Cell?" description="Reach out to the AGI Placement Cell for recruitment or student queries." />
        <Link to="/contact" className="btn-primary mt-6 inline-flex">Contact Us</Link>
      </section>
    </div>
  );
}
