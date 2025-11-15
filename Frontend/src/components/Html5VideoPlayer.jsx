import React, { useEffect, useRef, useState, useMemo } from 'react';

export default function Html5VideoPlayer({ src, title = 'Video' }) {
  const videoRef = useRef(null);
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
  const gainRef = useRef(null);
  const [boostEnabled, setBoostEnabled] = useState(false);
  const [boost, setBoost] = useState(1.0); // 1x to 3x
  const [error, setError] = useState(null);

  // Initialize audio graph on first enable
  const enableBoost = async () => {
    try {
      if (!videoRef.current) return;
      // Create context on user gesture
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }
      if (!sourceRef.current) {
        sourceRef.current = audioCtxRef.current.createMediaElementSource(videoRef.current);
      }
      if (!gainRef.current) {
        gainRef.current = audioCtxRef.current.createGain();
        gainRef.current.gain.value = boost;
        sourceRef.current.connect(gainRef.current).connect(audioCtxRef.current.destination);
      } else {
        gainRef.current.gain.value = boost;
      }
      setBoostEnabled(true);
      setError(null);
    } catch (e) {
      setError('Unable to boost audio in this browser/video (CORS or autoplay policy).');
    }
  };

  const disableBoost = () => {
    try {
      if (sourceRef.current && gainRef.current) {
        sourceRef.current.disconnect();
        gainRef.current.disconnect();
      }
    } catch {}
    gainRef.current = null;
    sourceRef.current = null;
    setBoostEnabled(false);
  };

  useEffect(() => {
    // Update gain when slider changes
    if (gainRef.current) {
      gainRef.current.gain.value = boost;
    }
  }, [boost]);

  useEffect(() => {
    return () => {
      try {
        if (sourceRef.current) sourceRef.current.disconnect();
        if (gainRef.current) gainRef.current.disconnect();
        if (audioCtxRef.current) audioCtxRef.current.close();
      } catch {}
    };
  }, []);

  return (
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

      {/* Controls Overlay */}
      <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
        <button
          onClick={boostEnabled ? disableBoost : enableBoost}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
            boostEnabled
              ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/40 hover:bg-emerald-500/30'
              : 'bg-white/10 text-slate-200 border-white/20 hover:bg-white/20'
          }`}
        >
          {boostEnabled ? 'Boost On' : 'Boost Volume'}
        </button>
        <input
          type="range"
          min="1"
          max="3"
          step="0.1"
          value={boost}
          onChange={(e) => setBoost(parseFloat(e.target.value))}
          className="w-28 accent-emerald-400"
          title={`Boost ${boost.toFixed(1)}x`}
        />
      </div>

      {error && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-2 rounded bg-red-500/20 text-red-100 text-xs border border-red-400/40">
          {error}
        </div>
      )}
    </div>
  );
}
