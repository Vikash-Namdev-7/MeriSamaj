import React from 'react';

export const CityLandscape = ({ className = '' }) => {
  return (
    <div 
      className={`relative w-full h-full overflow-hidden ${className}`} 
      style={{ 
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 100%)', 
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 100%)' 
      }}
    >
      <svg 
        viewBox="0 0 1000 400" 
        className="w-full h-full absolute bottom-0 opacity-25"
        fill="none" 
        stroke="currentColor" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        preserveAspectRatio="xMidYMax slice"
      >
        {/* Radiant Aura / Distant Sun Rays */}
        <g strokeOpacity="0.1" strokeWidth="1">
          {Array.from({ length: 24 }).map((_, i) => {
             const angle = Math.PI * (i / 23);
             return <line key={`ray${i}`} x1="500" y1="380" x2={500 + Math.cos(angle) * 800} y2={380 - Math.sin(angle) * 800} />;
          })}
        </g>

        {/* Base Platform (Adhishthana) */}
        <g strokeWidth="2.5" strokeOpacity="0.9">
          <path d="M 50 380 L 950 380 L 910 340 L 90 340 Z" />
          <path d="M 120 340 L 880 340 L 850 310 L 150 310 Z" />
          <path d="M 180 310 L 820 310 L 800 290 L 200 290 Z" />
          {/* Central Grand Steps */}
          <path d="M 430 380 L 430 290 M 570 380 L 570 290" />
          <path d="M 450 380 L 450 290 M 550 380 L 550 290" />
          <path d="M 470 380 L 470 290 M 530 380 L 530 290" />
          <path d="M 490 380 L 490 290 M 510 380 L 510 290" />
        </g>

        {/* Central Shikhar (Main Spire) */}
        <g strokeWidth="2.5" strokeOpacity="1">
           {/* Main Outline */}
           <path d="M 380 290 L 380 180 C 410 80, 480 50, 500 40 C 520 50, 590 80, 620 180 L 620 290 Z" />
           {/* Horizontal Tiered Carvings */}
           {Array.from({ length: 15 }).map((_, i) => {
              const y = 200 - (i * 10);
              const wOffset = i * 6;
              return <path key={`m${i}`} d={`M ${380 + wOffset} ${y} C 450 ${y-15}, 550 ${y-15}, ${620 - wOffset} ${y}`} strokeWidth="1.5" strokeOpacity="0.7" />;
           })}
           {/* Kalash (Top Peak) */}
           <circle cx="500" cy="30" r="10" />
           <path d="M 490 30 C 490 10, 510 10, 510 30" />
           <path d="M 495 20 L 505 20" />
           {/* Massive Flag (Dhvaja) */}
           <path d="M 500 20 L 500 -30 M 500 -10 L 560 -20 L 500 -5" strokeWidth="2" />
        </g>

        {/* Left Primary Mandapa */}
        <g strokeWidth="2" strokeOpacity="0.9">
           <path d="M 230 290 L 230 210 C 260 150, 310 130, 330 120 C 350 130, 400 150, 430 210 L 430 290 Z" />
           {Array.from({ length: 9 }).map((_, i) => {
              const y = 220 - (i * 11);
              const wOffset = i * 8;
              return <path key={`l${i}`} d={`M ${230 + wOffset} ${y} C 300 ${y-10}, 360 ${y-10}, ${430 - wOffset} ${y}`} strokeWidth="1.5" strokeOpacity="0.6" />;
           })}
           <circle cx="330" cy="110" r="8" />
           <path d="M 330 102 L 330 60 M 330 80 L 360 70 L 330 85" strokeWidth="1.5" />
        </g>

        {/* Right Primary Mandapa */}
        <g strokeWidth="2" strokeOpacity="0.9">
           <path d="M 570 290 L 570 210 C 600 150, 650 130, 670 120 C 690 130, 740 150, 770 210 L 770 290 Z" />
           {Array.from({ length: 9 }).map((_, i) => {
              const y = 220 - (i * 11);
              const wOffset = i * 8;
              return <path key={`r${i}`} d={`M ${570 + wOffset} ${y} C 640 ${y-10}, 700 ${y-10}, ${770 - wOffset} ${y}`} strokeWidth="1.5" strokeOpacity="0.6" />;
           })}
           <circle cx="670" cy="110" r="8" />
           <path d="M 670 102 L 670 60 M 670 80 L 700 70 L 670 85" strokeWidth="1.5" />
        </g>

        {/* Outer Left Small Pavilion */}
        <g strokeWidth="1.5" strokeOpacity="0.8">
           <path d="M 120 290 L 120 250 C 130 210, 160 200, 175 190 C 190 200, 220 210, 230 250 L 230 290 Z" />
           <circle cx="175" cy="183" r="5" />
           <path d="M 175 178 L 175 150 M 175 165 L 190 155 L 175 170" />
        </g>

        {/* Outer Right Small Pavilion */}
        <g strokeWidth="1.5" strokeOpacity="0.8">
           <path d="M 770 290 L 770 250 C 780 210, 810 200, 825 190 C 840 200, 870 210, 880 250 L 880 290 Z" />
           <circle cx="825" cy="183" r="5" />
           <path d="M 825 178 L 825 150 M 825 165 L 840 155 L 825 170" />
        </g>

        {/* Pillars, Corridors & Arched Entrances */}
        <g strokeWidth="2" strokeOpacity="0.9">
           {/* Central Garbhagriha Door */}
           <path d="M 460 290 L 460 240 A 40 40 0 0 1 540 240 L 540 290" />
           <path d="M 470 290 L 470 240 A 30 30 0 0 1 530 240 L 530 290" strokeWidth="1" />
           
           {/* Central Pillars */}
           <rect x="440" y="220" width="10" height="70" />
           <rect x="550" y="220" width="10" height="70" />

           {/* Left Corridors */}
           <path d="M 260 290 L 260 250 A 20 20 0 0 1 300 250 L 300 290" />
           <path d="M 310 290 L 310 250 A 20 20 0 0 1 350 250 L 350 290" />
           <path d="M 360 290 L 360 250 A 20 20 0 0 1 400 250 L 400 290" />

           {/* Right Corridors */}
           <path d="M 600 290 L 600 250 A 20 20 0 0 1 640 250 L 640 290" />
           <path d="M 650 290 L 650 250 A 20 20 0 0 1 690 250 L 690 290" />
           <path d="M 700 290 L 700 250 A 20 20 0 0 1 740 250 L 740 290" />

           {/* Outer Left Pillars */}
           <path d="M 140 290 L 140 260 A 15 15 0 0 1 170 260 L 170 290" />
           <path d="M 180 290 L 180 260 A 15 15 0 0 1 210 260 L 210 290" />

           {/* Outer Right Pillars */}
           <path d="M 790 290 L 790 260 A 15 15 0 0 1 820 260 L 820 290" />
           <path d="M 830 290 L 830 260 A 15 15 0 0 1 860 260 L 860 290" />
        </g>

        {/* Fine Architectural Fluting (Vertical Lines) */}
        <g strokeOpacity="0.3" strokeWidth="1">
           {/* Central Spire */}
           <path d="M 400 180 C 420 80, 480 50, 500 40" />
           <path d="M 420 180 C 440 80, 490 50, 500 40" />
           <path d="M 440 180 C 460 80, 495 50, 500 40" />
           <path d="M 460 180 C 480 80, 500 50, 500 40" />
           <path d="M 480 180 C 490 80, 500 50, 500 40" />
           
           <path d="M 600 180 C 580 80, 520 50, 500 40" />
           <path d="M 580 180 C 560 80, 510 50, 500 40" />
           <path d="M 560 180 C 540 80, 505 50, 500 40" />
           <path d="M 540 180 C 520 80, 500 50, 500 40" />
           <path d="M 520 180 C 510 80, 500 50, 500 40" />
        </g>

        {/* Foreground Ground Line */}
        <path d="M 0 380 H 1000" strokeWidth="6" />
      </svg>
    </div>
  );
};
