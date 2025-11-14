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
export default function DailymotionPlayer({ embedUrl, title = 'Video', onComplete, onNext }) {
  const src = useMemo(() => {
    const url = buildEmbedUrl(embedUrl);
    console.log('Built embed URL:', url);
    return url;
  }, [embedUrl]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const iframeRef = useRef(null);
  const messageListenerRef = useRef(null);

  // Reset overlay when video changes
  useEffect(() => {
    console.log('Video changed, resetting overlay. New src:', src);
    setShowOverlay(false);
    setVideoDuration(0);
    setCurrentTime(0);
  }, [embedUrl, src]);

  useEffect(() => {
    console.log('Setting up message listener...');
    // Listen for Dailymotion player events via postMessage
    const handleMessage = (event) => {
      console.log('Received postMessage:', { origin: event.origin, data: event.data });
      
      if (event.origin !== 'https://www.dailymotion.com') return;
      
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        console.log('Dailymotion event:', data); // Debug log
        
        if (data.event === 'durationchange') {
          setVideoDuration(data.duration || 0);
          console.log('Duration set to:', data.duration);
        } else if (data.event === 'timeupdate') {
          const time = data.time || 0;
          setCurrentTime(time);
          
          // Show overlay 10 seconds before end
          if (videoDuration > 0 && time >= videoDuration - 10) {
            console.log('Showing overlay at time:', time, 'duration:', videoDuration);
            setShowOverlay(true);
          }
        } else if (data.event === 'ended') {
          console.log('Video ended, showing overlay');
          setShowOverlay(true);
          // Pause the video to prevent autoplay of external videos
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({ command: 'pause' }),
              'https://www.dailymotion.com'
            );
          }
        } else if (data.event === 'apiready') {
          // Tell the player to send us events
          console.log('API ready, requesting events');
          if (iframeRef.current?.contentWindow) {
            const commands = [
              { command: 'addEventListener', event: 'durationchange' },
              { command: 'addEventListener', event: 'timeupdate' },
              { command: 'addEventListener', event: 'ended' },
              { command: 'addEventListener', event: 'play' },
              { command: 'addEventListener', event: 'pause' }
            ];
            commands.forEach(cmd => {
              console.log('Sending command:', cmd);
              iframeRef.current.contentWindow.postMessage(
                JSON.stringify(cmd),
                'https://www.dailymotion.com'
              );
            });
          }
        }
      } catch (e) {
        console.error('Error parsing message:', e);
      }
    };

    window.addEventListener('message', handleMessage);
    messageListenerRef.current = handleMessage;
    console.log('Message listener attached');

    return () => {
      console.log('Removing message listener');
      window.removeEventListener('message', handleMessage);
    };
  }, [videoDuration]);

  const handleComplete = () => {
    console.log('handleComplete clicked');
    setShowOverlay(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleNextTopic = () => {
    console.log('handleNextTopic clicked');
    setShowOverlay(false);
    if (onNext) {
      onNext();
    }
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
          
          {/* Overlay with Complete and Next buttons - Blocks all player interactions */}
          {showOverlay && (
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50"
              style={{ pointerEvents: 'all' }}
            >
              <div className="flex flex-col items-center gap-6 p-8">
                <div className="text-center mb-2">
                  <h3 className="text-2xl font-bold text-white mb-2">Video Complete!</h3>
                  <p className="text-slate-300">What would you like to do next?</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  {onComplete && (
                    <button
                      onClick={handleComplete}
                      className="px-8 py-4 rounded-lg bg-emerald-500/20 text-emerald-100 border-2 border-emerald-400/50 hover:bg-emerald-500/40 hover:border-emerald-400/70 font-semibold flex items-center gap-3 transition-all shadow-lg"
                    >
                      <CheckCircleIcon className="w-6 h-6" />
                      Mark Complete
                    </button>
                  )}
                  {onNext && (
                    <button
                      onClick={handleNextTopic}
                      className="px-8 py-4 rounded-lg bg-white/10 text-white border-2 border-white/30 hover:bg-white/20 hover:border-white/50 font-semibold flex items-center gap-3 transition-all shadow-lg"
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
