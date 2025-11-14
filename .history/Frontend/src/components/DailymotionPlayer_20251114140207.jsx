import React, { useMemo, useRef } from 'react';

// Extract a Dailymotion video ID from various URL shapes, or return null
function extractDailymotionId(input) {
  if (!input || typeof input !== 'string') return null;
  const raw = input.trim();
  if (!raw) return null;

  // If it looks like a bare ID (common DM ids like x84shcd)
  if (/^[a-zA-Z0-9]+$/.test(raw)) {
    return raw;
  }

  try {
    // Accept protocol-relative or relative by providing base
    const base = 'https://www.dailymotion.com';
    const url = raw.startsWith('http') ? new URL(raw) : new URL(raw, base);

    // dai.ly short links
    if (url.hostname.includes('dai.ly')) {
      const parts = url.pathname.split('/').filter(Boolean);
      return parts[0] || null;
    }
    // www.dailymotion.com/video/<id> or /embed/video/<id>
    if (url.hostname.includes('dailymotion.com')) {
      const parts = url.pathname.split('/').filter(Boolean);
      const videoIdx = parts.findIndex(p => p === 'video');
      if (videoIdx !== -1 && parts[videoIdx + 1]) return parts[videoIdx + 1];
    }
  } catch (_) {
    // ignore parse errors; fallback below
  }

  // Fallback: if nothing worked, return null
  return null;
}

// Build a themed embed URL with preferred params; return '' if invalid
function buildEmbedUrl(input) {
  const id = extractDailymotionId(input) || null;
  
  if (!id) {
    // If not a Dailymotion URL, return as-is
    return input?.startsWith('http') ? input : '';
  }

  // Build URL through our backend proxy instead of direct Dailymotion
  const apiUrl = import.meta.env.VITE_API_URL || 'https://mx-3xxg.onrender.com';
  
  try {
    // All parameters for Dailymotion player
    const params = new URLSearchParams({
      'queue-enable': '0',
      'queue-autoplay-next': '0',
      'endscreen-enable': '0',
      'sharing-enable': '0',
      'ui-logo': '0',
      'ui-start-screen-info': '0',
      'related': '0',
      'recommendations': '0',
      'controls': 'true',
      'syndication': '0',
      'ui-show-info': '0',
      'origin': window.location.origin,
      'ui-theme': 'dark',
      'ui-highlight': '10b981',
      'autoplay': '1',
      'muted': '0',
      'playsinline': '1'
    });

    return `${apiUrl}/api/video/proxy/dailymotion/${id}?${params.toString()}`;
  } catch (e) {
    if (import.meta?.env?.DEV) {
      // eslint-disable-next-line no-console
      console.warn('Invalid Dailymotion URL:', input, e);
    }
    return '';
  }
}

// Dailymotion player wrapper that minimizes branding and attempts autoplay.
// Note: Browsers often block autoplay with sound until user interaction.
export default function DailymotionPlayer({ embedUrl, title = 'Video' }) {
  const src = useMemo(() => buildEmbedUrl(embedUrl), [embedUrl]);
  const iframeRef = useRef(null);

  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-black/60 border border-white/10" style={{ paddingTop: '56.25%' }}>
      {src ? (
        <iframe
          ref={iframeRef}
          title={title}
          src={src}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen *; picture-in-picture *; encrypted-media; accelerometer; gyroscope"
          allowFullScreen
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-sm">
            Video unavailable or invalid URL. Please contact support.
          </div>
        </div>
      )}
    </div>
  );
}
