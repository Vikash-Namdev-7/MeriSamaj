import React from 'react';
import { Avatar } from '../../../../member/components/common/Avatar';
import { RecognitionBadge } from './RecognitionBadge';

export const LeaderCard = ({ rank, member }) => {
  const getRankColor = () => {
    switch (rank) {
      case 1: return 'text-amber-500 bg-amber-50 border-amber-200';
      case 2: return 'text-gray-500 bg-gray-50 border-gray-200';
      case 3: return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-400 bg-gray-50 border-gray-100';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-brand-primary/30 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border ${getRankColor()}`}>
          #{rank}
        </div>
        <Avatar initials={member.name?.charAt(0)} size="md" imageUrl={member.avatar} />
        <div>
          <h4 className="text-[14px] font-bold text-gray-800">{member.name}</h4>
          <p className="text-[12px] text-gray-500">{member.role}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex gap-1 hidden md:flex">
          {member.badges?.map((badgeId, i) => (
            <RecognitionBadge key={i} typeId={badgeId} size="sm" />
          ))}
        </div>
        <div className="text-right">
          <p className="text-[20px] font-black text-brand-primary">{member.score}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Score</p>
        </div>
      </div>
    </div>
  );
};
