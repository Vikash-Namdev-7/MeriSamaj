/**
 * NotificationBell - A header bell widget driven by real-time NotificationContext.
 * Previously polled every 60s; now receives live updates via socket.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const NotificationBell = ({ className = '' }) => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  return (
    <button
      id="notification-bell-btn"
      onClick={() => navigate('/member/notifications')}
      className={`relative p-2 active:scale-90 transition-transform ${className}`}
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
    >
      <Bell size={22} className="text-slate-600" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center bg-rose-500 text-white text-[9px] font-black rounded-full px-1 leading-none shadow-sm">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
