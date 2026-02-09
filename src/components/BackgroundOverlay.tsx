import React from 'react';

export function BackgroundOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none opacity-30">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)] animate-pulse"
        style={{ animationDuration: '4s' }}
      />
    </div>
  );
}
