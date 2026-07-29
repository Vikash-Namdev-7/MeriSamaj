/**
 * NotificationBell - A header bell widget driven by real-time NotificationContext.
 * Receives live updates via socket and renders the NotificationDropdown menu.
 */
import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationDropdown } from './NotificationDropdown';

export const NotificationBell = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotifications();

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div className="relative inline-block">
      <button
        id="notification-bell-btn"
        onClick={toggleDropdown}
        className={`relative p-2 active:scale-95 transition-all rounded-xl hover:bg-slate-100/80 ${className}`}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell size={22} className="text-slate-700 hover:text-rose-600 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center bg-rose-500 text-white text-[9px] font-black rounded-full px-1 leading-none shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Real-Time Interactive Notification Dropdown Menu ───────────────── */}
      <NotificationDropdown isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

export default NotificationBell;
