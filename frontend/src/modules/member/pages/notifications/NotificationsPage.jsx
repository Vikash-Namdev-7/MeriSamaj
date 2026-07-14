import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Megaphone, Heart, Calendar, Users, Check, Vote, Mail, HeartHandshake, Flame } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { useData, getNotificationModule } from '../../context/DataProvider';
import { mockNotifications } from '../../data/mockEvents';

const typeConfig = {
  announcement: { icon: Megaphone, color: 'bg-brand-primary/10 text-brand-primary' },
  matrimonial: { icon: Heart, color: 'bg-matrimonial-module/10 text-matrimonial-module' },
  event: { icon: Calendar, color: 'bg-social-module/10 text-social-module' },
  community: { icon: Users, color: 'bg-emerald-100 text-emerald-600' },
  group: { icon: Users, color: 'bg-indigo-100 text-indigo-600' },
  voting: { icon: Vote, color: 'bg-purple-100 text-purple-650' },
  donation: { icon: HeartHandshake, color: 'bg-rose-100 text-rose-600' },
  nimantran: { icon: Mail, color: 'bg-indigo-100 text-indigo-650' },
  shradhanjali: { icon: Flame, color: 'bg-amber-100 text-amber-700' }
};

const moduleTitles = {
  home: 'General Notifications',
  matrimonial: 'Matrimonial Alerts',
  nimantran: 'Invitation Alerts',
  chat: 'Chat Notifications',
  donation: 'Donation Updates',
  voting: 'Voting Updates',
  shradhanjali: 'Shradhanjali Alerts',
  community: 'Community Updates'
};

const NotificationsPage = () => {
  const { followedAnnouncements, toggleFollowedAnnouncement, notifications, markAllNotificationsRead, groups } = useData();
  const [showSettings, setShowSettings] = useState(false);
  const [searchParams] = useSearchParams();
  const activeModule = searchParams.get('module') || 'home';

  const markAllRead = () => {
    markAllNotificationsRead(activeModule);
  };

  // Filter notifications based on preferences and active module
  const filteredNotifications = notifications.filter(n => {
    const nModule = getNotificationModule(n.type);
    if (nModule !== activeModule) return false;

    if (n.type === 'announcement') return followedAnnouncements?.announcements;
    if (n.type === 'matrimonial') return followedAnnouncements?.matrimonial;
    if (n.type === 'event') return followedAnnouncements?.events;
    if (n.type === 'voting') return followedAnnouncements?.voting !== false;
    if (n.type === 'group') {
      const g = groups.find(group => group.id === n.groupId);
      return followedAnnouncements?.groups && (!g || !g.isMuted);
    }
    if (n.type === 'nimantran' || n.type === 'invitation') return followedAnnouncements?.nimantran !== false;
    if (n.type === 'donation') return followedAnnouncements?.donation !== false;
    if (n.type === 'shradhanjali') return followedAnnouncements?.shradhanjali !== false;
    if (['community', 'member', 'follow_request_sent', 'follow_accept'].includes(n.type)) return followedAnnouncements?.community !== false;
    return true;
  });

  const modulePreferences = {
    home: [
      { key: 'announcements', label: 'Samaj Announcements' },
      { key: 'events', label: 'Community Events' }
    ],
    matrimonial: [
      { key: 'matrimonial', label: 'Matrimonial Alerts' }
    ],
    chat: [
      { key: 'groups', label: 'Group & Chat Activity' }
    ],
    voting: [
      { key: 'voting', label: 'Voting & Poll Alerts' }
    ],
    nimantran: [
      { key: 'nimantran', label: 'Invitation Alerts' }
    ],
    donation: [
      { key: 'donation', label: 'Donation Updates' }
    ],
    shradhanjali: [
      { key: 'shradhanjali', label: 'Shradhanjali Alerts' }
    ],
    community: [
      { key: 'community', label: 'Community Updates' }
    ]
  };

  const activePreferences = modulePreferences[activeModule] || [];

  return (
    <div className="min-h-screen bg-surface pb-28">
      <PageHeader
        title={moduleTitles[activeModule] || 'General Notifications'}
        showBack={true}
        rightContent={
          <div className="flex items-center gap-2">
            {activePreferences.length > 0 && (
              <button 
                onClick={() => setShowSettings(!showSettings)} 
                className={`text-[12px] font-bold px-3 py-1.5 rounded-xl border transition-all press-scale ${
                  showSettings 
                    ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' 
                    : 'bg-gray-50 border-gray-200 text-text-secondary'
                }`}
              >
                Filters
              </button>
            )}
            <button onClick={markAllRead} className="text-[12px] text-brand-primary font-bold press-scale flex items-center gap-1">
              <Check size={14} /> Read all
            </button>
          </div>
        }
      />

      <div className="pt-16 max-w-lg mx-auto w-full">
        {showSettings && activePreferences.length > 0 && (
          <div className="card-neo mx-5 p-4 mb-4 shadow-sm animate-fade-in-down">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Subscription Preferences</h3>
            <div className="space-y-3">
              {activePreferences.map(pref => (
                <div key={pref.key} className="flex items-center justify-between">
                  <span className="text-sm font-bold text-text-primary">{pref.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={followedAnnouncements?.[pref.key] !== false} 
                      onChange={() => toggleFollowedAnnouncement(pref.key)} 
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-purple-100/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-purple-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Megaphone size={36} className="text-purple-200 mx-auto mb-2" />
            <p className="text-sm font-semibold text-text-secondary">No notifications matching your filters</p>
          </div>
        ) : (
          filteredNotifications.map((n, i) => {
            const config = typeConfig[n.type] || typeConfig.community || typeConfig.announcement;
            return (
              <div
                key={n.id}
                className={`flex items-start gap-4 px-5 py-4 border-b border-purple-100/10 animate-stagger-fade-in ${
                  !n.isRead ? 'bg-purple-50/40' : 'bg-transparent'
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center shrink-0 mt-0.5 border border-purple-100/10`}>
                  <config.icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-[15px] ${!n.isRead ? 'font-bold' : 'font-semibold'} text-text-primary`}>{n.title}</h4>
                    {!n.isRead && <div className="w-2.5 h-2.5 bg-brand-primary rounded-full shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-[13px] text-text-secondary mt-1 leading-relaxed">{n.message}</p>
                  <p className="text-[11px] text-text-muted mt-1.5 font-bold">{n.time}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
