import { SectionHeader } from "../../components/ui";

export function Contact() {
  return (
    <div className="container-page py-16">
      <SectionHeader eyebrow="Get in touch" title="Contact Us" description="Reach the AGI Placement Cell for recruitment or student queries." />
      <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
        <div className="card">
          <p className="font-semibold text-agi-navy">AIMSR — Aditya Institute of Management Technology and Research</p>
          <p className="mt-2 text-sm text-slate-600">Aditya Educational Campus, R.M. Bhattad Road, Ram Nagar, Borivali (West), Mumbai - 400092</p>
          <p className="mt-2 text-sm text-slate-600">Email: admissions@aimsr.edu.in</p>
          <p className="text-sm text-slate-600">Phone: 022-3520 6111 / 022-3520 6112</p>
        </div>
        <div className="card">
          <p className="font-semibold text-agi-navy">ACAAD — Aditya College of Art, Architecture and Design</p>
          <p className="mt-2 text-sm text-slate-600">Aditya Educational Campus, R.M. Bhattad Road, Ram Nagar, Borivali (West), Mumbai - 400092</p>
          <p className="mt-2 text-sm text-slate-600">Email: info@acaad.edu.in</p>
          <p className="text-sm text-slate-600">Phone: 022-3520 6111 / 022-3520 6112</p>
        </div>
      </div>
      <div className="mx-auto mt-6 max-w-4xl card">
        <p className="text-sm text-slate-600">Placement Cell office timings: Data to be updated.</p>
      </div>
    </div>
  );
}
