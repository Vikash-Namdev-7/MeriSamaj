import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Phone, Video, MoreVertical, Send, Paperclip, Mic,
  Smile, Camera, CheckCheck, Search, X, FileText, Check,
  Square, CornerUpLeft, Star, BellOff, Trash2, Pin, Play, 
  MapPin, UserSquare, Reply, Forward, Info, MessageCircle, Image as ImageIcon,
  Headphones, Ban, AlertTriangle, Wallpaper
} from 'lucide-react';
import { useData } from '../../context/DataProvider';
import { t } from '../../utils/translations';
import { Avatar } from '../../components/common/Avatar';
import { mockMessages } from '../../data/mockChats';

const formatMsgTime = (isoString) => {
  try {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
};

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥'];

const TypingIndicator = () => (
  <div className="flex justify-start items-end gap-2 py-1">
    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.12)]">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-gray-400"
            style={{ animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
    </div>
  </div>
);

const MessageStatusIcon = ({ status }) => {
  if (!status) return null;
  switch (status) {
    case 'sending': return <Check size={14} className="text-gray-400" />;
    case 'sent': return <Check size={14} className="text-gray-500" />;
    case 'delivered': return <CheckCheck size={14} className="text-gray-500" />;
    case 'read': return <CheckCheck size={14} className="text-[#53bdeb]" />;
    case 'failed': return <span className="text-red-500 text-[10px]">Failed</span>;
    default: return null;
  }
};

const ChatRoomPage = ({ chatId: propChatId }) => {
  const params = useParams();
  const chatId = propChatId || params.chatId || params.memberId || params.id;
  const navigate = useNavigate();
  const { chats, language } = useData();

  const chat = chats.find(c => c.id === chatId);
  const [localMessages, setLocalMessages] = useState(mockMessages[chatId] || []);

  const [newMessage, setNewMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMuteDialog, setShowMuteDialog] = useState(false);
  const [showWallpaperDialog, setShowWallpaperDialog] = useState(false);
  const [wallpaperTheme, setWallpaperTheme] = useState('default');
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [reactionTarget, setReactionTarget] = useState(null);
  const [replyTarget, setReplyTarget] = useState(null);
  const [reactionPosition, setReactionPosition] = useState('top');
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  
  const [isTyping, setIsTyping] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const touchStartX = useRef(null);
  const longPressTimerRef = useRef(null);

  const filteredMessages = isSearchOpen && searchQuery.trim()
    ? localMessages.filter(m => (m.text || '').toLowerCase().includes(searchQuery.toLowerCase()))
    : localMessages;

  const pinnedMessage = localMessages.find(m => m.isPinned);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages, isTyping]);

  const handleSend = () => {
    const trimmed = newMessage.trim();
    if (!trimmed && !pendingAttachment) return;
    
    const newMsgObj = {
      id: `m_new_${Date.now()}`,
      text: trimmed,
      timestamp: new Date().toISOString(),
      senderId: 'u1',
      senderName: 'You',
      status: 'sending',
      media: pendingAttachment,
      replyTo: replyTarget?.id
    };

    setLocalMessages(prev => [...prev, newMsgObj]);
    setNewMessage('');
    setReplyTarget(null);
    setPendingAttachment(null);
    setShowAttachmentMenu(false);
    inputRef.current?.focus();

    setTimeout(() => {
      setLocalMessages(prev => prev.map(m => m.id === newMsgObj.id ? { ...m, status: 'sent' } : m));
      if (chat && !chat.isGroup) {
        setIsTyping(true);
        setTimeout(() => {
          setLocalMessages(prev => prev.map(m => m.id === newMsgObj.id ? { ...m, status: 'read' } : m));
          setIsTyping(false);
          const replyMsg = {
            id: `m_reply_${Date.now()}`,
            text: 'Got it! 👍',
            timestamp: new Date().toISOString(),
            senderId: chat.participants?.find(p => p !== 'u1') || 'u2',
            senderName: chat.name,
            status: 'read'
          };
          setLocalMessages(prev => [...prev, replyMsg]);
        }, 2000);
      }
    }, 800);
  };

  const toggleSelection = (msgId) => {
    setSelectedMessages(prev => 
      prev.includes(msgId) ? prev.filter(id => id !== msgId) : [...prev, msgId]
    );
  };

  const handleReaction = (msgId, emoji) => {
    setLocalMessages(prev => prev.map(msg => {
      if (msg.id !== msgId) return msg;
      const currentReactions = msg.reactions || [];
      const hasReacted = currentReactions.find(r => r.emoji === emoji && r.users.includes('u1'));
      
      let newReactions = [...currentReactions];
      if (hasReacted) {
        newReactions = newReactions.map(r => {
          if (r.emoji === emoji) return { ...r, users: r.users.filter(u => u !== 'u1') };
          return r;
        }).filter(r => r.users.length > 0);
      } else {
        const existingEmoji = newReactions.find(r => r.emoji === emoji);
        if (existingEmoji) {
          existingEmoji.users.push('u1');
        } else {
          newReactions.push({ emoji, users: ['u1'] });
        }
      }
      return { ...msg, reactions: newReactions };
    }));
    setReactionTarget(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPendingAttachment({ type: 'image', url: ev.target.result, name: file.name });
      setShowAttachmentMenu(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDocChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPendingAttachment({ type: 'document', name: file.name, size: `${(file.size / 1024).toFixed(0)} KB` });
    setShowAttachmentMenu(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => { 
        setPendingAttachment({ type: 'audio', duration: recordDuration, name: 'Voice Note' });
        stream.getTracks().forEach(t => t.stop()); 
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordDuration(0);
      timerRef.current = setInterval(() => setRecordDuration(p => p + 1), 1000);
    } catch { alert('Microphone access denied'); }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    clearInterval(timerRef.current);
  };

  const formatDuration = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handlePressStart = (e, msgId) => { 
    if (e.type === 'mousedown' && e.button !== 0) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    touchStartX.current = clientX;
    
    longPressTimerRef.current = setTimeout(() => {
      if (selectedMessages.length === 0) {
        if (window.navigator.vibrate) window.navigator.vibrate(50);
        toggleSelection(msgId);
      }
    }, 500);
  };
  
  const handlePressMove = () => {
    clearTimeout(longPressTimerRef.current);
  };

  const handlePressEnd = (e, msgId) => {
    clearTimeout(longPressTimerRef.current);
    if (e.changedTouches) {
      if (e.changedTouches[0].clientX - touchStartX.current > 60 && selectedMessages.length === 0) {
        setReplyTarget(localMessages.find(m => m.id === msgId));
      }
    }
  };

  const handleMessageClick = (e, msgId) => {
    e.stopPropagation();
    if (selectedMessages.length > 0) {
      toggleSelection(msgId);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      if (rect.top < 150) {
        setReactionPosition('bottom');
      } else {
        setReactionPosition('top');
      }
      setReactionTarget(reactionTarget === msgId ? null : msgId);
    }
  };

  const handleAction = (action) => {
    if (action === 'delete') {
      setLocalMessages(prev => prev.filter(m => !selectedMessages.includes(m.id)));
    } else if (action === 'pin' && selectedMessages.length === 1) {
      setLocalMessages(prev => prev.map(m => m.id === selectedMessages[0] ? { ...m, isPinned: !m.isPinned } : m));
    } else if (action === 'reply' && selectedMessages.length === 1) {
      setReplyTarget(localMessages.find(m => m.id === selectedMessages[0]));
    } else if (action === 'unpin' && pinnedMessage) {
      setLocalMessages(prev => prev.map(m => m.id === pinnedMessage.id ? { ...m, isPinned: false } : m));
    }
    setSelectedMessages([]);
  };

  if (!chat) return <div className="flex h-screen items-center justify-center">Chat not found</div>;

  const isSelectionMode = selectedMessages.length > 0;

  // Group messages by date
  const groupedMessages = [];
  let lastDateStr = null;

  filteredMessages.forEach((msg) => {
    const d = new Date(msg.timestamp);
    const dateStr = d.toLocaleDateString();
    
    if (dateStr !== lastDateStr) {
      const today = new Date().toLocaleDateString();
      const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
      
      let badgeText = dateStr;
      if (dateStr === today) badgeText = 'Today';
      else if (dateStr === yesterday) badgeText = 'Yesterday';
      else badgeText = d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

      groupedMessages.push({ type: 'date', id: `date_${dateStr}`, text: badgeText });
      lastDateStr = dateStr;
    }
    groupedMessages.push({ type: 'message', ...msg });
  });

  return (
    <div className="flex flex-col h-[100dvh] relative overflow-hidden" onClick={() => { setReactionTarget(null); setShowMenu(false); setShowMoreMenu(false); setShowAttachmentMenu(false); setShowEmojiPicker(false); setShowMuteDialog(false); setShowWallpaperDialog(false); }}>
      {/* Background with WhatsApp-like pattern effect */}
      <div className={`absolute inset-0 z-0 ${wallpaperTheme === 'dark' ? 'bg-[#0b141a]' : wallpaperTheme === 'solid-blue' ? 'bg-blue-100' : wallpaperTheme === 'solid-pink' ? 'bg-pink-100' : 'bg-[#EFEAE2]'}`} style={{ opacity: wallpaperTheme === 'dark' ? 0.9 : 0.7, backgroundImage: 'radial-gradient(#cfc6b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      {isSelectionMode ? (
        <div className="bg-brand-primary text-white pb-3 px-3 flex items-center justify-between shrink-0 shadow-md z-30 transition-all"
             style={{ paddingTop: 'max(env(safe-area-inset-top, 0px) + 12px, 12px)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedMessages([])} className="w-10 h-10 rounded-full flex items-center justify-center active:bg-white/10 -ml-2 shrink-0">
              <ArrowLeft size={22} />
            </button>
            <span className="font-bold text-[18px]">{selectedMessages.length}</span>
          </div>
          <div className="flex items-center gap-1">
            {selectedMessages.length === 1 && (
              <button onClick={() => handleAction('reply')} className="w-10 h-10 rounded-full flex items-center justify-center active:bg-white/10">
                <Reply size={20} />
              </button>
            )}
            <button className="w-10 h-10 rounded-full flex items-center justify-center active:bg-white/10">
              <Star size={20} />
            </button>
            {selectedMessages.length === 1 && (
              <button onClick={() => handleAction('pin')} className="w-10 h-10 rounded-full flex items-center justify-center active:bg-white/10">
                <Pin size={20} />
              </button>
            )}
            <button onClick={() => handleAction('delete')} className="w-10 h-10 rounded-full flex items-center justify-center active:bg-white/10 text-red-100 hover:text-white">
              <Trash2 size={20} />
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center active:bg-white/10">
              <Forward size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-brand-primary text-white pb-3 px-3 flex items-center justify-between shrink-0 shadow-md z-30 transition-all"
          style={{ paddingTop: 'max(env(safe-area-inset-top, 0px) + 12px, 12px)' }}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button onClick={() => navigate('/member/chat')} className="w-10 h-10 rounded-full flex items-center justify-center active:bg-white/10 -ml-2 shrink-0">
              <ArrowLeft size={22} />
            </button>
            <div className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 hover:bg-white/5 p-1 rounded-xl transition-colors" onClick={() => navigate(`/member/chat/info/${chat.id}`)}>
              <div className="relative shrink-0">
                <Avatar src={chat.avatar} initials={chat.initials} size="md" color={chat.isGroup ? 'bg-white/20 text-white' : 'bg-white text-brand-primary'} />
                {chat.online && !chat.isGroup && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-[2.5px] border-brand-primary rounded-full" />}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[17px] font-bold truncate leading-tight">{chat.name}</h2>
                <p className="text-white/80 text-[13px] truncate font-medium">
                  {isTyping ? <span className="text-green-300 font-bold animate-pulse">typing...</span> : chat.isGroup ? `${chat.participants?.length || 0} participants` : chat.online ? 'Online' : 'Last seen today at 10:45 AM'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setShowMenu(p => !p); }} className="w-10 h-10 rounded-full flex items-center justify-center active:bg-white/10 -mr-2 press-scale">
                <MoreVertical size={20} />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => { setShowMenu(false); setShowMoreMenu(false); }} />
                  <div className="absolute top-11 right-2 bg-white text-gray-800 rounded-3xl shadow-2xl py-2 w-[220px] z-50 border border-gray-100 overflow-hidden animate-scale-up">
                    {!showMoreMenu ? (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); navigate(`/member/chat/info/${chat.id}`); }} className="w-full text-left px-5 py-3 text-[14.5px] font-bold text-slate-700 hover:bg-purple-50/40 active:bg-purple-50 transition-colors">
                          {chat.isGroup ? 'Group info' : 'View contact'}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); navigate(`/member/chat/info/${chat.id}`); }} className="w-full text-left px-5 py-3 text-[14.5px] font-bold text-slate-700 hover:bg-purple-50/40 active:bg-purple-50 transition-colors leading-tight">
                          Media, links, and docs
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setIsSearchOpen(true); setShowMenu(false); }} className="w-full text-left px-5 py-3 text-[14.5px] font-bold text-slate-700 hover:bg-purple-50/40 active:bg-purple-50 transition-colors">
                          Search
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setShowMuteDialog(true); setShowMenu(false); }} className="w-full text-left px-5 py-3 text-[14.5px] font-bold text-slate-700 hover:bg-purple-50/40 active:bg-purple-50 transition-colors">
                          Mute notifications
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setShowWallpaperDialog(true); setShowMenu(false); }} className="w-full text-left px-5 py-3 text-[14.5px] font-bold text-slate-700 hover:bg-purple-50/40 active:bg-purple-50 transition-colors">
                          Wallpaper
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setShowMoreMenu(true); }} className="w-full text-left px-5 py-3 text-[14.5px] font-bold text-slate-700 hover:bg-purple-50/40 active:bg-purple-50 transition-colors border-t border-gray-100 mt-1 flex items-center justify-between">
                          <span>More</span>
                          <span className="text-slate-400 font-normal">→</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); setShowMoreMenu(false); }} className="w-full text-left px-5 py-3 text-[14.5px] font-bold text-brand-primary flex items-center gap-2 hover:bg-purple-50/40 active:bg-purple-50 transition-colors border-b border-gray-100 mb-1">
                          <ArrowLeft size={18} /> Back
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} className="w-full text-left px-5 py-3 text-[14.5px] font-bold text-red-500 hover:bg-red-50/40 active:bg-red-50 transition-colors">
                          Report
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} className="w-full text-left px-5 py-3 text-[14.5px] font-bold text-red-500 hover:bg-red-50/40 active:bg-red-50 transition-colors">
                          Block
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); if (window.confirm("Clear all messages in this chat?")) setLocalMessages([]); setShowMenu(false); setShowMoreMenu(false); }} className="w-full text-left px-5 py-3 text-[14.5px] font-bold text-red-500 hover:bg-red-50/40 active:bg-red-50 transition-colors">
                          Clear chat
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} className="w-full text-left px-5 py-3 text-[14.5px] font-bold text-slate-700 hover:bg-purple-50/40 active:bg-purple-50 transition-colors">
                          Export chat
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {!isSelectionMode && pinnedMessage && (
        <div className="bg-white/95 backdrop-blur-md px-4 py-2 flex items-center justify-between border-b border-gray-200 z-20 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-start gap-2.5 overflow-hidden">
            <Pin size={14} className="text-brand-primary mt-1 shrink-0 fill-brand-primary" />
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-brand-primary mb-0.5">Pinned Message</p>
              <p className="text-[13px] text-gray-600 truncate">{pinnedMessage.text || 'Photo/Document'}</p>
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); handleAction('unpin'); }} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 text-gray-400 shrink-0">
            <X size={16} />
          </button>
        </div>
      )}

      {isSearchOpen && (
        <div className="bg-brand-primary px-3 pb-2.5 flex items-center gap-2 shrink-0 z-20">
          <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
            <Search size={15} className="text-white/70" />
            <input autoFocus type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-transparent text-white placeholder-white/60 outline-none text-[14px]" />
          </div>
          <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="text-white/80 text-[14px] font-semibold">Cancel</button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 z-10 relative">
        {groupedMessages.map((item, index) => {
          if (item.type === 'date') {
            return (
              <div key={item.id} className="flex justify-center my-4 sticky top-2 z-10">
                <span className="bg-white/90 backdrop-blur text-gray-600 text-[12px] font-bold px-3 py-1 rounded-full shadow-sm border border-gray-100">
                  {item.text}
                </span>
              </div>
            );
          }

          const msg = item;
          const isMine = msg.senderId === 'u1';
          const isSelected = selectedMessages.includes(msg.id);
          const nextMsg = groupedMessages[index + 1];
          const isLastInGroup = !nextMsg || nextMsg.type === 'date' || nextMsg.senderId !== msg.senderId;
          const repliedMsg = msg.replyTo ? localMessages.find(m => m.id === msg.replyTo) : null;
          const showAvatar = chat.isGroup && !isMine && isLastInGroup;
          const showSenderName = chat.isGroup && !isMine && !repliedMsg && (!groupedMessages[index - 1] || groupedMessages[index - 1].senderId !== msg.senderId || groupedMessages[index - 1].type === 'date');
          const msgReactions = msg.reactions?.map(r => r.emoji) || [];

          return (
            <div key={msg.id}
              className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} ${msgReactions.length > 0 ? 'pb-3.5' : 'pb-1'} ${isSelected ? 'bg-brand-primary/10 rounded-lg p-1 transition-colors' : 'transition-colors'}`}
              onMouseDown={e => handlePressStart(e, msg.id)}
              onTouchStart={e => handlePressStart(e, msg.id)}
              onMouseMove={handlePressMove}
              onTouchMove={handlePressMove}
              onMouseUp={e => handlePressEnd(e, msg.id)}
              onTouchEnd={e => handlePressEnd(e, msg.id)}>

              {chat.isGroup && !isMine && (
                <div className="w-7 shrink-0 mb-1">
                  {showAvatar && <Avatar initials={(msg.senderName || 'M').substring(0, 2).toUpperCase()} size="sm" />}
                </div>
              )}

              <div className="relative max-w-[80%]">
                {showSenderName && (
                  <p className="text-[11.5px] font-bold text-orange-500 mb-0.5 ml-1">{msg.senderName}</p>
                )}

                <div onClick={e => handleMessageClick(e, msg.id)}
                  className={`px-3 py-2 rounded-2xl shadow-sm relative cursor-pointer select-none border
                    ${isMine ? 'bg-[#d9fdd3] rounded-tr-sm border-[#c8e6c9] text-gray-900' : 'bg-white rounded-tl-sm border-gray-100 text-gray-900'}`}>
                  
                  {repliedMsg && (
                    <div className="bg-black/5 rounded-lg p-2 mb-1.5 border-l-4 border-brand-primary">
                      <p className="text-[12px] font-bold text-brand-primary mb-0.5">{repliedMsg.senderId === 'u1' ? 'You' : repliedMsg.senderName}</p>
                      <p className="text-[13px] text-gray-600 truncate">{repliedMsg.text || 'Attachment'}</p>
                    </div>
                  )}

                  {msg.media?.type === 'image' && (
                    <img src={msg.media.url} alt="img" className="rounded-xl max-w-full mb-1 max-h-64 object-cover" />
                  )}
                  {(msg.media?.type === 'file' || msg.media?.type === 'document') && (
                    <div className="flex items-center gap-3 bg-black/5 rounded-lg px-3 py-2 mb-1">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <FileText size={20} className="text-brand-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[14px] font-bold truncate block">{msg.media.name}</span>
                        <span className="text-[11px] text-gray-500 uppercase">{msg.media.size || 'DOCUMENT'}</span>
                      </div>
                    </div>
                  )}
                  {msg.text && <p className="text-[15px] leading-relaxed pr-14">{msg.text}</p>}

                  <div className={`absolute bottom-1 right-2 flex items-center gap-1 ${msg.text ? '' : 'bg-black/30 px-1.5 rounded-full'}`}>
                    <span className={`text-[10px] font-medium ${msg.text ? 'text-gray-500' : 'text-white'}`}>{formatMsgTime(msg.timestamp)}</span>
                    {isMine && <MessageStatusIcon status={msg.status} />}
                  </div>
                </div>

                {/* Reactions badge */}
                {msgReactions.length > 0 && (
                  <div className={`absolute -bottom-3 ${isMine ? 'right-2' : 'left-2'} bg-white border border-gray-100 rounded-full px-1.5 py-0.5 shadow-sm flex items-center gap-0.5 z-10`}>
                    {msgReactions.map((r, i) => <span key={i} className="text-[12px]">{r}</span>)}
                  </div>
                )}

                {/* Reaction picker */}
                {reactionTarget === msg.id && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={e => { e.stopPropagation(); setReactionTarget(null); }} />
                    <div className={`absolute z-50 ${isMine ? 'right-0' : 'left-0'} bg-white border border-gray-150 rounded-full px-3 py-2 shadow-xl flex items-center gap-3 animate-fade-in ${
                      reactionPosition === 'bottom' ? 'top-full mt-1.5' : '-top-12'
                    }`}>
                      {EMOJI_REACTIONS.map(emoji => (
                        <button key={emoji} onClick={e => { e.stopPropagation(); handleReaction(msg.id, emoji); }}
                          className={`text-[22px] hover:scale-125 transition-transform ${msgReactions.includes(emoji) ? 'scale-125 bg-gray-100 rounded-full' : 'opacity-90'}`}>
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* ─── ATTACHMENT MENU ─── */}
      {showAttachmentMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowAttachmentMenu(false)} />
          <div className="absolute bottom-[72px] left-2 right-2 bg-white rounded-[24px] p-6 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="grid grid-cols-3 gap-y-6 gap-x-2">
              <div className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform" onClick={() => docInputRef.current?.click()}>
                <div className="w-14 h-14 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-md bg-gradient-to-br from-indigo-400 to-indigo-600">
                  <FileText size={24} fill="currentColor" className="text-white/20" />
                </div>
                <span className="text-[13px] font-semibold text-gray-700">Document</span>
              </div>
              <div className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform" onClick={() => imageInputRef.current?.click()}>
                <div className="w-14 h-14 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-md bg-gradient-to-br from-pink-400 to-pink-600">
                  <Camera size={24} fill="currentColor" className="text-white/20" />
                </div>
                <span className="text-[13px] font-semibold text-gray-700">Camera</span>
              </div>
              <div className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform" onClick={() => imageInputRef.current?.click()}>
                <div className="w-14 h-14 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-md bg-gradient-to-br from-purple-400 to-purple-600">
                  <ImageIcon size={24} fill="currentColor" className="text-white/20" />
                </div>
                <span className="text-[13px] font-semibold text-gray-700">Gallery</span>
              </div>
              <div className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform">
                <div className="w-14 h-14 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md bg-gradient-to-br from-orange-400 to-orange-600">
                  <Headphones size={24} fill="currentColor" className="text-white/20" />
                </div>
                <span className="text-[13px] font-semibold text-gray-700">Audio</span>
              </div>
              <div className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform">
                <div className="w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-md bg-gradient-to-br from-green-400 to-green-600">
                  <MapPin size={24} fill="currentColor" className="text-white/20" />
                </div>
                <span className="text-[13px] font-semibold text-gray-700">Location</span>
              </div>
              <div className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform">
                <div className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md bg-gradient-to-br from-blue-400 to-blue-600">
                  <UserSquare size={24} fill="currentColor" className="text-white/20" />
                </div>
                <span className="text-[13px] font-semibold text-gray-700">Contact</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── INPUT AREA ─── */}
      <div className="bg-transparent px-2 pb-4 pt-1 flex flex-col gap-1.5 z-10 shrink-0" onClick={e => e.stopPropagation()}>
        <input type="file" ref={imageInputRef} accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
        <input type="file" ref={docInputRef} onChange={handleDocChange} style={{ display: 'none' }} />

        {/* Reply preview */}
        {replyTarget && (
          <div className="mx-1 flex items-center gap-3 bg-white/95 backdrop-blur rounded-xl px-3 py-2.5 border-l-4 border-brand-primary shadow-sm">
            <CornerUpLeft size={16} className="text-brand-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-brand-primary mb-0.5">{replyTarget.senderId === 'u1' ? 'You' : replyTarget.senderName}</p>
              <p className="text-[13px] font-medium text-gray-600 truncate">{replyTarget.text || 'Attachment'}</p>
            </div>
            <button onClick={() => setReplyTarget(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"><X size={16} /></button>
          </div>
        )}

        {/* Attachment preview */}
        {pendingAttachment && (
          <div className="mx-1 flex items-center gap-3 bg-white/95 backdrop-blur rounded-xl px-3 py-2 shadow-sm border border-gray-100">
            {pendingAttachment.type === 'image'
              ? <img src={pendingAttachment.url} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-100 shrink-0" />
              : <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0"><FileText size={20} className="text-indigo-500" /></div>}
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-gray-800 truncate">{pendingAttachment.name}</p>
              <p className="text-[12px] text-gray-500">Ready to send</p>
            </div>
            <button onClick={() => setPendingAttachment(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"><X size={16} /></button>
          </div>
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="mx-2 mb-2 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 overflow-y-auto max-h-[200px]">
            <div className="grid grid-cols-8 gap-2">
              {['😀','😃','😄','😁','😅','😂','🤣','🥲','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🥸','🤩','🥳','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕','🤑','🤠','😈','👿','👹','👺','🤡','💩','👻','💀','☠️','👽','👾','🤖','🎃','😺','😸','😹','😻','😼','😽','🙀','😿','😾'].map(emoji => (
                <button key={emoji} onClick={() => setNewMessage(p => p + emoji)} className="text-[22px] hover:bg-gray-100 rounded-lg flex justify-center items-center h-10 w-10 transition-colors">
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recording bar */}
        {isRecording ? (
          <div className="flex items-center gap-3 mx-1">
            <div className="flex-1 bg-white rounded-3xl px-4 py-3 flex items-center gap-3 shadow-sm border border-rose-200 animate-pulse">
              <div className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
              <span className="text-rose-600 font-bold text-[15px]">{formatDuration(recordDuration)}</span>
              <span className="text-rose-500 text-[11px] font-black uppercase tracking-widest">Recording...</span>
            </div>
            <button onTouchEnd={stopRecording} onMouseUp={stopRecording} className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md">
              <Square size={16} fill="white" />
            </button>
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-white rounded-3xl min-h-[50px] flex items-end py-1 px-2 shadow-sm border border-gray-200">
              <button onClick={() => setShowEmojiPicker(p => !p)} className={`w-10 h-[42px] rounded-full flex items-center justify-center shrink-0 hover:bg-gray-50 transition-colors ${showEmojiPicker ? 'text-brand-primary' : 'text-gray-500'}`}>
                <Smile size={24} />
              </button>
              <textarea 
                ref={inputRef} 
                value={newMessage} 
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={t('Message', language) || 'Message'}
                rows={1}
                className="flex-1 bg-transparent py-2.5 px-1.5 text-[15px] focus:outline-none text-gray-900 placeholder-gray-400 resize-none max-h-24" 
              />
              {!newMessage && (
                <button onClick={() => setShowAttachmentMenu(p => !p)} className={`w-[38px] h-[42px] rounded-full flex items-center justify-center shrink-0 transition-colors ${showAttachmentMenu ? 'bg-gray-100 text-gray-800' : 'text-gray-500 hover:bg-gray-50'}`}>
                  <Paperclip size={20} className={showAttachmentMenu ? 'rotate-45 transition-transform' : 'transition-transform'} />
                </button>
              )}
              <button onClick={() => imageInputRef.current?.click()} className="w-[38px] h-[42px] rounded-full flex items-center justify-center text-gray-500 shrink-0 hover:bg-gray-50 mr-1">
                <Camera size={22} />
              </button>
            </div>

            {newMessage.trim() || pendingAttachment ? (
              <button onClick={handleSend} className="w-[50px] h-[50px] rounded-full bg-[#00a884] text-white flex items-center justify-center shadow-md shrink-0 active:scale-95 transition-transform">
                <Send size={20} className="ml-1" />
              </button>
            ) : (
              <button onMouseDown={startRecording} onMouseUp={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording}
                className="w-[50px] h-[50px] rounded-full bg-[#00a884] text-white flex items-center justify-center shadow-md shrink-0 active:scale-95 transition-transform">
                <Mic size={22} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ─── MODALS ─── */}
      {showMuteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowMuteDialog(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <h3 className="text-[18px] font-bold text-gray-900 mb-4">Mute notifications for...</h3>
            <div className="space-y-4 mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="mute" className="w-5 h-5 accent-brand-primary" defaultChecked />
                <span className="text-[16px] text-gray-700 font-medium">8 hours</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="mute" className="w-5 h-5 accent-brand-primary" />
                <span className="text-[16px] text-gray-700 font-medium">1 week</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="mute" className="w-5 h-5 accent-brand-primary" />
                <span className="text-[16px] text-gray-700 font-medium">Always</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setShowMuteDialog(false)} className="px-4 py-2 text-brand-primary font-bold hover:bg-brand-primary/10 rounded-lg transition-colors">Cancel</button>
              <button onClick={() => setShowMuteDialog(false)} className="px-4 py-2 text-brand-primary font-bold hover:bg-brand-primary/10 rounded-lg transition-colors">OK</button>
            </div>
          </div>
        </div>
      )}

      {showWallpaperDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowWallpaperDialog(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <h3 className="text-[18px] font-bold text-gray-900 mb-4">Chat Wallpaper</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button onClick={() => setWallpaperTheme('default')} className={`h-24 rounded-xl border-4 ${wallpaperTheme === 'default' ? 'border-brand-primary' : 'border-transparent'} bg-[#EFEAE2] flex items-center justify-center relative overflow-hidden transition-all`}>
                <div className="absolute inset-0 bg-[#EFEAE2]" style={{ opacity: 0.7, backgroundImage: 'radial-gradient(#cfc6b8 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                <span className="bg-black/50 text-white text-[12px] px-2 py-1 rounded-md font-semibold z-10">Default</span>
              </button>
              <button onClick={() => setWallpaperTheme('dark')} className={`h-24 rounded-xl border-4 ${wallpaperTheme === 'dark' ? 'border-brand-primary' : 'border-transparent'} bg-[#0b141a] flex items-center justify-center relative overflow-hidden transition-all`}>
                <div className="absolute inset-0 bg-[#0b141a]" style={{ opacity: 0.9, backgroundImage: 'radial-gradient(#cfc6b8 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                <span className="bg-black/50 text-white text-[12px] px-2 py-1 rounded-md font-semibold z-10">Dark</span>
              </button>
              <button onClick={() => setWallpaperTheme('solid-blue')} className={`h-24 rounded-xl border-4 ${wallpaperTheme === 'solid-blue' ? 'border-brand-primary' : 'border-transparent'} bg-blue-100 flex items-center justify-center transition-all`}>
                <span className="bg-black/40 text-white text-[12px] px-2 py-1 rounded-md font-semibold">Solid Blue</span>
              </button>
              <button onClick={() => setWallpaperTheme('solid-pink')} className={`h-24 rounded-xl border-4 ${wallpaperTheme === 'solid-pink' ? 'border-brand-primary' : 'border-transparent'} bg-pink-100 flex items-center justify-center transition-all`}>
                <span className="bg-black/40 text-white text-[12px] px-2 py-1 rounded-md font-semibold">Solid Pink</span>
              </button>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowWallpaperDialog(false)} className="px-4 py-3 bg-brand-primary text-white font-bold rounded-xl w-full active:scale-95 transition-transform">Apply Wallpaper</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes typingBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ChatRoomPage;
