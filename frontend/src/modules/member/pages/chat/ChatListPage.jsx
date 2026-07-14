import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Edit2, Phone, Video, MoreVertical,
  MessageCircle, PhoneMissed, ArrowDownLeft, ArrowUpRight, Users,
  Pin, BellOff, Check, CheckCheck, Archive, Filter, Image as ImageIcon,
  FileText, Mic, PlusCircle
} from 'lucide-react';
import { useData } from '../../context/DataProvider';
import { mockChats, mockMessages } from '../../data/mockChats';
import { Avatar } from '../../components/common/Avatar';

// ─── Formatting Helpers ─────────────────────────────────────
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

// ─── Status Icons ───────────────────────────────────────────
const MessageStatusIcon = ({ status }) => {
  if (!status) return null;
  switch (status) {
    case 'sending': return <Check size={14} className="text-gray-300" />;
    case 'sent': return <Check size={14} className="text-gray-400" />;
    case 'delivered': return <CheckCheck size={14} className="text-gray-400" />;
    case 'read': return <CheckCheck size={14} className="text-blue-500" />;
    case 'failed': return <span className="text-red-500 text-[10px]">Failed</span>;
    default: return null;
  }
};

// ─── Main Component ─────────────────────────────────────────
const ChatListPage = ({ isHub = false }) => {
  const navigate = useNavigate();
  const { chats } = useData();
  const [activeTab, setActiveTab] = useState('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, unread, groups
  const [showDropdown, setShowDropdown] = useState(false);

  // Derive message preview based on type
  const getMessagePreview = (chat) => {
    if (chat.typing) return <span className="text-brand-primary font-semibold italic">typing...</span>;
    
    // Check actual latest message if mockMessages exist
    const chatMsgs = mockMessages[chat.id];
    let msg = chat.lastMessage;
    if (chatMsgs && chatMsgs.length > 0) {
      msg = chatMsgs[chatMsgs.length - 1];
    }
    
    if (!msg) return 'No messages yet';

    let prefix = msg.senderId === 'u1' ? 'You: ' : (chat.isGroup ? `${msg.senderName}: ` : '');

    if (msg.media) {
      if (msg.media.type === 'image') return <span className="flex items-center gap-1">{prefix}<ImageIcon size={12}/> Photo</span>;
      if (msg.media.type === 'document') return <span className="flex items-center gap-1">{prefix}<FileText size={12}/> Document</span>;
      if (msg.media.type === 'audio') return <span className="flex items-center gap-1">{prefix}<Mic size={12}/> Audio</span>;
    }

    return `${prefix}${msg.text || ''}`;
  };

  const filteredChats = useMemo(() => {
    let filtered = chats.filter(c => !c.isArchived); // Exclude archived by default

    if (searchQuery.trim()) {
      filtered = filtered.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (filterType === 'unread') {
      filtered = filtered.filter(c => c.unreadCount > 0);
    } else if (filterType === 'groups') {
      filtered = filtered.filter(c => c.isGroup);
    }

    // Sort by timestamp
    return filtered.sort((a, b) => {
      const timeA = new Date(a.lastMessage?.timestamp || 0).getTime();
      const timeB = new Date(b.lastMessage?.timestamp || 0).getTime();
      return timeB - timeA;
    });
  }, [chats, searchQuery, filterType]);

  const pinnedChats = filteredChats.filter(c => c.isPinned);
  const unpinnedChats = filteredChats.filter(c => !c.isPinned);

  const totalUnread = chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  // Example Calls mock
  const mockCalls = [
    { id: 1, name: 'Mahesh Agrawal', type: 'video', status: 'missed', time: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', chatId: 'c1' },
    { id: 2, name: 'Priya Sharma', type: 'voice', status: 'incoming', time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', chatId: 'c3' },
  ];

  const renderChatItem = (chat) => {
    const isMine = chat.lastMessage?.senderId === 'u1';
    const msgStatus = isMine ? chat.lastMessage?.status || 'sent' : null;

    return (
      <div
        key={chat.id}
        onClick={() => navigate(`/member/chat/${chat.id}`)}
        className="flex items-center gap-3.5 px-4 py-3 border-b border-gray-50 bg-white hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors"
      >
        <div className="relative shrink-0">
          <Avatar
            initials={chat.initials}
            src={chat.avatar}
            size="lg"
            color={chat.isGroup ? 'bg-violet-100 text-violet-600' : 'bg-orange-100 text-orange-600'}
          />
          {chat.online && !chat.isGroup && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
          )}
          {chat.isGroup && (
            <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] bg-brand-primary rounded-full flex items-center justify-center border-2 border-white">
              <Users size={10} className="text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <h3 className={`text-[16px] truncate pr-2 ${chat.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
              {chat.name}
            </h3>
            <span className={`text-[12px] whitespace-nowrap shrink-0 ${chat.unreadCount > 0 ? 'text-brand-primary font-bold' : 'text-gray-400'}`}>
              {formatTime(chat.lastMessage?.timestamp)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {isMine && !chat.typing && (
                <div className="shrink-0"><MessageStatusIcon status={msgStatus} /></div>
              )}
              <p className={`text-[14px] truncate leading-snug ${chat.typing ? 'text-brand-primary' : (chat.unreadCount > 0 ? 'text-gray-800 font-semibold' : 'text-gray-500')}`}>
                {getMessagePreview(chat)}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {chat.isMuted && <BellOff size={14} className="text-gray-300" />}
              {chat.isPinned && <Pin size={14} className="text-gray-400 fill-gray-400" />}
              {chat.unreadCount > 0 && (
                <div className="min-w-[20px] h-5 px-1.5 rounded-full bg-brand-primary text-white flex items-center justify-center text-[11px] font-bold shadow-sm">
                  {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col bg-white ${isHub ? 'h-full' : 'min-h-screen pb-20'}`}>
      
      {/* Header Bar — Glass morphism */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-purple-100/30 pb-3 px-4 sticky top-0 z-30 shadow-[0_2px_12px_rgba(124,58,237,0.02)]">
        {!isHub && (
          <div className="flex items-center justify-between pt-3 mb-2">
            <div>
              <h1 className="text-xl font-bold text-text-primary tracking-tight">Chats</h1>
              {totalUnread > 0 && (
                <p className="text-brand-primary text-[11px] font-bold mt-0.5">You have {totalUnread} unread messages</p>
              )}
            </div>
            <div className="flex items-center gap-2 relative">
              <button className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-text-primary hover:bg-purple-50 transition-colors press-scale">
                <Search size={18} />
              </button>
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-text-primary hover:bg-purple-50 transition-colors press-scale"
              >
                <MoreVertical size={18} />
              </button>
              
              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute top-11 right-0 bg-white rounded-xl shadow-xl border border-purple-100/30 w-48 py-2 z-50 animate-fade-in text-text-primary">
                  <button className="w-full px-4 py-2.5 text-left text-[13px] font-bold hover:bg-purple-50 flex items-center gap-3">
                    <Users size={16} /> New Group
                  </button>
                  <button className="w-full px-4 py-2.5 text-left text-[13px] font-bold hover:bg-purple-50 flex items-center gap-3">
                    <Archive size={16} /> Archived Chats
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mt-2">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl py-2.5 pl-10 pr-4 text-[13px] font-bold outline-none transition-all bg-white border border-purple-100/30 focus:border-brand-primary/45 focus:shadow-[0_0_0_3px_rgba(124,58,237,0.08)] focus:bg-white text-text-primary placeholder:text-text-secondary shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* CHAT LIST */}
      <div className="flex-1 bg-transparent overflow-y-auto pb-28">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-60">
            <MessageCircle size={48} className="text-gray-300" />
            <p className="text-gray-500 text-[15px] font-medium">No conversations found</p>
          </div>
        ) : (
          <>
            {pinnedChats.length > 0 && (
              <div className="mb-2">
                <div className="px-4 py-2 bg-gray-50 flex items-center gap-2">
                  <Pin size={12} className="text-gray-400" />
                  <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Pinned</span>
                </div>
                {pinnedChats.map(renderChatItem)}
              </div>
            )}

            {unpinnedChats.length > 0 && (
              <div>
                {pinnedChats.length > 0 && (
                  <div className="px-4 py-2 bg-gray-50 flex items-center gap-2">
                    <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">All Chats</span>
                  </div>
                )}
                {unpinnedChats.map(renderChatItem)}
              </div>
            )}
          </>
        )}
      </div>

      {/* FAB */}
      {!isHub && (
        <button
          className="fixed bottom-24 right-5 w-14 h-14 bg-brand-primary text-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.25)] flex items-center justify-center active:scale-95 transition-transform z-30"
        >
          <MessageCircle size={24} />
          <div className="absolute bottom-2 right-2 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
            <PlusCircle size={14} className="text-brand-primary" fill="white" />
          </div>
        </button>
      )}
    </div>
  );
};

export default ChatListPage;
