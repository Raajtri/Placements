import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-agi-navy text-slate-200">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-sm font-semibold text-white">AGI Placement Cell</p>
          <p className="mt-2 text-sm text-slate-300">Aditya Group of Institution (AGI)</p>
          <p className="mt-1 text-xs text-slate-400">Aditya Educational Campus, R.M. Bhattad Road, Ram Nagar, Borivali (West), Mumbai - 400092</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Explore</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-300">
            <li><Link to="/placements" className="hover:text-white">Placement Highlights</Link></li>
            <li><Link to="/companies" className="hover:text-white">Corporate Partners</Link></li>
            <li><Link to="/statistics" className="hover:text-white">Placement Statistics</Link></li>
            <li><Link to="/reports" className="hover:text-white">Placement Reports</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Resources</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-300">
            <li><Link to="/policy" className="hover:text-white">Placement Policy</Link></li>
            <li><Link to="/process" className="hover:text-white">Placement Process</Link></li>
            <li><Link to="/team" className="hover:text-white">Placement Team</Link></li>
            <li><Link to="/testimonials" className="hover:text-white">Alumni Testimonials</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Contact</p>
          <p className="mt-2 text-sm text-slate-300">AIMSR: admissions@aimsr.edu.in</p>
          <p className="text-sm text-slate-300">ACAAD: info@acaad.edu.in</p>
          <p className="text-sm text-slate-300">Phone: 022-3520 6111</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Aditya Group of Institution — Placement Cell. All data marked "demo" is illustrative only.
        <br />
        Developed by Aman Tripathi and Sushant Tiwari
      </div>
    </footer>
  );
}
