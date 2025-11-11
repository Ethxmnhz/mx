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

    // Disable all recommendations and related videos
    params.set('queue-enable', '0');
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
    
    // Enable loop to prevent autoplay to other videos
    params.set('loop', '1');
    
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
export default function DailymotionPlayer({ embedUrl, title = 'Video', onComplete, onNext }) {
  const src = useMemo(() => buildEmbedUrl(embedUrl), [embedUrl]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const iframeRef = useRef(null);
  const messageListenerRef = useRef(null);

  useEffect(() => {
    // Listen for Dailymotion player events via postMessage
    const handleMessage = (event) => {
      if (event.origin !== 'https://www.dailymotion.com') return;
      
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        if (data.event === 'durationchange') {
          setVideoDuration(data.duration || 0);
        } else if (data.event === 'timeupdate') {
          const time = data.time || 0;
          setCurrentTime(time);
          
          // Show overlay 10 seconds before end
          if (videoDuration > 0 && time >= videoDuration - 10 && time < videoDuration) {
            setShowOverlay(true);
          } else if (time < videoDuration - 10) {
            setShowOverlay(false);
          }
        } else if (data.event === 'ended') {
          setShowOverlay(true);
          // Pause the video to prevent autoplay of external videos
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({ command: 'pause' }),
              'https://www.dailymotion.com'
            );
          }
        }
      } catch (e) {
        // Ignore parse errors
      }
    };

    window.addEventListener('message', handleMessage);
    messageListenerRef.current = handleMessage;

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [videoDuration]);

  const handleComplete = () => {
    setShowOverlay(false);
    if (onComplete) onComplete();
  };

  const handleNextTopic = () => {
    setShowOverlay(false);
    if (onNext) onNext();
  };

  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-black/60 border border-white/10" style={{ paddingTop: '56.25%' }}>
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
          />
          
          {/* Overlay with Complete and Next buttons */}
          {showOverlay && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="flex flex-col sm:flex-row gap-4">
                {onComplete && (
                  <button
                    onClick={handleComplete}
                    className="px-6 py-3 rounded-lg bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 hover:bg-emerald-500/30 font-semibold flex items-center gap-2 transition-all"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    Mark Complete
                  </button>
                )}
                {onNext && (
                  <button
                    onClick={handleNextTopic}
                    className="px-6 py-3 rounded-lg bg-white/10 text-slate-200 border border-white/20 hover:bg-white/20 font-semibold flex items-center gap-2 transition-all"
                  >
                    Next Topic
                    <ArrowRightIcon className="w-5 h-5" />
                  </button>
                )}
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
