import { Link } from 'react-router-dom';
import { ShieldCheckIcon, ArrowPathIcon, DocumentArrowUpIcon, FlagIcon, CheckBadgeIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

export default function Certification() {
  const steps = [
    { icon: <FlagIcon className="h-5 w-5 text-emerald-400" />, title: 'Register', text: 'Create your account and choose your upcoming cohort.' },
    { icon: <ArrowPathIcon className="h-5 w-5 text-emerald-400" />, title: 'Exam Access', text: 'Receive access to two boxes (Linux + Windows) when your window opens.' },
    { icon: <DocumentArrowUpIcon className="h-5 w-5 text-emerald-400" />, title: '24‑Hour Report', text: 'Perform the assessment and submit a professional report within 24 hours.' },
    { icon: <CheckBadgeIcon className="h-5 w-5 text-emerald-400" />, title: 'Review & Result', text: 'We review within ~5–7 working days. On success, you earn your certificate.' },
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
        <div className="relative overflow-hidden rounded-2xl bg-[#0c1217] border border-white/10">
          <div className="absolute inset-0 blur-3xl opacity-30" aria-hidden>
            <div className="h-full w-full bg-[radial-gradient(circle_at_20%_25%,rgba(16,185,129,0.25),transparent_35%),radial-gradient(circle_at_80%_35%,rgba(16,185,129,0.15),transparent_35%)]" />
          </div>
          <div className="relative p-8 md:p-12">
            {/* Icon block */}
            <div className="flex justify-center">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-black/40 border border-emerald-400/30 p-2 shadow-[0_0_30px_rgba(16,185,129,0.35)] mb-2">
                <img
                  src="/icon.png"
                  alt="Certification Icon"
                  className="w-full h-full object-contain rounded-xl"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.png'; }}
                />
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
              <ShieldCheckIcon className="h-4 w-4" /> Certification
            </div>
            <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Practical, Report‑Based Certification
            </h1>
            <p className="mt-4 text-slate-300 max-w-3xl">
              Earn a credential that signals real‑world capability. Assess scoped targets, demonstrate
              impact with evidence, and submit a professional report. On success, receive a verifiable
              certificate you can share confidently.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link to="/signup" className="px-6 py-3 rounded-lg bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 hover:bg-emerald-500/30 font-semibold">Get Started</Link>
              <Link to="/mjpt" className="px-6 py-3 rounded-lg bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 font-semibold">See MJPT</Link>
            </div>
          </div>
        </div>

        {/* Certificate preview */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-6">
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40">
              <img src="/certificate.png" alt="Certificate preview" className="w-full object-contain max-h-[540px]" />
            </div>
            <div className="mt-4 text-sm text-slate-400">
              Preview of the certificate you receive upon successful completion and review.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0c1217] p-6">
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
              Note: Follow scope rules strictly. No destructive testing, DoS, or scanning beyond the assigned targets.
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
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
            <Link to="/signup" className="px-5 py-2 rounded-md bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 hover:bg-emerald-500/30 text-sm font-semibold">Apply Now</Link>
            <Link to="/contact" className="px-5 py-2 rounded-md bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 text-sm font-semibold">Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
