import { Link } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import {
  AcademicCapIcon,
  ShieldCheckIcon,
  SparklesIcon,
  GlobeAltIcon,
  TrophyIcon,
  CpuChipIcon,
  UsersIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";

export default function Landing() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#070b10] via-[#0a121a] to-black text-slate-100 overflow-hidden">
      {/* Background Layers */}
      <div className="fixed inset-0 -z-10 animate-gradient-move hero-gradient" aria-hidden></div>
      <div className="fixed inset-0 -z-10 beams" aria-hidden></div>
      <div className="fixed inset-0 -z-10 aurora" aria-hidden></div>
      <div className="fixed inset-0 -z-10 spotlight" aria-hidden></div>

      {/* Top Banner: New certification launched */}
      <div className="bg-[#120F18]/80 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-2 overflow-hidden">
          <div
            className="whitespace-nowrap select-none"
            style={{
              display: 'flex',
              gap: '3rem',
              animation: 'marquee 22s linear infinite',
              willChange: 'transform',
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="text-xs md:text-sm text-emerald-200/90">
                New certification launched: MJPT – MaxSec Junior Penetration Tester.
              </span>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>

      {/* Header */}
      <header className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandLogo
            size={52}
            withTagline={false}
            showWordmark={false}
            plain={true}
          />
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/about" className="text-slate-300 hover:text-white">
            About
          </Link>
          <Link to="/mjpt" className="text-slate-300 hover:text-white">
            MJPT
          </Link>
          <Link to="/certification" className="text-slate-300 hover:text-white">
            Certification
          </Link>
          <Link to="/contact" className="text-slate-300 hover:text-white">
            Contact
          </Link>
          <Link
            to="/login"
            className="px-3 py-1.5 rounded-md bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10"
          >
            Sign in
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main>
  <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 text-center">
          <img
            src="/logo.png"
            alt="MaxSec Academy Logo"
            className="mx-auto mb-6 rounded-2xl object-contain w-56 sm:w-64 md:w-72 h-auto"
          />
          <h1 className="mt-6 text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Applied Cybersecurity Training and Certification.
          </h1>
          <p className="mt-5 text-slate-400 text-lg max-w-2xl mx-auto">
            Hands‑on learning backed by verifiable credentials, managed by
            <span className="text-emerald-400 font-semibold"> HackoSquad</span>.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/mjpt"
              className="px-6 py-3 rounded-lg bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 hover:bg-emerald-500/30 font-semibold"
            >
              Explore Program
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 rounded-lg bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 font-semibold"
            >
              Contact Us
            </Link>
          </div>

          {/* Partner Section */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 items-center">
            <img
              src="/ptlogo.png"
              alt="HackoSquad Partner Logo"
              className="h-24 md:h-28 opacity-90 hover:opacity-100 transition object-contain"
              title="Powered by HackoSquad"
            />
          </div>
        </section>

  {/* Highlights */}
        <section className="mx-auto max-w-6xl px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 text-center sm:text-left">
          {[
            {
              icon: (
                <ShieldCheckIcon className="h-10 w-10 text-emerald-400 mb-3" />
              ),
              title: "Verifiable Credentials",
              text: "Credentials you can verify and share with employers and peers.",
            },
            {
              icon: (
                <AcademicCapIcon className="h-10 w-10 text-emerald-400 mb-3" />
              ),
              title: "Skill-Mapped Learning",
              text: "Each lab and task is mapped to real cybersecurity skills used by professionals in the field.",
            },
            {
              icon: <CpuChipIcon className="h-10 w-10 text-emerald-400 mb-3" />,
              title: "Hands-On Labs",
              text: "Simulate real attacks and defenses inside guided, interactive environments built for mastery.",
            },
            {
              icon: <TrophyIcon className="h-10 w-10 text-emerald-400 mb-3" />,
              title: "Assessment-Driven Growth",
              text: "Earn your certification only after completing practical, scenario-based evaluations.",
            },
            {
              icon: <UsersIcon className="h-10 w-10 text-emerald-400 mb-3" />,
              title: "Mentor-Led Learning",
              text: "Learn directly from HackoSquad mentors who share hands-on experience and real project guidance.",
            },
            {
              icon: <CheckBadgeIcon className="h-10 w-10 text-emerald-400 mb-3" />,
              title: "Emerging Platform",
              text: "We’re a growing cybersecurity academy, focused on building trust, community, and real skill-based credentials.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="flex flex-col items-center sm:items-start"
            >
              {f.icon}
              <h3 className="font-semibold text-lg text-slate-100">{f.title}</h3>
              <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                {f.text}
              </p>
            </div>
          ))}
        </section>

        {/* About */}
        <section className="mx-auto max-w-6xl px-6 py-12 border-t border-white/10">
          <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-2">About MaxSec</h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
                MaxSec delivers applied cybersecurity training and practical certification. Managed by
                <span className="text-emerald-300"> HackoSquad</span>, we focus on real capability, measured performance, and
                verifiable outcomes.
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">Managed by HackoSquad</span>
            </div>
          </div>
        </section>

        {/* Programs */}
        <section id="programs" className="mx-auto max-w-6xl px-6 py-14">
          <h2 className="text-2xl font-bold mb-6">Programs</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* MJPT - larger card with icon */}
            <div className="rounded-2xl bg-[#120F18] p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-6 items-center min-h-[340px]">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-200 text-xs font-semibold w-max">
                    <AcademicCapIcon className="h-4 w-4" /> MJPT
                  </div>
                  <h3 className="mt-3 text-2xl font-bold">24‑Hour Practical Exam</h3>
                  <p className="mt-2 text-slate-300 text-sm">Two targets (Linux & Windows). Report‑based submission.</p>
                  <ul className="mt-3 text-slate-300 text-sm list-disc ml-5 space-y-1">
                    <li>Evidence‑driven assessment</li>
                    <li>Voucher‑based access</li>
                    <li>Verifiable certificate</li>
                  </ul>
                  <div className="mt-5 flex gap-3">
                    <Link to="/signup" className="px-4 py-2 rounded-md bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 hover:bg-emerald-500/30 text-sm font-semibold">Get your voucher now</Link>
                    <Link to="/mjpt" className="px-4 py-2 rounded-md bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 text-sm font-semibold">Learn more</Link>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -inset-6 -z-10 blur-2xl opacity-70" aria-hidden>
                    <div className="h-full w-full bg-[radial-gradient(circle_at_60%_50%,#120F18_0%,transparent_60%)]" />
                  </div>
                  <img src="/icon.png" alt="MJPT Icon" className="w-full max-h-[300px] md:max-h-[360px] object-contain ml-auto" onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.src='/logo.png'}} />
                </div>
              </div>
            </div>

            {/* Corporate / Custom Training - larger card with icon */}
            <div className="rounded-2xl bg-[#100B15] p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-6 items-center min-h-[340px]">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-200 text-xs font-semibold w-max">
                    <UsersIcon className="h-4 w-4" /> Corporate / Custom Training
                  </div>
                  <h3 className="mt-3 text-2xl font-bold">Team‑Ready, Tailored Programs</h3>
                  <p className="mt-2 text-slate-300 text-sm">Custom curricula for companies and institutions.</p>
                  <ul className="mt-3 text-slate-300 text-sm list-disc ml-5 space-y-1">
                    <li>Role‑based learning paths</li>
                    <li>Onsite or remote delivery</li>
                    <li>Hands‑on labs and reporting</li>
                  </ul>
                  <div className="mt-5 flex gap-3">
                    <Link to="/contact" className="px-4 py-2 rounded-md bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 hover:bg-emerald-500/30 text-sm font-semibold">Contact sales</Link>
                    <Link to="/about" className="px-4 py-2 rounded-md bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 text-sm font-semibold">Learn more</Link>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -inset-6 -z-10 blur-2xl opacity-70" aria-hidden>
                    <div className="h-full w-full bg-[radial-gradient(circle_at_60%_50%,#120F18_0%,transparent_60%)]" />
                  </div>
                  <img src="/corporate.png" alt="Corporate training" className="w-full max-h-[300px] md:max-h-[360px] object-contain ml-auto" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mx-auto max-w-5xl px-6 py-20 text-center border-t border-white/10">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed">
            We are not just an academy — we’re a movement shaping the next generation of cybersecurity professionals.  
            Our approach focuses on{" "}
            <span className="text-emerald-400">real skills</span>,{" "}
            <span className="text-emerald-400">measurable progress</span>, and{" "}
            <span className="text-emerald-400">
              verifiable credentials
            </span>{" "}
            that hold value in the real world.
          </p>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-100 mb-4">
            Start your Cybersecurity Journey today.
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-8">
            Join early and become part of our growing ecosystem of learners
            who want to make a difference in the cybersecurity world.
          </p>
          <Link
            to="/signup"
            className="inline-block px-8 py-3 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-100 font-semibold hover:bg-emerald-500/30"
          >
            Create account
          </Link>
        </section>
      </main>
    </div>
  );
}
