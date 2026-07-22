import React from 'react';
import { Users, Heart } from 'lucide-react';
import { Avatar } from '../../components/common/Avatar';

const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });
};

const ConversationCard = ({ conv, onClick }) => {
  const { title, avatar, type, lastMessagePreview, lastMessageAt, unreadCount, isOnline } = conv;
  
  const initials = title ? title.substring(0, 2).toUpperCase() : 'U';
  
  // Styling based on type
  let color = 'bg-gray-100 text-gray-600';
  let badge = null;
  
  if (type === 'direct') {
    color = 'bg-orange-100 text-orange-600';
    if (isOnline) {
      badge = <div className="absolute -bottom-0.5 -right-0.5 w-[14px] h-[14px] bg-green-500 rounded-full border-2 border-white" />;
    }
  } else if (type === 'group') {
    color = 'bg-violet-100 text-violet-600';
    badge = (
      <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] bg-brand-primary rounded-full flex items-center justify-center border-2 border-white">
        <Users size={10} className="text-white" />
      </div>
    );
  } else if (type === 'matrimonial') {
    color = 'bg-pink-100 text-pink-600';
    badge = (
      <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] bg-pink-500 rounded-full flex items-center justify-center border-2 border-white">
        <Heart size={10} className="text-white" />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3.5 px-4 py-3.5 border-b border-gray-50 bg-white hover:bg-purple-50/20 active:bg-purple-100/20 cursor-pointer transition-colors"
    >
      <div className="relative shrink-0">
        <Avatar
          initials={initials}
          src={avatar}
          size="lg"
          color={color}
        />
        {badge}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="text-[15.5px] font-semibold text-gray-900 truncate pr-2">{title}</h3>
          <span className="text-[12px] whitespace-nowrap shrink-0 text-gray-400">
            {formatTime(lastMessageAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className={`text-[13.5px] truncate leading-snug ${unreadCount > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
            {lastMessagePreview || (type === 'group' ? 'Start chatting...' : 'No messages yet')}
          </p>
          {unreadCount > 0 && (
            <div className="min-w-[20px] h-5 px-1.5 rounded-full bg-brand-primary text-white flex items-center justify-center text-[11px] font-bold shadow-sm shrink-0">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationCard;
