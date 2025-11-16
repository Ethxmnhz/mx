import React, { useEffect, useRef, useState } from 'react';
import { SpeakerWaveIcon } from '@heroicons/react/24/solid';

export default function Html5VideoPlayer({ src, title = 'Video', onBoostChange = null }) {
  const videoRef = useRef(null);
  const [boostEnabled, setBoostEnabled] = useState(false);
  const [boost, setBoost] = useState(1.0);
  const [error, setError] = useState(null);

  // Use Web Audio API to boost volume
  const enableBoost = async () => {
    try {
      if (!videoRef.current) return;
      
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      
      const source = audioCtx.createMediaElementSource(videoRef.current);
      const gainNode = audioCtx.createGain();
      
      source.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      gainNode.gain.value = boost;
      
      // Store in ref for later updates
      videoRef.current._audioCtx = audioCtx;
      videoRef.current._gainNode = gainNode;
      
      setBoostEnabled(true);
      setError(null);
    } catch (e) {
      setError('Audio boost unavailable');
      console.error('Boost error:', e);
    }
  };

  const disableBoost = () => {
    try {
      if (videoRef.current?._gainNode) {
        videoRef.current._gainNode.gain.value = 1.0;
      }
      if (videoRef.current?._audioCtx) {
        videoRef.current._audioCtx.close();
      }
    } catch (e) {
      console.error('Error disabling boost:', e);
    }
    videoRef.current._gainNode = null;
    videoRef.current._audioCtx = null;
    setBoostEnabled(false);
  };

  useEffect(() => {
    // Update gain when slider changes
    if (boostEnabled && videoRef.current?._gainNode) {
      videoRef.current._gainNode.gain.value = Math.max(1.0, boost);
    }
  }, [boost, boostEnabled]);

  useEffect(() => {
    return () => {
      try {
        if (videoRef.current?._gainNode) {
          videoRef.current._gainNode.disconnect();
        }
        if (videoRef.current?._audioCtx) {
          videoRef.current._audioCtx.close();
        }
      } catch {}
    };
  }, []);

  return (
    <>
      {/* Boost Controls - Completely Separate */}
      <div className="flex items-center gap-3 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg mb-4">
        <button
          onClick={boostEnabled ? disableBoost : enableBoost}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors inline-flex items-center gap-2 ${
            boostEnabled
              ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/40 hover:bg-emerald-500/30'
              : 'bg-white/10 text-slate-200 border-white/20 hover:bg-white/20'
          }`}
        >
          <SpeakerWaveIcon className="w-4 h-4" />
          {boostEnabled ? 'Boost On' : 'Boost Vlum Test'}
        </button>
        {boostEnabled && (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={boost}
              onChange={(e) => setBoost(parseFloat(e.target.value))}
              className="flex-1 max-w-xs accent-emerald-400 cursor-pointer"
              title={`Boost ${boost.toFixed(1)}x`}
            />
            <span className="text-xs text-slate-400 min-w-fit">{boost.toFixed(1)}x</span>
          </div>
        )}
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>

      {/* Video Player - Clean Container */}
      <div className="relative w-full rounded-lg overflow-hidden bg-black/60 border border-white/10" style={{ paddingTop: '56.25%' }}>
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full"
          src={src}
          title={title}
          controls
          playsInline
          crossOrigin="anonymous"
        />
      </div>
    </>
  );
}
