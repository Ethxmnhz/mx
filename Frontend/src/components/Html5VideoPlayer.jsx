import React, { forwardRef } from 'react';

// Forward the ref so parent can access the underlying <video> element directly
const Html5VideoPlayer = forwardRef(function Html5VideoPlayer({ src, title = 'Video' }, ref) {
  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-black/60 border border-white/10" style={{ paddingTop: '56.25%' }}>
      <video
        ref={ref}
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

export default Html5VideoPlayer;
