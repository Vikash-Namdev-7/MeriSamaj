import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, CheckCheck, Sparkles, Filter, ChevronRight, Loader2, 
  Trash2, ShieldCheck, Heart, Calendar, Wallet, Users, MessageSquare, Vote, Megaphone
} from 'lucide-react';
import { HeadPanelPageHeader, HeadPanelCard } from '../../components/shared/HeadUI';
import { notificationService } from '../../../../core/api/matrimonialService';
import { useNotifications } from '../../../member/context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const MODULE_TABS = [
  { key: 'all', label: 'All Notifications', icon: Bell },
  { key: 'announcements', label: 'Community Announcements', modules: ['social', 'obituary', 'chat', 'system'], icon: Megaphone },
  { key: 'matrimonial', label: 'Matrimonial Activity Updates', modules: ['matrimonial'], icon: Heart },
  { key: 'events', label: 'Event Reminders', modules: ['events', 'invitations'], icon: Calendar },
  { key: 'voting', label: 'Voting Notifications', modules: ['voting'], icon: Vote },
];

export const HeadNotificationCenter = () => {
  const navigate = useNavigate();
  const { unreadCount, latestNotification, decrementUnreadCount, resetUnreadCount } = useNotifications();

  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchNotifications = useCallback(async (pageNum = 1, tabKey = activeTab) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const selectedTab = MODULE_TABS.find(t => t.key === tabKey);
      const params = {
        page: pageNum,
        limit: 20
      };

      if (selectedTab?.modules && selectedTab.modules.length === 1) {
        params.module = selectedTab.modules[0];
      }

      const res = await notificationService.getAll(params);
      const data = res.data?.data || res.data || {};
      let list = data.notifications || data.list || [];
      const totalPages = data.pages || Math.ceil((data.total || 0) / 20);

      // Client-side multi-module filter if tab covers multiple modules
      if (selectedTab?.modules && selectedTab.modules.length > 1) {
        list = list.filter(n => selectedTab.modules.includes(n.module));
      }

      setNotifications(prev => pageNum === 1 ? list : [...prev, ...list]);
      setHasMore(pageNum < totalPages);
      setPage(pageNum);
    } catch (err) {
      console.error('[HeadNotificationCenter] Error fetching notifications:', err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchNotifications(1, activeTab);
  }, [activeTab, fetchNotifications]);

  // Live socket insertion
  useEffect(() => {
    if (!latestNotification) return;
    setNotifications(prev => [latestNotification, ...prev]);
  }, [latestNotification]);

  const handleMarkAsRead = async (id, isRead) => {
    if (!isRead) {
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      decrementUnreadCount();
      await notificationService.markRead(id).catch(() => {});
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      resetUnreadCount();
      await notificationService.markAllRead();
    } catch (err) {
      console.error('[MarkAllReadError]', err.message);
    }
  };

  const handleItemClick = (item) => {
    handleMarkAsRead(item._id, item.isRead);
    if (item.actionUrl) {
      navigate(item.actionUrl);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <HeadPanelPageHeader
        title="Council Notification Center"
        description="Real-time governance alerts, approval notices, community member activity, and financial logs."
        icon={Bell}
        actionLabel={unreadCount > 0 ? "Mark All as Read" : null}
        onActionClick={handleMarkAllAsRead}
        actionIcon={CheckCheck}
      />

      {/* ── Category Filter Tabs ───────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {MODULE_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent shadow-md shadow-violet-500/20 scale-[1.02]'
                  : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Notification Feed ──────────────────────────────────────────── */}
      <HeadPanelCard className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-violet-600" />
            <p className="text-sm font-semibold">Loading governance notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-500 flex items-center justify-center">
              <Sparkles size={28} />
            </div>
            <h4 className="text-base font-bold text-slate-800">No Notifications</h4>
            <p className="text-xs text-slate-500 max-w-sm">
              There are currently no alerts in this category. Important governance updates will be logged here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map(item => (
              <div
                key={item._id}
                onClick={() => handleItemClick(item)}
                className={`p-4 sm:p-5 flex items-start gap-4 hover:bg-slate-50/80 cursor-pointer transition-colors relative group ${
                  !item.isRead ? 'bg-violet-50/25' : ''
                }`}
              >
                {/* Module Icon Badge */}
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 flex items-center justify-center text-xl shrink-0 border border-violet-200/60 shadow-xs">
                  {item.icon || '🔔'}
                </div>

                {/* Body Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 bg-violet-100/70 px-2 py-0.5 rounded-md">
                        {item.module}
                      </span>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(item.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <h3 className={`text-sm font-bold mt-1 ${!item.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {item.message}
                  </p>

                  {item.actionUrl && (
                    <div className="mt-2.5 flex items-center gap-1 text-xs font-bold text-violet-600 group-hover:text-violet-700">
                      <span>Take Action / View Details</span>
                      <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && (
          <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
            <button
              onClick={() => fetchNotifications(page + 1)}
              disabled={loadingMore}
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-violet-600 hover:border-violet-300 font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 inline-flex items-center gap-2"
            >
              {loadingMore ? <Loader2 size={15} className="animate-spin text-violet-600" /> : null}
              <span>{loadingMore ? 'Loading More...' : 'Load More Notifications'}</span>
            </button>
          </div>
        )}
      </HeadPanelCard>
    </div>
  );
};

export default HeadNotificationCenter;
