import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function LegalRefund() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f14] via-[#0a0f14] to-black text-slate-100">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0a0f14]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-emerald-300 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-slate-100 mb-2">Refund & Cancellation Policy</h1>
        <p className="text-slate-400 mb-8">Last updated: November 15, 2025</p>

        <div className="space-y-8">
          {/* No Refund Policy */}
          <section className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <span className="text-red-400">⚠️</span> No Refund Policy
            </h2>
            <div className="space-y-4 text-slate-300">
              <p className="font-semibold text-lg text-slate-200">
                All course purchases are final and non-refundable under any circumstances.
              </p>
              <p>
                Once a course is purchased and payment is completed, <strong className="text-white">no refunds will be issued</strong> regardless of:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Personal reasons or change of mind</li>
                <li>Course difficulty level or expectations</li>
                <li>Time constraints or inability to complete the course</li>
                <li>Technical issues on the user's end (device, internet connection, etc.)</li>
                <li>Duplicate purchases</li>
                <li>Course completion status</li>
              </ul>
              <p className="mt-4 p-4 bg-red-500/10 border border-red-400/30 rounded-lg text-red-100">
                <strong>Important:</strong> By purchasing any course on MaxSec Academy, you acknowledge and agree that all sales are final and that you will not be entitled to a refund under any circumstances except as outlined in the "Exceptions" section below.
              </p>
            </div>
          </section>

          {/* Exceptions */}
          <section className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">Exceptions to No-Refund Policy</h2>
            <div className="space-y-4 text-slate-300">
              <p>
                Refunds will <strong className="text-white">ONLY</strong> be considered in the following exceptional circumstances:
              </p>
              <ul className="list-disc list-inside space-y-3 ml-4">
                <li>
                  <strong className="text-slate-200">Technical Error by MaxSec Academy:</strong> If there is a proven technical error or malfunction on our platform that prevents you from accessing the purchased course content, and our support team is unable to resolve the issue within a reasonable timeframe.
                </li>
                <li>
                  <strong className="text-slate-200">Billing Mistake:</strong> If you were charged incorrectly due to a system error (e.g., charged twice for the same course, charged the wrong amount).
                </li>
                <li>
                  <strong className="text-slate-200">Course Not Delivered:</strong> If the purchased course was never made available in your account and our team cannot restore access.
                </li>
                <li>
                  <strong className="text-slate-200">Fraudulent Transaction:</strong> If your payment was made without your authorization and you provide valid proof of fraud.
                </li>
              </ul>
              <p className="mt-4 p-4 bg-emerald-500/10 border border-emerald-400/30 rounded-lg text-slate-200">
                <strong>Note:</strong> All refund requests under these exceptions must be submitted within <strong className="text-white">7 days of purchase</strong> with complete documentation and proof of the issue.
              </p>
            </div>
          </section>

          {/* Refund Request Process */}
          <section className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">How to Request a Refund (Exceptions Only)</h2>
            <div className="space-y-4 text-slate-300">
              <p>If you believe your situation qualifies under the exceptions listed above, please follow these steps:</p>
              <ol className="list-decimal list-inside space-y-3 ml-4">
                <li>
                  <strong className="text-slate-200">Contact Support:</strong> Email us at <a href="mailto:support@maxsec.tech" className="text-emerald-300 hover:text-emerald-200 underline">support@maxsec.tech</a> or <a href="mailto:officialmnhz@gmail.com" className="text-emerald-300 hover:text-emerald-200 underline">officialmnhz@gmail.com</a>
                </li>
                <li>
                  <strong className="text-slate-200">Provide Details:</strong> Include your order number, transaction ID, course name, and a detailed explanation of the issue
                </li>
                <li>
                  <strong className="text-slate-200">Submit Evidence:</strong> Attach screenshots, error messages, or any documentation that supports your claim
                </li>
                <li>
                  <strong className="text-slate-200">Wait for Review:</strong> Our team will review your request within 3-5 business days
                </li>
                <li>
                  <strong className="text-slate-200">Decision:</strong> You will receive an email with our decision. If approved, the refund will be processed to your original payment method within 7-10 business days
                </li>
              </ol>
              <p className="mt-4 text-sm text-slate-400">
                All refund decisions are final and at the sole discretion of MaxSec Academy management.
              </p>
            </div>
          </section>

          {/* Cancellation Policy */}
          <section className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">Cancellation Policy</h2>
            <div className="space-y-4 text-slate-300">
              <p>
                <strong className="text-slate-200">Course Cancellation by User:</strong> Once a course purchase is completed, it cannot be cancelled. There is no cooling-off period or grace period for cancellations.
              </p>
              <p>
                <strong className="text-slate-200">Course Cancellation by MaxSec Academy:</strong> In rare cases, we may need to cancel or discontinue a course. In such events:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You will be notified via email</li>
                <li>You will receive a full refund to your original payment method</li>
                <li>Or, you may be offered an equivalent course as a replacement at no additional cost</li>
              </ul>
            </div>
          </section>

          {/* Pre-Purchase Recommendations */}
          <section className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">Before You Purchase</h2>
            <div className="space-y-4 text-slate-300">
              <p>
                To ensure you make an informed decision before purchasing, we strongly recommend:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Review the course curriculum, objectives, and prerequisites carefully</li>
                <li>Check preview lessons if available</li>
                <li>Read course descriptions and requirements thoroughly</li>
                <li>Verify that your device and internet connection meet the technical requirements</li>
                <li>Contact our support team if you have any questions before purchasing</li>
              </ul>
              <p className="mt-4 p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-lg text-yellow-100">
                <strong>Remember:</strong> All sales are final. Make sure the course is right for you before completing your purchase.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">Contact Us</h2>
            <div className="space-y-3 text-slate-300">
              <p>If you have any questions about our Refund & Cancellation Policy, please contact us:</p>
              <div className="space-y-2">
                <p><strong className="text-slate-200">Email:</strong> <a href="mailto:support@maxsec.tech" className="text-emerald-300 hover:text-emerald-200 underline">support@maxsec.tech</a></p>
                <p><strong className="text-slate-200">Alternative Email:</strong> <a href="mailto:officialmnhz@gmail.com" className="text-emerald-300 hover:text-emerald-200 underline">officialmnhz@gmail.com</a></p>
                <p><strong className="text-slate-200">Website:</strong> <a href="https://maxsec.tech" className="text-emerald-300 hover:text-emerald-200 underline">https://maxsec.tech</a></p>
              </div>
            </div>
          </section>

          {/* Managed By */}
          <section className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              MaxSec Academy is managed by <span className="text-emerald-300 font-semibold">HackoSquad</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
