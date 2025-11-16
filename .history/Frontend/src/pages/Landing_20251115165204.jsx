import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
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
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function Landing() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Show popup after 3 seconds
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
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
                🎁 Enroll in MJPT Course → Get FREE MJPT Exam Voucher! 🔥 First 100 users get 90% OFF (₹1,999 only!). Limited time offer.
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
            Learn with hands‑on labs, video tutorials, and comprehensive resources. Master real skills and earn verifiable credentials managed by
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
              text: "Earn MJPT certification and credentials you can verify and share with employers and peers.",
            },
            {
              icon: (
                <AcademicCapIcon className="h-10 w-10 text-emerald-400 mb-3" />
              ),
              title: "Comprehensive Learning",
              text: "Access video tutorials, detailed PPTs, and structured courses designed for all skill levels.",
            },
            {
              icon: <CpuChipIcon className="h-10 w-10 text-emerald-400 mb-3" />,
              title: "Hands-On Labs",
              text: "Practice with real lab environments on Linux & Windows. Develop practical hacking skills that matter.",
            },
            {
              icon: <TrophyIcon className="h-10 w-10 text-emerald-400 mb-3" />,
              title: "Free MJPT Voucher",
              text: "Enroll in our MJPT course and get a FREE exam voucher to take the certification. Limited time!",
            },
            {
              icon: <UsersIcon className="h-10 w-10 text-emerald-400 mb-3" />,
              title: "Expert Mentorship",
              text: "Learn directly from HackoSquad mentors with real penetration testing experience and industry insights.",
            },
            {
              icon: <CheckBadgeIcon className="h-10 w-10 text-emerald-400 mb-3" />,
              title: "Career Growth",
              text: "Build a portfolio of real skills and verifiable certifications that open doors in cybersecurity roles.",
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
          <h2 className="text-2xl font-bold mb-2">Our Programs</h2>
          <p className="text-slate-400 text-sm mb-6">Learn practical cybersecurity skills with hands-on labs, videos, and expert mentorship. Get certified with verifiable credentials.</p>
          <div className="grid md:grid-cols-2 gap-6">
            {/* MJPT - Course + Certification */}
            <div className="rounded-2xl bg-[#120F18] p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left: Content */}
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-200 text-xs font-semibold w-max mb-3">
                    <AcademicCapIcon className="h-4 w-4" /> MJPT Program
                  </div>
                  <h3 className="text-2xl font-bold text-slate-100 mb-2">MaxSec Junior Penetration Tester</h3>
                  <p className="text-slate-300 text-sm mb-4"><strong>Enroll in our comprehensive MJPT course</strong> featuring video tutorials, detailed presentations, and hands-on labs on Linux & Windows environments.</p>
                  
                  <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-lg p-3 mb-4">
                    <div className="text-emerald-300 font-semibold text-sm">✨ Special Offer</div>
                    <div className="text-slate-300 text-xs mt-1">Get a <strong>FREE MJPT Exam Voucher</strong> when you enroll</div>
                    <div className="text-emerald-300 text-xs mt-1 font-semibold">90% OFF for first 100 users</div>
                  </div>
                </div>

                {/* Right: Image */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute -inset-6 -z-10 blur-2xl opacity-70" aria-hidden>
                    <div className="h-full w-full bg-[radial-gradient(circle_at_60%_50%,#120F18_0%,transparent_60%)]" />
                  </div>
                  <img src="/icon.png" alt="MJPT Icon" className="w-full max-h-[280px] object-contain" onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.src='/logo.png'}} />
                </div>
              </div>

              {/* Bottom: Features + Buttons Rectangle */}
              <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-slate-300 text-sm space-y-1">
                      <div className="text-2xl mb-2">📚</div>
                      <div className="font-semibold text-slate-100">Course</div>
                      <div className="text-xs text-slate-400">Videos, PPTs, and lab exercises</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-300 text-sm space-y-1">
                      <div className="text-2xl mb-2">🎯</div>
                      <div className="font-semibold text-slate-100">Free Exam</div>
                      <div className="text-xs text-slate-400">24-hour practical assessment</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-300 text-sm space-y-1">
                      <div className="text-2xl mb-2">🏆</div>
                      <div className="font-semibold text-slate-100">Certificate</div>
                      <div className="text-xs text-slate-400">Verifiable industry credential</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Link to="/signup" className="flex-1 px-4 py-2 rounded-md bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 hover:bg-emerald-500/30 text-sm font-semibold text-center">Enroll Now</Link>
                  <Link to="/mjpt" className="flex-1 px-4 py-2 rounded-md bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 text-sm font-semibold text-center">Exam Details</Link>
                </div>
              </div>
            </div>

            {/* Corporate / Enterprise */}
            <div className="rounded-2xl bg-[#100B15] p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-6 items-start min-h-[400px]">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-200 text-xs font-semibold w-max mb-3">
                    <UsersIcon className="h-4 w-4" /> Enterprise
                  </div>
                  <h3 className="text-2xl font-bold text-slate-100 mb-2">Corporate & Enterprise Training</h3>
                  <p className="text-slate-300 text-sm mb-4"><strong>Tailored cybersecurity programs for teams and organizations.</strong> We design custom curricula mapped to your specific security challenges and skill gaps.</p>
                  
                  <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-lg p-3 mb-4">
                    <div className="text-emerald-300 font-semibold text-sm">🏢 For Organizations</div>
                    <div className="text-slate-300 text-xs mt-1">Flexible delivery, proven results, and verifiable outcomes</div>
                  </div>
                  
                  <ul className="text-slate-300 text-sm space-y-2 mb-5">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 flex-shrink-0">🎯</span>
                      <span><strong>Custom Design:</strong> Role-based learning paths</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 flex-shrink-0">📍</span>
                      <span><strong>Flexible Delivery:</strong> Onsite or remote training</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 flex-shrink-0">💪</span>
                      <span><strong>Hands-On:</strong> Real labs and practical assessments</span>
                    </li>
                  </ul>
                  
                  <div className="flex gap-3">
                    <Link to="/contact" className="flex-1 px-3 py-2 rounded-md bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 hover:bg-emerald-500/30 text-sm font-semibold text-center">Contact Sales</Link>
                    <Link to="/about" className="flex-1 px-3 py-2 rounded-md bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 text-sm font-semibold text-center">Learn More</Link>
                  </div>
                </div>
                <div className="relative flex items-center justify-center">
                  <div className="absolute -inset-6 -z-10 blur-2xl opacity-70" aria-hidden>
                    <div className="h-full w-full bg-[radial-gradient(circle_at_60%_50%,#120F18_0%,transparent_60%)]" />
                  </div>
                  <img src="/corporate.png" alt="Corporate training" className="w-full max-h-[320px] object-contain" />
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

      {/* FOMO Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-md w-full rounded-2xl bg-gradient-to-br from-[#120F18] to-[#0a0f14] border border-emerald-400/30 p-8 shadow-2xl animate-bounce-in">
            {/* Close button */}
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {/* Content */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/30 mb-4">
                <SparklesIcon className="h-6 w-6 text-emerald-400" />
              </div>
              
              <h2 className="text-2xl font-extrabold text-slate-100 mb-2">
                Claim Your Free MJPT Certificate! 🎁
              </h2>
              
              <p className="text-slate-300 text-sm mb-4">
                Get a 24-hour report-based penetration testing exam by enrolling in our MJPT course.
              </p>

              {/* Offer Badge */}
              <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-3 mb-6">
                <div className="text-red-200 text-xs font-semibold mb-1">⚡ LIMITED TIME OFFER</div>
                <div className="text-emerald-300 text-lg font-extrabold">90% OFF</div>
                <div className="text-slate-400 text-xs">First 100 users only!</div>
              </div>

              {/* Features */}
              <ul className="text-left text-slate-300 text-xs space-y-2 mb-6 bg-white/5 rounded-lg p-3 border border-white/10">
                <li className="flex items-start gap-2">
                  <CheckBadgeIcon className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>24-hour practical exam</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckBadgeIcon className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Report-based assessment</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckBadgeIcon className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Verifiable certificate</span>
                </li>
              </ul>

              {/* CTA Button */}
              <Link
                to="/signup"
                onClick={() => setShowPopup(false)}
                className="w-full block px-4 py-3 rounded-lg bg-emerald-500/30 text-emerald-100 border border-emerald-400/40 hover:bg-emerald-500/40 font-semibold text-sm transition-all mb-3"
              >
                Enroll Now & Claim Offer
              </Link>

              {/* Close link */}
              <button
                onClick={() => setShowPopup(false)}
                className="text-slate-400 hover:text-slate-300 text-xs transition-colors"
              >
                Maybe later
              </button>
            </div>

            {/* Corner accent */}
            <div className="absolute -top-2 -right-2 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.95) translateY(-20px);
            opacity: 0;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
