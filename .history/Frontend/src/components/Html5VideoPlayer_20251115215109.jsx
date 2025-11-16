import React, { useEffect, useRef, useState, forwardRef } from 'react';
import { SpeakerWaveIcon } from '@heroicons/react/24/solid';

const Html5VideoPlayer = forwardRef(({ src, title = 'Video', onBoostChange = null }, ref) => {
  const videoRef = useRef(null);
  const [boostEnabled, setBoostEnabled] = useState(false);
  const [boost, setBoost] = useState(1.0);
  const [error, setError] = useState(null);

  // Forward the ref so parent can access video element
  useEffect(() => {
    if (ref) {
      ref.current = videoRef.current;
    }
  }, [ref]);

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
  );
});

Html5VideoPlayer.displayName = 'Html5VideoPlayer';
export default Html5VideoPlayer;
