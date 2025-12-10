// BACKUP FILE - Contains complete manual payment code
// This file preserves the manual UPI payment implementation
// To restore: copy the relevant sections back to PaymentPage.jsx

// ============================================
// MANUAL PAYMENT UI SECTIONS TO RESTORE
// ============================================

// 1. METHOD STATE (line ~13)
// Replace: const method = 'PHONEPE';
// With:
const [method, setMethod] = useState('DIRECT'); // DIRECT or PHONEPE

// ============================================
// 2. DISCOUNT BANNER (after "Choose Payment Method" heading)
// ============================================
{/* Discount Banner */}
{session && method === 'DIRECT' && (
	<div className="mb-4 rounded-xl border-2 border-emerald-400 bg-emerald-500/10 p-4">
		<div className="flex items-center gap-3">
			<div className="bg-emerald-500 rounded-full p-2">
				<svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
					<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
				</svg>
			</div>
			<div>
				<div className="text-emerald-100 font-bold text-lg">₹{directDiscount} Discount Applied!</div>
				<div className="text-sm text-slate-300">
					Pay <span className="font-bold text-emerald-200 text-xl">₹{payable}</span> instead of <span className="line-through opacity-70">₹{baseAmountBeforeDirect}</span>
				</div>
			</div>
		</div>
	</div>
)}

// ============================================
// 3. PAYMENT METHOD SELECTION CARDS
// Replace the "PHONEPE PAYMENT - SINGLE OPTION" section with:
// ============================================
{/* Payment Method Selection */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
	{/* Manual UPI Payment */}
	<button
		type="button"
		onClick={() => setMethod('DIRECT')}
		className={`text-left rounded-xl border-2 p-6 transition-all ${method === 'DIRECT' ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
	>
		<div className="flex items-center justify-between mb-3">
			<div className="text-base font-bold text-slate-100">Pay via UPI</div>
			{directDiscount > 0 && (
				<span className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
					SAVE ₹{directDiscount}
				</span>
			)}
		</div>
		
		{/* Payment App Icons */}
		<div className="flex items-center gap-3 mb-3">
			<div className="bg-white rounded-lg p-2 shadow-md">
				<img src="/icons8-google-pay-48.png" alt="Google Pay" className="h-8 w-8" />
			</div>
			<div className="bg-white rounded-lg p-2 shadow-md">
				<img src="/icons8-phone-pe-48.png" alt="PhonePe" className="h-8 w-8" />
			</div>
			<div className="bg-white rounded-lg p-2 shadow-md">
				<img src="/icons8-visa-48.png" alt="Visa" className="h-8 w-8" />
			</div>
			<div className="bg-gradient-to-br from-orange-500 to-green-600 rounded-lg p-2 shadow-md">
				<svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
					<path d="M20.8 4.5H3.2C2.54 4.5 2 5.04 2 5.7v12.6c0 .66.54 1.2 1.2 1.2h17.6c.66 0 1.2-.54 1.2-1.2V5.7c0-.66-.54-1.2-1.2-1.2zm-8.93 9.08l-3.44 3.44c-.2.2-.51.2-.71 0l-1.77-1.77c-.2-.2-.2-.51 0-.71l.71-.71c.2-.2.51-.2.71 0l.71.71 2.38-2.38c.2-.2.51-.2.71 0l.71.71c.19.19.19.51-.01.71zm7.69 0l-3.44 3.44c-.2.2-.51.2-.71 0l-1.77-1.77c-.2-.2-.2-.51 0-.71l.71-.71c.2-.2.51-.2.71 0l.71.71 2.38-2.38c.2-.2.51-.2.71 0l.71.71c.19.19.19.51-.01.71z"/>
				</svg>
			</div>
		</div>

		<div className="text-xs text-slate-400">
			Scan QR or Pay to UPI ID • Manual verification
		</div>
		
		{method === 'DIRECT' && (
			<div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-300">
				<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
					<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
				</svg>
				Selected
			</div>
		)}
	</button>

	{/* PhonePe Gateway */}
	<button
		type="button"
		onClick={() => setMethod('PHONEPE')}
		className={`text-left rounded-xl border-2 p-6 transition-all ${method === 'PHONEPE' ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
	>
		<div className="flex items-center justify-between mb-3">
			<div className="text-base font-bold text-slate-100">Online Payment</div>
			<span className="bg-purple-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
				AUTO
			</span>
		</div>

		{/* Payment Options Icons */}
		<div className="flex items-center gap-3 mb-3">
			<div className="bg-white rounded-lg p-2 shadow-md">
				<img src="/icons8-phone-pe-48.png" alt="PhonePe" className="h-8 w-8" />
			</div>
			<div className="bg-white rounded-lg p-2 shadow-md">
				<img src="/icons8-google-pay-48.png" alt="Google Pay" className="h-8 w-8" />
			</div>
			<div className="bg-white rounded-lg p-2 shadow-md">
				<img src="/atm-card.png" alt="Cards" className="h-8 w-8" />
			</div>
			<div className="bg-white rounded-lg p-2 shadow-md">
				<img src="/icons8-visa-48.png" alt="Visa" className="h-8 w-8" />
			</div>
		</div>

		<div className="text-xs text-slate-400">
			Cards • UPI • NetBanking • Instant access
		</div>

		{method === 'PHONEPE' && (
			<div className="mt-3 flex items-center gap-2 text-xs font-medium text-purple-300">
				<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
					<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
				</svg>
				Selected
			</div>
		)}
	</button>
</div>

// ============================================
// 4. MANUAL UPI PAYMENT INSTRUCTIONS
// Add this BEFORE the PhonePe payment section:
// ============================================
{method === 'DIRECT' && (
	<>
		<div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4 mb-4">
			<div className="text-sm text-slate-200">
				<span className="font-bold">How to pay:</span> Use any UPI app to scan QR code or send money to UPI ID. Then enter your transaction number below.
			</div>
		</div>

		<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
			{/* QR Code */}
			<div className="bg-white/5 border border-white/20 rounded-xl p-5">
				<div className="flex items-center gap-2 mb-3">
					<QrCodeIcon className="h-5 w-5 text-emerald-400" />
					<span className="text-sm font-bold text-slate-100">Scan QR Code</span>
				</div>
				{session.upi_qr ? (
					<div className="bg-white rounded-xl p-4 shadow-xl">
						<img src={session.upi_qr} alt="UPI QR" className="w-full max-w-[200px] mx-auto" />
					</div>
				) : (
					<div className="text-slate-500 text-sm text-center py-12 bg-black/20 rounded-lg">QR not available</div>
				)}
				<div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400">
					<img src="/icons8-google-pay-48.png" alt="GPay" className="h-5 w-5" />
					<img src="/icons8-phone-pe-48.png" alt="PhonePe" className="h-5 w-5" />
					<img src="/icons8-visa-48.png" alt="Visa" className="h-5 w-5" />
					<span>or any UPI app</span>
				</div>
			</div>

			{/* UPI ID */}
			<div className="space-y-4">
				<div>
					<div className="flex items-center gap-2 mb-2">
						<DevicePhoneMobileIcon className="h-5 w-5 text-emerald-400" />
						<span className="text-sm font-bold text-slate-100">Or Pay to UPI ID</span>
					</div>
					<div className="flex gap-2">
						<input 
							readOnly 
							className="flex-1 rounded-lg bg-black/40 border-2 border-emerald-400/50 p-3 text-slate-100 font-mono text-sm font-bold cursor-pointer select-all" 
							value={session.upi_address || 'Not available'} 
							onClick={(e) => e.target.select()}
						/>
						<button
							className="px-4 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors"
							onClick={() => copyToClipboard(session.upi_address, 'UPI ID copied!')}
						>
							Copy
						</button>
					</div>
				</div>

				<div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/50 rounded-xl p-4">
					<div className="text-xs text-yellow-200 font-medium mb-1">Amount to Pay</div>
					<div className="text-3xl font-bold text-yellow-100">₹{payable}</div>
				</div>

				<div className="text-xs text-slate-400 bg-black/20 rounded-lg p-3">
					Need bank transfer? <a href={helpWhatsappUrl} target="_blank" rel="noreferrer" className="text-emerald-400 underline">WhatsApp us</a>
				</div>
			</div>
		</div>
	</>
)}

// ============================================
// 5. TRANSACTION PROOF SUBMISSION FORM
// Add this AFTER the PhonePe payment section:
// ============================================
{method === 'DIRECT' && (
	<div className="mt-6 bg-slate-800/50 border border-white/10 rounded-xl p-5">
		<div className="flex items-start gap-3 mb-4">
			<div className="h-8 w-8 rounded-full bg-blue-500/20 border-2 border-blue-400 text-blue-200 flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
			<div>
				<h4 className="text-base font-bold text-slate-100">Enter Transaction Details</h4>
				<p className="text-xs text-slate-400 mt-1">Submit your payment proof for verification</p>
			</div>
		</div>

		<div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-3 mb-4">
			<div className="text-xs text-slate-200">
				<span className="font-bold">Where to find:</span> Open your payment app → Transaction History → Select this payment → Copy UTR/Transaction ID
			</div>
		</div>

		<div className="space-y-4">
			<div>
				<label className="block text-sm font-bold text-slate-200 mb-2">
					Transaction ID / UTR Number <span className="text-red-400">*</span>
				</label>
				<input
					className="w-full rounded-lg bg-black/60 border-2 border-white/20 p-3 text-slate-100 font-mono text-base tracking-wider placeholder:text-slate-600 focus:outline-none focus:border-emerald-400"
					placeholder="Example: 234567890123"
					value={proof.transaction_id}
					onChange={e => setProof({ ...proof, transaction_id: e.target.value })}
				/>
			</div>

			<div>
				<label className="block text-sm font-bold text-slate-400 mb-2">
					Receipt Email <span className="text-slate-600">(Optional)</span>
				</label>
				<input 
					className="w-full rounded-lg bg-black/60 border-2 border-white/10 p-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-400" 
					placeholder="Optional" 
					value={proof.receipt_email} 
					onChange={e => setProof({ ...proof, receipt_email: e.target.value })} 
				/>
			</div>

			<div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-2 border-green-400/30 rounded-lg p-4">
				<div className="flex items-center gap-3 mb-2">
					<ChatBubbleOvalLeftIcon className="h-6 w-6 text-green-400" />
					<div className="text-sm font-bold text-green-200">Faster Option</div>
				</div>
				<div className="text-xs text-slate-300 mb-3">Send payment screenshot on WhatsApp for instant verification</div>
				<a
					href={helpWhatsappUrl || '#'}
					target="_blank"
					rel="noreferrer"
					className={`w-full px-4 py-3 rounded-lg font-bold text-sm inline-flex items-center justify-center gap-2 transition-all ${helpWhatsappUrl ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
				>
					<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
						<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
					</svg>
					Send on WhatsApp
				</a>
			</div>
		</div>

		<div className="mt-6 pt-5 border-t border-white/10 flex justify-between items-center gap-3">
			<button 
				className="px-5 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors" 
				onClick={() => setStep(1)}
			>
				← Back
			</button>
			<button 
				className={`flex-1 px-6 py-3 rounded-lg font-bold text-base transition-all ${(!proof.transaction_id && !proof.receipt_email) || submitting ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-500/30'}`}
				onClick={submitProof} 
				disabled={(!proof.transaction_id && !proof.receipt_email) || submitting}
			>
				{submitting ? 'Submitting...' : 'Submit Payment Proof'}
			</button>
		</div>
	</div>
)}

// ============================================
// RESTORATION NOTES:
// ============================================
// 1. This backup contains all manual payment UI components
// 2. To restore, copy sections 1-5 back into PaymentPage.jsx at the marked locations
// 3. Make sure to also restore the `trxId` and `proof` state variables if needed
// 4. The backend API endpoints for manual payment are still active and functional
// 5. Icons used: /icons8-google-pay-48.png, /icons8-phone-pe-48.png, /icons8-visa-48.png, /atm-card.png
