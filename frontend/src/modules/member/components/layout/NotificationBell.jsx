/**
 * NotificationBell - A header bell widget that polls unread notification count.
 * Displays a badge and navigates to /member/notifications on click.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { notificationService } from '../../../../core/api/matrimonialService';

export const NotificationBell = ({ className = '' }) => {
  const navigate     = useNavigate();
  const [count, setCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await notificationService.getUnread();
      setCount(res.data.data.count || 0);
    } catch {}
  }, []);

  // Poll every 60 seconds
  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  return (
    <button
      id="notification-bell-btn"
      onClick={() => navigate('/member/notifications')}
      className={`relative p-2 active:scale-90 transition-transform ${className}`}
      aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ''}`}
    >
      <Bell size={22} className="text-slate-600" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center bg-rose-500 text-white text-[9px] font-black rounded-full px-1 leading-none shadow-sm">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
