import React from 'react';

/**
 * MatchScoreBadge — Circular progress ring showing compatibility percentage.
 * Uses SVG for the ring with a rose-to-purple gradient.
 */
const MatchScoreBadge = ({ score, size = 48, strokeWidth = 3.5, className = '' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getScoreColor = (s) => {
    if (s >= 85) return { text: 'text-emerald-500', stroke: '#10B981' };
    if (s >= 70) return { text: 'text-rose-500', stroke: '#F43F5E' };
    return { text: 'text-amber-500', stroke: '#F59E0B' };
  };

  const colors = getScoreColor(score);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F1F5F9"
          strokeWidth={strokeWidth}
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-[11px] font-black ${colors.text} leading-none`}>{score}%</span>
      </div>
    </div>
  );
};

export default MatchScoreBadge;
