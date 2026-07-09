import React from 'react';
import { ACTIVITY_TYPES } from '../constants/activityTypes';
import { User, MessageSquare, Heart, Calendar } from 'lucide-react';
import { Avatar } from '../../../../member/components/common/Avatar';

export const TimelineItem = ({ event }) => {
  const getIcon = () => {
    switch (event.type) {
      case ACTIVITY_TYPES.POST: return <MessageSquare size={14} className="text-blue-500" />;
      case ACTIVITY_TYPES.DONATION: return <Heart size={14} className="text-rose-500" />;
      case ACTIVITY_TYPES.EVENT_CHECKIN: return <Calendar size={14} className="text-purple-500" />;
      default: return <User size={14} className="text-gray-500" />;
    }
  };

  return (
    <div className="flex gap-4 relative">
      <div className="absolute left-[19px] top-10 bottom-0 w-[2px] bg-gray-100 last:hidden" />
      <div className="relative z-10 shrink-0">
        <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center shadow-sm">
          {getIcon()}
        </div>
      </div>
      <div className="pb-8 flex-1">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Avatar initials={event.user?.charAt(0) || 'U'} size="xs" imageUrl={event.avatar} />
              <p className="text-[13px] font-bold text-gray-800">{event.user}</p>
            </div>
            <span className="text-[11px] font-semibold text-gray-400">{event.time}</span>
          </div>
          <p className="text-[13px] text-gray-600">
            {event.type === ACTIVITY_TYPES.DONATION && `Donated ${event.amount ? `₹${event.amount}` : ''} to ${event.target}`}
            {event.type === ACTIVITY_TYPES.POST && `Posted in ${event.target}`}
            {event.type === ACTIVITY_TYPES.VOLUNTEER && `Volunteered for ${event.target}`}
          </p>
        </div>
      </div>
    </div>
  );
};
