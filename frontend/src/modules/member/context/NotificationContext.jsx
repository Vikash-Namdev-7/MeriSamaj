import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Bell, X, ExternalLink } from 'lucide-react';
import { useAuth } from '../../../core/auth/useAuth';
import { notificationService } from '../../../core/api/matrimonialService';
import { getSocket } from '../hooks/useChatSocket';

// ─── Context ──────────────────────────────────────────────────────────────────
const NotificationContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount]               = useState(0);
  const [latestNotification, setLatestNotification] = useState(null);
  const [toastNotif, setToastNotif]                 = useState(null);
  const handlerRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  // ── Fetch initial unread count on mount / when user changes ────────────────
  useEffect(() => {
    if (!user?._id) return;
    notificationService.getUnread()
      .then(res => setUnreadCount(res.data?.data?.count || res.data?.data?.unreadCount || 0))
      .catch(() => {}); // non-critical
  }, [user?._id]);

  // ── Socket listener for real-time notifications ────────────────────────────
  useEffect(() => {
    if (!user?._id) return;

    const socket = getSocket(user._id);

    const handler = (notification) => {
      setUnreadCount(c => c + 1);
      setLatestNotification(notification);
      setToastNotif(notification);

      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setToastNotif(null);
      }, 6000);
    };

    handlerRef.current = handler;
    socket.on('notification:new', handler);

    return () => {
      socket.off('notification:new', handler);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [user?._id]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const resetUnreadCount     = useCallback(() => setUnreadCount(0), []);
  const decrementUnreadCount = useCallback(() => setUnreadCount(c => Math.max(0, c - 1)), []);

  const handleToastClick = () => {
    if (!toastNotif) return;
    const url = toastNotif.actionUrl || '/member/notifications';
    setToastNotif(null);
    window.location.href = url;
  };

  return (
    <NotificationContext.Provider value={{
      unreadCount,
      latestNotification,
      resetUnreadCount,
      decrementUnreadCount
    }}>
      {children}

      {/* ── Live Toast Notification Popup Banner ──────────────────────────── */}
      {toastNotif && (
        <div
          onClick={handleToastClick}
          className="fixed top-4 right-4 left-4 sm:left-auto sm:max-w-md z-[9999] bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-700/50 flex items-start gap-3.5 cursor-pointer transform transition-all duration-300 hover:scale-[1.02] active:scale-95 animate-in fade-in slide-in-from-top-4"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-xl shrink-0 shadow-md">
            {toastNotif.icon || '🔔'}
          </div>
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-md">
                Live Alert
              </span>
              <span className="text-[11px] text-slate-400">Just now</span>
            </div>
            <h4 className="text-sm font-bold text-white mt-1 truncate">
              {toastNotif.title || 'New Notification'}
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-snug">
              {toastNotif.message}
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setToastNotif(null); }}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationProvider>');
  return ctx;
};

export default NotificationContext;
