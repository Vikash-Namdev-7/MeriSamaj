import React from 'react';

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-50 text-gray-600 border border-gray-200/60',
    primary: 'bg-gradient-to-r from-purple-50 to-violet-50 text-brand-primary border border-purple-200/40',
    social: 'bg-gradient-to-r from-blue-50 to-sky-50 text-social-module border border-blue-200/40',
    matrimonial: 'bg-gradient-to-r from-pink-50 to-rose-50 text-matrimonial-module border border-pink-200/40',
    success: 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200/40',
    warning: 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200/40',
    new: 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-sm shadow-purple-300/50 animate-pulse-glow',
    glass: 'bg-white/50 backdrop-blur-md text-text-primary border border-white/60 shadow-sm',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
