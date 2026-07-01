import React from 'react';
import { usePageTransition } from '../../hooks/usePageTransition';

export const PageTransition = ({ children, isTab = false }) => {
  const transitionClass = usePageTransition();

  return (
    <div className={`gpu-accel min-h-screen w-full bg-surface ${isTab ? 'animate-fade-in' : transitionClass}`}>
      {children}
    </div>
  );
};
