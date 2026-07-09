import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, CheckCircle2, Heart, Calendar, Briefcase, Award, TrendingUp, 
  Search, ShieldAlert, Sparkles, Send, Plus, ChevronRight, X, Eye, 
  MapPin, Clock, ArrowUpRight, BarChart3, FileText, Check, AlertCircle, RefreshCw,
  Settings
} from 'lucide-react';
import { useData } from '../../../member/context/DataProvider';
import { useFund } from '../../../member/context/FundContext';
import { Avatar } from '../../../member/components/common/Avatar';

export const HeadDashboard = () => {
  const { 
    members, 
    matrimonialProfiles, 
    events, 
    verifyMember, 
    rejectMember, 
    addEvent, 
    createPost,
    currentUser 
  } = useData();

  const { funds, expenses, contributions } = useFund();

  // Local Component States for Modals
  const [activeModal, setActiveModal] = useState(null); // 'approve' | 'event' | 'announce' | 'reports' | null
  const [searchQuery, setSearchQuery] = useState('');
  const [timelineFilter, setTimelineFilter] = useState('all'); // 'all' | 'members' | 'events' | 'matrimony' | 'posts'
  const [toast, setToast] = useState(null);

  // Form States
  const [eventForm, setEventForm] = useState({
    title: '', date: '', time: '', venue: '', description: '', category: 'General', image: ''
  });
  const [announcementText, setAnnouncementText] = useState('');
  const [selectedProofMember, setSelectedProofMember] = useState(null);

  // Real-time calculations
  const pendingMembers = useMemo(() => members.filter(m => !m.isVerified), [members]);
  const verifiedCount = useMemo(() => members.filter(m => m.isVerified).length, [members]);
  
  // Show toast notification helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Actions handlers
  const handleApprove = (id, name) => {
    verifyMember(id);
    showToast(`Approved membership for ${name}!`, 'success');
    if (selectedProofMember?.id === id) {
      setSelectedProofMember(null);
    }
  };

  const handleReject = (id, name) => {
    rejectMember(id);
    showToast(`Rejected membership for ${name}`, 'warning');
    if (selectedProofMember?.id === id) {
      setSelectedProofMember(null);
    }
  };

  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.date || !eventForm.venue) {
      showToast('Please fill in all mandatory fields', 'warning');
      return;
    }

    const defaultImages = [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
    ];
    
    addEvent({
      title: eventForm.title,
      date: new Date(eventForm.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: eventForm.time || '06:00 PM',
      venue: eventForm.venue,
      description: eventForm.description || 'Samaj official community gathering.',
      category: eventForm.category,
      image: eventForm.image || defaultImages[Math.floor(Math.random() * defaultImages.length)],
      attendees: 0,
      isRegistered: false
    });

    showToast(`Successfully created event: "${eventForm.title}"!`);
    setEventForm({ title: '', date: '', time: '', venue: '', description: '', category: 'General', image: '' });
    setActiveModal(null);
  };

  const handleSendAnnouncement = (e) => {
    e.preventDefault();
    if (!announcementText.trim()) {
      showToast('Announcement content cannot be empty', 'warning');
      return;
    }

    createPost(announcementText, [], { isPinned: true, isAnnouncement: true });
    showToast('Global Announcement broadcasted successfully!');
    setAnnouncementText('');
    setActiveModal(null);
  };

  // Filtered members for Search
  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.profession && m.profession.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [members, searchQuery]);

  // Activity Log Data
  const activityLog = useMemo(() => {
    const logs = [];
    
    // Member activities
    members.slice(-4).forEach(m => {
      logs.push({
        id: `act-m-${m.id}`,
        type: 'members',
        user: m.name,
        action: m.isVerified ? 'joined the community portal' : 'registered and requested verification',
        time: '2 hours ago',
        status: m.isVerified ? 'Active' : 'Pending',
        details: `${m.city} • ${m.profession || 'Member'}`
      });
    });

    // Event activities
    events.slice(-2).forEach(ev => {
      logs.push({
        id: `act-ev-${ev.id}`,
        type: 'events',
        user: 'Council Admin',
        action: `scheduled event: ${ev.title}`,
        time: '1 day ago',
        status: 'Scheduled',
        details: ev.venue
      });
    });

    // Matrimony activities
    matrimonialProfiles.slice(-2).forEach(mp => {
      logs.push({
        id: `act-mp-${mp.id}`,
        type: 'matrimony',
        user: mp.name,
        action: 'activated public matrimonial match profile',
        time: '3 hours ago',
        status: 'Active Match',
        details: `${mp.age} Yrs • ${mp.city}`
      });
    });

    return logs.sort((a, b) => b.id.localeCompare(a.id));
  }, [members, events, matrimonialProfiles]);

  const filteredActivities = useMemo(() => {
    if (timelineFilter === 'all') return activityLog;
    return activityLog.filter(act => act.type === timelineFilter);
  }, [activityLog, timelineFilter]);

  // Mock Top Contributors
  const topContributors = [
    { name: 'Suresh Agrawal', points: '₹45,000 Contributed', role: 'Patron Donor', initials: 'SA' },
    { name: 'Dr. Kavita Agrawal', points: '12 Events Hosted', role: 'Medical Volunteer', initials: 'KA' },
    { name: 'Vikas Agrawal', points: 'CA Audit Advisor', role: 'Committee Auditor', initials: 'VA' },
  ];

  return (
    <div className="space-y-8 pb-10">
      
      {/* ─── TOAST NOTIFICATIONS ─── */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-55 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border backdrop-blur-md ${
              toast.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : toast.type === 'warning'
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-bold tracking-wide">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── TOP WELCOME SECTION ─── */}
      <section className="card-neo p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full filter blur-3xl pointer-events-none" />
        
        {/* Profile Identity Details */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar 
              initials="MA" 
              size="lg" 
              color="bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-black text-xl shadow-lg border border-purple-400/20"
            />
            <div className="absolute -bottom-1 -right-1 bg-amber-500 border border-surface text-[8px] font-black text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">
              Adhyaksh
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-secondary tracking-widest uppercase">President Portfolio</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
              Shri Mohan Lal Agrawal
            </h2>
            <p className="text-xs text-text-muted mt-1 font-medium flex items-center gap-2">
              <span>{currentUser?.community || 'Agrawal Samaj Indore'}</span>
              <span>•</span>
              <span className="text-purple-300">Session: Active Council</span>
            </p>
          </div>
        </div>

        {/* Date & Quick Action buttons */}
        <div className="flex flex-wrap items-center gap-3 md:ml-auto md:justify-end">
          <div className="text-right hidden xl:block mr-4">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Current Council Date</p>
            <p className="text-sm font-bold text-white mt-0.5">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button 
              onClick={() => setActiveModal('approve')}
              className="px-4 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 border border-purple-500/20 text-xs font-bold uppercase tracking-wider press-scale flex items-center gap-2"
            >
              <Check size={14} /> Approve Members
              {pendingMembers.length > 0 && (
                <span className="ml-1 w-4.5 h-4.5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-black animate-pulse">
                  {pendingMembers.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveModal('event')}
              className="px-4 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 border border-purple-500/20 text-xs font-bold uppercase tracking-wider press-scale flex items-center gap-2"
            >
              <Plus size={14} /> Create Event
            </button>
            <button 
              onClick={() => setActiveModal('announce')}
              className="px-4 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 border border-purple-500/20 text-xs font-bold uppercase tracking-wider press-scale flex items-center gap-2"
            >
              <Send size={13} /> Announcement
            </button>
            <button 
              onClick={() => setActiveModal('reports')}
              className="px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold uppercase tracking-wider press-scale flex items-center gap-2 shadow-lg shadow-purple-500/25"
            >
              <FileText size={14} /> View Reports
            </button>
          </div>
        </div>
      </section>

      {/* ─── STATISTICS CARDS GRID ─── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Total Members */}
        <div className="card-neo p-5 relative overflow-hidden group hover:border-purple-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Users size={20} />
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs bg-emerald-500/5 px-2 py-1 rounded-full border border-emerald-500/10">
              <TrendingUp size={12} />
              +4.2% this mo.
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Total Registered Members</h4>
            <h3 className="text-3xl font-black text-white mt-1 tracking-tight">
              {verifiedCount}
            </h3>
          </div>

          {/* Mini trend line graph */}
          <div className="h-10 mt-3 flex items-end">
            <svg className="w-full h-8 overflow-visible" viewBox="0 0 150 40">
              <defs>
                <linearGradient id="gradient-line-1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d="M0,35 Q15,20 30,28 T60,15 T90,20 T120,5 T150,12 L150,40 L0,40 Z" fill="url(#gradient-line-1)" />
              <path d="M0,35 Q15,20 30,28 T60,15 T90,20 T120,5 T150,12" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-text-muted">
            <span>Total Accounts: {members.length}</span>
            <button onClick={() => setActiveModal('reports')} className="text-brand-secondary hover:text-white transition-colors font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 duration-200">
              View Audit <ChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* Card 2: Pending Approvals */}
        <div className={`card-neo p-5 relative overflow-hidden group hover:border-purple-500/20 transition-all ${pendingMembers.length > 0 ? 'border-rose-500/20' : ''}`}>
          <div className="flex items-center justify-between">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              pendingMembers.length > 0 
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse' 
                : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
            }`}>
              <CheckCircle2 size={20} />
            </div>
            {pendingMembers.length > 0 ? (
              <div className="px-2 py-1 rounded-full text-rose-400 bg-rose-500/5 text-xs font-bold border border-rose-500/10">
                Action Required
              </div>
            ) : (
              <div className="px-2 py-1 rounded-full text-emerald-400 bg-emerald-500/5 text-xs font-bold border border-emerald-500/10">
                Cleared
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Pending Member Approvals</h4>
            <h3 className="text-3xl font-black text-white mt-1 tracking-tight">
              {pendingMembers.length}
            </h3>
          </div>

          {/* Mini trend line graph */}
          <div className="h-10 mt-3 flex items-end">
            <svg className="w-full h-8 overflow-visible" viewBox="0 0 150 40">
              <path d="M0,25 Q20,10 40,32 T80,18 T120,38 T150,5" fill="none" stroke={pendingMembers.length > 0 ? '#F43F5E' : '#34D399'} strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-text-muted">
            <span>Last Application: Today</span>
            <button 
              onClick={() => setActiveModal('approve')}
              className="text-brand-secondary hover:text-white transition-colors font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 duration-200"
            >
              Open Console <ChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* Card 3: Matrimonial Registry */}
        <div className="card-neo p-5 relative overflow-hidden group hover:border-purple-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Heart size={20} />
            </div>
            <div className="flex items-center gap-1.5 text-pink-400 font-bold text-xs bg-pink-500/5 px-2 py-1 rounded-full border border-pink-500/10">
              Active Profiles
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Active Matrimonial Profiles</h4>
            <h3 className="text-3xl font-black text-white mt-1 tracking-tight">
              {matrimonialProfiles.length}
            </h3>
          </div>

          {/* Mini trend line graph */}
          <div className="h-10 mt-3 flex items-end">
            <svg className="w-full h-8 overflow-visible" viewBox="0 0 150 40">
              <defs>
                <linearGradient id="gradient-line-pink" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EC4899" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#EC4899" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d="M0,38 Q15,30 30,35 T60,20 T90,10 T120,25 T150,5 L150,40 L0,40 Z" fill="url(#gradient-line-pink)" />
              <path d="M0,38 Q15,30 30,35 T60,20 T90,10 T120,25 T150,5" fill="none" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-text-muted">
            <span>Interest Requests: 84% Response</span>
            <button className="text-pink-400 hover:text-white transition-colors font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 duration-200">
              Registry Desk <ChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* Card 4: Upcoming Events */}
        <div className="card-neo p-5 relative overflow-hidden group hover:border-purple-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Calendar size={20} />
            </div>
            <div className="flex items-center gap-1 text-indigo-400 font-bold text-xs bg-indigo-500/5 px-2 py-1 rounded-full border border-indigo-500/10">
              Live RSVP tracking
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Scheduled Events</h4>
            <h3 className="text-3xl font-black text-white mt-1 tracking-tight">
              {events.length}
            </h3>
          </div>

          {/* Mini trend line graph */}
          <div className="h-10 mt-3 flex items-end">
            <svg className="w-full h-8 overflow-visible" viewBox="0 0 150 40">
              <path d="M0,15 T30,5 T60,35 T90,20 T120,10 T150,15" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-text-muted">
            <span>Next: Career Seminar</span>
            <button onClick={() => setActiveModal('event')} className="text-indigo-400 hover:text-white transition-colors font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 duration-200">
              Add Event <ChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* Card 5: Professional Listings */}
        <div className="card-neo p-5 relative overflow-hidden group hover:border-purple-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Briefcase size={20} />
            </div>
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs bg-amber-500/5 px-2 py-1 rounded-full border border-amber-500/10">
              Jobs & Directory
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Professional Directory</h4>
            <h3 className="text-3xl font-black text-white mt-1 tracking-tight">
              24
            </h3>
          </div>

          {/* Mini trend line graph */}
          <div className="h-10 mt-3 flex items-end">
            <svg className="w-full h-8 overflow-visible" viewBox="0 0 150 40">
              <path d="M0,35 Q30,10 60,30 T120,12 T150,22" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-text-muted">
            <span>Business Nodes: 8 Domains</span>
            <button className="text-amber-400 hover:text-white transition-colors font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 duration-200">
              View Listings <ChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* Card 6: Engagement Activity Score */}
        <div className="card-neo p-5 relative overflow-hidden group hover:border-purple-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Award size={20} />
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs bg-emerald-500/5 px-2 py-1 rounded-full border border-emerald-500/10">
              +1.8%
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Samaj Activity Score</h4>
            <h3 className="text-3xl font-black text-white mt-1 tracking-tight">
              96.4%
            </h3>
          </div>

          {/* Mini trend line graph */}
          <div className="h-10 mt-3 flex items-end">
            <svg className="w-full h-8 overflow-visible" viewBox="0 0 150 40">
              <defs>
                <linearGradient id="gradient-line-score" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d="M0,28 Q20,18 40,24 T80,10 T120,20 T150,5 L150,40 L0,40 Z" fill="url(#gradient-line-score)" />
              <path d="M0,28 Q20,18 40,24 T80,10 T120,20 T150,5" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-text-muted">
            <span>High Engagement Factor</span>
            <span className="text-brand-secondary font-semibold">Excellent Stability</span>
          </div>
        </div>

      </section>

      {/* ─── ANALYTICS CHART SECTION ─── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <BarChart3 size={20} className="text-purple-400" />
              Samaj Analytics Overview
            </h3>
            <p className="text-xs text-text-muted mt-0.5">Real-time graphic parameters from portal activities</p>
          </div>
          <button 
            onClick={() => showToast('Refreshing analytical datasets...', 'success')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 active:scale-95 transition-all border border-white/5"
          >
            <RefreshCw size={14} className="animate-spin-slow" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Chart 1: Member Growth */}
          <div className="card-neo p-5 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Monthly Member Growth</h4>
              <p className="text-[10px] text-text-muted">Growth of verified accounts over last 6 months</p>
            </div>
            <div className="h-44 mt-4 flex items-center justify-center">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 150">
                <defs>
                  <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.01"/>
                  </linearGradient>
                </defs>
                {/* Horizontal Guide Lines */}
                <line x1="20" y1="20" x2="280" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                <line x1="20" y1="70" x2="280" y2="70" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                <line x1="20" y1="120" x2="280" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                {/* Graph Path */}
                <path d="M20,120 Q60,110 100,90 T180,60 T260,35 L280,30 L280,130 L20,130 Z" fill="url(#area-grad)" />
                <path d="M20,120 Q60,110 100,90 T180,60 T260,35 L280,30" fill="none" stroke="#7C3AED" strokeWidth="3.5" strokeLinecap="round" />
                {/* Node Points */}
                <circle cx="20" cy="120" r="4.5" fill="#7C3AED" stroke="white" strokeWidth="1.5" />
                <circle cx="100" cy="90" r="4.5" fill="#7C3AED" stroke="white" strokeWidth="1.5" />
                <circle cx="180" cy="60" r="4.5" fill="#7C3AED" stroke="white" strokeWidth="1.5" />
                <circle cx="280" cy="30" r="4.5" fill="#A78BFA" stroke="white" strokeWidth="1.5" />
                {/* X Axis Labels */}
                <text x="18" y="145" fill="rgba(255,255,255,0.4)" fontSize="9" fontWeight="bold">Jan</text>
                <text x="95" y="145" fill="rgba(255,255,255,0.4)" fontSize="9" fontWeight="bold">Mar</text>
                <text x="175" y="145" fill="rgba(255,255,255,0.4)" fontSize="9" fontWeight="bold">May</text>
                <text x="268" y="145" fill="rgba(255,255,255,0.4)" fontSize="9" fontWeight="bold">Jul</text>
              </svg>
            </div>
          </div>

          {/* Chart 2: Event Participation */}
          <div className="card-neo p-5 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Event RSVP Turnout</h4>
              <p className="text-[10px] text-text-muted">Registered members versus actual check-ins</p>
            </div>
            <div className="h-44 mt-4 flex items-end justify-between px-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 150">
                {/* Horizontal Guide Lines */}
                <line x1="10" y1="20" x2="290" y2="20" stroke="rgba(255,255,255,0.03)" />
                <line x1="10" y1="70" x2="290" y2="70" stroke="rgba(255,255,255,0.03)" />
                <line x1="10" y1="120" x2="290" y2="120" stroke="rgba(255,255,255,0.03)" />
                
                {/* Bars - Event 1 */}
                <rect x="25" y="40" width="16" height="85" rx="3.5" fill="url(#purple-grad)" />
                <rect x="44" y="65" width="16" height="60" rx="3.5" fill="#3B82F6" />
                {/* Bars - Event 2 */}
                <rect x="95" y="15" width="16" height="110" rx="3.5" fill="url(#purple-grad)" />
                <rect x="114" y="35" width="16" height="90" rx="3.5" fill="#3B82F6" />
                {/* Bars - Event 3 */}
                <rect x="165" y="60" width="16" height="65" rx="3.5" fill="url(#purple-grad)" />
                <rect x="184" y="80" width="16" height="45" rx="3.5" fill="#3B82F6" />
                {/* Bars - Event 4 */}
                <rect x="235" y="30" width="16" height="95" rx="3.5" fill="url(#purple-grad)" />
                <rect x="254" y="55" width="16" height="70" rx="3.5" fill="#3B82F6" />

                <defs>
                  <linearGradient id="purple-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED"/>
                    <stop offset="100%" stopColor="#C4B5FD"/>
                  </linearGradient>
                </defs>

                <text x="27" y="142" fill="rgba(255,255,255,0.4)" fontSize="9" fontWeight="bold">Evt-1</text>
                <text x="97" y="142" fill="rgba(255,255,255,0.4)" fontSize="9" fontWeight="bold">Evt-2</text>
                <text x="167" y="142" fill="rgba(255,255,255,0.4)" fontSize="9" fontWeight="bold">Evt-3</text>
                <text x="237" y="142" fill="rgba(255,255,255,0.4)" fontSize="9" fontWeight="bold">Evt-4</text>
              </svg>
            </div>
            <div className="flex items-center gap-4 justify-center text-[10px] mt-2 border-t border-white/5 pt-2">
              <div className="flex items-center gap-1.5 text-white/70">
                <div className="w-2.5 h-2.5 rounded bg-purple-500" /> RSVPs Cast
              </div>
              <div className="flex items-center gap-1.5 text-white/70">
                <div className="w-2.5 h-2.5 rounded bg-blue-500" /> Checked In
              </div>
            </div>
          </div>

          {/* Chart 3: Matrimonial Activity */}
          <div className="card-neo p-5 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Matrimonial Activity</h4>
              <p className="text-[10px] text-text-muted">Interests sent (Rose) vs Approvals (Purple)</p>
            </div>
            <div className="h-44 mt-4 flex items-center justify-center">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 150">
                {/* Horizontal Guide Lines */}
                <line x1="20" y1="20" x2="280" y2="20" stroke="rgba(255,255,255,0.03)" />
                <line x1="20" y1="70" x2="280" y2="70" stroke="rgba(255,255,255,0.03)" />
                <line x1="20" y1="120" x2="280" y2="120" stroke="rgba(255,255,255,0.03)" />
                {/* Line 1 - Interests Sent (Rose) */}
                <path d="M20,110 Q60,60 110,80 T200,45 T280,30" fill="none" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" />
                {/* Line 2 - Interests Accepted (Purple) */}
                <path d="M20,120 Q60,90 110,110 T200,65 T280,45" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" />
                
                <circle cx="280" cy="30" r="3.5" fill="#F43F5E" stroke="white" strokeWidth="1" />
                <circle cx="280" cy="45" r="3.5" fill="#7C3AED" stroke="white" strokeWidth="1" />
              </svg>
            </div>
            <div className="flex items-center gap-4 justify-center text-[10px] border-t border-white/5 pt-2">
              <div className="flex items-center gap-1.5 text-white/70">
                <div className="w-2.5 h-2.5 rounded bg-pink-500" /> Requests Raised
              </div>
              <div className="flex items-center gap-1.5 text-white/70">
                <div className="w-2.5 h-2.5 rounded bg-purple-500" /> Mutual Matches
              </div>
            </div>
          </div>

          {/* Chart 4: Professional Directory Domains */}
          <div className="card-neo p-5 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Professional Directory Domains</h4>
              <p className="text-[10px] text-text-muted">Sector metrics across verified community profiles</p>
            </div>
            <div className="h-44 mt-4 flex items-center justify-between gap-4">
              {/* SVG Donut Chart */}
              <div className="w-24 h-24 shrink-0">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  {/* Background ring */}
                  <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                  
                  {/* Segment 1: IT - 35% */}
                  <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#8B5CF6" strokeWidth="4" 
                    strokeDasharray="35 65" strokeDashoffset="25" />
                  
                  {/* Segment 2: Finance/CA - 25% */}
                  <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#3B82F6" strokeWidth="4" 
                    strokeDasharray="25 75" strokeDashoffset="90" />
                  
                  {/* Segment 3: Medical - 20% */}
                  <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#10B981" strokeWidth="4" 
                    strokeDasharray="20 80" strokeDashoffset="115" />
                  
                  {/* Segment 4: Business/Trade - 20% */}
                  <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#F59E0B" strokeWidth="4" 
                    strokeDasharray="20 80" strokeDashoffset="135" />
                </svg>
              </div>

              {/* Legend Grid */}
              <div className="flex-1 space-y-1.5 text-[10px] text-text-muted font-bold">
                <div className="flex items-center justify-between text-white">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-purple-500" /> IT / Tech</span>
                  <span>35%</span>
                </div>
                <div className="flex items-center justify-between text-white">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-blue-500" /> CA / Finance</span>
                  <span>25%</span>
                </div>
                <div className="flex items-center justify-between text-white">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-emerald-500" /> Medical / MD</span>
                  <span>20%</span>
                </div>
                <div className="flex items-center justify-between text-white">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-amber-500" /> Business Owner</span>
                  <span>20%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart 5: Community Engagement Waves */}
          <div className="card-neo p-5 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Weekly Activity engagement</h4>
              <p className="text-[10px] text-text-muted">Total platform interactions log count</p>
            </div>
            <div className="h-44 mt-4 flex items-center justify-center">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 150">
                {/* Horizontal Guide Lines */}
                <line x1="10" y1="20" x2="290" y2="20" stroke="rgba(255,255,255,0.03)" />
                <line x1="10" y1="70" x2="290" y2="70" stroke="rgba(255,255,255,0.03)" />
                <line x1="10" y1="120" x2="290" y2="120" stroke="rgba(255,255,255,0.03)" />

                {/* Spline Wave */}
                <path d="M10,80 C50,15 80,130 130,50 C180,-10 220,140 290,60" fill="none" stroke="url(#engage-grad)" strokeWidth="3" strokeLinecap="round" />
                <path d="M10,95 C50,30 80,145 130,65 C180,5 220,155 290,75" fill="none" stroke="rgba(167, 139, 250, 0.2)" strokeWidth="1.5" strokeLinecap="round" />
                
                <defs>
                  <linearGradient id="engage-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="50%" stopColor="#A78BFA" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Chart 6: Active vs Inactive ratio */}
          <div className="card-neo p-5 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Active vs Inactive Ratio</h4>
              <p className="text-[10px] text-text-muted">Accounts accessed in the last 14 days</p>
            </div>
            <div className="h-44 mt-4 flex flex-col items-center justify-center relative">
              <div className="w-28 h-28">
                <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                  {/* Inactive Segment (12%) */}
                  <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="rgba(124,58,237,0.15)" strokeWidth="4.5" />
                  {/* Active Segment (88%) */}
                  <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="url(#purple-grad)" strokeWidth="4.5"
                    strokeDasharray="88 12" strokeDashoffset="0" strokeLinecap="round" />
                </svg>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-3">
                <span className="text-2xl font-black text-white">88%</span>
                <span className="text-[8px] font-bold text-emerald-400 tracking-wider uppercase">Active Ratio</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── PENDING APPROVALS WIDGET ─── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Pending approvals widget */}
        <div className="card-neo p-5 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-md font-black text-white flex items-center gap-2">
                <ShieldAlert size={18} className="text-amber-400" />
                Pending Verification Requests
              </h3>
              <p className="text-xs text-text-muted mt-0.5">Approve new profiles to allow full catalog directory access</p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {pendingMembers.length} Requests
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[350px] pr-2">
            {pendingMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center bg-white/5 border border-white/5 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-2">
                  <Check size={20} />
                </div>
                <h4 className="text-sm font-bold text-white">All Clear!</h4>
                <p className="text-xs text-text-muted mt-1 max-w-xs">No pending verification request at this moment.</p>
              </div>
            ) : (
              pendingMembers.map((member) => (
                <div 
                  key={member.id} 
                  className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/8 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/5"
                >
                  <div className="flex items-center gap-3.5">
                    <Avatar 
                      initials={member.initials} 
                      size="md" 
                      imageUrl={member.avatar}
                      color="bg-gradient-to-br from-indigo-400 to-purple-600 text-white font-bold"
                    />
                    <div>
                      <h4 className="text-sm font-black text-white">{member.name}</h4>
                      <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>{member.city}</span>
                        <span>•</span>
                        <span>{member.profession || 'Self Employed'}</span>
                        <span>•</span>
                        <span className="text-[10px] font-semibold text-purple-300">{member.phone}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 justify-end">
                    <button 
                      onClick={() => setSelectedProofMember(member)}
                      className="px-3 py-1.5 rounded-lg text-white/70 hover:text-white bg-white/5 hover:bg-white/10 text-xs font-bold transition-all flex items-center gap-1 border border-white/5"
                    >
                      <Eye size={12} /> View Proof
                    </button>
                    <button 
                      onClick={() => handleReject(member.id, member.name)}
                      className="px-3 py-1.5 rounded-lg text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500 text-xs font-bold transition-all border border-rose-500/20"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleApprove(member.id, member.name)}
                      className="px-4 py-1.5 rounded-lg text-white bg-brand-primary hover:bg-purple-600 text-xs font-bold transition-all shadow-md shadow-purple-500/20"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Quick navigation desk shortcuts */}
        <div className="card-neo p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-md font-black text-white flex items-center gap-2">
              <Sparkles size={18} className="text-purple-400" />
              Quick Navigation Shortcuts
            </h3>
            <p className="text-xs text-text-muted mt-0.5">Instant portal access bookmarks</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 flex-1">
            <button className="p-3.5 rounded-2xl bg-white/5 hover:bg-purple-500/10 hover:border-purple-500/20 text-left border border-white/5 transition-all group flex flex-col justify-between">
              <Users size={16} className="text-purple-400 group-hover:scale-110 duration-200" />
              <span className="text-xs font-bold text-white mt-4 block">Members Desk</span>
            </button>
            <button className="p-3.5 rounded-2xl bg-white/5 hover:bg-pink-500/10 hover:border-pink-500/20 text-left border border-white/5 transition-all group flex flex-col justify-between">
              <Heart size={16} className="text-pink-400 group-hover:scale-110 duration-200" />
              <span className="text-xs font-bold text-white mt-4 block">Matrimonial</span>
            </button>
            <button className="p-3.5 rounded-2xl bg-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/20 text-left border border-white/5 transition-all group flex flex-col justify-between">
              <Calendar size={16} className="text-indigo-400 group-hover:scale-110 duration-200" />
              <span className="text-xs font-bold text-white mt-4 block">Events Desk</span>
            </button>
            <button className="p-3.5 rounded-2xl bg-white/5 hover:bg-amber-500/10 hover:border-amber-500/20 text-left border border-white/5 transition-all group flex flex-col justify-between">
              <Briefcase size={16} className="text-amber-400 group-hover:scale-110 duration-200" />
              <span className="text-xs font-bold text-white mt-4 block">Professionals</span>
            </button>
            <button onClick={() => setActiveModal('reports')} className="p-3.5 rounded-2xl bg-white/5 hover:bg-purple-500/10 hover:border-purple-500/20 text-left border border-white/5 transition-all group flex flex-col justify-between">
              <FileText size={16} className="text-purple-400 group-hover:scale-110 duration-200" />
              <span className="text-xs font-bold text-white mt-4 block">Financials</span>
            </button>
            <button className="p-3.5 rounded-2xl bg-white/5 hover:bg-purple-500/10 hover:border-purple-500/20 text-left border border-white/5 transition-all group flex flex-col justify-between col-span-1">
              <Settings size={16} className="text-purple-400 group-hover:scale-110 duration-200" />
              <span className="text-xs font-bold text-white mt-4 block">System Config</span>
            </button>
          </div>
        </div>

      </section>

      {/* ─── RECENT REGISTRATIONS TABLE ─── */}
      <section className="card-neo p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-md font-black text-white flex items-center gap-2">
              <Users size={18} className="text-purple-400" />
              Recent Portal Registrations
            </h3>
            <p className="text-xs text-text-muted mt-0.5">Chronological registry of community accounts</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search by name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/5 hover:border-purple-500/10 focus:border-brand-primary outline-none text-xs text-white rounded-xl transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/5 bg-white/3">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-black uppercase text-text-muted tracking-wider bg-white/5">
                <th className="p-4">Profile Photo</th>
                <th className="p-4">Name</th>
                <th className="p-4">City</th>
                <th className="p-4">Status / Role</th>
                <th className="p-4">Verification</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-xs text-text-muted">
                    No community profile matches the search query.
                  </td>
                </tr>
              ) : (
                filteredMembers.slice(0, 6).map((member) => (
                  <tr key={member.id} className="hover:bg-white/5 transition-all text-xs text-white">
                    <td className="p-4">
                      <Avatar 
                        initials={member.initials} 
                        imageUrl={member.avatar} 
                        size="sm"
                        color="bg-gradient-to-br from-purple-400 to-indigo-600 text-white font-bold"
                      />
                    </td>
                    <td className="p-4 font-bold">{member.name}</td>
                    <td className="p-4 text-text-muted">{member.city}</td>
                    <td className="p-4 font-semibold text-purple-300">
                      {member.profession || 'Registered Member'}
                    </td>
                    <td className="p-4">
                      {member.isVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Check size={10} /> Verified Council
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <AlertCircle size={10} /> Pending Audit
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {member.isVerified ? (
                          <button 
                            onClick={() => {
                              showToast(`Revoking verification profile ${member.name}`);
                              // Inline state toggle
                              verifyMember(member.id); 
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/20"
                          >
                            Revoke
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleApprove(member.id, member.name)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/20"
                          >
                            Approve
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedProofMember(member)}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-[10px] font-bold border border-white/5"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── UPCOMING EVENTS & TIMELINE LOG ─── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upcoming events list */}
        <div className="card-neo p-5 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-md font-black text-white flex items-center gap-2">
                <Calendar size={18} className="text-purple-400" />
                Community Events Desk
              </h3>
              <p className="text-xs text-text-muted mt-0.5">Upcoming celebrations, assemblies and schedules</p>
            </div>
            <button 
              onClick={() => setActiveModal('event')}
              className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
            >
              <Plus size={12} /> Add Event
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[360px] pr-2">
            {events.length === 0 ? (
              <div className="col-span-2 flex flex-col items-center justify-center h-48 bg-white/5 border border-white/5 rounded-2xl">
                <p className="text-xs text-text-muted">No upcoming events listed.</p>
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="rounded-2xl border border-white/5 bg-white/3 overflow-hidden flex flex-col justify-between group hover:border-purple-500/10 transition-all">
                  <div className="h-28 overflow-hidden relative shrink-0">
                    <img 
                      src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'} 
                      alt={event.title} 
                      className="w-full h-full object-cover group-hover:scale-105 duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-brand-primary text-white">
                      {event.category || 'General'}
                    </div>
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{event.title}</h4>
                      <p className="text-[10px] text-text-muted mt-1.5 flex items-center gap-1"><MapPin size={10} /> {event.venue}</p>
                      <p className="text-[10px] text-text-muted mt-1 flex items-center gap-1"><Clock size={10} /> {event.date} • {event.time || '6:00 PM'}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5">
                      <div className="flex items-center justify-between text-[9px] text-text-muted font-bold mb-1">
                        <span>RSVP Register Target</span>
                        <span className="text-purple-300">{event.attendees || 0} Registered</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-primary rounded-full" style={{ width: `${Math.min(100, ((event.attendees || 0) / 150) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Community Activity Timeline */}
        <div className="card-neo p-5 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-md font-black text-white flex items-center gap-2">
              <Clock size={18} className="text-purple-400" />
              Community Activity Log
            </h3>
            <p className="text-xs text-text-muted mt-0.5">Chronological system events audit</p>
            
            {/* Horizontal Filter Tabs */}
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {['all', 'members', 'events', 'matrimony'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTimelineFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all ${
                    timelineFilter === tab
                      ? 'bg-purple-500/20 text-purple-200 border-purple-500/30'
                      : 'bg-white/5 text-white/50 border-transparent hover:bg-white/8 hover:text-white/80'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px] pr-1.5">
            {filteredActivities.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-10">No logs for this category.</p>
            ) : (
              filteredActivities.map((act) => (
                <div key={act.id} className="relative pl-6 pb-2 border-l border-white/5 last:border-none">
                  {/* Timeline bullet dot */}
                  <div className="absolute left-0 top-1 -translate-x-1/2 w-2 h-2 rounded-full bg-brand-primary" />
                  
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] text-white">
                        <span className="font-bold">{act.user}</span> {act.action}
                      </p>
                      {act.details && (
                        <p className="text-[9px] text-text-muted mt-0.5 font-medium">{act.details}</p>
                      )}
                    </div>
                    <span className="text-[8px] font-bold text-text-muted uppercase shrink-0">{act.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </section>

      {/* ─── ENGAGEMENT SUMMARY REPORT ─── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Side: Today vs Weekly vs Monthly */}
        <div className="card-neo p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-md font-black text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-purple-400" />
              Community Engagement Report
            </h3>
            <p className="text-xs text-text-muted mt-0.5">Platform interactions statistics</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Today's Visits</p>
              <h4 className="text-lg font-black text-white mt-1">124</h4>
              <span className="text-[8px] font-bold text-emerald-400 mt-1 block">+2.4%</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Weekly Visits</p>
              <h4 className="text-lg font-black text-white mt-1">842</h4>
              <span className="text-[8px] font-bold text-emerald-400 mt-1 block">+8.5%</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Monthly Visits</p>
              <h4 className="text-lg font-black text-white mt-1">3.4k</h4>
              <span className="text-[8px] font-bold text-emerald-400 mt-1 block">+12%</span>
            </div>
          </div>

          <div className="mt-4 p-3.5 rounded-2xl bg-purple-500/5 border border-purple-500/10 text-xs text-purple-200">
            <span className="font-bold text-white block">Adhyaksh Insight:</span>
            Weekly check-ins rose due to newly created marriage match registrations and local dharmashala booking schedules.
          </div>
        </div>

        {/* Right Side: Top contributors */}
        <div className="card-neo p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-md font-black text-white flex items-center gap-2">
              <Award size={18} className="text-amber-400" />
              Council Top Contributors
            </h3>
            <p className="text-xs text-text-muted mt-0.5">Top volunteers and donors in community portal</p>
          </div>

          <div className="space-y-3 mt-4">
            {topContributors.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 transition-all">
                <div className="flex items-center gap-3">
                  <Avatar initials={c.initials} size="sm" color="bg-gradient-to-br from-purple-400 to-indigo-600 text-white font-bold" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{c.name}</h4>
                    <p className="text-[9px] font-medium text-purple-300">{c.role}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                  {c.points}
                </span>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* ─── ACTIVE DIALOGUE MODALS ─── */}
      <AnimatePresence>
        
        {/* Modal 1: Approve Members List */}
        {activeModal === 'approve' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-2xl bg-gradient-to-b from-[#13093a] to-[#21124f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-10 p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-md font-black text-white flex items-center gap-2">
                  <ShieldAlert size={18} className="text-amber-400" />
                  Approve Pending Accounts
                </h3>
                <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/50 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
                {pendingMembers.length === 0 ? (
                  <p className="text-xs text-text-muted text-center py-10">No pending accounts need verification.</p>
                ) : (
                  pendingMembers.map((member) => (
                    <div key={member.id} className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar initials={member.initials} size="sm" imageUrl={member.avatar} />
                        <div>
                          <h4 className="text-xs font-bold text-white">{member.name}</h4>
                          <p className="text-[10px] text-text-muted">{member.city} • {member.phone}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button 
                          onClick={() => handleReject(member.id, member.name)}
                          className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-300 text-[10px] font-bold border border-rose-500/20"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => handleApprove(member.id, member.name)}
                          className="px-3 py-1 rounded-lg bg-brand-primary text-white text-[10px] font-bold shadow shadow-purple-500/20"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal 2: Create Event Form */}
        {activeModal === 'event' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-lg bg-gradient-to-b from-[#13093a] to-[#21124f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-10 p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-md font-black text-white flex items-center gap-2">
                  <Calendar size={18} className="text-purple-400" />
                  Schedule Samaj Celebration
                </h3>
                <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/50 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Event Title *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g., Annual Sneh Milan" 
                    value={eventForm.title}
                    onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Event Date *</label>
                    <input 
                      type="date" 
                      required
                      value={eventForm.date}
                      onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Time</label>
                    <input 
                      type="text" 
                      placeholder="e.g., 07:00 PM" 
                      value={eventForm.time}
                      onChange={(e) => setEventForm({...eventForm, time: e.target.value})}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Venue Location *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g., Samaj Bhawan, Indore" 
                    value={eventForm.venue}
                    onChange={(e) => setEventForm({...eventForm, venue: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Event Category</label>
                  <select 
                    value={eventForm.category}
                    onChange={(e) => setEventForm({...eventForm, category: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
                  >
                    <option value="General">General Gatherings</option>
                    <option value="Festival">Festival & Satsang</option>
                    <option value="Youth">Youth Careers & Seminars</option>
                    <option value="Education">Education Awards</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Description</label>
                  <textarea 
                    rows="3"
                    placeholder="Enter short event synopsis..."
                    value={eventForm.description}
                    onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 rounded-xl bg-brand-primary text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-purple-500/25 press-scale"
                >
                  Create & Broadcast Event
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal 3: Broadcast Pinned Announcement */}
        {activeModal === 'announce' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-md bg-gradient-to-b from-[#13093a] to-[#21124f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-10 p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-md font-black text-white flex items-center gap-2">
                  <Send size={16} className="text-purple-400" />
                  BroadCast Pinned Announcement
                </h3>
                <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/50 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSendAnnouncement} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Announcement Text</label>
                  <textarea 
                    rows="5"
                    required
                    placeholder="Write official council circular text here... This will be pinned to all user feeds."
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 rounded-xl bg-brand-primary text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-purple-500/25 press-scale"
                >
                  Broadcast to Feed
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal 4: View Reports Modal */}
        {activeModal === 'reports' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-2xl bg-gradient-to-b from-[#13093a] to-[#21124f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-10 p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-md font-black text-white flex items-center gap-2">
                  <FileText size={18} className="text-purple-400" />
                  Samaj Financial Audit Reports
                </h3>
                <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/50 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">Donations / Funds Collected</h4>
                  <div className="mt-3 space-y-2">
                    {funds.map((f) => {
                      const fContribs = contributions[f.id] || [];
                      const fCollected = fContribs.reduce((acc, curr) => acc + (curr.paidAmount || 0), 0);
                      return (
                        <div key={f.id} className="flex justify-between text-xs text-white">
                          <span>{f.name}</span>
                          <span className="font-bold">₹{fCollected.toLocaleString('en-IN')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">Expenses Audited</h4>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-xs text-white">
                      <span>Hall Renovation Costs</span>
                      <span className="font-bold text-rose-400">₹45,000</span>
                    </div>
                    <div className="flex justify-between text-xs text-white">
                      <span>Food Distribution Event</span>
                      <span className="font-bold text-rose-400">₹18,500</span>
                    </div>
                    <div className="flex justify-between text-xs text-white">
                      <span>Scholarship Allocations</span>
                      <span className="font-bold text-rose-400">₹25,000</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 text-xs text-purple-200">
                <h4 className="font-bold text-white mb-1">Treasury Overview:</h4>
                Total cash reserves are audited and synced to localStorage records. Invoices are archived on-chain for secure verification audits.
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal 5: Proof Document Viewer */}
        {selectedProofMember && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProofMember(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-md bg-gradient-to-b from-[#13093a] to-[#21124f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative z-10 p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <h3 className="text-sm font-black text-white">Verification Credential</h3>
                  <p className="text-[10px] text-text-muted mt-0.5">Proof submitted by {selectedProofMember.name}</p>
                </div>
                <button onClick={() => setSelectedProofMember(null)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/50 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="aspect-[4/3] rounded-2xl bg-white/5 border border-white/5 overflow-hidden flex items-center justify-center p-3 relative">
                {/* Simulated Aadhaar/Proof card */}
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-900 to-purple-950 p-4 border border-white/10 flex flex-col justify-between text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full filter blur-xl" />
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-[11px] font-bold tracking-wider uppercase text-purple-300">Identity Card of India</h4>
                      <p className="text-[7px] text-purple-400 font-bold uppercase mt-0.5">Government of India Verification</p>
                    </div>
                    <div className="w-6 h-6 rounded bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-[10px]">🇮🇳</div>
                  </div>

                  <div className="flex items-center gap-3.5 mt-3">
                    <Avatar initials={selectedProofMember.initials} size="md" color="bg-purple-600 text-white font-bold" />
                    <div>
                      <p className="text-xs font-bold">{selectedProofMember.name}</p>
                      <p className="text-[8px] text-purple-300 font-semibold mt-0.5">DOB: 1991-03-15 • Male</p>
                      <p className="text-[8px] text-purple-300 font-semibold mt-0.5">CITY: {selectedProofMember.city}</p>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-2 flex items-center justify-between mt-3 text-[9px] font-mono tracking-widest text-purple-300/80">
                    <span>9948 1002 9948</span>
                    <span className="text-[7px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-sans font-bold">DIGI-VERIFIED</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => handleReject(selectedProofMember.id, selectedProofMember.name)}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500/10 text-rose-300 text-xs font-bold border border-rose-500/20 active:scale-95 transition-all text-center"
                >
                  Reject Proof
                </button>
                <button 
                  onClick={() => handleApprove(selectedProofMember.id, selectedProofMember.name)}
                  className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold active:scale-95 transition-all text-center"
                >
                  Approve Member
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>

    </div>
  );
};

export default HeadDashboard;
