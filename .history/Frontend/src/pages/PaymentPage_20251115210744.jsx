import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import { CheckCircleIcon, ExclamationIcon } from '@heroicons/react/24/outline';

// Proper 3-step checkout: 1) User details 2) Payment method 3) Payment proof
export default function PaymentPage() {
	const { courseId } = useParams();
	const navigate = useNavigate();
	const [step, setStep] = useState(1); // 1: Details, 2: Payment Method, 3: Payment Proof
	const [submitting, setSubmitting] = useState(false);
	const [session, setSession] = useState(null);
	const [form, setForm] = useState({ name: '', email: '', coupon: '' });
	const [selectedPayment, setSelectedPayment] = useState('upi'); // 'upi' or 'phonepe'
	const [proof, setProof] = useState({ transaction_id: '', receipt_email: '' });
	
	// Validation
	const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
	const nameOk = String(form.name || '').trim().length >= 2;
	const emailOk = isValidEmail(form.email);
	const canContinue = nameOk && emailOk;

	// Config and helpers
	const API_BASE = (import.meta?.env?.VITE_API_URL || window?.VITE_API_URL || '').replace(/\/$/, '');
	const SUPPORT_WA = '7039108259'; // Your WhatsApp number

	const helpWhatsappUrl = useMemo(() => {
		if (!SUPPORT_WA) return '';
		const msg = encodeURIComponent(
			`Hello MaxSec Academy Support,%0A%0A` +
			`I have completed a payment and would like to share proof for verification.%0A%0A` +
			`Course: ${session?.course_title || 'N/A'}%0A` +
			`Amount: ₹${session?.amount ?? ''}%0A` +
			`Name: ${form.name || ''}%0A` +
			`Email: ${form.email || ''}%0A` +
			`Transaction/UTR: ${proof.transaction_id || 'Pending'}%0A%0A` +
			`Please verify my payment. I'm attaching a screenshot…`
		);
		return `https://wa.me/${SUPPORT_WA}?text=${msg}`;
	}, [SUPPORT_WA, session, form, proof]);

	const copyToClipboard = async (text, label = 'Copied') => {
		if (!text) return;
		try {
			await navigator.clipboard.writeText(text);
			toast.success(`${label}`);
		} catch (e) {
			try {
				const el = document.createElement('textarea');
				el.value = text;
				document.body.appendChild(el);
				el.select();
				document.execCommand('copy');
				document.body.removeChild(el);
				toast.success(`${label}`);
			} catch {
				toast.error('Failed to copy');
			}
		}
	};

	useEffect(() => {
		// Prefill name/email from stored user
		try {
			const u = JSON.parse(localStorage.getItem('user') || '{}');
			setForm((prev) => ({
				...prev,
				name: prev.name || u.full_name || '',
				email: prev.email || u.email || ''
			}));
		} catch {}
	}, [courseId]);

	const startCheckout = async () => {
		if (!canContinue) {
			toast.error('Please enter your name and a valid email');
			return;
		}
		try {
			setSubmitting(true);
			const token = localStorage.getItem('token');
			const res = await fetch(`${API_BASE}/api/payments/checkout/${courseId}`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(form)
			});
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				toast.error(err.message || 'Failed to start checkout');
				return;
			}
			const data = await res.json();
			setSession(data);
			setStep(2);
		} catch (err) {
			toast.error('Failed to start checkout');
		} finally {
			setSubmitting(false);
		}
	};

	const submitProof = async () => {
		if (!proof.transaction_id && !proof.receipt_email) {
			return toast.error('Please enter Transaction/UTR ID or receipt email');
		}
		try {
			setSubmitting(true);
			const token = localStorage.getItem('token');
			const res = await fetch(`${API_BASE}/api/payments/submit/${courseId}`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					transaction_id: proof.transaction_id || undefined,
					receipt_email: proof.receipt_email || undefined,
					payment_method: selectedPayment === 'upi' ? 'UPI' : 'PhonePe',
					coupon: session?.checkout?.coupon || undefined
				})
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				toast.error(data.message || 'Failed to submit payment');
				return;
			}
			toast.success('Payment submitted successfully! Access will be granted within 1 hour.');
			navigate('/my-learning');
		} catch (err) {
			toast.error('Failed to submit payment');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="flex min-h-screen bg-gradient-to-br from-[#0a0f14] via-[#0a0f14] to-black text-slate-100">
			<Sidebar />
			<div className="flex-1 p-6">
				<div className="max-w-7xl mx-auto">
					{/* Header */}
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-slate-100">Secure Checkout</h1>
						<p className="text-slate-400 mt-1">Complete your enrollment in a few simple steps</p>
					</div>

					{/* Progress Bar */}
					<div className="mb-8 flex items-center justify-between">
						{[
							{ num: 1, label: 'Your Details' },
							{ num: 2, label: 'Payment Method' },
							{ num: 3, label: 'Confirm Payment' }
						].map((s, i) => (
							<div key={s.num} className="flex items-center flex-1">
								<div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold ${step >= s.num ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-white/5 border-white/10 text-slate-400'}`}>
									{step > s.num ? '✓' : s.num}
								</div>
								<div className="ml-3">
									<div className={`text-sm font-semibold ${step >= s.num ? 'text-slate-100' : 'text-slate-400'}`}>{s.label}</div>
								</div>
								{i < 2 && (
									<div className={`flex-1 h-1 mx-4 rounded ${step > s.num ? 'bg-emerald-400' : 'bg-white/10'}`}></div>
								)}
							</div>
						))}
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Main Content */}
						<div className="lg:col-span-2">{/* STEP 1: User Details */}
						{step === 1 && (
							<div className="bg-white/5 border border-white/10 rounded-2xl p-8">
								<h2 className="text-2xl font-bold text-slate-100 mb-6">Billing Information</h2>
								<div className="space-y-5">
									<div>
										<label className="block text-sm font-semibold text-slate-200 mb-2">Full Name <span className="text-red-400">*</span></label>
										<input
											className={`w-full rounded-lg bg-black/40 border px-4 py-3 text-slate-100 placeholder-slate-500 transition ${nameOk ? 'border-white/10 focus:border-emerald-400/50' : 'border-red-500/50'} focus:outline-none`}
											value={form.name}
											onChange={e => setForm({ ...form, name: e.target.value })}
											placeholder="John Doe"
										/>
										{!nameOk && form.name && <p className="text-xs text-red-400 mt-1">Minimum 2 characters required</p>}
									</div>

									<div>
										<label className="block text-sm font-semibold text-slate-200 mb-2">Email Address <span className="text-red-400">*</span></label>
										<input
											className={`w-full rounded-lg bg-black/40 border px-4 py-3 text-slate-100 placeholder-slate-500 transition ${emailOk ? 'border-white/10 focus:border-emerald-400/50' : 'border-red-500/50'} focus:outline-none`}
											value={form.email}
											onChange={e => setForm({ ...form, email: e.target.value })}
											placeholder="you@example.com"
											type="email"
										/>
										{!emailOk && form.email && <p className="text-xs text-red-400 mt-1">Please enter a valid email</p>}
										<p className="text-xs text-slate-500 mt-1">We'll send your course access details to this email</p>
									</div>

									<div>
										<label className="block text-sm font-semibold text-slate-200 mb-2">Coupon Code (Optional)</label>
										<input
											className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-emerald-400/50 focus:outline-none transition"
											value={form.coupon}
											onChange={e => setForm({ ...form, coupon: e.target.value })}
											placeholder="e.g., SAVE10"
										/>
										<p className="text-xs text-slate-500 mt-1">Enter a valid coupon code if you have one</p>
									</div>
								</div>

								<div className="mt-8 flex justify-between">
									<button
										className="px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition font-semibold"
										onClick={() => navigate(-1)}
									>
										Cancel
									</button>
									<button
										className={`px-6 py-3 rounded-lg border font-semibold transition ${canContinue ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30 hover:bg-emerald-500/30' : 'bg-white/5 text-slate-400 border-white/10 cursor-not-allowed'}`}
										onClick={startCheckout}
										disabled={!canContinue || submitting}
									>
										{submitting ? 'Processing…' : 'Continue to Payment'}
									</button>
								</div>
							</div>
						)}

						{/* STEP 2: Payment Method Selection */}
						{step === 2 && session && (
							<div className="space-y-6">
								<div className="bg-white/5 border border-white/10 rounded-2xl p-8">
									<h2 className="text-2xl font-bold text-slate-100 mb-6">Select Payment Method</h2>

									{/* Direct UPI/Bank Transfer - WITH ₹50 DISCOUNT */}
									<div
										onClick={() => setSelectedPayment('upi')}
										className={`mb-4 p-6 rounded-xl border-2 cursor-pointer transition ${selectedPayment === 'upi' ? 'bg-emerald-500/10 border-emerald-400' : 'bg-black/30 border-white/10 hover:border-white/20'}`}
									>
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="text-lg font-bold text-slate-100 mb-1">Direct UPI / Bank Transfer</div>
												<p className="text-sm text-slate-300 mb-3">Recommended • Instant verification</p>
												<div className="bg-emerald-500/20 border border-emerald-400/30 rounded-lg p-3 inline-block">
													<span className="text-emerald-300 font-semibold text-sm">💰 ₹50 Extra Discount Applied!</span>
												</div>
											</div>
											<div className="w-6 h-6 rounded-full border-2 flex items-center justify-center" style={{borderColor: selectedPayment === 'upi' ? '#10b981' : '#e2e8f0'}}>
												{selectedPayment === 'upi' && <div className="w-3 h-3 rounded-full bg-emerald-400"></div>}
											</div>
										</div>
										<p className="text-xs text-slate-400 mt-3">Pay via UPI, bank transfer, or scan QR code. Get verified within 1 hour.</p>
									</div>

									{/* PhonePe - GRAYED OUT */}
									<div
										onClick={() => toast.error('PhonePe payment coming soon. Please use Direct UPI/Bank transfer for now.')}
										className="p-6 rounded-xl border-2 bg-slate-600/10 border-slate-600/20 opacity-60 cursor-not-allowed"
									>
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="text-lg font-bold text-slate-400 mb-1">PhonePe</div>
												<p className="text-sm text-slate-500 mb-3">Coming Soon</p>
												<span className="text-xs text-slate-500 bg-slate-600/20 px-2 py-1 rounded">Not Available Yet</span>
											</div>
											<div className="w-6 h-6 rounded-full border-2 border-slate-600/30"></div>
										</div>
										<p className="text-xs text-slate-500 mt-3">We're integrating PhonePe for faster payments. Please use Direct UPI for now.</p>
									</div>

									<div className="mt-6 flex justify-between">
										<button
											className="px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition font-semibold"
											onClick={() => setStep(1)}
										>
											Back
										</button>
										<button
											className="px-6 py-3 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/30 transition font-semibold"
											onClick={() => setStep(3)}
										>
											Continue
										</button>
									</div>
								</div>
							</div>
						)}

						{/* STEP 3: Payment Instructions & Proof */}
						{step === 3 && session && (
							<div className="space-y-6">
								<div className="bg-white/5 border border-white/10 rounded-2xl p-8">
									<h2 className="text-2xl font-bold text-slate-100 mb-6">Complete Payment</h2>

									{/* Payment Instructions */}
									<div className="bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-6 mb-6">
										<h3 className="font-semibold text-emerald-200 mb-4 flex items-center gap-2">
											<ExclamationIcon className="w-5 h-5" /> Payment Instructions
										</h3>
										<ol className="space-y-3 text-sm text-slate-300">
											<li><strong>Step 1:</strong> Copy the UPI ID or scan the QR code below</li>
											<li><strong>Step 2:</strong> Pay ₹{session.amount} from your bank app or UPI</li>
											<li><strong>Step 3:</strong> Copy your Transaction ID / UTR from your bank app</li>
											<li><strong>Step 4:</strong> Paste it below and submit for verification</li>
											<li className="text-emerald-200"><strong>⏱ Access granted within 1 hour</strong></li>
										</ol>
									</div>

									{/* QR & UPI ID */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
										<div>
											<label className="block text-sm font-semibold text-slate-200 mb-3">Scan QR Code</label>
											<div className="bg-black/40 border border-white/10 rounded-lg p-4 aspect-square flex items-center justify-center">
												{session.upi_qr ? (
													<img src={session.upi_qr} alt="UPI QR" className="w-full h-full object-contain rounded" />
												) : (
													<div className="text-slate-500 text-sm text-center">QR Code not available</div>
												)}
											</div>
										</div>

										<div>
											<label className="block text-sm font-semibold text-slate-200 mb-3">Or Copy UPI ID</label>
											<div className="bg-black/40 border border-white/10 rounded-lg p-4 flex flex-col gap-3">
												<div className="font-mono text-lg text-slate-100 break-all">{session.upi_address || 'Not configured'}</div>
												<button
													className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/30 transition font-semibold text-sm"
													onClick={() => copyToClipboard(session.upi_address, 'UPI ID copied!')}
												>
													Copy UPI ID
												</button>
												<p className="text-xs text-slate-500">Session expires: {new Date(session.session_expires_at).toLocaleString()}</p>
											</div>
										</div>
									</div>

									{/* Transaction Verification */}
									<div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
										<h3 className="font-semibold text-slate-200 mb-4">Verify Your Payment</h3>
										<div className="space-y-4">
											<div>
												<label className="block text-sm font-semibold text-slate-200 mb-2">Transaction ID / UTR <span className="text-red-400">*</span></label>
												<div className="flex gap-2">
													<input
														className="flex-1 rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-500 font-mono focus:border-emerald-400/50 focus:outline-none transition"
														placeholder="e.g., 2310151234567890 or UTR123456"
														value={proof.transaction_id}
														onChange={e => setProof({ ...proof, transaction_id: e.target.value })}
													/>
													{proof.transaction_id && (
														<button
															className="px-4 py-3 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/30 transition font-semibold text-sm whitespace-nowrap"
															onClick={() => copyToClipboard(proof.transaction_id, 'Copied')}
														>
															Copy
														</button>
													)}
												</div>
												<p className="text-xs text-slate-500 mt-2">Find this in your bank app transaction details (e.g., "Ref ID" or "UTR")</p>
											</div>

											<div>
												<label className="block text-sm font-semibold text-slate-200 mb-2">Receipt Email (Optional)</label>
												<input
													className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-emerald-400/50 focus:outline-none transition"
													placeholder="your-receipt@email.com"
													value={proof.receipt_email}
													onChange={e => setProof({ ...proof, receipt_email: e.target.value })}
												/>
											</div>
										</div>
									</div>

									{/* WhatsApp Alternative */}
									<div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-6 mb-6">
										<h3 className="font-semibold text-blue-200 mb-3">💬 Need Help? Share on WhatsApp</h3>
										<p className="text-sm text-slate-300 mb-4">Share your payment screenshot on WhatsApp for instant verification within 1 hour</p>
										<div className="flex flex-col gap-3">
											<a
												href={helpWhatsappUrl}
												target="_blank"
												rel="noreferrer"
												className="px-4 py-3 rounded-lg bg-blue-500/20 text-blue-200 border border-blue-400/30 hover:bg-blue-500/30 transition font-semibold text-center"
											>
												💬 Share on WhatsApp
											</a>
											<button
												className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition font-semibold text-sm"
												onClick={() => copyToClipboard(SUPPORT_WA, 'WhatsApp number copied')}
											>
												📋 Copy WhatsApp Number: {SUPPORT_WA}
											</button>
										</div>
									</div>

									<div className="flex justify-between">
										<button
											className="px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition font-semibold"
											onClick={() => setStep(2)}
										>
											Back
										</button>
										<button
											className="px-6 py-3 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/30 transition font-semibold"
											onClick={submitProof}
											disabled={submitting || !proof.transaction_id}
										>
											{submitting ? 'Submitting…' : 'Submit for Verification'}
										</button>
									</div>
								</div>
							</div>
						)}</div>

						{/* Right Sidebar - Order Summary */}
						<aside className="sticky top-8 h-fit">
							{/* Order Summary Card */}
							<div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4">
								<h3 className="text-lg font-bold text-slate-100 mb-4">Order Summary</h3>
								{session ? (
									<div className="space-y-4">
										<div className="flex gap-3">
											<img src={session.thumbnail || '/placeholder-course.png'} alt="course" className="w-16 h-12 rounded object-cover border border-white/10" />
											<div className="flex-1">
												<div className="text-sm font-semibold text-slate-100">{session.course_title}</div>
												<div className="text-xs text-slate-500">MaxSec Academy</div>
											</div>
										</div>

										<div className="border-t border-white/10 pt-4 space-y-2 text-sm">
											<div className="flex justify-between text-slate-300">
												<span>Subtotal</span>
												<span>₹{session.original_amount ?? session.amount}</span>
											</div>
											{session.discount_percent && (
												<div className="flex justify-between text-emerald-300">
													<span>Discount ({session.discount_percent}%)</span>
													<span>-₹{Math.max(0, Number((Number(session.original_amount || 0) - Number(session.amount || 0)).toFixed(2)))}</span>
												</div>
											)}
											{selectedPayment === 'upi' && step >= 2 && (
												<div className="flex justify-between text-emerald-300">
													<span>Extra Discount (UPI)</span>
													<span>-₹50</span>
												</div>
											)}
										</div>

										<div className="border-t border-white/10 pt-4">
											<div className="flex justify-between font-bold text-lg text-slate-100">
												<span>Total</span>
												<span>₹{selectedPayment === 'upi' && step >= 2 ? Math.max(0, session.amount - 50) : session.amount}</span>
											</div>
										</div>

										{selectedPayment === 'upi' && step >= 2 && (
											<div className="bg-emerald-500/10 border border-emerald-400/30 rounded-lg p-3 text-emerald-200 text-xs font-semibold text-center">
												✨ ₹50 discount applied for direct UPI payment!
											</div>
										)}
									</div>
								) : (
									<div className="text-slate-400 text-sm">Enter your details to see pricing</div>
								)}
							</div>

							{/* Security Badge */}
							<div className="bg-white/5 border border-white/10 rounded-2xl p-6">
								<div className="flex items-start gap-3">
									<CheckCircleIcon className="w-5 h-5 text-emerald-400 mt-0.5" />
									<div className="text-xs text-slate-300">
										<strong className="text-slate-100">100% Secure</strong>
										<p className="mt-1">✅ Manual verification by admin</p>
										<p>🔒 No card details stored</p>
										<p>⏱ Access within 1 hour</p>
									</div>
								</div>
							</div>
						</aside>
					</div>
				</div>
			</div>
		</div>
	);
}
			<div className="flex-1 p-6">
				<div className="max-w-6xl mx-auto">
					<div className="mb-5 flex items-end justify-between">
						<div>
							<h1 className="text-xl font-semibold text-slate-100">Checkout</h1>
							<div className="text-xs text-slate-500">Secure manual checkout • UPI/QR • Admin verification</div>
						</div>
						<div className="hidden sm:block text-xs text-slate-500">Need help? Use the WhatsApp card on the right.</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<div className="lg:col-span-2 space-y-6">
					{/* 1. Confirm your details */}
						<div className="bg-white/5 border border-white/10 rounded-2xl p-6">
							<div className="flex items-start gap-3 mb-2">
								<div className="h-7 w-7 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 flex items-center justify-center text-sm font-semibold">1</div>
								<h1 className="text-lg font-semibold text-slate-100">Confirm your details</h1>
							</div>
							<p className="text-sm text-slate-400 mb-6">Enter your name, email, and coupon (optional). Then we’ll show you where to pay.</p>
							<div className="grid grid-cols-1 gap-4">
								<div>
									<label className="block text-xs text-slate-400">Full Name <span className="text-red-400">*</span></label>
									<input
										className={`mt-1 w-full rounded-md bg-black/30 border p-2 text-slate-100 ${nameOk ? 'border-white/10' : 'border-red-500/40'}`}
										value={form.name}
										onChange={e => setForm({ ...form, name: e.target.value })}
										placeholder="Your name"
										aria-invalid={!nameOk}
										aria-describedby="nameHelp"
									/>
									<div id="nameHelp" className="mt-1 text-[11px] text-slate-500">Enter at least 2 characters.</div>
								</div>
								<div>
									<label className="block text-xs text-slate-400">Email <span className="text-red-400">*</span></label>
									<input
										className={`mt-1 w-full rounded-md bg-black/30 border p-2 text-slate-100 ${emailOk ? 'border-white/10' : 'border-red-500/40'}`}
										value={form.email}
										onChange={e => setForm({ ...form, email: e.target.value })}
										placeholder="you@example.com"
										type="email"
										aria-invalid={!emailOk}
										aria-describedby="emailHelp"
									/>
									<div id="emailHelp" className="mt-1 text-[11px] text-slate-500">We’ll send updates to this email.</div>
								</div>
								<div>
									<label className="block text-xs text-slate-400">Coupon (optional)</label>
									<input
										className="mt-1 w-full rounded-md bg-black/30 border border-white/10 p-2 text-slate-100"
										value={form.coupon}
										onChange={e => setForm({ ...form, coupon: e.target.value })}
										placeholder="MS10 for 10% off"
									/>
									<div className="mt-1 text-[11px] text-slate-500">If valid, the discount will be applied automatically.</div>
								</div>
							</div>
							<div className="mt-6 flex justify-end items-center gap-3">
								<button className="px-4 py-2 rounded-md bg-black/30 border border-white/10" onClick={() => navigate(-1)}>Cancel</button>
								<button
									className={`px-4 py-2 rounded-md border ${canContinue ? 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30 hover:bg-emerald-500/25' : 'bg-white/5 text-slate-400 border-white/10 cursor-not-allowed'}`}
									onClick={startCheckout}
									disabled={!canContinue || submitting}
								>
									{submitting ? 'Processing…' : 'Show payment instructions'}
								</button>
							</div>
						</div>

					{/* 2. Pay the amount */}
					{session && (
						<div className="space-y-6">
							{/* Payer confirmation card */}
							<div className="bg-white/5 border border-white/10 rounded-2xl p-6">
								<h2 className="text-lg font-semibold text-slate-100 mb-2">Payer details</h2>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
									<div>
										<div className="text-slate-400">Full name</div>
										<div className="text-slate-200 font-medium">{form.name || '—'}</div>
									</div>
									<div>
										<div className="text-slate-400">Email</div>
										<div className="text-slate-200 font-medium break-all">{form.email || '—'}</div>
									</div>
								</div>
								<div className="mt-4">
									<button className="px-3 py-1.5 rounded-md bg-black/30 border border-white/10 text-xs" onClick={() => setStep(1)}>Edit details</button>
								</div>
							</div>
							<div className="bg-white/5 border border-white/10 rounded-2xl p-6">
								<h2 className="text-lg font-semibold text-slate-100 mb-1">You're paying for</h2>
								<div className="text-slate-300">{session.course_title}</div>
								<div className="mt-2 grid grid-cols-[80px_1fr] gap-4 items-center">
									<img src={session.thumbnail || '/placeholder-course.png'} alt="course" className="w-20 h-14 object-cover rounded border border-white/10" />
									<div className="text-sm text-slate-400">Amount <span className="text-slate-200">₹{session.amount}</span> {session.discount_percent ? <span className="ml-2 text-emerald-300">({session.discount_percent}% off)</span> : null}</div>
								</div>
							</div>

							{/* Payment methods & instructions */}
							<div className="bg-white/5 border border-white/10 rounded-2xl p-6">
								<div className="flex items-start gap-3 mb-2">
									<div className="h-7 w-7 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 flex items-center justify-center text-sm font-semibold">2</div>
									<h3 className="text-lg font-semibold text-slate-100">Pay the amount</h3>
								</div>
								<p className="text-sm text-slate-400">Pay ₹{session.amount} to the UPI ID or scan the QR. Then paste your UTR/transaction ID below.</p>

								{/* Methods row */}
								<div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4">
										<div className="text-sm font-semibold text-emerald-200">UPI / QR (Recommended)</div>
										<p className="text-xs text-emerald-200/80 mt-1">Pay via the QR or UPI ID below, then paste your UTR/transaction ID.</p>
									</div>
									<div className="rounded-xl border border-white/10 bg-white/5 p-4 opacity-70">
										<div className="text-sm font-semibold text-slate-300">PhonePe</div>
										<p className="text-xs text-slate-400 mt-1">Coming soon — meanwhile, please pay using UPI / QR and submit your UTR/transaction ID.</p>
										<button disabled className="mt-3 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs text-slate-400 cursor-not-allowed">PhonePe (coming soon)</button>
									</div>
								</div>

								<p className="text-sm text-slate-400">Scan QR or pay with UPI</p>
								<div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
									<div className="bg-black/30 border border-white/10 rounded-lg p-3 text-center">
										{session.upi_qr ? (
											<img src={session.upi_qr} alt="UPI QR" className="w-full max-w-[240px] mx-auto rounded" />
										) : (
											<div className="text-slate-500 text-sm">QR not configured</div>
										)}
									</div>
									<div className="space-y-2">
										<div className="text-sm text-slate-300">UPI ID</div>
										<div className="flex items-center gap-2">
											<input readOnly className="flex-1 rounded-md bg-black/30 border border-white/10 p-2 text-slate-100 font-mono tracking-wide" value={session.upi_address || 'Not configured'} />
											<button
												className="px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/25 text-xs"
												onClick={() => copyToClipboard(session.upi_address, 'UPI ID copied')}
											>
												Copy
											</button>
										</div>
										<div className="text-[11px] text-slate-500">Session expires: {new Date(session.session_expires_at).toLocaleString()}</div>
									</div>
								</div>
								<div className="mt-4 text-xs text-slate-400">
									<strong className="text-slate-200">How it works</strong>
									<ol className="list-decimal ml-5 mt-1 space-y-1">
										<li>Pay the amount shown to the UPI ID above or scan the QR.</li>
										<li>Copy the reference/UTR from your bank app, or note the receipt email.</li>
										<li>Paste the Transaction/UTR below and submit for verification.</li>
									</ol>
								</div>

								<div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
									<div>
										<label className="block text-xs text-slate-400">Transaction / UTR ID</label>
										<div className="flex items-center gap-2">
											<input
												className="mt-1 w-full rounded-md bg-black/30 border border-white/10 p-2 text-slate-100 font-mono tracking-wider text-base md:text-lg"
												placeholder="e.g., 2310151234567890 or UTR123456"
												value={proof.transaction_id}
												onChange={e => setProof({ ...proof, transaction_id: e.target.value })}
											/>
											{proof.transaction_id ? (
												<button
													className="mt-1 px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/25 text-xs whitespace-nowrap"
													onClick={() => copyToClipboard(proof.transaction_id, 'Transaction ID copied')}
												>
													Copy
												</button>
											) : null}
										</div>
										<div className="text-[11px] text-slate-500 mt-1">Tip: You can usually find the reference/UTR in your bank app’s transaction details.</div>

										{/* Inline WhatsApp alternative */}
										<div className="mt-3 flex items-center flex-wrap gap-2 text-xs text-slate-400">
											<span className="opacity-70">or</span>
											<a
												href={helpWhatsappUrl || '#'}
												target="_blank"
												rel="noreferrer"
												className={`px-3 py-1.5 rounded-md border ${helpWhatsappUrl ? 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30 hover:bg-emerald-500/25' : 'bg-white/5 text-slate-400 border-white/10 cursor-not-allowed'}`}
											>
												Send payment proof on WhatsApp {SUPPORT_WA ? `(+${SUPPORT_WA})` : ''}
											</a>
											<button
												className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-slate-200"
												onClick={() => copyToClipboard(SUPPORT_WA, 'WhatsApp number copied')}
												disabled={!SUPPORT_WA}
											>
												Copy number
											</button>
										</div>
									</div>
									<div>
										<label className="block text-xs text-slate-400">Receipt Email (optional)</label>
										<input className="mt-1 w-full rounded-md bg-black/30 border border-white/10 p-2 text-slate-100" placeholder="you@payemail.com" value={proof.receipt_email} onChange={e => setProof({ ...proof, receipt_email: e.target.value })} />
									</div>
								</div>

								<div className="mt-6 flex justify-between">
									<button className="px-4 py-2 rounded-md bg-black/30 border border-white/10" onClick={() => setStep(1)}>Back</button>
									<div className="flex gap-3">
										<button className="px-4 py-2 rounded-md bg-black/30 border border-white/10" onClick={() => navigate(-1)}>Cancel</button>
										<button className="px-4 py-2 rounded-md bg-emerald-500/15 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/25" onClick={submitProof} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit for verification'}</button>
									</div>
								</div>
							</div>

							{/* Removed separate step 3 card; WhatsApp option shown inline next to Transaction ID */}

							
						</div>
					)}
					</div>

					{/* Sidebar: sticky order summary and help */}
					<aside className="space-y-4">
						<div className="sticky top-4 space-y-4">
							<div className="bg-white/5 border border-white/10 rounded-2xl p-5">
								<h3 className="text-sm font-semibold text-slate-100 mb-3">Order summary</h3>
								{session ? (
									<>
										<div className="flex items-center gap-3">
											<img src={session.thumbnail || '/placeholder-course.png'} alt="course" className="h-12 w-12 rounded object-cover border border-white/10" />
											<div className="min-w-0">
												<div className="text-slate-200 text-sm font-medium truncate">{session.course_title}</div>
												<div className="text-[11px] text-slate-500">INR</div>
											</div>
										</div>
										<div className="mt-3 text-sm text-slate-300 flex items-center justify-between">
											<span>Subtotal</span>
											<span>₹{session.original_amount ?? session.amount}</span>
										</div>
										{session.discount_percent ? (
											<div className="text-sm text-emerald-200 flex items-center justify-between">
												<span>Discount ({session.discount_percent}%)</span>
												<span>-₹{Math.max(0, Number((Number(session.original_amount || 0) - Number(session.amount || 0)).toFixed(2)))}</span>
											</div>
										) : null}
										<div className="border-t border-white/10 my-3"></div>
										<div className="text-sm text-slate-100 flex items-center justify-between font-semibold">
											<span>Total</span>
											<span>₹{session.amount}</span>
										</div>
										<div className="mt-2 text-[11px] text-slate-500">Payment method: Manual UPI (PhonePe coming soon)</div>
									</>
								) : (
									<div className="text-sm text-slate-400">Apply your coupon to see your total.</div>
								)}
							</div>

							<div className="bg-white/5 border border-white/10 rounded-2xl p-5">
								<h4 className="text-sm font-semibold text-slate-100 mb-1">Need help?</h4>
								<p className="text-xs text-slate-400">Share a screenshot on WhatsApp for quicker review.</p>
								<div className="mt-2 flex items-center gap-2">
									<button
										className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs text-slate-200"
										onClick={() => copyToClipboard(SUPPORT_WA, 'WhatsApp number copied')}
										disabled={!SUPPORT_WA}
									>
										Copy WhatsApp
									</button>
									<a
										href={helpWhatsappUrl || '#'}
										target="_blank"
										rel="noreferrer"
										className={`px-3 py-1.5 rounded-md border text-xs ${helpWhatsappUrl ? 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30 hover:bg-emerald-500/25' : 'bg-white/5 text-slate-400 border-white/10 cursor-not-allowed'}`}
									>
										Open WhatsApp
									</a>
								</div>
								<div className="mt-2 text-[11px] text-slate-500">Include your name, course, amount, and transaction ID.</div>
							</div>

