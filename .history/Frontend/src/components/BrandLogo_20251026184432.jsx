import React from 'react';

export default function BrandLogo({ size = 48, withTagline = false, taglineText = '', showWordmark = false, plain = false }) {
	return (
		<div className="flex flex-col items-center select-none">
			<img
				src="/logo.png"
				alt="MaxSec Academy Logo"
				style={{ width: size, height: size, borderRadius: '16px', boxShadow: plain ? 'none' : '0 2px 16px rgba(16,185,129,0.12)' }}
				className={(plain ? '' : 'bg-white/10 ') + 'object-contain'}
				onError={e => { e.currentTarget.style.display = 'none'; }}
			/>
			{showWordmark && (
				<span className="mt-1 text-lg font-bold tracking-tight text-emerald-300 neon-text">MaxSec Academy</span>
			)}
			{withTagline && taglineText && (
				<span className="text-xs text-slate-400 mt-0.5">{taglineText}</span>
			)}
		</div>
	);
}
