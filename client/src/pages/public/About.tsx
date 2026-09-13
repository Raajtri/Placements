import { SectionHeader } from "../../components/ui";

export function About() {
  return (
    <div className="container-page py-16">
      <SectionHeader eyebrow="About Us" title="About the AGI Placement Cell" description="Serving students across Aditya Group of Institution's constituent institutes." />

      <div className="mx-auto mt-10 max-w-3xl space-y-6 text-sm leading-relaxed text-slate-700">
        <p>
          The AGI Placement Cell coordinates industry interaction, internship facilitation and final placement activity across the
          constituent institutes of Aditya Group of Institution, including the Aditya Institute of Management Technology and Research
          (AIMSR) and the Aditya College of Art, Architecture and Design (ACAAD).
        </p>
        <p>
          The Cell works to build recruiter relationships, organize resume-building and grooming sessions, conduct mock group
          discussions and personal interviews, and support students through a structured, verified placement process.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            "Industry interaction & recruiter relationships",
            "Internship opportunities",
            "Final placement coordination",
            "Resume building support",
            "Mock group discussions",
            "Mock personal interviews",
            "Grooming & life-skill workshops",
            "Student-industry engagement",
          ].map((item) => (
            <div key={item} className="card text-sm font-medium text-agi-navy">{item}</div>
          ))}
        </div>

        <div className="card">
          <p className="text-xs font-semibold uppercase text-slate-500">Institute-specific note</p>
          <p className="mt-2">
            Programs under AIMSR (BMS, MMS, MCA) and ACAAD (B.Arch, B.Des, B.Voc, B.F.A) are placed through the shared AGI Placement
            Cell, with institute-specific eligibility and recruiter engagement handled separately where relevant.
          </p>
        </div>
      </div>
    </div>
  );
}
