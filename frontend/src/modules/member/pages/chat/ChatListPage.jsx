import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MoreVertical, MessageCircle, Users, Pin, BellOff,
  Check, CheckCheck, Archive, PlusCircle, RefreshCcw, Loader2
} from 'lucide-react';
import { Avatar } from '../../components/common/Avatar';
import { useMemberConversations } from '../../hooks/useMemberChat';
import { useGroups } from '../../hooks/useGroups';

// ─── Formatting Helpers ───────────────────────────────────────────────────────
const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now   = new Date();
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

const MessageStatusIcon = ({ status }) => {
  if (!status) return null;
  switch (status) {
    case 'sent':      return <Check size={14} className="text-gray-400" />;
    case 'delivered': return <CheckCheck size={14} className="text-gray-400" />;
    case 'read':      return <CheckCheck size={14} className="text-blue-500" />;
    default: return null;
  }
};

// ─── Conversation Item ────────────────────────────────────────────────────────
const ConvItem = ({ conv, myId, onClick }) => {
  const other   = conv.otherUser;
  const name    = other?.name || conv.name || 'Unknown';
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const preview = conv.lastMessagePreview || 'No messages yet';
  const isGroup = conv.type === 'group';

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3.5 px-4 py-3.5 border-b border-gray-50 bg-white hover:bg-purple-50/20 active:bg-purple-100/20 cursor-pointer transition-colors"
    >
      <div className="relative shrink-0">
        <Avatar
          initials={initials}
          src={other?.avatar || conv.avatar}
          size="lg"
          color={isGroup ? 'bg-violet-100 text-violet-600' : 'bg-orange-100 text-orange-600'}
        />
        {isGroup && (
          <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] bg-brand-primary rounded-full flex items-center justify-center border-2 border-white">
            <Users size={10} className="text-white" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="text-[15.5px] font-semibold text-gray-900 truncate pr-2">{name}</h3>
          <span className="text-[12px] whitespace-nowrap shrink-0 text-gray-400">
            {formatTime(conv.lastMessageAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13.5px] truncate text-gray-500 leading-snug">{preview}</p>
          {conv.unreadCount > 0 && (
            <div className="min-w-[20px] h-5 px-1.5 rounded-full bg-brand-primary text-white flex items-center justify-center text-[11px] font-bold shadow-sm shrink-0">
              {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Group Item ───────────────────────────────────────────────────────────────
const GroupItem = ({ group, onClick }) => {
  const initials = group.name.substring(0, 2).toUpperCase();
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3.5 px-4 py-3.5 border-b border-gray-50 bg-white hover:bg-purple-50/20 active:bg-purple-100/20 cursor-pointer transition-colors"
    >
      <div className="relative shrink-0">
        <Avatar
          initials={initials}
          src={group.avatar}
          size="lg"
          color="bg-violet-100 text-violet-600"
        />
        <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] bg-brand-primary rounded-full flex items-center justify-center border-2 border-white">
          <Users size={10} className="text-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="text-[15.5px] font-semibold text-gray-900 truncate pr-2">{group.name}</h3>
          <span className="text-[12px] text-gray-400">{group.memberCount || group.members?.length || 0} members</span>
        </div>
        <p className="text-[13.5px] truncate text-gray-500">{group.description || `${group.category} · ${group.type}`}</p>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ChatListPage = ({ isHub = false }) => {
  const navigate  = useNavigate();
  const [activeTab, setActiveTab] = useState('chats');  // 'chats' | 'groups'
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Real API data
  const { conversations, loading: convLoading, error: convError, refresh: refreshConvs } = useMemberConversations();
  const { groups, loading: groupsLoading, refresh: refreshGroups } = useGroups({ myGroupsOnly: true });

  const filteredConvs = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(c => {
      const name = c.otherUser?.name || c.name || '';
      return name.toLowerCase().includes(q);
    });
  }, [conversations, searchQuery]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const q = searchQuery.toLowerCase();
    return groups.filter(g => g.name.toLowerCase().includes(q));
  }, [groups, searchQuery]);

  const tabs = [
    { id: 'chats',  label: 'Chats',  count: conversations.length },
    { id: 'groups', label: 'Groups', count: groups.length }
  ];

  const loading = activeTab === 'chats' ? convLoading : groupsLoading;
  const error   = convError;

  const handleOpenMemberChat = useCallback(async (targetUserId) => {
    // Navigate to member chat room — the page handles openConversation itself
    navigate(`/member/chat/member/${targetUserId}`);
  }, [navigate]);

  return (
    <div className={`flex flex-col bg-white ${isHub ? 'h-full' : 'min-h-screen pb-20'}`}>

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-gray-100 pb-0 px-4 sticky top-0 z-30 shadow-sm">
        {!isHub && (
          <div className="flex items-center justify-between pt-4 mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Community Chat</h1>
              {conversations.length > 0 && (
                <p className="text-brand-primary text-[12px] font-semibold mt-0.5">
                  {conversations.length} active conversations
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 relative">
              <button
                onClick={() => activeTab === 'chats' ? refreshConvs() : refreshGroups()}
                className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-purple-50 transition-colors"
                title="Refresh"
              >
                {loading ? <Loader2 size={17} className="animate-spin text-brand-primary" /> : <RefreshCcw size={17} />}
              </button>
              <button
                onClick={() => setShowDropdown(p => !p)}
                className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-purple-50 transition-colors"
              >
                <MoreVertical size={18} />
              </button>
              {showDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                  <div className="absolute top-11 right-0 bg-white rounded-xl shadow-xl border border-purple-100/40 w-48 py-2 z-50 animate-fade-in">
                    <button
                      onClick={() => { setShowDropdown(false); navigate('/member/groups'); }}
                      className="w-full px-4 py-2.5 text-left text-[13px] font-semibold hover:bg-purple-50 flex items-center gap-3 text-gray-700"
                    >
                      <Users size={15} /> Discover Groups
                    </button>
                    <button
                      onClick={() => { setShowDropdown(false); navigate('/member/announcements'); }}
                      className="w-full px-4 py-2.5 text-left text-[13px] font-semibold hover:bg-purple-50 flex items-center gap-3 text-gray-700"
                    >
                      <Archive size={15} /> Announcements
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={activeTab === 'chats' ? 'Search conversations...' : 'Search joined groups...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl py-2.5 pl-10 pr-4 text-[13px] font-medium outline-none bg-gray-50 border border-gray-100 focus:border-brand-primary/40 focus:bg-white transition-all text-gray-800 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[13.5px] font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-28">

        {/* Error */}
        {error && (
          <div className="mx-4 my-3 px-4 py-3 bg-red-50 rounded-xl border border-red-100 text-red-600 text-[13px] font-medium">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-0">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3.5 px-4 py-3.5 border-b border-gray-50 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-gray-200 rounded-full w-1/2" />
                  <div className="h-3 bg-gray-100 rounded-full w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chats Tab */}
        {!loading && activeTab === 'chats' && (
          filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-6">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-2">
                <MessageCircle size={28} className="text-gray-400" />
              </div>
              <div>
                <p className="text-gray-700 text-[16px] font-bold mb-2">No conversations yet</p>
                <p className="text-gray-500 text-[13px] leading-relaxed mb-6">
                  Start a conversation with any member of your community to see it here.
                </p>
                <button
                  onClick={() => navigate('/member/directory')}
                  className="bg-brand-primary text-white font-bold text-[14px] px-6 py-2.5 rounded-xl shadow-md shadow-brand-primary/20 press-scale"
                >
                  Browse Directory
                </button>
              </div>
            </div>
          ) : (
            filteredConvs.map(conv => (
              <ConvItem
                key={conv._id}
                conv={conv}
                myId={null}
                onClick={() => navigate(`/member/chat/conv/${conv._id}`)}
              />
            ))
          )
        )}

        {/* Groups Tab (joined groups only) */}
        {!loading && activeTab === 'groups' && (
          filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-6">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Users size={28} className="text-gray-400" />
              </div>
              <div>
                <p className="text-gray-700 text-[15px] font-bold mb-1">No joined groups</p>
                <p className="text-gray-400 text-[13px]">Discover and join community groups.</p>
              </div>
              <button
                onClick={() => navigate('/member/groups')}
                className="px-5 py-2.5 bg-brand-primary text-white text-[13px] font-bold rounded-xl shadow-sm hover:bg-brand-primary/90 transition-colors"
              >
                Discover Groups
              </button>
            </div>
          ) : (
            filteredGroups.map(group => (
              <GroupItem
                key={group._id}
                group={group}
                onClick={() => navigate(`/member/groups/${group._id}`)}
              />
            ))
          )
        )}
      </div>

      {/* FAB — New Chat */}
      {!isHub && (
        <button
          onClick={() => navigate('/member/directory')}
          title="Start new chat from Members Directory"
          className="fixed bottom-24 right-5 w-14 h-14 bg-brand-primary text-white rounded-2xl shadow-[0_8px_24px_rgba(124,58,237,0.35)] flex items-center justify-center active:scale-95 transition-transform z-30 hover:bg-brand-primary/90"
        >
          <MessageCircle size={24} />
          <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
            <PlusCircle size={14} className="text-brand-primary" fill="white" />
          </div>
        </button>
      )}
    </div>
  );
};

export default ChatListPage;
