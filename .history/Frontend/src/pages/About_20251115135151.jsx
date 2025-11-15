import { Link } from "react-router-dom";
import { ShieldCheckIcon, AcademicCapIcon, CpuChipIcon, UsersIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";

export default function About() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#070b10] via-[#0a121a] to-black text-slate-100">
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-16 pb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">About MaxSec</h1>
        <p className="mt-4 text-slate-400 max-w-3xl">
          MaxSec is an applied cybersecurity academy focused on measurable capability and practical certification.
          Managed by <span className="text-emerald-300">HackoSquad</span>, we emphasize hands‑on learning, verified outcomes,
          and professional reporting.
        </p>
      </section>

      {/* Who We Are */}
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-400/20 p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-4">Who We Are</h2>
          <p className="text-slate-300 leading-relaxed max-w-4xl">
            We are a team of passionate people dedicated to making cybersecurity education accessible, practical, and effective. 
            Our teaching approach is simple: we explain complex concepts in a friendly, approachable way—like how friends teach 
            each other. We believe learning should be engaging, not intimidating. Whether you're just starting out or advancing 
            your career, we're here to guide you every step of the way with clear explanations, real-world examples, and genuine 
            support. Your success is our mission.
          </p>
        </div>
      </section>

      {/* What we do */}
      <section className="mx-auto max-w-6xl px-6 pb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[{
            icon: <ShieldCheckIcon className="h-8 w-8 text-emerald-400" />, title: "Verifiable Credentials", text: "Earn credentials you can verify and share with employers and peers."
          }, {
            icon: <CpuChipIcon className="h-8 w-8 text-emerald-400" />, title: "Hands‑On Labs", text: "Train in realistic environments mapped to real‑world workflows."
          }, {
            icon: <AcademicCapIcon className="h-8 w-8 text-emerald-400" />, title: "Assessment‑Driven", text: "Practical, evidence‑backed evaluation with professional reporting."
          }, {
            icon: <UsersIcon className="h-8 w-8 text-emerald-400" />, title: "Mentor Support", text: "Guidance from practitioners to accelerate your growth."
          }, {
            icon: <CheckBadgeIcon className="h-8 w-8 text-emerald-400" />, title: "Clear Outcomes", text: "Transparent criteria, structured coverage, and weighted topics."
          }].map((f, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3">
                {f.icon}
                <h3 className="text-lg font-semibold">{f.title}</h3>
              </div>
              <p className="mt-2 text-sm text-slate-400">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Managed by HackoSquad */}
      <section className="mx-auto max-w-6xl px-6 py-10 border-t border-white/10">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold">Managed by HackoSquad</h2>
            <p className="mt-2 text-slate-400 text-sm max-w-3xl">
              HackoSquad supports MaxSec in program design, infrastructure, and mentorship to ensure industry‑aligned learning
              and reliable assessment standards.
            </p>
          </div>
          <div className="flex justify-start md:justify-end">
            <img src="/ptlogo.png" alt="HackoSquad" className="h-16 md:h-20 object-contain opacity-90" />
          </div>
        </div>
      </section>

      {/* Programs preview */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-2xl font-bold mb-6">Programs</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* MJPT */}
          <div className="rounded-2xl bg-[#120F18] p-6">
            <h3 className="text-xl font-semibold">MJPT — 24‑Hour Practical Exam</h3>
            <p className="mt-2 text-slate-300 text-sm">Two machines (Linux & Windows). Report‑based, evidence‑driven.</p>
            <div className="mt-4 flex gap-3">
              <Link to="/mjpt" className="px-4 py-2 rounded-md bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 text-sm font-semibold">Learn more</Link>
              <Link to="/signup" className="px-4 py-2 rounded-md bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 hover:bg-emerald-500/30 text-sm font-semibold">Get voucher</Link>
            </div>
          </div>
          {/* Corporate / Custom Training */}
          <div className="rounded-2xl bg-[#120F18] p-6">
            <h3 className="text-xl font-semibold">Corporate / Custom Training</h3>
            <p className="mt-2 text-slate-300 text-sm">Tailored curricula for teams. Onsite or remote delivery.</p>
            <div className="mt-4 flex gap-3">
              <Link to="/contact" className="px-4 py-2 rounded-md bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 hover:bg-emerald-500/30 text-sm font-semibold">Contact sales</Link>
              <Link to="/about" className="px-4 py-2 rounded-md bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 text-sm font-semibold">Learn more</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-6 py-10 border-t border-white/10">
        <h2 className="text-2xl font-bold mb-4">Our Values</h2>
        <ul className="grid md:grid-cols-2 gap-4 text-sm text-slate-300">
          <li className="rounded-xl bg-white/5 border border-white/10 p-4"><span className="font-semibold text-slate-100">Integrity:</span> Clear criteria, fair assessments, and transparent outcomes.</li>
          <li className="rounded-xl bg-white/5 border border-white/10 p-4"><span className="font-semibold text-slate-100">Practicality:</span> Focus on real skills through hands‑on labs and scenarios.</li>
          <li className="rounded-xl bg-white/5 border border-white/10 p-4"><span className="font-semibold text-slate-100">Community:</span> Learn with peers and mentors who care about growth.</li>
          <li className="rounded-xl bg-white/5 border border-white/10 p-4"><span className="font-semibold text-slate-100">Privacy & Security:</span> Respect for learner data and secure learning environments.</li>
        </ul>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-100 mb-4">Build real capability with MaxSec.</h2>
        <p className="text-slate-400 max-w-2xl mx-auto mb-8">Have questions about programs or corporate options?</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/contact" className="px-6 py-3 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-100 font-semibold hover:bg-emerald-500/30">Contact us</Link>
          <Link to="/signup" className="px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-slate-200 font-semibold hover:bg-white/10">Create account</Link>
        </div>
      </section>
    </div>
  );
}
