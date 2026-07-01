import React from 'react';

/**
 * TributeHeroImage — Full-bleed hero image for detail page.
 * Shows Om Shanti badge, floral corner decorations, and gradient overlays.
 */
const TributeHeroImage = ({ src, alt, deceasedName }) => {
  return (
    <div className="relative w-full" style={{ height: '320px', maxHeight: '40vh' }}>
      {/* Photo */}
      <img
        src={src}
        alt={alt || deceasedName}
        className="w-full h-full object-cover"
        style={{ objectPosition: 'top center' }}
      />

      {/* Top gradient overlay */}
      <div
        className="absolute inset-x-0 top-0 h-24"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 100%)' }}
      />

      {/* Bottom gradient overlay */}
      <div
        className="absolute inset-x-0 bottom-0 h-32"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)' }}
      />

      {/* Om Shanti badge — top left */}
      <div
        className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-bold"
        style={{
          background: 'rgba(20,12,0,0.75)',
          backdropFilter: 'blur(12px)',
          color: '#D4AF37',
          border: '1px solid rgba(212,175,55,0.3)'
        }}
      >
        <span>🪔</span>
        <span>ॐ शांति</span>
      </div>

      {/* Decorative floral corners (SVG emoji overlay) */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <div className="flex justify-between px-2">
          <span className="text-[32px] opacity-60 select-none" style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.4))' }}>🌸</span>
          <span className="text-[32px] opacity-60 select-none" style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.4))' }}>🌸</span>
        </div>
      </div>
    </div>
  );
};

export default TributeHeroImage;
