import { useEffect, useMemo, useState } from 'react';
import { ChatBubbleOvalLeftIcon, BanknotesIcon, CreditCardIcon, QrCodeIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/solid';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';

// Two-step manual checkout: 1) collect name/email/coupon 2) show UPI instructions and submit proof
export default function PaymentPage() {
	const { courseId } = useParams();
	const navigate = useNavigate();
	const [step, setStep] = useState(1);
	const [method, setMethod] = useState('DIRECT'); // DIRECT or PHONEPE
	const [phonePeLoading, setPhonePeLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [session, setSession] = useState(null);
	const [form, setForm] = useState({ name: '', email: '', coupon: '' });
	const [proof, setProof] = useState({ transaction_id: '', receipt_email: '' });
	// Simple validation for Step 1
	const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
	const nameOk = String(form.name || '').trim().length >= 2;
	const emailOk = isValidEmail(form.email);
	const canContinue = nameOk && emailOk;

	// Config and helpers
	const API_BASE = (import.meta?.env?.VITE_API_URL || window?.VITE_API_URL || '').replace(/\/$/, '');
	// Default to +91 7039108259 if env is not set
	const SUPPORT_WA = ((import.meta?.env?.VITE_SUPPORT_WHATSAPP || import.meta?.env?.VITE_WHATSAPP_NUMBER || '917039108259'))
		.toString()
		.replace(/[^0-9]/g, '');

	const DEFAULT_DIRECT_DISCOUNT = Number(import.meta?.env?.VITE_DIRECT_UPI_EXTRA_DISCOUNT ?? 50);
	const directDiscount = Number(session?.direct_upi_extra_discount ?? DEFAULT_DIRECT_DISCOUNT) || 0;
	const baseAmountBeforeDirect = Number(session?.base_amount_before_direct_discount ?? session?.amount ?? 0) || 0;
	const couponSavings = Math.max(0, Number(((Number(session?.original_amount || 0) || 0) - baseAmountBeforeDirect).toFixed(2)));
	const finalManualAmount = (() => {
		const raw = session?.amount;
		const asNumber = raw !== undefined && raw !== null ? Number(raw) : NaN;
		if (Number.isFinite(asNumber)) return Math.max(0, asNumber);
		return Math.max(0, baseAmountBeforeDirect - directDiscount);
	})();
	const payable = useMemo(() => (method === 'DIRECT' ? finalManualAmount : baseAmountBeforeDirect), [method, finalManualAmount, baseAmountBeforeDirect]);

	const helpWhatsappUrl = useMemo(() => {
		if (!SUPPORT_WA) return '';
		const msg = encodeURIComponent(
			`Hello MaxSec Academy Support,%0A%0A` +
			`I have completed a payment and would like to share proof for verification.%0A` +
			`Course: ${session?.course_title || 'N/A'}%0A` +
			`Amount: ₹${session ? payable : ''}%0A` +
			`Name: ${form.name || ''}%0A` +
			`Email: ${form.email || ''}%0A` +
			`${session?.checkout?.coupon ? `Coupon: ${session.checkout.coupon}%0A` : ''}` +
			`Payment Method: ${method === 'DIRECT' ? 'Direct UPI/Bank' : 'PhonePe'}%0A` +
			`Transaction/UTR (if available): ${proof.transaction_id || ''}%0A%0A` +
			`Attaching screenshot…`
		);
		return `https://wa.me/${SUPPORT_WA}?text=${msg}`;
	}, [SUPPORT_WA, session, form, proof, method, payable]);

	// Quick helper to copy text to clipboard with graceful fallback
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
		// Prefill name/email from stored user to make it quicker
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
			return toast.error('Provide transaction ID or receipt email');
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
					...proof,
					payment_method: method === 'DIRECT' ? 'UPI' : 'PHONEPE',
					coupon: session?.checkout?.coupon || undefined
				})
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				toast.error(data.message || 'Failed to submit payment');
				return;
			}
			toast.success('Payment submitted. We will verify and grant access within an hour.');
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
				<div className="max-w-6xl mx-auto">
					<div className="mb-5 flex items-end justify-between">
						<div>
							<h1 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
								Secure Checkout
								<span className="inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-200">
									Save ₹{directDiscount} with UPI
								</span>
							</h1>
							<div className="text-xs text-slate-500">Multiple payment options • Instant verification</div>
						</div>
						<div className="hidden sm:block text-xs text-slate-500">Questions? Contact support via WhatsApp</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<div className="lg:col-span-2 space-y-6">
					{/* 1. Confirm your details */}
						<div className="bg-white/5 border border-white/10 rounded-2xl p-6">
							<div className="flex items-start gap-3 mb-2">
								<div className="h-7 w-7 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 flex items-center justify-center text-sm font-semibold">1</div>
								<h1 className="text-lg font-semibold text-slate-100">Your Information</h1>
							</div>
							<p className="text-sm text-slate-400 mb-6">Enter your details to proceed to payment</p>
							<div className="grid grid-cols-1 gap-4">
								<div>
									<label className="block text-xs text-slate-400 font-medium mb-1">Full Name <span className="text-red-400">*</span></label>
									<input
										className={`w-full rounded-lg bg-black/30 border p-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${nameOk ? 'border-white/10' : 'border-red-500/40'}`}
										value={form.name}
										onChange={e => setForm({ ...form, name: e.target.value })}
										placeholder="John Doe"
										aria-invalid={!nameOk}
									/>
								</div>
								<div>
									<label className="block text-xs text-slate-400 font-medium mb-1">Email Address <span className="text-red-400">*</span></label>
									<input
										className={`w-full rounded-lg bg-black/30 border p-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${emailOk ? 'border-white/10' : 'border-red-500/40'}`}
										value={form.email}
										onChange={e => setForm({ ...form, email: e.target.value })}
										placeholder="you@example.com"
										type="email"
										aria-invalid={!emailOk}
									/>
									<div className="mt-1.5 text-[11px] text-slate-500">Course access link will be sent to this email</div>
								</div>
								<div>
									<label className="block text-xs text-slate-400 font-medium mb-1">Coupon Code <span className="text-slate-500">(Optional)</span></label>
									<input
										className="w-full rounded-lg bg-black/30 border border-white/10 p-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 uppercase"
										value={form.coupon}
										onChange={e => setForm({ ...form, coupon: e.target.value.toUpperCase() })}
										placeholder="Enter discount code"
									/>
									<div className="mt-1.5 text-[11px] text-slate-500">Discounts applied automatically at checkout</div>
								</div>
							</div>
							<div className="mt-6 flex justify-end items-center gap-3">
								<button className="px-4 py-2 rounded-lg bg-black/30 border border-white/10 hover:bg-black/50 transition-colors text-sm" onClick={() => navigate(-1)}>Cancel</button>
								<button
									className={`px-5 py-2.5 rounded-lg border font-medium text-sm transition-all ${canContinue ? 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/25' : 'bg-white/5 text-slate-400 border-white/10 cursor-not-allowed'}`}
									onClick={startCheckout}
									disabled={!canContinue || submitting}
								>
									{submitting ? 'Processing…' : 'Continue to Payment'}
								</button>
							</div>
						</div>

					{/* 2. Pay the amount */}
					{session && (
						<div className="space-y-6">
							{/* Payer confirmation card */}
							<div className="bg-white/5 border border-white/10 rounded-2xl p-6">
								<h2 className="text-base font-semibold text-slate-100 mb-3 flex items-center gap-2">
									<svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
									Billing Information
								</h2>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
									<div className="bg-black/20 rounded-lg p-3">
										<div className="text-slate-500 text-xs mb-1">Name</div>
										<div className="text-slate-100 font-medium">{form.name || '—'}</div>
									</div>
									<div className="bg-black/20 rounded-lg p-3">
										<div className="text-slate-500 text-xs mb-1">Email</div>
										<div className="text-slate-100 font-medium break-all">{form.email || '—'}</div>
									</div>
								</div>
								<button className="mt-3 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs transition-colors" onClick={() => setStep(1)}>
									Edit Information
								</button>
							</div>
							<div className="bg-white/5 border border-white/10 rounded-2xl p-6">
								<h2 className="text-lg font-semibold text-slate-100 mb-1">You're paying for</h2>
								<div className="text-slate-300">{session.course_title}</div>
								<div className="mt-2 grid grid-cols-[80px_1fr] gap-4 items-center">
									<img src={session.thumbnail || '/placeholder-course.png'} alt="course" className="w-20 h-14 object-cover rounded border border-white/10" />
									<div className="text-sm text-slate-400">Amount <span className="text-slate-200">₹{method === 'DIRECT' ? payable : baseAmountBeforeDirect}</span> {session.discount_percent ? <span className="ml-2 text-emerald-300">({session.discount_percent}% off)</span> : null}</div>
								</div>
							</div>

							{/* Payment methods & instructions */}
							<div className="bg-white/5 border border-white/10 rounded-2xl p-6">
								<div className="flex items-start gap-3 mb-4">
									<div className="h-7 w-7 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 flex items-center justify-center text-sm font-semibold">2</div>
									<div>
										<h3 className="text-lg font-semibold text-slate-100">Choose Payment Method</h3>
										<p className="text-sm text-slate-400 mt-0.5">Select your preferred payment option</p>
									</div>
								</div>

								{/* Discount Banner */}
								{session && method === 'DIRECT' && (
									<div className="mb-4 rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-4">
										<div className="flex items-start gap-3">
											<BanknotesIcon className="h-5 w-5 text-emerald-300 flex-shrink-0 mt-0.5" />
											<div className="text-sm">
												<div className="text-emerald-100 font-semibold mb-1">Direct UPI Discount Applied!</div>
												<div className="text-slate-300">
													<span className="line-through opacity-70">₹{baseAmountBeforeDirect}</span>
													<span className="mx-2">→</span>
													<span className="text-emerald-200 font-bold text-lg">₹{payable}</span>
													<span className="ml-2 text-emerald-300">(Save ₹{directDiscount})</span>
												</div>
											</div>
										</div>
									</div>
								)}

								{/* Payment Method Selection */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
									{/* UPI Direct Payment */}
									<button
										type="button"
										onClick={() => setMethod('DIRECT')}
										className={`text-left rounded-xl border p-5 transition-all ${method === 'DIRECT' ? 'border-emerald-400/60 bg-emerald-500/15 ring-2 ring-emerald-500/30' : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'}`}
									>
										<div className="flex items-start gap-3">
											<div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-400/30">
												<QrCodeIcon className="h-6 w-6 text-emerald-300" />
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-1">
													<div className="text-sm font-semibold text-slate-100">UPI / QR Code</div>
													<span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-200 border border-emerald-400/30">
														SAVE ₹{directDiscount}
													</span>
												</div>
												<div className="text-xs text-slate-400 mb-2">Google Pay • PhonePe • Paytm • Any UPI App</div>
												<div className="text-xs text-emerald-300 font-medium">✓ Instant discount applied</div>
											</div>
										</div>
									</button>

									{/* PhonePe Gateway */}
									<button
										type="button"
										onClick={() => setMethod('PHONEPE')}
										className={`text-left rounded-xl border p-5 transition-all ${method === 'PHONEPE' ? 'border-indigo-400/60 bg-indigo-500/15 ring-2 ring-indigo-500/30' : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'}`}
									>
										<div className="flex items-start gap-3">
											<div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-400/30">
												<DevicePhoneMobileIcon className="h-6 w-6 text-indigo-300" />
											</div>
											<div className="flex-1 min-w-0">
												<div className="text-sm font-semibold text-slate-100 mb-1 flex items-center gap-2">
													PhonePe Gateway
													<svg className="w-4 h-4 text-indigo-300" fill="currentColor" viewBox="0 0 24 24">
														<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
													</svg>
												</div>
												<div className="text-xs text-slate-400 mb-2">Credit/Debit Cards • UPI • Net Banking</div>
												<div className="text-xs text-indigo-300 font-medium">✓ Automated instant access</div>
											</div>
										</div>
									</button>
								</div>

								{method === 'DIRECT' && (
									<>
										<div className="bg-indigo-500/5 border border-indigo-400/20 rounded-xl p-4 mb-4">
											<div className="flex items-start gap-3">
												<svg className="w-5 h-5 text-indigo-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
												<div className="text-xs text-slate-300">
													<span className="font-semibold text-slate-100">How to pay:</span> Scan the QR code or use the UPI ID below with any UPI app. After payment, enter your transaction ID for verification.
												</div>
											</div>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
											{/* QR Code */}
											<div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-4">
												<div className="flex items-center gap-2 mb-3">
													<QrCodeIcon className="h-5 w-5 text-emerald-300" />
													<span className="text-sm font-semibold text-slate-100">Scan QR Code</span>
												</div>
												{session.upi_qr ? (
													<div className="bg-white rounded-lg p-3 shadow-lg">
														<img src={session.upi_qr} alt="UPI QR" className="w-full max-w-[200px] mx-auto rounded" />
													</div>
												) : (
													<div className="text-slate-500 text-sm text-center py-8 bg-black/20 rounded-lg">QR code not available</div>
												)}
												<div className="mt-3 text-[11px] text-slate-400 text-center">
													Use Google Pay, PhonePe, Paytm or any UPI app
												</div>
											</div>

											{/* UPI ID */}
											<div className="space-y-3">
												<div>
													<div className="flex items-center gap-2 mb-2">
														<DevicePhoneMobileIcon className="h-5 w-5 text-emerald-300" />
														<span className="text-sm font-semibold text-slate-100">Pay via UPI ID</span>
													</div>
													<div className="flex items-center gap-2">
														<input 
															readOnly 
															className="flex-1 rounded-lg bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border border-emerald-400/30 p-3 text-slate-100 font-mono text-sm tracking-wide cursor-pointer select-all" 
															value={session.upi_address || 'Not configured'} 
															onClick={(e) => e.target.select()}
														/>
														<button
															className="px-3 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white border-0 transition-colors shadow-lg shadow-emerald-500/25"
															onClick={() => copyToClipboard(session.upi_address, 'UPI ID copied')}
														>
															<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
															</svg>
														</button>
													</div>
												</div>

												<div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-3">
													<div className="text-xs text-yellow-200 font-medium mb-1">⚡ Amount to Pay</div>
													<div className="text-2xl font-bold text-yellow-100">₹{payable}</div>
												</div>

												<div className="text-[11px] text-slate-500 space-y-1">
													<div>• Session valid until: {new Date(session.session_expires_at).toLocaleTimeString()}</div>
													<div>• Need bank transfer? Contact us on WhatsApp</div>
												</div>
											</div>
										</div>
									</>
								)}
								{method === 'PHONEPE' && (
									<div className="rounded-xl border border-indigo-400/40 bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 p-5">
										<div className="flex items-start gap-3 mb-4">
											<div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-400/30">
												<CreditCardIcon className="h-6 w-6 text-indigo-300" />
											</div>
											<div className="flex-1">
												<div className="text-base font-semibold text-slate-100 mb-1">PhonePe Secure Payment</div>
												<div className="text-xs text-slate-400">Pay securely with multiple payment options</div>
											</div>
										</div>

										<div className="bg-black/20 rounded-lg p-4 mb-4">
											<div className="grid grid-cols-3 gap-3 text-center text-xs">
												<div className="bg-white/5 rounded-lg p-2 border border-white/10">
													<DevicePhoneMobileIcon className="h-5 w-5 text-indigo-300 mx-auto mb-1" />
													<div className="text-slate-300">UPI Apps</div>
												</div>
												<div className="bg-white/5 rounded-lg p-2 border border-white/10">
													<CreditCardIcon className="h-5 w-5 text-indigo-300 mx-auto mb-1" />
													<div className="text-slate-300">Cards</div>
												</div>
												<div className="bg-white/5 rounded-lg p-2 border border-white/10">
													<BanknotesIcon className="h-5 w-5 text-indigo-300 mx-auto mb-1" />
													<div className="text-slate-300">Net Banking</div>
												</div>
											</div>
										</div>

										<div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
											<svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
											</svg>
											<span>Instant course access after successful payment</span>
										</div>

										<button
											onClick={async () => {
												try {
													setPhonePeLoading(true);
													const token = localStorage.getItem('token');
													const res = await fetch(`${API_BASE}/api/payments/phonepe/initiate/${courseId}`, {
														method: 'POST',
														headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
														body: JSON.stringify({ coupon: session?.checkout?.coupon || undefined })
													});
													const data = await res.json().catch(() => ({}));
													if (!res.ok) {
														toast.error(data.message || 'Failed to create payment session');
														return;
													}
													if (data.payPageUrl) {
														window.location.href = data.payPageUrl;
													} else {
														toast.error('Unable to redirect to payment gateway');
													}
												} catch (e) {
													toast.error('Payment initiation failed');
												} finally {
													setPhonePeLoading(false);
												}
											}}
											className={`w-full px-6 py-3.5 rounded-lg text-sm font-semibold border transition-all flex items-center justify-center gap-2 ${phonePeLoading ? 'bg-white/5 text-slate-400 border-white/10 cursor-not-allowed' : 'bg-indigo-500 text-white border-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/30'}`}
											disabled={phonePeLoading}
										>
											{phonePeLoading ? (
												<>
													<svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
														<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
														<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
													</svg>
													<span>Redirecting to Payment Gateway...</span>
												</>
											) : (
												<>
													<CreditCardIcon className="h-5 w-5" />
													<span>Proceed to Checkout - ₹{baseAmountBeforeDirect}</span>
												</>
											)}
										</button>
										
										<div className="mt-3 text-[11px] text-slate-500 text-center">
											Secured by PhonePe • 256-bit SSL encryption
										</div>
									</div>
								)}
								{method === 'DIRECT' && (
								<div className="mt-6 bg-black/20 border border-white/10 rounded-xl p-5">
									<div className="flex items-start gap-3 mb-4">
										<div className="h-7 w-7 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-200 flex items-center justify-center text-sm font-semibold flex-shrink-0">3</div>
										<div>
											<h4 className="text-base font-semibold text-slate-100">Submit Payment Proof</h4>
											<p className="text-xs text-slate-400 mt-1">Enter your transaction details for verification</p>
										</div>
									</div>

									<div className="bg-indigo-500/5 border border-indigo-400/20 rounded-lg p-3 mb-4 text-xs text-slate-300">
										<div className="flex items-start gap-2">
											<svg className="w-4 h-4 text-indigo-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											<div>
												<span className="font-semibold text-slate-100">Where to find your Transaction ID:</span>
												<div className="mt-1">Open your UPI app → Payment History → Select this payment → Copy the UTR/Reference number</div>
											</div>
										</div>
									</div>

									<div className="space-y-4">
										<div>
											<label className="block text-xs font-medium text-slate-300 mb-2">
												Transaction ID / UTR Number <span className="text-red-400">*</span>
											</label>
											<div className="flex gap-2">
												<input
													className="flex-1 rounded-lg bg-black/40 border border-white/20 p-3 text-slate-100 font-mono text-sm tracking-wider placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent"
													placeholder="e.g., 234567890123"
													value={proof.transaction_id}
													onChange={e => setProof({ ...proof, transaction_id: e.target.value })}
												/>
												{proof.transaction_id && (
													<button
														className="px-3 rounded-lg bg-emerald-500/15 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/25 transition-colors"
														onClick={() => copyToClipboard(proof.transaction_id, 'Copied!')}
													>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
														</svg>
													</button>
												)}
											</div>
										</div>

										<div>
											<label className="block text-xs font-medium text-slate-400 mb-2">
												Payment Receipt Email <span className="text-slate-600">(Optional)</span>
											</label>
											<input 
												className="w-full rounded-lg bg-black/40 border border-white/10 p-3 text-slate-100 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
												placeholder="Optional: receipt email from your bank" 
												value={proof.receipt_email} 
												onChange={e => setProof({ ...proof, receipt_email: e.target.value })} 
											/>
										</div>

										<div className="bg-emerald-500/10 border border-emerald-400/30 rounded-lg p-3">
											<div className="flex items-start gap-2 text-xs text-emerald-200">
												<svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
												</svg>
												<div>
													<span className="font-semibold">Alternative:</span> Send your payment screenshot via WhatsApp for instant verification
												</div>
											</div>
										</div>

										<div className="flex items-center gap-3">
											<a
												href={helpWhatsappUrl || '#'}
												target="_blank"
												rel="noreferrer"
												className={`flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium inline-flex items-center justify-center gap-2 transition-all ${helpWhatsappUrl ? 'bg-green-600 hover:bg-green-700 text-white border-green-600 shadow-lg shadow-green-600/25' : 'bg-white/5 text-slate-400 border-white/10 cursor-not-allowed'}`}
											>
												<ChatBubbleOvalLeftIcon className="h-4 w-4" />
												<span>Send via WhatsApp</span>
											</a>
										</div>
									</div>

									<div className="mt-6 pt-5 border-t border-white/10 flex justify-between items-center">
										<button 
											className="px-4 py-2 rounded-lg bg-black/30 border border-white/10 hover:bg-black/50 text-sm transition-colors" 
											onClick={() => setStep(1)}
										>
											← Back
										</button>
										<button 
											className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${(!proof.transaction_id && !proof.receipt_email) || submitting ? 'bg-white/5 text-slate-400 border border-white/10 cursor-not-allowed' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25'}`}
											onClick={submitProof} 
											disabled={(!proof.transaction_id && !proof.receipt_email) || submitting}
										>
											{submitting ? (
												<span className="flex items-center gap-2">
													<svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
														<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
														<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
													</svg>
													<span>Verifying...</span>
												</span>
											) : 'Submit for Verification'}
										</button>
									</div>
								</div>
								)}
							</div>
						</div>
					)}
					</div>

					{/* Sidebar: sticky order summary and help */}
					<aside className="space-y-4">
						<div className="sticky top-4 space-y-4">
							<div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
								<h3 className="text-sm font-semibold text-slate-100 mb-4 flex items-center gap-2">
									<svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
									Order Summary
								</h3>
								{session ? (
									<>
										<div className="flex items-center gap-3 pb-4 border-b border-white/10">
											<img src={session.thumbnail || '/placeholder-course.png'} alt="course" className="h-16 w-16 rounded-lg object-cover border border-white/20 shadow-lg" />
											<div className="min-w-0 flex-1">
												<div className="text-slate-100 text-sm font-semibold line-clamp-2">{session.course_title}</div>
												<div className="text-[11px] text-slate-500 mt-0.5">Digital Course Access</div>
											</div>
										</div>
										<div className="mt-4 space-y-2 text-sm">
											<div className="flex items-center justify-between text-slate-300">
												<span>Course Price</span>
												<span className="font-medium">₹{Number(session.original_amount ?? baseAmountBeforeDirect)}</span>
											</div>
											{couponSavings > 0 && (
												<div className="flex items-center justify-between text-emerald-300">
													<span className="flex items-center gap-1">
														<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
															<path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
															<path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
														</svg>
														Coupon {session.discount_percent ? `(${session.discount_percent}%)` : ''}
													</span>
													<span className="font-medium">-₹{couponSavings}</span>
												</div>
											)}
											{method === 'DIRECT' && directDiscount > 0 && (
												<div className="flex items-center justify-between text-emerald-300">
													<span className="flex items-center gap-1">
														<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
															<path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
														</svg>
														UPI Discount
													</span>
													<span className="font-medium">-₹{directDiscount}</span>
												</div>
											)}
										</div>
										<div className="border-t border-white/10 my-4"></div>
										<div className="flex items-center justify-between text-base font-bold">
											<span className="text-slate-100">Total Amount</span>
											<span className="text-emerald-400">₹{payable}</span>
										</div>
										<div className="mt-3 px-3 py-2 bg-indigo-500/10 border border-indigo-400/20 rounded-lg">
											<div className="text-[11px] text-indigo-200 flex items-center gap-1.5">
												<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
												</svg>
												<span className="font-medium">{method === 'DIRECT' ? 'Direct UPI Payment' : 'PhonePe Gateway'}</span>
											</div>
										</div>
									</>
								) : (
									<div className="text-sm text-slate-400 text-center py-8">
										Complete step 1 to view pricing
									</div>
								)}
							</div>

							<div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-400/30 rounded-2xl p-5">
								<h4 className="text-sm font-semibold text-emerald-100 mb-2 flex items-center gap-2">
									<ChatBubbleOvalLeftIcon className="h-4 w-4" />
									Need Help?
								</h4>
								<p className="text-xs text-slate-300 mb-3">Send your payment screenshot via WhatsApp for instant support</p>
								<div className="space-y-2">
									<a
										href={helpWhatsappUrl || '#'}
										target="_blank"
										rel="noreferrer"
										className={`w-full px-4 py-2.5 rounded-lg border text-sm font-medium inline-flex items-center justify-center gap-2 transition-all ${helpWhatsappUrl ? 'bg-green-600 hover:bg-green-700 text-white border-green-600 shadow-lg shadow-green-600/25' : 'bg-white/5 text-slate-400 border-white/10 cursor-not-allowed'}`}
									>
										<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
											<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
										</svg>
										Chat on WhatsApp
									</a>
									<button
										className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-sm transition-colors text-slate-300"
										onClick={() => copyToClipboard(SUPPORT_WA, 'Phone number copied')}
										disabled={!SUPPORT_WA}
									>
										Copy Phone Number
									</button>
								</div>
								<div className="mt-3 text-[10px] text-slate-400 leading-relaxed">
									We verify payments and grant access within 1 hour during business hours
								</div>
							</div>

							<div className="bg-white/5 border border-white/10 rounded-2xl p-4">
								<div className="text-[11px] text-slate-400 space-y-2">
									<div className="flex items-center gap-2">
										<svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
										</svg>
										<span>Secure payment processing</span>
									</div>
									<div className="flex items-center gap-2">
										<svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
										</svg>
										<span>Instant course access</span>
									</div>
									<div className="flex items-center gap-2">
										<svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
										</svg>
										<span>Lifetime access to content</span>
									</div>
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

