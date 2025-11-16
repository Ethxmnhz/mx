import React, { useRef } from 'react';

export default function Html5VideoPlayer({ src, title = 'Video' }) {
  const videoRef = useRef(null);

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
        data-video-player="true"
      />
    </div>
  );
}
