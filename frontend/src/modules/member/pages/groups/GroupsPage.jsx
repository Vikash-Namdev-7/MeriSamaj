import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, MessageCircle, ChevronRight, Bell, BellOff, Lock, Plus, Search, Camera, Check, Shield, ArrowRight, Settings, Info, X, Menu } from 'lucide-react';
import { Avatar } from '../../components/common/Avatar';
import { useData } from '../../context/DataProvider';

const categoryPills = [
  { id: 'all', label: 'All' },
  { id: 'my', label: 'My Groups' },
  { id: 'General', label: 'General' },
  { id: 'Youth', label: 'Youth' },
  { id: 'Women', label: 'Women' },
  { id: 'Business', label: 'Business' },
  { id: 'Education', label: 'Education' },
  { id: 'Religious', label: 'Religious' }
];

const groupColors = {
  General: 'bg-indigo-100 text-indigo-700',
  Youth: 'bg-blue-100 text-blue-700',
  Women: 'bg-pink-100 text-pink-700',
  Business: 'bg-amber-100 text-amber-700',
  Service: 'bg-emerald-100 text-emerald-700',
  Education: 'bg-purple-100 text-purple-700',
  Religious: 'bg-orange-100 text-orange-700'
};

const GroupsPage = ({ isHub = false, triggerCreateGroup, onGroupCreateTriggered }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { groups, groupMessages, members, createGroup, toggleGroupMute, joinGroup, getUnreadCountForModule } = useData();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [showAlertModal, setShowAlertModal] = useState(false);

  useEffect(() => {
    if (location.state?.showJoinAlert) {
      setShowAlertModal(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (triggerCreateGroup) {
      setIsCreating(true);
      if (onGroupCreateTriggered) {
        onGroupCreateTriggered();
      }
    }
  }, [triggerCreateGroup, onGroupCreateTriggered]);
  
  // Create Group Flow State
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState(1);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupType, setNewGroupType] = useState('public'); // public | private | admin_only
  const [newGroupAvatar, setNewGroupAvatar] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [chatSettings, setChatSettings] = useState({
    canSend: 'all', // all | admin
    canMedia: 'all', // all | admin
    canLinks: 'all'  // all | admin
  });

  // Filter groups
  const filteredGroups = groups.filter(group => {
    // Search text match
    const matchesSearch = group.name.toLowerCase().includes(searchText.toLowerCase()) || 
                          (group.description && group.description.toLowerCase().includes(searchText.toLowerCase()));
    
    // Category pill match
    if (activeCategory === 'all') return matchesSearch;
    if (activeCategory === 'my') return matchesSearch && group.isJoined;
    return matchesSearch && group.category === activeCategory;
  });

  // Toggle member selection in Step 2
  const handleToggleMember = (memberId) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };

  // Handle finalize creation
  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    
    const categoryMap = {
      public: 'General',
      private: 'Business',
      admin_only: 'Religious'
    };

    createGroup({
      name: newGroupName,
      description: newGroupDesc,
      avatarUrl: newGroupAvatar,
      category: categoryMap[newGroupType] || 'General',
      members: selectedMembers.length + 1, // including me
      initialMessage: `Greetings! I have started this new group "${newGroupName}".`,
      privacy: {
        type: newGroupType === 'public' ? 'Public' : newGroupType === 'private' ? 'Private' : 'Admin Only',
        canAddMembers: 'all',
        canSeeMembers: 'all'
      },
      chatSettings: {
        canSendMessages: chatSettings.canSend === 'all' ? 'All Members' : 'Only Admin',
        canShareMedia: chatSettings.canMedia === 'all' ? 'All Members' : 'Only Admin',
        canShareLinks: chatSettings.canLinks === 'all' ? 'All Members' : 'Only Admin'
      }
    });

    // Reset and close
    setNewGroupName('');
    setNewGroupDesc('');
    setNewGroupType('public');
    setNewGroupAvatar('');
    setSelectedMembers([]);
    setStep(1);
    setIsCreating(false);
  };

  return (
    <div className="bg-[#F5F6FA] min-h-screen pb-28 relative">
      
      {/* ─── HEADER BAR ─── */}
      {!isHub && (
        <div className="bg-white px-5 h-16 flex items-center justify-between border-b border-gray-150/40 shrink-0 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
          <button className="p-1 -ml-1 text-slate-800 active:scale-95 transition-transform">
            <Menu size={22} />
          </button>
          <h1 className="text-[17px] font-black text-slate-800 absolute left-1/2 -translate-x-1/2">Groups</h1>
          <button onClick={() => navigate('/member/notifications?module=chat')} className="p-1 -mr-1 text-slate-800 active:scale-95 transition-transform relative">
            <Bell size={22} />
            {getUnreadCountForModule('chat') > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-primary rounded-full ring-2 ring-white" />
            )}
          </button>
        </div>
      )}

      {/* ─── SEARCH & ADD ACTION BAR ─── */}
      <div className="bg-[#F5F6FA] px-4 pt-4 pb-1.5 flex items-center gap-3">
        <div className="flex-1 bg-white rounded-2xl flex items-center px-4 py-2.5 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus-within:border-brand-primary/20 transition-all">
          <Search size={18} className="text-gray-400 shrink-0 mr-2" />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="bg-transparent outline-none w-full text-[14px] text-slate-850 placeholder:text-gray-400 font-medium"
          />
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="w-11 h-11 rounded-2xl bg-brand-primary text-white flex items-center justify-center press-scale shadow-md shadow-brand-primary/25 shrink-0"
        >
          <Plus size={22} />
        </button>
      </div>

      {/* ─── HORIZONTAL FILTER PILLS ─── */}
      <div 
        className="overflow-x-auto snap-x snap-mandatory scrollbar-hide py-2.5 px-4 flex gap-2 bg-[#F5F6FA]"
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        data-swipe-block="true"
      >
        {categoryPills.map(pill => {
          const isActive = activeCategory === pill.id;
          return (
            <button
              key={pill.id}
              onClick={() => setActiveCategory(pill.id)}
              className={`snap-center shrink-0 px-4 py-2 rounded-full text-[12.5px] font-semibold transition-all press-scale ${
                isActive 
                  ? 'bg-brand-primary text-white shadow-sm shadow-brand-primary/20' 
                  : 'bg-white text-slate-500 border border-slate-150/50 hover:text-slate-700'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* ─── GROUP CARD LISTING ─── */}
      <div className="px-4 space-y-3 mt-2">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group, idx) => {
            const msgs = groupMessages[group.id] || [];
            const lastMsg = msgs[msgs.length - 1];
            
            const handleGroupClick = (g) => {
              if (g.isJoined) {
                navigate(`/member/groups/${g.id}`);
              } else {
                setShowAlertModal(true);
              }
            };

            return (
              <div 
                key={group.id} 
                onClick={() => handleGroupClick(group)}
                className="bg-white rounded-[24px] p-4 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex gap-3.5 cursor-pointer card-press animate-stagger-fade-in"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                {/* Initials Avatar */}
                <Avatar 
                  initials={group.initials} 
                  src={group.avatarUrl}
                  size="lg" 
                  color={groupColors[group.category] || 'bg-gray-100 text-gray-700'} 
                  className="shadow-sm border border-black/5"
                />

                {/* Info and Messages */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-start gap-1">
                    <h3 className="text-[14.5px] font-bold text-slate-800 truncate leading-snug">{group.name}</h3>
                    <span className="text-[10px] font-semibold text-slate-400 shrink-0 mt-0.5">{group.lastActivity}</span>
                  </div>

                  {/* Member count + online count */}
                  <p className="text-[11.5px] text-slate-400 font-medium mt-0.5">
                    {group.members} members {group.online ? `· ${group.online} online` : ''}
                  </p>

                  {/* Last Message / Desc Snippet */}
                  <p className="text-[12.5px] text-slate-500 mt-2 line-clamp-1 leading-relaxed font-medium">
                    {lastMsg ? (
                      lastMsg.attachment ? (
                        <span className="text-brand-primary flex items-center gap-1">
                          📁 [File] {lastMsg.attachment.name}
                        </span>
                      ) : (
                        <span>
                          <strong className="text-gray-750">{lastMsg.senderName}:</strong> {lastMsg.text}
                        </span>
                      )
                    ) : (
                      group.description || 'No messages yet.'
                    )}
                  </p>
                </div>

                {/* Right Action / Status */}
                {!group.isJoined ? (
                  <div className="flex items-center justify-center shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        joinGroup(group.id);
                        navigate(`/member/groups/${group.id}`);
                      }}
                      className="px-4 py-1.5 bg-brand-primary text-white text-[11.5px] font-bold rounded-full shadow-sm hover:bg-brand-primary/95 transition-all press-scale"
                    >
                      Join
                    </button>
                  </div>
                ) : (
                  (group.unread && group.unread > 0) ? (
                    <div className="flex items-center justify-center shrink-0">
                      <span className="w-5.5 h-5.5 rounded-full bg-brand-primary text-white text-[10px] font-bold flex items-center justify-center shadow-sm shadow-brand-primary/30">
                        {group.unread}
                      </span>
                    </div>
                  ) : null
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 text-gray-400 shadow-sm mt-4">
            <Users size={36} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-semibold">No groups found.</p>
          </div>
        )}
      </div>

      {/* ─── CREATE GROUP FULLSCREEN SHEET ─── */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/40 animate-fade-in flex flex-col justify-end">
          <div className="bg-white w-full h-[92vh] rounded-t-[32px] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
            
            {/* Sheet Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    if (step > 1) setStep(step - 1);
                    else setIsCreating(false);
                  }}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center active:scale-95"
                >
                  <ChevronRight size={18} className="rotate-180 text-gray-600 animate-fade-in" />
                </button>
                <h3 className="text-[17px] font-black text-gray-900">Create New Group</h3>
              </div>
              <button 
                onClick={() => setIsCreating(false)} 
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center active:scale-95"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Step Indicators */}
            <div className="px-6 py-4 bg-white border-b border-gray-50">
              <div className="flex items-center justify-between relative max-w-xs mx-auto">
                <div className="absolute left-0 right-0 top-[14px] h-[2px] bg-gray-100 -z-10" />
                <div className="absolute left-0 top-[14px] h-[2px] bg-brand-primary -z-10 transition-all duration-300" style={{ width: `${(step - 1) * 50}%` }} />
                
                {[
                  { key: 1, label: 'Details' },
                  { key: 2, label: 'Add Members' },
                  { key: 3, label: 'Settings' }
                ].map(s => {
                  const isDone = step > s.key;
                  const isActive = step === s.key;
                  return (
                    <div key={s.key} className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold border-2 transition-all ${
                        isDone 
                          ? 'bg-brand-primary border-brand-primary text-white' 
                          : isActive 
                            ? 'bg-white border-brand-primary text-brand-primary shadow-sm shadow-brand-primary/20' 
                            : 'bg-white border-gray-200 text-gray-400'
                      }`}>
                        {isDone ? <Check size={14} /> : s.key}
                      </div>
                      <span className={`text-[10px] font-bold mt-1.5 ${isActive ? 'text-brand-primary' : isDone ? 'text-gray-800' : 'text-gray-400'}`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step Contents */}
            <div className="flex-1 overflow-y-auto p-5">
              
              {/* STEP 1: INFO */}
              {step === 1 && (
                <div className="space-y-6">
                  {/* Photo picker */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border border-gray-200 shadow-sm overflow-hidden group/avatar">
                      {newGroupAvatar ? (
                        <img src={newGroupAvatar} alt="New Group Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <Camera size={32} className="text-gray-400" />
                      )}
                      <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                        <Camera size={24} className="text-white animate-pulse" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setNewGroupAvatar(event.target.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }} 
                        />
                      </label>
                    </div>
                    <span className="text-[11px] text-gray-400 font-bold mt-2">Add group profile photo</span>
                  </div>

                  {/* Input details */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[12px] font-extrabold text-gray-600">Group Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Samaj Youth Group"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="w-full mt-1.5 px-4 py-3 rounded-2xl bg-slate-50 border border-gray-150 focus:border-brand-primary focus:bg-white outline-none text-[13.5px] font-semibold transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[12px] font-extrabold text-gray-600">Group Description</label>
                      <textarea
                        placeholder="Purpose and topic of this group..."
                        value={newGroupDesc}
                        onChange={(e) => setNewGroupDesc(e.target.value)}
                        rows={3}
                        className="w-full mt-1.5 px-4 py-3 rounded-2xl bg-slate-50 border border-gray-150 focus:border-brand-primary focus:bg-white outline-none text-[13.5px] font-semibold resize-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Privacy Selector */}
                  <div className="space-y-3">
                    <label className="text-[12px] font-extrabold text-gray-600 block">Choose Group Type</label>
                    
                    {[
                      { key: 'public', title: 'Public', desc: 'Any member can join and view.' },
                      { key: 'private', title: 'Private Group', desc: 'Only invited members can join.' },
                      { key: 'admin_only', title: 'Admin Only Group', desc: 'Only admins can send messages, other members cannot.' }
                    ].map(type => (
                      <div 
                        key={type.key}
                        onClick={() => setNewGroupType(type.key)}
                        className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all ${
                          newGroupType === type.key
                            ? 'bg-brand-primary/5 border-brand-primary'
                            : 'bg-white border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <h4 className="text-[13px] font-extrabold text-gray-950">{type.title}</h4>
                          <p className="text-[11px] text-gray-500 font-medium mt-0.5 leading-relaxed">{type.desc}</p>
                        </div>
                        <div className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          newGroupType === type.key ? 'border-brand-primary bg-brand-primary' : 'border-gray-300'
                        }`}>
                          {newGroupType === type.key && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: ADD MEMBERS */}
              {step === 2 && (
                <div className="space-y-4 flex flex-col h-full">
                  {/* Search member */}
                  <div className="bg-[#F5F6FA] rounded-2xl flex items-center px-4 py-2 border border-transparent focus-within:border-brand-primary/20 focus-within:bg-white transition-all shrink-0">
                    <Search size={16} className="text-gray-400 shrink-0 mr-2" />
                    <input
                      type="text"
                      placeholder="Search member name..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      className="bg-transparent outline-none w-full text-[13px] text-text-primary placeholder:text-gray-400 font-medium"
                    />
                  </div>

                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mt-2">Samaj Members ({members.length})</p>
                  
                  {/* Members list */}
                  <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 pb-10">
                    {members
                      .filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()))
                      .map(m => {
                        const isSelected = selectedMembers.includes(m.id);
                        return (
                          <div 
                            key={m.id}
                            onClick={() => handleToggleMember(m.id)}
                            className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                              isSelected 
                                ? 'bg-brand-primary/5 border-brand-primary/30' 
                                : 'bg-white border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar initials={m.initials} size="sm" color="bg-gray-100 text-gray-600" />
                              <div>
                                <h4 className="text-[13px] font-extrabold text-gray-900 leading-none">{m.name}</h4>
                                <p className="text-[10px] text-gray-400 font-medium mt-1">{m.city} · {m.profession || 'Member'}</p>
                              </div>
                            </div>
                            <div className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected ? 'bg-brand-primary border-brand-primary text-white' : 'border-gray-300 bg-white'
                            }`}>
                              {isSelected && <Check size={12} />}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* STEP 3: SETTINGS */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="bg-slate-50 border border-gray-100 rounded-3xl p-5 flex items-start gap-3">
                    <Shield size={20} className="text-brand-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[13px] font-extrabold text-gray-900">Chat Permission Settings</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">Choose which members will have the permission to send messages and share media within the group.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Send permissions */}
                    <div>
                      <label className="text-[12px] font-extrabold text-gray-600">Permission to Send Messages</label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {[
                          { key: 'all', label: 'All Members' },
                          { key: 'admin', label: 'Only Admin' }
                        ].map(opt => (
                          <button
                            key={opt.key}
                            onClick={() => setChatSettings(prev => ({ ...prev, canSend: opt.key }))}
                            className={`py-3 rounded-xl text-[12.5px] font-bold border transition-all ${
                              chatSettings.canSend === opt.key
                                ? 'bg-brand-primary border-brand-primary text-white shadow-sm'
                                : 'bg-white border-gray-150 text-gray-600'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Media sharing permissions */}
                    <div>
                      <label className="text-[12px] font-extrabold text-gray-600">Permission to Share Media</label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {[
                          { key: 'all', label: 'All Members' },
                          { key: 'admin', label: 'Only Admin' }
                        ].map(opt => (
                          <button
                            key={opt.key}
                            onClick={() => setChatSettings(prev => ({ ...prev, canMedia: opt.key }))}
                            className={`py-3 rounded-xl text-[12.5px] font-bold border transition-all ${
                              chatSettings.canMedia === opt.key
                                ? 'bg-brand-primary border-brand-primary text-white shadow-sm'
                                : 'bg-white border-gray-150 text-gray-600'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Link sharing permissions */}
                    <div>
                      <label className="text-[12px] font-extrabold text-gray-600">Permission to Share Links</label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {[
                          { key: 'all', label: 'All Members' },
                          { key: 'admin', label: 'Only Admin' }
                        ].map(opt => (
                          <button
                            key={opt.key}
                            onClick={() => setChatSettings(prev => ({ ...prev, canLinks: opt.key }))}
                            className={`py-3 rounded-xl text-[12.5px] font-bold border transition-all ${
                              chatSettings.canLinks === opt.key
                                ? 'bg-brand-primary border-brand-primary text-white shadow-sm'
                                : 'bg-white border-gray-150 text-gray-600'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Actions Button */}
            <div className="px-5 py-4 border-t border-gray-100 bg-white" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}>
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 && !newGroupName.trim()}
                  className={`w-full py-3.5 rounded-2xl text-[14px] font-bold flex items-center justify-center gap-1.5 press-scale ${
                    step === 1 && !newGroupName.trim() 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                  }`}
                >
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleCreateGroup}
                  className="w-full py-3.5 bg-brand-primary text-white rounded-2xl text-[14px] font-bold flex items-center justify-center gap-1.5 press-scale shadow-md shadow-brand-primary/20"
                >
                  Create Group
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ─── CUSTOM ALERT MODAL ─── */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-5 animate-fade-in">
          <div className="bg-white rounded-[32px] max-w-xs w-full p-6 shadow-2xl flex flex-col items-center text-center animate-scale-up border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4 shadow-sm shadow-brand-primary/5">
              <Lock size={26} />
            </div>
            
            <h3 className="text-[17px] font-black text-gray-900 leading-snug">Access Restricted</h3>
            
            <p className="text-[12.5px] text-gray-500 font-semibold mt-2.5 leading-relaxed">
              You are not joined in this group, so you cannot see the group chat. You must first click the Join button to join, then you can view and chat.
            </p>
            
            <button
              onClick={() => setShowAlertModal(false)}
              className="mt-6 w-full py-3.5 bg-brand-primary text-white rounded-2xl text-[13.5px] font-bold shadow-md shadow-brand-primary/20 press-scale"
            >
              Okay
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default GroupsPage;
