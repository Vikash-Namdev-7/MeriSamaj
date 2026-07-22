/**
 * NotificationContext.jsx
 * Real-time notification context for the member app.
 *
 * Imports and reuses the SAME `getSocket` singleton exported from useChatSocket.js.
 * There is only ONE underlying Socket.io connection in the entire app.
 *
 * Exposes:
 *   unreadCount            — number of unread notifications
 *   latestNotification     — most recently received notification object (or null)
 *   resetUnreadCount()     — sets unreadCount → 0  (call when user opens the page)
 *   decrementUnreadCount() — decrements by 1 (call when user reads a single notification)
 */
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
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
  const handlerRef = useRef(null);

  // ── Fetch initial unread count on mount / when user changes ────────────────
  useEffect(() => {
    if (!user?._id) return;
    notificationService.getUnread()
      .then(res => setUnreadCount(res.data?.data?.count || 0))
      .catch(() => {}); // non-critical
  }, [user?._id]);

  // ── Socket listener for real-time notifications ────────────────────────────
  useEffect(() => {
    if (!user?._id) return;

    // Reuses the SAME singleton as useChatSocket — guaranteed single connection
    const socket = getSocket(user._id);

    const handler = (notification) => {
      setUnreadCount(c => c + 1);
      setLatestNotification(notification);
    };

    handlerRef.current = handler;
    socket.on('notification:new', handler);

    return () => {
      socket.off('notification:new', handler);
    };
  }, [user?._id]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const resetUnreadCount     = useCallback(() => setUnreadCount(0), []);
  const decrementUnreadCount = useCallback(() => setUnreadCount(c => Math.max(0, c - 1)), []);

  return (
    <NotificationContext.Provider value={{
      unreadCount,
      latestNotification,
      resetUnreadCount,
      decrementUnreadCount
    }}>
      {children}
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
