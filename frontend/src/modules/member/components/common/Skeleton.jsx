import React from 'react';

export const Skeleton = ({ className, circle = false, width, height }) => {
  const baseClasses = "bg-gray-200 animate-pulse relative overflow-hidden";
  const shapeClasses = circle ? "rounded-full" : "rounded-xl";
  
  return (
    <div 
      className={`${baseClasses} ${shapeClasses} ${className || ''}`}
      style={{ width, height }}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
    </div>
  );
};

export const PostSkeleton = () => {
  return (
    <div className="card-std p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton circle width={44} height={44} />
        <div className="space-y-2">
          <Skeleton width={120} height={14} />
          <Skeleton width={80} height={12} />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton width="100%" height={14} />
        <Skeleton width="90%" height={14} />
        <Skeleton width="60%" height={14} />
      </div>
      <Skeleton width="100%" height={200} className="rounded-2xl mt-4" />
    </div>
  );
};
