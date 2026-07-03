import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Video, Heart, MoreVertical, Send, Camera, Search, X,
  CheckCheck, Star, Shield, ChevronDown, ChevronUp, Smile, Mic,
  CornerUpLeft, Sparkles, BookHeart, UserCheck, Calendar, Phone
} from 'lucide-react';
import { useData } from '../../context/DataProvider';

const formatTime = (iso) => {
  try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
};

const EMOJI_REACTIONS = ['❤️', '😊', '🙏', '👍', '😮', '🌹', '💍'];

const ICEBREAKERS = [
  { text: 'Hi! I would love to know more about you 😊', icon: '👋' },
  { text: 'Your profile is very impressive 🌸', icon: '✨' },
  { text: 'I believe we share similar values 🙏', icon: '💫' },
  { text: 'Would you like to connect and talk? 💬', icon: '💕' },
];

const TypingIndicator = () => (
  <div className="flex justify-start items-end gap-2 py-1">
    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-[0_2px_8px_rgba(139,26,74,0.12)] border border-rose-100">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-rose-400"
            style={{ animation: `matrimonialBounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
    </div>
  </div>
);

const MatrimonialChatPage = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const { currentUser, matrimonialProfiles, chatMessages, sendChatMessage } = useData();

  // Look up in matrimonialProfiles first or fallback to dictionary mapping to make all conversations dynamic
  let profile = matrimonialProfiles?.find(p => p.id === profileId);
  if (!profile) {
    const mockDict = {
      'feed_priya': {
        id: 'feed_priya',
        name: 'Priyel Bhatnagar',
        age: 26,
        city: 'Delhi',
        profession: 'Software Developer',
        community: 'Agrawal',
        education: 'B.Tech, Delhi University',
        annualIncome: '10-15 LPA',
        gotra: 'Jatav',
        diet: 'Vegetarian',
        maritalStatus: 'Never Married',
        matchScore: 92,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        online: true,
        premiumStatus: true
      },
      'feed_ruchi': {
        id: 'feed_ruchi',
        name: 'Aakanksha Saini',
        age: 25,
        city: 'Jaipur',
        profession: 'UI/UX Designer',
        community: 'Saini',
        education: 'B.Des, NID',
        annualIncome: '8-12 LPA',
        gotra: 'Saini',
        diet: 'Vegetarian',
        maritalStatus: 'Never Married',
        matchScore: 88,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        online: false,
        premiumStatus: false
      },
      's_verma': {
        id: 's_verma',
        name: 'S verma',
        age: 27,
        city: 'Bhopal',
        profession: 'Business Owner',
        community: 'Verma',
        education: 'MBA, DAVV',
        annualIncome: '15-20 LPA',
        gotra: 'Verma',
        diet: 'Vegetarian',
        maritalStatus: 'Never Married',
        matchScore: 85,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        online: true,
        premiumStatus: true
      },
      'rani': {
        id: 'rani',
        name: 'Rani',
        age: 24,
        city: 'Indore',
        profession: 'Teacher',
        community: 'Garg',
        education: 'M.Ed',
        annualIncome: '4-6 LPA',
        gotra: 'Garg',
        diet: 'Vegetarian',
        maritalStatus: 'Never Married',
        matchScore: 90,
        avatar: '',
        online: true,
        premiumStatus: false
      },
      'jagriti': {
        id: 'jagriti',
        name: 'Jagriti Gupta',
        age: 28,
        city: 'Mumbai',
        profession: 'Chartered Accountant',
        community: 'Agrawal',
        education: 'CA, ICAI',
        annualIncome: '18-22 LPA',
        gotra: 'Gupta',
        diet: 'Vegetarian',
        maritalStatus: 'Never Married',
        matchScore: 94,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        online: true,
        premiumStatus: true
      },
      'pragati': {
        id: 'pragati',
        name: 'Jaiswal Pragati',
        age: 26,
        city: 'Indore',
        profession: 'HR Manager',
        community: 'Jaiswal',
        education: 'MBA, IMS',
        annualIncome: '7-9 LPA',
        gotra: 'Jaiswal',
        diet: 'Vegetarian',
        maritalStatus: 'Never Married',
        matchScore: 87,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
        online: true,
        premiumStatus: false
      },
      'txar8899': {
        id: 'txar8899',
        name: 'TXAR8899',
        age: 29,
        city: 'Jaipur',
        profession: 'Marketing Professional',
        community: 'Mali',
        education: 'MBA, Nirma',
        annualIncome: '15-20 LPA',
        gotra: 'Mali',
        diet: 'Vegetarian',
        maritalStatus: 'Never Married',
        matchScore: 89,
        avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80',
        online: false,
        premiumStatus: false
      },
      'aanchal': {
        id: 'aanchal',
        name: 'Aanchal Parheta',
        age: 25,
        city: 'Jabalpur',
        profession: 'Software Professional',
        community: 'Koshti',
        education: 'B.E, SGSITS',
        annualIncome: '7.5-10 LPA',
        gotra: 'Koshti',
        diet: 'Vegetarian',
        maritalStatus: 'Never Married',
        matchScore: 91,
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
        online: false,
        premiumStatus: false
      }
    };
    profile = mockDict[profileId] || {
      id: profileId,
      name: 'Priyel Bhatnagar',
      age: 26,
      city: 'Delhi',
      profession: 'Software Developer',
      community: 'Agrawal',
      education: 'B.Tech, Delhi University',
      annualIncome: '10-15 LPA',
      gotra: 'Jatav',
      diet: 'Vegetarian',
      maritalStatus: 'Never Married',
      matchScore: 92,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      online: true,
      premiumStatus: true,
    };
  }

  const chatId = `matrimonial_${profileId}`;
  const messages = chatMessages?.[chatId] || [];

  const [newMessage, setNewMessage] = useState('');
  const [showIcebreakers, setShowIcebreakers] = useState(true);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [reactionTarget, setReactionTarget] = useState(null);
  const [localReactions, setLocalReactions] = useState({});
  const [replyTarget, setReplyTarget] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (messages.length > 0) setShowIcebreakers(false);
  }, [messages.length]);

  // Scroll lock effect for overlays
  useEffect(() => {
    const isOverlayOpen = showProfileCard || showMenu || reactionTarget;
    if (isOverlayOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [showProfileCard, showMenu, reactionTarget]);

  const handleSend = (text) => {
    const trimmed = (text || newMessage).trim();
    if (!trimmed && !pendingImage) return;
    sendChatMessage(chatId, trimmed || '📷 Photo');
    setNewMessage('');
    setPendingImage(null);
    setReplyTarget(null);
    setShowIcebreakers(false);
    inputRef.current?.focus();
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 2000);
  };

  const handleReaction = (msgId, emoji) => {
    setLocalReactions(prev => {
      const existing = prev[msgId] || [];
      return { ...prev, [msgId]: existing.includes(emoji) ? existing.filter(e => e !== emoji) : [...existing, emoji] };
    });
    setReactionTarget(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPendingImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const filteredMessages = isSearchOpen && searchQuery
    ? messages.filter(m => m.text?.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return (
    <div className="flex flex-col h-[100dvh] relative overflow-hidden bg-[#FFF8F5]"
      onClick={() => { setReactionTarget(null); setShowMenu(false); }}>

      {/* ─── GRADIENT HEADER ─── */}
      <div
        className="shrink-0 z-20 shadow-[0_4px_20px_rgba(139,26,74,0.25)]"
        style={{
          background: 'linear-gradient(135deg, #8B1A4A 0%, #C2185B 50%, #E91E8C 100%)',
          paddingTop: 'max(env(safe-area-inset-top, 0px) + 10px, 10px)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-3 pb-3">
          <button onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center active:bg-white/10 shrink-0">
            <ArrowLeft size={22} className="text-white" />
          </button>

          <button
            onClick={() => setShowProfileCard(p => !p)}
            className="flex items-center gap-3 flex-1 min-w-0 text-left"
          >
            <div className="relative shrink-0">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-white/40 shadow-md"
              />
              {profile.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#C2185B] rounded-full" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-white font-bold text-[15px] truncate">{profile.name}</h2>
                {profile.premiumStatus && (
                  <Shield size={13} className="text-yellow-300 shrink-0" fill="currentColor" />
                )}
              </div>
              <p className="text-white/70 text-[11px] truncate">
                {isTyping
                  ? <span className="text-pink-200 animate-pulse font-semibold">typing...</span>
                  : `${profile.age} yrs · ${profile.city} · ${profile.profession}`}
              </p>
            </div>
            <div className="shrink-0 mr-1">
              {showProfileCard
                ? <ChevronUp size={16} className="text-white/60" />
                : <ChevronDown size={16} className="text-white/60" />}
            </div>
          </button>

          <div className="flex items-center gap-0.5 shrink-0">
            <button onClick={() => setIsSearchOpen(p => !p)}
              className="w-9 h-9 rounded-full flex items-center justify-center active:bg-white/10">
              <Search size={18} className="text-white" />
            </button>
            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setShowMenu(p => !p); }}
                className="w-9 h-9 rounded-full flex items-center justify-center active:bg-white/10">
                <MoreVertical size={20} className="text-white" />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute top-11 right-0 bg-white rounded-xl shadow-xl py-2 w-52 z-50 border border-rose-100">
                    {[
                      { icon: UserCheck, label: 'View Full Profile', action: () => { navigate(`/member/matrimonial/${profile.id}`); setShowMenu(false); }, color: 'text-rose-600' },
                      { icon: BookHeart, label: 'Share Horoscope', action: () => setShowMenu(false), color: 'text-purple-600' },
                      { icon: Star, label: 'Shortlist Profile', action: () => setShowMenu(false), color: 'text-amber-600' },
                    ].map(item => (
                      <button key={item.label} onClick={item.action}
                        className="w-full text-left px-4 py-2.5 text-[13px] font-semibold flex items-center gap-2.5 hover:bg-rose-50/50">
                        <item.icon size={15} className={item.color} />
                        <span className="text-gray-800">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Interest accepted chip */}
        <div className="flex items-center justify-center gap-2 pb-3">
          <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
            <Heart size={11} className="text-pink-200" fill="currentColor" />
            <span className="text-white/90 text-[11px] font-bold">Interest Accepted · Connected</span>
            <span className="text-green-300 text-[10px] font-black">✓</span>
          </div>
        </div>

        {/* Search bar */}
        {isSearchOpen && (
          <div className="px-3 pb-2.5 flex items-center gap-2">
            <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
              <Search size={14} className="text-white/70 shrink-0" />
              <input autoFocus type="text" placeholder="Search messages..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-white/60 text-[14px] outline-none" />
              {searchQuery && <button onClick={() => setSearchQuery('')}><X size={13} className="text-white/70" /></button>}
            </div>
            <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
              className="text-white/80 text-[13px] font-semibold">Cancel</button>
          </div>
        )}
      </div>

      {/* ─── MINI PROFILE CARD ─── */}
      {showProfileCard && (
        <div className="bg-white border-b border-rose-100 px-4 py-3 shrink-0 shadow-[0_2px_8px_rgba(139,26,74,0.08)] z-10"
          onClick={e => e.stopPropagation()}>
          <div className="flex items-start gap-3">
            <img src={profile.avatar} alt={profile.name}
              className="w-16 h-20 rounded-xl object-cover border border-rose-100 shadow-sm shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-[15px] font-black text-rose-800">{profile.name}</h3>
                <span className="text-[10px] font-bold bg-gradient-to-r from-rose-500 to-pink-500 text-white px-1.5 py-0.5 rounded-full">{profile.matchScore}% Match</span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                {[
                  { label: 'Age', val: `${profile.age} yrs` },
                  { label: 'City', val: profile.city },
                  { label: 'Education', val: profile.education },
                  { label: 'Income', val: profile.annualIncome },
                  { label: 'Gotra', val: profile.gotra },
                  { label: 'Diet', val: profile.diet },
                ].map(({ label, val }) => (
                  <p key={label} className="text-[10.5px] text-gray-500">
                    <span className="font-bold text-gray-700">{label}: </span>{val || '—'}
                  </p>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate(`/member/matrimonial/${profile.id}`)}
            className="mt-2.5 w-full py-2 rounded-xl text-[12px] font-black text-rose-600 border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-colors">
            View Full Profile →
          </button>
        </div>
      )}

      {/* ─── MESSAGES ─── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 z-10 relative"
        style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,182,193,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(233,30,140,0.06) 0%, transparent 50%)' }}>

        <div className="flex justify-center mb-4">
          <span className="bg-rose-100/80 text-rose-700 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm border border-rose-200/50">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>

        {/* Interest accepted system message */}
        {messages.length === 0 && !showIcebreakers && (
          <div className="flex justify-center mb-3">
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl px-4 py-3 max-w-xs text-center shadow-sm">
              <div className="text-2xl mb-1">🌹</div>
              <p className="text-rose-700 text-[12px] font-bold">Interest Accepted!</p>
              <p className="text-rose-500 text-[11px] mt-0.5">You and {profile.name} are now connected.<br />Start the conversation below.</p>
            </div>
          </div>
        )}

        {filteredMessages.map((msg) => {
          const isMine = msg.senderId === 'u1';
          const msgReactions = localReactions[msg.id] || [];

          return (
            <div key={msg.id}
              className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'} mb-3`}>

              {!isMine && (
                <img src={profile.avatar} alt={profile.name}
                  className="w-7 h-7 rounded-full object-cover border border-rose-200 shrink-0 mb-1 shadow-sm" />
              )}

              <div className="relative max-w-[76%]">
                {msg.replyTo && (
                  <div className={`text-[11px] font-semibold px-3 py-1.5 rounded-t-xl border-l-4 mb-0.5 ${
                    isMine ? 'bg-rose-100 border-rose-400 text-rose-700' : 'bg-gray-100 border-pink-400 text-gray-600'
                  }`}>
                    <CornerUpLeft size={10} className="inline mr-1" />
                    {msg.replyTo}
                  </div>
                )}

                <div
                  onClick={e => { e.stopPropagation(); setReactionTarget(reactionTarget === msg.id ? null : msg.id); }}
                  className={`px-4 py-2.5 rounded-2xl cursor-pointer select-none shadow-[0_2px_8px_rgba(0,0,0,0.08)] relative ${
                    isMine
                      ? 'rounded-tr-sm text-white'
                      : 'rounded-tl-sm bg-white text-gray-900 border border-rose-100'
                  }`}
                  style={isMine ? { background: 'linear-gradient(135deg, #C2185B, #E91E8C)' } : {}}
                >
                  {msg.text && <p className="text-[14px] leading-relaxed pr-14">{msg.text}</p>}
                  <div className={`absolute bottom-1.5 right-3 flex items-center gap-0.5 ${
                    isMine ? 'text-white/60' : 'text-gray-400'
                  }`}>
                    <span className="text-[9.5px] font-medium">{formatTime(msg.timestamp)}</span>
                    {isMine && <CheckCheck size={12} className="text-white/70" />}
                  </div>
                </div>

                {msgReactions.length > 0 && (
                  <div className={`absolute -bottom-3 ${isMine ? 'right-2' : 'left-2'} bg-white border border-rose-100 rounded-full px-1.5 py-0.5 shadow-sm flex items-center gap-0.5 z-10`}>
                    {msgReactions.map((r, i) => <span key={i} className="text-[11px]">{r}</span>)}
                  </div>
                )}

                {reactionTarget === msg.id && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={e => { e.stopPropagation(); setReactionTarget(null); }} />
                    <div className={`absolute z-50 -top-12 ${isMine ? 'right-0' : 'left-0'} bg-white border border-rose-100 rounded-full px-2.5 py-2 shadow-xl flex items-center gap-2`}>
                      {EMOJI_REACTIONS.map(emoji => (
                        <button key={emoji} onClick={e => { e.stopPropagation(); handleReaction(msg.id, emoji); }}
                          className={`text-[18px] hover:scale-125 transition-transform ${msgReactions.includes(emoji) ? 'scale-110' : 'opacity-80'}`}>
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {isMine && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0 mb-1 shadow-sm border-2 border-white"
                  style={{ background: 'linear-gradient(135deg, #C2185B, #E91E8C)' }}>
                  {(currentUser?.initials || 'ME').substring(0, 2)}
                </div>
              )}
            </div>
          );
        })}

        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* ─── ICEBREAKER CHIPS ─── */}
      {showIcebreakers && (
        <div className="px-4 py-2 shrink-0 bg-white border-t border-rose-100" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={12} className="text-rose-400" />
            <span className="text-[11px] font-bold text-rose-500">Break the ice:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ICEBREAKERS.map((ice) => (
              <button
                key={ice.text}
                onClick={() => handleSend(ice.text)}
                className="flex items-center gap-1 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 text-rose-700 rounded-full px-3 py-1.5 text-[11px] font-bold active:scale-95 transition-transform shadow-sm"
              >
                <span>{ice.icon}</span>
                <span className="line-clamp-1 max-w-[160px]">{ice.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── INPUT BAR ─── */}
      <div className="bg-white border-t border-rose-100 px-3 py-2.5 pb-4 flex flex-col gap-2 shrink-0 z-10 shadow-[0_-4px_16px_rgba(139,26,74,0.06)]"
        onClick={e => e.stopPropagation()}>
        <input type="file" ref={imageInputRef} accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />

        {replyTarget && (
          <div className="flex items-center gap-2 bg-rose-50 rounded-xl px-3 py-2 border-l-4 border-rose-400">
            <CornerUpLeft size={14} className="text-rose-500 shrink-0" />
            <p className="text-[12px] font-semibold text-rose-700 flex-1 truncate">{replyTarget.text?.substring(0, 60)}</p>
            <button onClick={() => setReplyTarget(null)}><X size={13} className="text-rose-400" /></button>
          </div>
        )}

        {pendingImage && (
          <div className="flex items-center gap-2 bg-rose-50 rounded-xl px-3 py-2">
            <img src={pendingImage} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
            <p className="text-[12px] font-semibold text-rose-700 flex-1">Photo ready to send</p>
            <button onClick={() => setPendingImage(null)}><X size={13} className="text-rose-400" /></button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button onClick={() => imageInputRef.current?.click()}
            className="w-10 h-10 rounded-full flex items-center justify-center text-rose-400 bg-rose-50 active:scale-90 transition-transform shrink-0">
            <Camera size={19} />
          </button>

          <div className="flex-1 flex items-center bg-rose-50 rounded-full px-4 py-2.5 border border-rose-200 focus-within:border-rose-400 transition-all">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-[14px] outline-none text-gray-800 placeholder-rose-300"
            />
            <button className="text-rose-300 ml-1 shrink-0">
              <Smile size={19} />
            </button>
          </div>

          <button
            onClick={() => handleSend()}
            className="w-11 h-11 rounded-full flex items-center justify-center shadow-md shrink-0 active:scale-90 transition-transform"
            style={{ background: 'linear-gradient(135deg, #C2185B, #E91E8C)' }}
          >
            {newMessage.trim() || pendingImage
              ? <Send size={18} className="text-white ml-0.5" />
              : <Mic size={18} className="text-white" />}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes matrimonialBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default MatrimonialChatPage;
