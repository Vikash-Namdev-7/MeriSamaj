import React from 'react';

export const Avatar = ({ initials, src, avatar, size = 'md', color, className = '' }) => {
  const sizes = {
    xs: 'w-6 h-6 text-[9px]',
    sm: 'w-8 h-8 text-[11px]',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  const gradients = [
    'bg-gradient-to-br from-purple-100 to-violet-50 text-purple-700 ring-1 ring-purple-200/50 shadow-sm shadow-purple-100/50',
    'bg-gradient-to-br from-blue-100 to-sky-50 text-blue-700 ring-1 ring-blue-200/50 shadow-sm shadow-blue-100/50',
    'bg-gradient-to-br from-emerald-100 to-green-50 text-emerald-700 ring-1 ring-emerald-200/50 shadow-sm shadow-emerald-100/50',
    'bg-gradient-to-br from-amber-100 to-orange-50 text-amber-700 ring-1 ring-amber-200/50 shadow-sm shadow-amber-100/50',
    'bg-gradient-to-br from-pink-100 to-rose-50 text-pink-700 ring-1 ring-pink-200/50 shadow-sm shadow-pink-100/50',
    'bg-gradient-to-br from-teal-100 to-cyan-50 text-teal-700 ring-1 ring-teal-200/50 shadow-sm shadow-teal-100/50',
    'bg-gradient-to-br from-indigo-100 to-violet-50 text-indigo-700 ring-1 ring-indigo-200/50 shadow-sm shadow-indigo-100/50',
  ];

  // Deterministic color from initials
  const colorIndex = initials ? initials.charCodeAt(0) % gradients.length : 0;
  const bgColor = color || gradients[colorIndex];

  const imageSrc = src || avatar;

  if (imageSrc) {
    return (
      <img 
        src={imageSrc} 
        alt={initials || 'Avatar'} 
        className={`${sizes[size]} rounded-full object-cover shrink-0 ring-1 ring-purple-100/30 shadow-sm ${className}`} 
      />
    );
  }

  return (
    <div className={`${sizes[size]} ${bgColor} rounded-full flex items-center justify-center font-bold tracking-tight shrink-0 ${className}`}>
      {initials}
    </div>
  );
};
