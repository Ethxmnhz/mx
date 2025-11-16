import { Link } from 'react-router-dom';
import { ShieldCheckIcon, ArrowPathIcon, DocumentArrowUpIcon, FlagIcon, CheckBadgeIcon, QuestionMarkCircleIcon, ClockIcon, ComputerDesktopIcon, DocumentTextIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function Certification() {
  const steps = [
    { icon: <FlagIcon className="h-5 w-5 text-emerald-400" />, title: 'Register', text: 'Create your account and secure your exam voucher.' },
    { icon: <ArrowPathIcon className="h-5 w-5 text-emerald-400" />, title: 'Exam Access', text: 'Receive access to two targets (Linux + Windows) when your exam window opens.' },
    { icon: <DocumentArrowUpIcon className="h-5 w-5 text-emerald-400" />, title: '24‑Hour Report', text: 'Execute the assessment and submit a concise, professional report within 24 hours.' },
    { icon: <CheckBadgeIcon className="h-5 w-5 text-emerald-400" />, title: 'Review & Result', text: 'Typical review time is 5–7 working days. On success, you are awarded a verifiable certificate.' },
  ];

  const faqs = [
    { q: 'Is the exam fully practical?', a: 'Yes. There are no multiple‑choice questions. Your score is based on exploited evidence, methodology, and reporting quality.' },
    { q: 'Do I need prior experience?', a: 'Basic familiarity with Linux/Windows, networking, and web security helps. The blueprint guides the expected skill areas.' },
    { q: 'Retakes?', a: 'If you don’t pass, you can join a future cohort. Check announcements for retake slots and any applicable fees.' },
    { q: 'Tools allowed?', a: 'Common assessment tooling is allowed. Destructive actions (e.g., DoS, scanning beyond scope) are prohibited.' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f14] via-[#0a0f14] to-black text-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Top */}
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
          {/* Ambient radial beams */}
          <div className="absolute inset-0 blur-3xl opacity-30 pointer-events-none" aria-hidden>
            <div className="h-full w-full bg-[radial-gradient(circle_at_20%_25%,rgba(16,185,129,0.25),transparent_35%),radial-gradient(circle_at_80%_35%,rgba(16,185,129,0.15),transparent_35%)]" />
          </div>
          {/* Right-side gradient blend from icon bg (#120F18) into page bg */}
          <div className="absolute inset-y-0 right-0 w-3/5 opacity-80 blur-xl pointer-events-none" aria-hidden>
            <div className="h-full w-full bg-gradient-to-l from-[#120F18] via-[#120F18]/70 to-transparent" />
          </div>

          <div className="relative p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left: copy */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
                  <ShieldCheckIcon className="h-4 w-4" /> Certification
                </div>
                <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  Practical, Evidence‑Backed Certification
                </h1>
                <p className="mt-4 text-slate-300 max-w-xl">
                  Demonstrate applied penetration testing capability end‑to‑end. Assess scoped targets,
                  capture defensible evidence, and deliver a concise, decision‑ready report.
                  Successful candidates earn a verifiable credential.
                </p>
                <ul className="mt-4 text-slate-300 text-sm list-disc ml-5 space-y-1 max-w-xl">
                  <li>24‑hour, report‑based practical exam</li>
                  <li>Two targets: Linux & Windows</li>
                  <li>Outcome: verifiable certificate</li>
                </ul>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link to="/signup" className="px-6 py-3 rounded-lg bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 hover:bg-emerald-500/30 font-semibold">Get your voucher now</Link>
                  <Link to="/mjpt" className="px-6 py-3 rounded-lg bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 font-semibold">See MJPT</Link>
                </div>
              </div>

              {/* Right: large icon with blended backdrop */}
              <div className="relative">
                {/* Localized radial using #120F18 to further blend around the icon */}
                <div className="absolute -inset-8 -z-10 blur-2xl opacity-70" aria-hidden>
                  <div className="h-full w-full bg-[radial-gradient(circle_at_60%_50%,#120F18_0%,transparent_60%)]" />
                </div>
                <img
                  src="/icon.png"
                  alt="Certification Icon"
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

        {/* Pricing Section */}
        <div className="mt-12 relative">
          <div className="absolute inset-0 -z-10 blur-3xl opacity-30 pointer-events-none" aria-hidden>
            <div className="h-full w-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.25),transparent_50%)]" />
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-400/20 p-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-semibold mb-4">
              <SparklesIcon className="h-4 w-4" /> Limited Time Offer
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-100">Exam Voucher Pricing</h2>
            <p className="mt-2 text-slate-300 max-w-2xl mx-auto text-sm">Get 90% discount for the first 100 users. Don't miss out on this exclusive opportunity!</p>
            
            <div className="mt-8 grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Original Price */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                <div className="text-slate-400 text-sm">Regular Price</div>
                <div className="mt-2 text-2xl font-bold text-slate-300">₹14,999</div>
                <div className="text-xs text-slate-500 mt-1">Full price for regular access</div>
              </div>

              {/* Discounted Price */}
              <div className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-400/30 p-6 relative">
                <div className="absolute -top-3 right-4 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 border border-red-400/30 text-red-200 text-xs font-semibold">
                  <SparklesIcon className="h-3 w-3" /> 90% OFF
                </div>
                <div className="text-emerald-300 text-sm font-semibold">First 100 Users</div>
                <div className="mt-2 text-3xl font-extrabold text-emerald-300">₹1,499</div>
                <div className="text-xs text-emerald-200/70 mt-1">Save ₹13,500</div>
                <Link to="/signup" className="mt-4 w-full px-4 py-2 rounded-lg bg-emerald-500/30 text-emerald-100 border border-emerald-400/40 hover:bg-emerald-500/40 font-semibold text-sm inline-block">Claim Your Offer Now</Link>
              </div>
            </div>

            <p className="mt-6 text-xs text-slate-400">
              ⏱️ <strong>Hurry!</strong> Only available for the first 100 exam takers. Once the quota is filled, pricing will return to ₹14,999.
            </p>
          </div>
        </div>

        {/* Certificate preview (no card) + How it works */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="relative">
              <div className="absolute inset-0 -z-10 blur-3xl opacity-25" aria-hidden>
                <div className="h-full w-full bg-[radial-gradient(circle_at_30%_40%,rgba(16,185,129,0.25),transparent_35%),radial-gradient(circle_at_70%_60%,rgba(16,185,129,0.15),transparent_35%)]" />
              </div>
              <img src="/certificate.png" alt="Certificate preview" className="w-full max-h-[580px] object-contain" style={{ filter: 'drop-shadow(0 10px 40px rgba(16,185,129,0.18))' }} />
            </div>
            <div className="mt-4 text-sm text-slate-400">Credential is issued upon successful assessment and review.</div>
            <div className="mt-4">
              <Link to="/signup" className="px-6 py-2 rounded-lg bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 hover:bg-emerald-500/30 font-semibold">Get your voucher now</Link>
            </div>
          </div>

          <div className="bg-white/[0.02] rounded-2xl p-6">
            <h2 className="text-xl font-semibold">How It Works</h2>
            <div className="mt-4 grid grid-cols-1 gap-4">
              {steps.map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="shrink-0">{s.icon}</div>
                  <div>
                    <div className="text-slate-100 font-medium">{s.title}</div>
                    <div className="text-slate-300 text-sm">{s.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 text-xs text-slate-400">
              Operate within scope. No destructive testing, DoS, or scanning beyond the assigned targets.
            </div>
          </div>
        </div>

        {/* FAQs */}
  <div className="mt-10 bg-white/[0.02] rounded-2xl p-6">
          <div className="flex items-center gap-2">
            <QuestionMarkCircleIcon className="h-5 w-5 text-emerald-400" />
            <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((f, i) => (
              <div key={i}>
                <div className="font-medium text-slate-100">{f.q}</div>
                <div className="text-sm text-slate-300 mt-1">{f.a}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <Link to="/signup" className="px-5 py-2 rounded-md bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 hover:bg-emerald-500/30 text-sm font-semibold">Get your voucher now</Link>
            <Link to="/contact" className="px-5 py-2 rounded-md bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 text-sm font-semibold">Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
