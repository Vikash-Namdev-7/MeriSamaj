import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MoreVertical, MessageCircle, Users, Archive, PlusCircle, RefreshCcw, Loader2, Heart
} from 'lucide-react';
import { useUnifiedConversations } from '../../hooks/useUnifiedConversations';
import ConversationCard from '../../components/chat/ConversationCard';

const ChatListPage = ({ isHub = false }) => {
  const navigate = useNavigate();
  
  // Tab persistence
  const [activeTab, setActiveTab] = useState(() => {
    let saved = localStorage.getItem('messagesHub_activeTab') || 'all';
    if (saved === 'groups') saved = 'all';
    return saved;
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const { conversations, loading, error, refreshConversations, markConversationRead } = useUnifiedConversations();

  // Handle Tab Switch
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchQuery('');
    localStorage.setItem('messagesHub_activeTab', tabId);
  };

  // Filter conversations based on tab and search
  const filteredConvs = useMemo(() => {
    let filtered = conversations.filter(c => c.type !== 'group');

    // 1. Filter by Tab
    if (activeTab === 'direct') {
      filtered = filtered.filter(c => c.type === 'direct');
    } else if (activeTab === 'matrimonial') {
      filtered = filtered.filter(c => c.type === 'matrimonial');
    }

    // 2. Filter by Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c => (c.title || '').toLowerCase().includes(q));
    }

    return filtered;
  }, [conversations, activeTab, searchQuery]);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'direct', label: 'Direct' },
    { id: 'matrimonial', label: 'Matrimonial' }
  ];

  const handleCardClick = (conv) => {
    markConversationRead(conv.conversationId);
    navigate(conv.route, { state: { from: '/member/social', tab: 'chat' } });
  };

  const getEmptyState = () => {
    if (searchQuery) return { icon: Search, title: 'No results found', desc: `No conversations match "${searchQuery}"` };
    if (activeTab === 'direct') return { icon: MessageCircle, title: 'No direct chats', desc: 'Start a conversation with a community member.' };
    if (activeTab === 'matrimonial') return { icon: Heart, title: 'No matrimonial chats', desc: 'Chats will appear here when an interest is accepted.' };
    return { icon: MessageCircle, title: 'No conversations yet', desc: 'Start chatting with members.' };
  };

  const emptyState = getEmptyState();
  const EmptyIcon = emptyState.icon;

  return (
    <div className={`flex flex-col bg-white ${isHub ? 'h-full' : 'min-h-screen pb-20'}`}>

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-gray-100 pb-0 px-4 sticky top-0 z-30 shadow-sm">
        {!isHub && (
          <div className="flex items-center justify-between pt-4 mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            </div>
            <div className="flex items-center gap-2 relative">
              <button
                onClick={refreshConversations}
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
              placeholder={`Search ${activeTab === 'all' ? 'all conversations' : activeTab}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl py-2.5 pl-10 pr-4 text-[13px] font-medium outline-none bg-gray-50 border border-gray-100 focus:border-brand-primary/40 focus:bg-white transition-all text-gray-800 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto hide-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 whitespace-nowrap px-4 py-2.5 text-[13.5px] font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
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
        {loading && filteredConvs.length === 0 && !error && (
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

        {/* Empty State */}
        {!loading && filteredConvs.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-6">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-2">
              <EmptyIcon size={28} className={activeTab === 'matrimonial' ? 'text-pink-400' : 'text-gray-400'} />
            </div>
            <div>
              <p className="text-gray-700 text-[16px] font-bold mb-2">{emptyState.title}</p>
              <p className="text-gray-500 text-[13px] leading-relaxed mb-6">
                {emptyState.desc}
              </p>
              {activeTab === 'direct' && (
                <button
                  onClick={() => navigate('/member/directory')}
                  className="bg-brand-primary text-white font-bold text-[14px] px-6 py-2.5 rounded-xl shadow-md shadow-brand-primary/20 press-scale"
                >
                  Browse Directory
                </button>
              )}
              {activeTab === 'matrimonial' && (
                <button
                  onClick={() => navigate('/member/matrimony')}
                  className="bg-brand-primary text-white font-bold text-[14px] px-6 py-2.5 rounded-xl shadow-md shadow-brand-primary/20 press-scale"
                >
                  Find Matches
                </button>
              )}
            </div>
          </div>
        )}

        {/* Conversation List */}
        {filteredConvs.map(conv => (
          <ConversationCard
            key={`${conv.type}_${conv.id}`}
            conv={conv}
            onClick={() => handleCardClick(conv)}
          />
        ))}
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
