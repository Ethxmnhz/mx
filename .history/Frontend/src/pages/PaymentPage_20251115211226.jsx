import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, BanknotesIcon, CommandLineIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';

export default function PaymentPage() {
	const { courseId } = useParams();
	const navigate = useNavigate();
	const [step, setStep] = useState(1); // 1: Details | 2: Payment Method | 3: Payment Submission
	const [submitting, setSubmitting] = useState(false);
	const [session, setSession] = useState(null);
	const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('direct'); // 'direct' or 'phonepe'
	const [form, setForm] = useState({ name: '', email: '', coupon: '' });
	const [proof, setProof] = useState({ transaction_id: '' });

	// Validation
	const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
	const nameOk = String(form.name || '').trim().length >= 2;
	const emailOk = isValidEmail(form.email);
	const canContinue = nameOk && emailOk;

	// Config
	const API_BASE = (import.meta?.env?.VITE_API_URL || window?.VITE_API_URL || '').replace(/\/$/, '');
	const SUPPORT_WA = '7039108259'; // Direct WhatsApp number

	// Calculate pricing
	const directPaymentDiscount = session ? 50 : 0;
	const finalAmount = session ? Math.max(session.amount - directPaymentDiscount, 0) : 0;

	const paymentWhatsappUrl = useMemo(() => {
		if (!SUPPORT_WA) return '';
		const msg = encodeURIComponent(
			`Hi MaxSec Academy Support! 👋%0A%0A` +
			`I have completed payment for ${session?.course_title || 'MJPT Course'}%0A` +
			`Name: ${form.name || 'N/A'}%0A` +
			`Email: ${form.email || 'N/A'}%0A` +
			`Transaction ID/UTR: ${proof.transaction_id || 'Attaching screenshot'}%0A%0A` +
			`Amount: ₹${selectedPaymentMethod === 'direct' ? finalAmount : session?.amount}%0A` +
			`Payment Method: ${selectedPaymentMethod === 'direct' ? 'Direct UPI/Bank Transfer' : 'PhonePe'}%0A%0A` +
			`Please verify my payment and grant access. 🙏`
		);
		return `https://wa.me/${SUPPORT_WA}?text=${msg}`;
	}, [SUPPORT_WA, session, form, proof, selectedPaymentMethod, finalAmount]);

	// Copy to clipboard
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

	// Auto-fill user details
	useEffect(() => {
		try {
			const u = JSON.parse(localStorage.getItem('user') || '{}');
			setForm((prev) => ({
				...prev,
				name: prev.name || u.full_name || '',
				email: prev.email || u.email || ''
			}));
		} catch {}
	}, [courseId]);

	// Step 1: Start checkout
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

	// Step 3: Submit payment proof
	const submitProof = async () => {
		if (!proof.transaction_id || proof.transaction_id.trim() === '') {
			toast.error('Please enter your transaction ID/UTR number');
			return;
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
					transaction_id: proof.transaction_id,
					payment_method: selectedPaymentMethod === 'direct' ? 'UPI' : 'PhonePe',
					coupon: form.coupon || undefined,
					amount_paid: finalAmount
				})
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				toast.error(data.message || 'Failed to submit payment');
				return;
			}
			toast.success('Payment submitted! We\'ll verify within an hour.');
			setTimeout(() => navigate('/my-learning'), 1500);
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
				<div className="max-w-5xl mx-auto">
					{/* Progress indicator */}
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-slate-100 mb-2">Secure Checkout</h1>
						<p className="text-sm text-slate-400">Complete your enrollment in 3 simple steps</p>
						
						{/* Step indicator */}
						<div className="mt-6 flex items-center justify-start gap-4">
							<div className={`flex items-center gap-2 ${step >= 1 ? 'opacity-100' : 'opacity-50'}`}>
								<div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm ${step === 1 ? 'bg-emerald-500/20 border-2 border-emerald-400' : step > 1 ? 'bg-emerald-500/40 border-2 border-emerald-400' : 'bg-white/5 border-2 border-white/10'} ${step >= 1 ? 'text-emerald-200' : 'text-slate-400'}`}>
									{step > 1 ? <CheckCircleIcon className="h-6 w-6" /> : '1'}
								</div>
								<div className="text-sm font-medium text-slate-300">Your Details</div>
							</div>
							
							<div className={`h-1 w-12 ${step > 1 ? 'bg-emerald-500/40' : 'bg-white/10'}`}></div>
							
							<div className={`flex items-center gap-2 ${step >= 2 ? 'opacity-100' : 'opacity-50'}`}>
								<div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm ${step === 2 ? 'bg-emerald-500/20 border-2 border-emerald-400' : step > 2 ? 'bg-emerald-500/40 border-2 border-emerald-400' : 'bg-white/5 border-2 border-white/10'} ${step >= 2 ? 'text-emerald-200' : 'text-slate-400'}`}>
									{step > 2 ? <CheckCircleIcon className="h-6 w-6" /> : '2'}
								</div>
								<div className="text-sm font-medium text-slate-300">Payment Method</div>
							</div>
							
							<div className={`h-1 w-12 ${step > 2 ? 'bg-emerald-500/40' : 'bg-white/10'}`}></div>
							
							<div className={`flex items-center gap-2 ${step >= 3 ? 'opacity-100' : 'opacity-50'}`}>
								<div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm ${step === 3 ? 'bg-emerald-500/20 border-2 border-emerald-400' : 'bg-white/5 border-2 border-white/10'} ${step >= 3 ? 'text-emerald-200' : 'text-slate-400'}`}>
									3
								</div>
								<div className="text-sm font-medium text-slate-300">Submit Payment</div>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<div className="lg:col-span-2 space-y-6">
							{/* STEP 1: USER DETAILS */}
							{step === 1 && (
								<div className="bg-white/5 border border-white/10 rounded-2xl p-8">
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

							<div className="bg-white/5 border border-white/10 rounded-2xl p-5">
								<div className="text-[11px] text-slate-500">✅ Manual verification by admin • 🔒 We never store card details • ⏱ Access usually granted within a few hours</div>
							</div>
						</div>
					</aside>
					</div>
				</div>
			</div>
		</div>
	);
}

