import React from 'react';
import { BADGE_TYPES } from '../constants/engagementBadges';
import * as Icons from 'lucide-react';

export const RecognitionBadge = ({ typeId, size = 'md' }) => {
  const badge = BADGE_TYPES[typeId?.toUpperCase()] || BADGE_TYPES.MOST_ACTIVE;
  const IconComponent = Icons[badge.icon] || Icons.Award;
  
  const sizeClasses = {
    sm: 'p-1',
    md: 'p-2 text-[10px]',
    lg: 'p-3 text-[12px]'
  };

  const iconSizes = { sm: 12, md: 14, lg: 18 };

  return (
    <div 
      className={`inline-flex items-center gap-1.5 rounded-full text-white font-bold tracking-wide shadow-sm hover:-translate-y-0.5 transition-transform ${badge.color} ${sizeClasses[size]}`}
      title={badge.description}
    >
      <IconComponent size={iconSizes[size]} className="drop-shadow-sm" />
      {size !== 'sm' && <span>{badge.label}</span>}
    </div>
  );
};
