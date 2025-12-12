import React, { useMemo, useRef, useState, useEffect } from 'react';

// Extract a Dailymotion or YouTube video ID from various URL shapes, or return null
function extractDailymotionId(input) {
  if (!input || typeof input !== 'string') return null;
  const raw = input.trim();
  if (!raw) return null;

  // If it looks like a bare Dailymotion ID, prefer IDs that start with 'x'
  // Dailymotion IDs commonly start with 'x' followed by alphanumerics
  if (/^x[0-9a-zA-Z]+$/.test(raw)) return raw;

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

// Extract YouTube ID from URL or return null
function extractYouTubeId(input) {
  if (!input || typeof input !== 'string') return null;
  const raw = input.trim();
  if (!raw) return null;

  // Bare YouTube id (standard IDs are 11 characters)
  if (/^[A-Za-z0-9_-]{11}$/.test(raw) && !raw.includes('http')) return raw;

  try {
    const url = raw.startsWith('http') ? new URL(raw) : new URL(raw, 'https://www.youtube.com');
    const host = url.hostname.toLowerCase();
    if (host.includes('youtube.com')) {
      // watch?v=ID or /embed/ID
      if (url.searchParams.get('v')) return url.searchParams.get('v');
      const parts = url.pathname.split('/').filter(Boolean);
      const embedIdx = parts.findIndex(p => p === 'embed');
      if (embedIdx !== -1 && parts[embedIdx + 1]) return parts[embedIdx + 1];
    }
    if (host.includes('youtu.be')) {
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts[0]) return parts[0];
    }
  } catch (_) {}
  return null;
}

// Build a themed embed URL with preferred params; return '' if invalid
function buildEmbedUrl(input) {
  // Prefer Dailymotion, but accept YouTube links too
  // Guard: if input looks malformed (e.g. 'httpsyoutubeFgU6Qghbyc') try a loose YouTube id search
  let dmId = extractDailymotionId(input);
  let ytId = extractYouTubeId(input);
  if (!dmId && !ytId && typeof input === 'string') {
    const loose = input.match(/[A-Za-z0-9_-]{11}/);
    if (loose) ytId = loose[0];
  }
  let baseUrl = '';
  let service = null;
  if (dmId) {
    // Sanity-check dmId
    if (!/^x[0-9a-zA-Z]{3,}$/.test(dmId)) {
      dmId = null;
    }
  }
  if (dmId) {
    service = 'dailymotion';
    baseUrl = `https://www.dailymotion.com/embed/video/${dmId}`;
  } else if (ytId) {
    // Sanity-check ytId (must be 11 chars)
    if (!/^[A-Za-z0-9_-]{11}$/.test(ytId)) {
      ytId = null;
    }
  }
  if (!dmId && ytId) {
    service = 'youtube';
    baseUrl = `https://www.youtube.com/embed/${ytId}`;
  } else if (input?.startsWith('http')) {
    // Only accept explicit YouTube or Dailymotion host URLs as fallback; avoid embedding full pages
    try {
      const u = new URL(input);
      const host = u.hostname.toLowerCase();
      if (host.includes('dailymotion.com') || host.includes('dai.ly') || host.includes('youtube.com') || host.includes('youtu.be')) {
        baseUrl = input;
      } else {
        // Unsupported host - don't attempt to embed arbitrary page
        return '';
      }
    } catch (e) {
      return '';
    }
  }

  if (!baseUrl) return '';

  try {
    const url = new URL(baseUrl);
    const params = url.searchParams;

    if (service === 'dailymotion') {
      // Dailymotion params
      params.set('api', '1');
      params.set('queue-enable', '0');
      params.set('queue-autoplay-next', '0');
      params.set('endscreen-enable', '0');
      params.set('sharing-enable', '0');
      params.set('ui-logo', '0');
      params.set('ui-start-screen-info', '0');
      params.set('related', '0');
      params.set('recommendations', '0');
      params.set('autoplay', '0');
      params.set('playlist', '');
      params.set('list', '');
      params.set('controls', 'true');
      params.set('syndication', '0');
      params.set('ui-show-info', '0');
      params.set('origin', window.location.origin);
      params.set('ui-theme', 'dark');
      params.set('ui-highlight', '10b981');
      params.set('muted', '0');
      params.set('playsinline', '1');
    } else if (service === 'youtube') {
      // YouTube params: disable related videos, no autoplay, enable JS API for events
      params.set('rel', '0');
      params.set('modestbranding', '1');
      params.set('controls', '1');
      params.set('playsinline', '1');
      params.set('autoplay', '0');
      params.set('enablejsapi', '1');
      params.set('origin', window.location.origin);
    } else {
      // Generic: try to disable autoplay
      params.set('autoplay', '0');
      params.set('playsinline', '1');
      params.set('origin', window.location.origin);
    }

    url.search = params.toString();
    return url.toString();
  } catch (e) {
    return '';
  }
}

// Dailymotion player wrapper that minimizes branding and attempts autoplay.
// Note: Browsers often block autoplay with sound until user interaction.
export default function DailymotionPlayer({ embedUrl, title = 'Video' }) {
  const [reloadCounter, setReloadCounter] = useState(0);
  const [status, setStatus] = useState('loading'); // loading | loaded | error | timeout
  const iframeRef = useRef(null);

  // Build src with cache bust when reloading
  const src = useMemo(() => {
    const base = buildEmbedUrl(embedUrl);
    if (!base) return '';
    const url = new URL(base);
    url.searchParams.set('bust', String(reloadCounter));
    return url.toString();
  }, [embedUrl, reloadCounter]);

  useEffect(() => {
    if (!src) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => setStatus('loaded');
    const handleError = () => setStatus('error');

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    // Listen for postMessage events from embeds (Dailymotion, YouTube)
    const handleMessage = (event) => {
      if (!iframe || event.source !== iframe.contentWindow) return;
      if (typeof event.data === 'string') {
        // Try parse JSON payloads
        try {
          const data = JSON.parse(event.data);
          if (data && data.event) {
            // Dailymotion: event === 'play' or 'playing'
            if (data.event === 'play' || data.event === 'playing') {
              setStatus('loaded');
              return;
            }
            // YouTube IFrame API posts onStateChange with info:1 for playing
            if (data.event === 'onStateChange' && (data.info === 1 || data.info === '1')) {
              setStatus('loaded');
              return;
            }
          }
        } catch (e) {
          // Some providers send string messages containing onStateChange
          if (event.data.includes && event.data.includes('onStateChange') && event.data.includes('info')) {
            if (event.data.includes('"info":1') || event.data.includes('"info": 1') || event.data.includes('info:1')) {
              setStatus('loaded');
              return;
            }
          }
        }
      }
    };
    window.addEventListener('message', handleMessage);

    // Timeout: if not loaded within 15s assume blocked by network
    const timeoutId = setTimeout(() => {
      if (status === 'loading') setStatus('timeout');
    }, 15000);

    return () => {
      clearTimeout(timeoutId);
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
      window.removeEventListener('message', handleMessage);
    };
  }, [src]);

  const blocked = status === 'error' || status === 'timeout';

  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-black/60 border border-white/10" style={{ paddingTop: '56.25%' }}>
      {src ? (
        <>
          <iframe
            ref={iframeRef}
            title={title}
            src={src}
            className={`absolute top-0 left-0 w-full h-full transition-opacity ${blocked ? 'opacity-30' : 'opacity-100'}`}
            frameBorder="0"
            allow="autoplay; fullscreen *; picture-in-picture *; encrypted-media; accelerometer; gyroscope"
            allowFullScreen
          />
        </>
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
