import { Link } from 'react-router-dom';
import {
  AcademicCapIcon,
  ShieldCheckIcon,
  ClockIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
  BoltIcon,
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
  <div className="relative overflow-hidden rounded-2xl bg-[#120F18] md:min-h-[520px]">
          {/* Ambient beams */}
          <div className="absolute inset-0 blur-3xl opacity-30" aria-hidden>
            <div className="h-full w-full bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.25),transparent_35%),radial-gradient(circle_at_85%_30%,rgba(16,185,129,0.15),transparent_35%)]" />
          </div>
          {/* Right-side blend using icon bg (#120F18) */}
          <div className="absolute inset-y-0 right-0 w-3/5 opacity-80 blur-xl pointer-events-none" aria-hidden>
            <div className="h-full w-full bg-gradient-to-l from-[#120F18] via-[#120F18]/70 to-transparent" />
          </div>
          <div className="relative p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left copy */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
                  <AcademicCapIcon className="h-4 w-4" /> MJPT • MaxSec Junior Penetration Tester
                </div>
                <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  MJPT — 24‑Hour, Report‑Based Practical Certification
                </h1>
                <p className="mt-4 text-slate-300 max-w-xl">
                  Validate hands‑on penetration testing capability. Assess two targets (Linux + Windows),
                  gain meaningful access, and submit a professional report within 24 hours.
                </p>
                <ul className="mt-4 text-slate-300 text-sm list-disc ml-5 space-y-1 max-w-xl">
                  <li>24‑hour, evidence‑driven assessment</li>
                  <li>Two targets: Linux & Windows</li>
                  <li>Outcome: verifiable certificate</li>
                </ul>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link to="/signup" className="px-6 py-3 rounded-lg bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 hover:bg-emerald-500/30 font-semibold">Get your voucher now</Link>
                </div>
                <div className="mt-6 text-sm text-emerald-200/90">Vouchers are limited.</div>
              </div>

              {/* Right icon blended */}
              <div className="relative">
                <div className="absolute -inset-6 -z-10 blur-2xl opacity-70" aria-hidden>
                  <div className="h-full w-full bg-[radial-gradient(circle_at_60%_50%,#120F18_0%,transparent_60%)]" />
                </div>
                <img
                  src="/icon.png"
                  alt="MJPT Icon"
                  className="w-full max-h-[560px] md:max-h-[640px] object-contain ml-auto md:translate-x-6 lg:translate-x-10"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.png'; }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* At a glance */}
        <div className="mt-8 flex flex-wrap gap-3">
          <span className="px-3 py-1.5 rounded-full bg-white/5 text-slate-200 border border-white/10 inline-flex items-center gap-2 text-sm">
            <ClockIcon className="h-5 w-5 text-emerald-400" /> 24 Hours
          </span>
          <span className="px-3 py-1.5 rounded-full bg-white/5 text-slate-200 border border-white/10 inline-flex items-center gap-2 text-sm">
            <ComputerDesktopIcon className="h-5 w-5 text-emerald-400" /> Linux + Windows
          </span>
          <span className="px-3 py-1.5 rounded-full bg-white/5 text-slate-200 border border-white/10 inline-flex items-center gap-2 text-sm">
            <DocumentTextIcon className="h-5 w-5 text-emerald-400" /> Report‑Based
          </span>
          <span className="px-3 py-1.5 rounded-full bg-white/5 text-slate-200 border border-white/10 inline-flex items-center gap-2 text-sm">
            <ShieldCheckIcon className="h-5 w-5 text-emerald-400" /> Verifiable Certificate
          </span>
        </div>

        {/* Blueprint */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-3">Assessment Coverage & Weighting</h2>
          <p className="text-slate-400 text-sm mb-6">Focus areas and expected coverage across the engagement lifecycle.</p>
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

        {/* Certificate preview (no card) */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-3">Your Certificate</h2>
          <p className="text-slate-400 text-sm mb-6">Credential issued upon successful assessment and review.</p>
          <div className="relative">
            <div className="absolute inset-0 -z-10 blur-3xl opacity-25" aria-hidden>
              <div className="h-full w-full bg-[radial-gradient(circle_at_30%_40%,rgba(16,185,129,0.25),transparent_35%),radial-gradient(circle_at_70%_60%,rgba(16,185,129,0.15),transparent_35%)]" />
            </div>
            <img src="/certificate.png" alt="MJPT Certificate" className="w-full max-h-[560px] object-contain" style={{ filter: 'drop-shadow(0 10px 40px rgba(16,185,129,0.18))' }} />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/certification" className="px-5 py-2 rounded-md bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 hover:bg-emerald-500/30 text-sm font-semibold">See Certification Details</Link>
            <Link to="/signup" className="px-5 py-2 rounded-md bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 text-sm font-semibold">Get your voucher now</Link>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col items-center gap-3 px-6 py-5">
            <div className="text-emerald-200/90 text-sm">Vouchers are limited</div>
            <div className="text-xl font-semibold">Secure access. Demonstrate capability. Earn recognition.</div>
            <div className="flex gap-3 mt-1">
              <Link to="/signup" className="px-6 py-2 rounded-lg bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 hover:bg-emerald-500/30 font-semibold">Get your voucher now</Link>
              <Link to="/contact" className="px-6 py-2 rounded-lg bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 font-semibold">Talk to Us</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
