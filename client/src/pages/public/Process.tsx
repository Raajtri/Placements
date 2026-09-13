import { SectionHeader } from "../../components/ui";

const steps = [
  { n: "01", t: "Student Preparation", d: "Orientation, resume building and skill workshops for eligible students." },
  { n: "02", t: "Profile & Resume", d: "Students complete their academic and professional profile and upload verified documents." },
  { n: "03", t: "Industry Interaction", d: "Pre-placement talks, industry sessions and recruiter engagement." },
  { n: "04", t: "Eligibility", d: "Server-side eligibility check against CGPA, backlogs, program and batch criteria." },
  { n: "05", t: "Placement Drive", d: "Drive is published to eligible students with role, package and process details." },
  { n: "06", t: "Selection Rounds", d: "Aptitude test, group discussion, technical and HR rounds as configured per drive." },
  { n: "07", t: "Final Selection", d: "Results are recorded and communicated to students through the portal." },
  { n: "08", t: "Offer & Placement Record", d: "Offer details are recorded in the student's placement history." },
];

export function Process() {
  return (
    <div className="container-page py-16">
      <SectionHeader eyebrow="How it works" title="Placement Process" description="General process overview — distinct from official placement policy." />
      <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-2">
        {steps.map((s) => (
          <div key={s.n} className="card flex gap-4">
            <span className="text-2xl font-extrabold text-agi-gold">{s.n}</span>
            <div>
              <p className="font-semibold text-agi-navy">{s.t}</p>
              <p className="mt-1 text-sm text-slate-600">{s.d}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
