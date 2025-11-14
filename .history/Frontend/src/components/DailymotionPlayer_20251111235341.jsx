import React, { useMemo, useState, useEffect, useRef } from 'react';
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

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
  const embedBase = 'https://www.dailymotion.com/embed/video/';
  const baseUrl = id ? `${embedBase}${id}` : (input?.startsWith('http') ? input : '');

  if (!baseUrl) return '';

  try {
    const url = new URL(baseUrl);
    const params = url.searchParams;

    // Enable API for time tracking
    params.set('api', '1');

    // Disable all recommendations and related videos aggressively
    params.set('queue-enable', '0');
    params.set('queue-autoplay-next', '0');
    params.set('endscreen-enable', '0');
    params.set('sharing-enable', '0');
    params.set('ui-logo', '0');
    params.set('ui-start-screen-info', '0');
    
    // Explicitly disable related videos and recommendations
    params.set('related', '0');
    params.set('recommendations', '0');
    
    // Keep controls for fullscreen capability
    params.set('controls', 'true');
    params.set('syndication', '0');
    
    // Disable video info overlay
    params.set('ui-show-info', '0');
    
    // Disable external links
    params.set('origin', window.location.origin);

    // Theming and highlight color to match neon accents
    params.set('ui-theme', 'dark');
    params.set('ui-highlight', '10b981'); // emerald-500-ish

    // Playback preferences
    params.set('autoplay', '1');
    params.set('muted', '0'); // browsers may override to muted
    params.set('playsinline', '1');

    url.search = params.toString();
    return url.toString();
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
    <div className="relative w-full rounded-lg overflow-hidden bg-black/60 border border-white/10" style={{ paddingTop: '56.25%', position: 'relative' }}>
      {src ? (
        <>
          <iframe
            ref={iframeRef}
            title={title}
            src={src}
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0"
            allow="autoplay; fullscreen *; picture-in-picture *; encrypted-media; accelerometer; gyroscope"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          />
          
          {/* Debug: Manual overlay trigger button */}
          <button
            onClick={() => {
              console.log('Manual overlay toggle clicked. Current state:', showOverlay);
              setShowOverlay(!showOverlay);
            }}
            className="absolute top-4 right-4 z-[10000] px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold"
            style={{ position: 'absolute', zIndex: 10000 }}
          >
            Toggle Overlay (Test)
          </button>
          
          {/* Overlay with Complete and Next buttons - Blocks all player interactions */}
          {showOverlay && (
            <div 
              className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center"
              style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                pointerEvents: 'all',
                width: '100%',
                height: '100%'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center gap-6 p-8" onClick={(e) => e.stopPropagation()}>
                <div className="text-center mb-2">
                  <h3 className="text-2xl font-bold text-white mb-2">Video Complete!</h3>
                  <p className="text-slate-300">What would you like to do next?</p>
                  <p className="text-xs text-slate-500 mt-2">Duration: {videoDuration.toFixed(1)}s | Current: {currentTime.toFixed(1)}s</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  {onComplete && (
                    <button
                      onClick={handleComplete}
                      className="px-8 py-4 rounded-lg bg-emerald-500/30 text-emerald-100 border-2 border-emerald-400/50 hover:bg-emerald-500/50 hover:border-emerald-400/70 font-semibold flex items-center gap-3 transition-all shadow-lg"
                    >
                      <CheckCircleIcon className="w-6 h-6" />
                      Mark Complete
                    </button>
                  )}
                  {onNext && (
                    <button
                      onClick={handleNextTopic}
                      className="px-8 py-4 rounded-lg bg-white/20 text-white border-2 border-white/40 hover:bg-white/30 hover:border-white/60 font-semibold flex items-center gap-3 transition-all shadow-lg"
                    >
                      Next Topic
                      <ArrowRightIcon className="w-6 h-6" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
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
