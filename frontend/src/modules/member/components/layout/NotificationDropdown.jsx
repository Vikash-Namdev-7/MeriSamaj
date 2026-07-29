import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, X, Sparkles, ChevronRight, Loader2, Circle } from 'lucide-react';
import { notificationService } from '../../../../core/api/matrimonialService';
import { useNotifications } from '../../context/NotificationContext';

// Helper for human-readable relative time
const formatRelativeTime = (dateStr) => {
  if (!dateStr) return 'Just now';
  const now = new Date();
  const date = new Date(dateStr);
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export const NotificationDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { unreadCount, latestNotification, decrementUnreadCount, resetUnreadCount } = useNotifications();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const dropdownRef = useRef(null);

  // ── Fetch notifications ──────────────────────────────────────────────────
  const fetchNotifications = useCallback(async (pageNum = 1, isTabChange = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = {
        page: pageNum,
        limit: 20
      };
      if (activeTab === 'unread') {
        params.isRead = 'false';
      }

      const res = await notificationService.getAll(params);
      const data = res.data?.data || res.data || {};
      const list = data.notifications || data.list || [];
      const totalPages = data.pages || Math.ceil((data.total || 0) / 20);

      setNotifications(prev => (pageNum === 1 ? list : [...prev, ...list]));
      setHasMore(pageNum < totalPages);
      setPage(pageNum);
    } catch (err) {
      console.error('[NotificationDropdown] Fetch error:', err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeTab]);

  // Initial fetch on open or tab change
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(1, true);
    }
  }, [isOpen, activeTab, fetchNotifications]);

  // ── Handle incoming live socket notifications ────────────────────────────
  useEffect(() => {
    if (!latestNotification) return;

    setNotifications(prev => {
      // Avoid duplicate insertion
      const exists = prev.some(n => n._id === latestNotification._id);
      if (exists) {
        return prev.map(n => n._id === latestNotification._id ? { ...n, ...latestNotification } : n);
      }
      // Insert new notification at top
      return [latestNotification, ...prev];
    });
  }, [latestNotification]);

  // ── Handle Click Outside ──────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !e.target.closest('#notification-bell-btn')) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleItemClick = async (notif) => {
    // Optimistic mark as read
    if (!notif.isRead) {
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      decrementUnreadCount();
      notificationService.markRead(notif._id).catch(() => {});
    }

    onClose();
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    } else {
      navigate('/member/notifications');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      resetUnreadCount();
      await notificationService.markAllRead();
    } catch (err) {
      console.error('[MarkAllReadError]', err.message);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchNotifications(page + 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-[92vw] sm:w-[380px] max-w-[400px] bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
      style={{
        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.1)'
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white text-sm shadow-sm">
            <Bell size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">Notifications</h3>
            <span className="text-[10px] text-slate-500 font-medium">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1"
              title="Mark all as read"
            >
              <CheckCheck size={13} />
              Read all
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ── Tabs (All / Unread) ────────────────────────────────────────────── */}
      <div className="flex items-center px-3 pt-2.5 pb-1 border-b border-slate-100 bg-white gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'all'
              ? 'bg-rose-50 text-rose-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('unread')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === 'unread'
              ? 'bg-rose-50 text-rose-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          Unread
          {unreadCount > 0 && (
            <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Notification List ─────────────────────────────────────────────── */}
      <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 scrollbar-thin scrollbar-thumb-slate-200">
        {loading ? (
          <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
            <Loader2 size={24} className="animate-spin text-rose-500" />
            <span className="text-xs font-medium">Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Sparkles size={22} />
            </div>
            <p className="text-xs font-semibold text-slate-600">No notifications found</p>
            <p className="text-[11px] text-slate-400">
              {activeTab === 'unread' ? 'You have read all unread alerts.' : 'Important updates will appear here.'}
            </p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item._id}
              onClick={() => handleItemClick(item)}
              className={`p-3.5 flex items-start gap-3 hover:bg-slate-50/80 cursor-pointer transition-colors relative group ${
                !item.isRead ? 'bg-rose-50/30' : ''
              }`}
            >
              {/* Icon */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-100 to-amber-100 text-rose-600 flex items-center justify-center text-base shrink-0 border border-rose-200/50 shadow-xs">
                {item.icon || '🔔'}
              </div>

              {/* Text Body */}
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center justify-between gap-1">
                  <h4 className={`text-xs font-bold truncate ${!item.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                  {item.message}
                </p>
              </div>

              {/* Unread indicator dot */}
              {!item.isRead && (
                <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 self-center shadow-xs animate-pulse" />
              )}
            </div>
          ))
        )}

        {/* Load More Button */}
        {hasMore && !loading && (
          <div className="p-2.5 text-center bg-slate-50/50">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Loading...
                </>
              ) : (
                'Load More Notifications'
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div className="p-2.5 border-t border-slate-100 bg-slate-50/80 text-center">
        <button
          onClick={() => {
            onClose();
            navigate('/member/notifications');
          }}
          className="text-[11px] font-bold text-slate-600 hover:text-rose-600 flex items-center justify-center gap-1 w-full transition-colors"
        >
          View Notification History <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
