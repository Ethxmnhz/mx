import { Link } from 'react-router-dom';
import {
  AcademicCapIcon,
  ShieldCheckIcon,
  ClockIcon,
  ComputerDesktopIcon,
  ServerStackIcon,
  DocumentTextIcon,
  BoltIcon,
  GlobeAltIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

export default function MJPT() {
  const stats = [
    { icon: <ClockIcon className="h-6 w-6 text-emerald-400" />, label: 'Exam Window', value: '24 Hours' },
    { icon: <ComputerDesktopIcon className="h-6 w-6 text-emerald-400" />, label: 'Targets', value: '2 Boxes (Linux + Windows)' },
    { icon: <DocumentTextIcon className="h-6 w-6 text-emerald-400" />, label: 'Submission', value: 'Professional Report' },
    { icon: <ShieldCheckIcon className="h-6 w-6 text-emerald-400" />, label: 'Outcome', value: 'Practical Certification' },
  ];

  const blueprint = [
    {
      title: 'Recon, Enumeration & Scanning',
      percent: 25,
      points: ['Passive & active recon', 'Service and version detection', 'Enumerating users/shares', 'Network mapping'],
    },
    {
      title: 'Assessment & Exploitation',
      percent: 25,
      points: ['Vulnerability validation', 'Exploit selection & chaining', 'Privilege escalation attempts', 'Stability & OPSEC'],
    },
    {
      title: 'Post-Exploitation',
      percent: 25,
      points: ['Persistence (where safe)', 'Credential harvesting', 'Lateral movement (scoped)', 'Host-based artifacts'],
    },
    {
      title: 'Web Vulnerabilities Basics',
      percent: 25,
      points: ['Auth flows & sessions', 'Input validation & XSS basics', 'IDOR & access control', 'Common misconfigurations'],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f14] via-[#0a0f14] to-black text-slate-100">
      {/* Page container */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Top bar */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-slate-100">MaxSec Academy</span>
            <span className="text-xs text-slate-500">Managed by HackoSquad</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/about" className="text-slate-300 hover:text-emerald-300">About</Link>
            <Link to="/contact" className="text-slate-300 hover:text-emerald-300">Contact</Link>
          </div>
        </div>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-[#0c1217] border border-white/10">
          <div className="absolute inset-0 blur-3xl opacity-30" aria-hidden>
            <div className="h-full w-full bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.25),transparent_35%),radial-gradient(circle_at_85%_30%,rgba(16,185,129,0.15),transparent_35%)]" />
          </div>
          <div className="relative p-8 md:p-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
              <AcademicCapIcon className="h-4 w-4" /> MaxSec Junior Penetration Tester
            </div>
            <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              MJPT — 24‑Hour, Report‑Based Practical Certification
            </h1>
            <p className="mt-4 text-slate-300 max-w-3xl">
              A high‑signal, hands‑on exam built to validate real pentesting skills. You’ll assess two
              machines (one Linux, one Windows), obtain meaningful access, and submit a professional
              report within 24 hours. No MCQs. Pure execution.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link to="/signup" className="px-6 py-3 rounded-lg bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 hover:bg-emerald-500/30 font-semibold">Get Certified</Link>
              <Link to="/login" className="px-6 py-3 rounded-lg bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 font-semibold">Sign in</Link>
            </div>

            {/* FOMO strip */}
            <div className="mt-6 text-sm text-emerald-200/90">
              Limited cohorts. Seats open monthly. Secure your slot now →
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-3">
                {s.icon}
                <div>
                  <div className="text-slate-400 text-xs">{s.label}</div>
                  <div className="text-slate-100 font-semibold">{s.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Blueprint */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-3">Exam Blueprint</h2>
          <p className="text-slate-400 text-sm mb-6">Weighted focus areas. Expect realistic, end‑to‑end assessment across the stack.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blueprint.map((b, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-[#0c1217] p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-100">{b.title}</h3>
                  <span className="text-emerald-300 text-sm font-semibold">{b.percent}%</span>
                </div>
                <ul className="mt-3 list-disc ml-5 text-sm text-slate-300 space-y-1">
                  {b.points.map((p, idx) => <li key={idx}>{p}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* What to expect */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-xl font-semibold">What You’ll Do</h2>
            <ul className="mt-3 text-sm text-slate-300 space-y-2 list-disc ml-5">
              <li>Plan and execute reconnaissance and enumeration to build a clear attack plan.</li>
              <li>Validate and exploit vulnerabilities safely, documenting steps and evidence.</li>
              <li>Gain and maintain access, escalate privileges, and enumerate post‑exploitation data where in scope.</li>
              <li>Identify and explain core web vulnerabilities when present in targets.</li>
              <li>Deliver a concise, professional report with remediation guidance.</li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-200 border border-emerald-400/30 inline-flex items-center gap-1"><BoltIcon className="h-4 w-4"/> Hands‑On</span>
              <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-200 border border-emerald-400/30 inline-flex items-center gap-1"><ChartBarIcon className="h-4 w-4"/> Evidence‑Driven</span>
              <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-200 border border-emerald-400/30 inline-flex items-center gap-1"><WrenchScrewdriverIcon className="h-4 w-4"/> Real‑World</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0c1217] p-6">
            <h2 className="text-xl font-semibold">Deliverables & Review</h2>
            <ul className="mt-3 text-sm text-slate-300 space-y-2 list-disc ml-5">
              <li>Report format: executive summary, methodology, findings (evidence), risk, and remediation.</li>
              <li>Submission deadline: within the 24‑hour window.</li>
              <li>Review time: typical 5–7 working days.</li>
              <li>Outcome: verifiable certificate and badge on success.</li>
            </ul>
          </div>
        </div>

        {/* Certificate preview */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-3">Your Certificate</h2>
          <p className="text-slate-400 text-sm mb-6">A showcase‑ready credential you can share with employers and peers.</p>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-6">
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40">
              <img src="/certificate.png" alt="MJPT Certificate" className="w-full object-contain max-h-[520px]" />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/certification" className="px-5 py-2 rounded-md bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 hover:bg-emerald-500/30 text-sm font-semibold">See Certification Details</Link>
              <Link to="/signup" className="px-5 py-2 rounded-md bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 text-sm font-semibold">Join the Next Cohort</Link>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-6 py-5">
            <div className="text-emerald-200 text-sm">Cohorts fill fast</div>
            <div className="text-xl font-semibold">Be early. Build signal. Get certified.</div>
            <div className="flex gap-3 mt-1">
              <Link to="/signup" className="px-6 py-2 rounded-lg bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 hover:bg-emerald-500/30 font-semibold">Apply Now</Link>
              <Link to="/contact" className="px-6 py-2 rounded-lg bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 font-semibold">Talk to Us</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
