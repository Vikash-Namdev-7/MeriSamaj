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

  const [activeModal, setActiveModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [timelineFilter, setTimelineFilter] = useState('all');
  const [toast, setToast] = useState(null);

  const [eventForm, setEventForm] = useState({
    title: '', date: '', time: '', venue: '', description: '', category: 'General', image: ''
  });
  const [announcementText, setAnnouncementText] = useState('');
  const [selectedProofMember, setSelectedProofMember] = useState(null);

  const pendingMembers = useMemo(() => members.filter(m => !m.isVerified), [members]);
  const verifiedCount = useMemo(() => members.filter(m => m.isVerified).length, [members]);
  
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = (id, name) => {
    verifyMember(id);
    showToast(`Approved membership for ${name}!`, 'success');
    if (selectedProofMember?.id === id) setSelectedProofMember(null);
  };

  const handleReject = (id, name) => {
    rejectMember(id);
    showToast(`Rejected membership for ${name}`, 'warning');
    if (selectedProofMember?.id === id) setSelectedProofMember(null);
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

  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.profession && m.profession.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [members, searchQuery]);

  const activityLog = useMemo(() => {
    const logs = [];
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

  const topContributors = [
    { name: 'Suresh Agrawal', points: '₹45,000 Contributed', role: 'Patron Donor', initials: 'SA' },
    { name: 'Dr. Kavita Agrawal', points: '12 Events Hosted', role: 'Medical Volunteer', initials: 'KA' },
    { name: 'Vikas Agrawal', points: 'CA Audit Advisor', role: 'Committee Auditor', initials: 'VA' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">

      {/* ─── TOAST ─── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border text-sm font-bold ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── PAGE HEADER ─── */}
      <div className="px-6 py-5 bg-white border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <LayoutDashboardIcon className="text-indigo-600" size={24} />
            President Dashboard
          </h1>
          <p className="text-[13px] text-slate-500 font-medium mt-1">
            {currentUser?.community || 'Agrawal Samaj'} &nbsp;•&nbsp;
            <span className="text-indigo-600 font-semibold">Session: Active Council</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setActiveModal('approve')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
          >
            <Check size={14} /> Approve Members
            {pendingMembers.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-black animate-pulse">
                {pendingMembers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveModal('event')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
          >
            <Plus size={14} /> Create Event
          </button>
          <button
            onClick={() => setActiveModal('announce')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
          >
            <Send size={13} /> Announcement
          </button>
          <button
            onClick={() => setActiveModal('reports')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-indigo-500/20"
          >
            <FileText size={14} /> View Reports
          </button>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto space-y-6">

        {/* ─── STATS CARDS ─── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Card 1: Total Members */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Users size={22} />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Members</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{verifiedCount}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Total Accounts: {members.length}</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200 shrink-0">
              <TrendingUp size={12} /> +4.2%
            </div>
          </div>

          {/* Card 2: Pending Approvals */}
          <div className={`bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4 ${pendingMembers.length > 0 ? 'border-rose-200' : 'border-slate-200'}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${pendingMembers.length > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
              <CheckCircle2 size={22} />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Approvals</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{pendingMembers.length}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Last Application: Today</p>
            </div>
            {pendingMembers.length > 0 ? (
              <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 shrink-0">Action Required</span>
            ) : (
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">All Clear</span>
            )}
          </div>

          {/* Card 3: Matrimonial */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
              <Heart size={22} />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Matrimonial Profiles</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{matrimonialProfiles.length}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">84% Response Rate</p>
            </div>
            <span className="text-[10px] font-black text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200 shrink-0">Active</span>
          </div>

          {/* Card 4: Events */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Calendar size={22} />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Scheduled Events</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{events.length}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Next: Career Seminar</p>
            </div>
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 shrink-0">Live RSVP</span>
          </div>

          {/* Card 5: Professionals */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Briefcase size={22} />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Professional Directory</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">24</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Business Nodes: 8 Domains</p>
            </div>
            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 shrink-0">Jobs & Dir.</span>
          </div>

          {/* Card 6: Engagement Score */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Award size={22} />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Activity Score</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">96.4%</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Excellent Stability</p>
            </div>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">+1.8%</span>
          </div>

        </section>

        {/* ─── ANALYTICS SECTION ─── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[15px] font-black text-slate-900 flex items-center gap-2">
                <BarChart3 size={18} className="text-indigo-600" />
                Samaj Analytics Overview
              </h3>
              <p className="text-[12px] text-slate-500 mt-0.5">Real-time graphic parameters from portal activities</p>
            </div>
            <button
              onClick={() => showToast('Refreshing analytical datasets...', 'success')}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition-all border border-slate-200"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Chart 1: Member Growth */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Monthly Member Growth</h4>
                <p className="text-[11px] text-slate-500">Growth of verified accounts over last 6 months</p>
              </div>
              <div className="h-40 mt-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 150">
                  <defs>
                    <linearGradient id="lgt-area-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity="0.2"/>
                      <stop offset="100%" stopColor="#6366F1" stopOpacity="0.01"/>
                    </linearGradient>
                  </defs>
                  <line x1="20" y1="20" x2="280" y2="20" stroke="rgba(0,0,0,0.05)" strokeDasharray="3,3" />
                  <line x1="20" y1="70" x2="280" y2="70" stroke="rgba(0,0,0,0.05)" strokeDasharray="3,3" />
                  <line x1="20" y1="120" x2="280" y2="120" stroke="rgba(0,0,0,0.05)" strokeDasharray="3,3" />
                  <path d="M20,120 Q60,110 100,90 T180,60 T260,35 L280,30 L280,130 L20,130 Z" fill="url(#lgt-area-grad)" />
                  <path d="M20,120 Q60,110 100,90 T180,60 T260,35 L280,30" fill="none" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="20" cy="120" r="4" fill="#6366F1" stroke="white" strokeWidth="2" />
                  <circle cx="100" cy="90" r="4" fill="#6366F1" stroke="white" strokeWidth="2" />
                  <circle cx="180" cy="60" r="4" fill="#6366F1" stroke="white" strokeWidth="2" />
                  <circle cx="280" cy="30" r="4" fill="#818CF8" stroke="white" strokeWidth="2" />
                  <text x="18" y="145" fill="rgba(0,0,0,0.3)" fontSize="9" fontWeight="bold">Jan</text>
                  <text x="95" y="145" fill="rgba(0,0,0,0.3)" fontSize="9" fontWeight="bold">Mar</text>
                  <text x="175" y="145" fill="rgba(0,0,0,0.3)" fontSize="9" fontWeight="bold">May</text>
                  <text x="268" y="145" fill="rgba(0,0,0,0.3)" fontSize="9" fontWeight="bold">Jul</text>
                </svg>
              </div>
            </div>

            {/* Chart 2: Event RSVP */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Event RSVP Turnout</h4>
                <p className="text-[11px] text-slate-500">Registered members versus actual check-ins</p>
              </div>
              <div className="h-40 mt-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 150">
                  <line x1="10" y1="20" x2="290" y2="20" stroke="rgba(0,0,0,0.04)" />
                  <line x1="10" y1="70" x2="290" y2="70" stroke="rgba(0,0,0,0.04)" />
                  <line x1="10" y1="120" x2="290" y2="120" stroke="rgba(0,0,0,0.04)" />
                  <defs>
                    <linearGradient id="lgt-purple-bar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1"/>
                      <stop offset="100%" stopColor="#A5B4FC"/>
                    </linearGradient>
                  </defs>
                  <rect x="25" y="40" width="16" height="85" rx="3" fill="url(#lgt-purple-bar)" />
                  <rect x="44" y="65" width="16" height="60" rx="3" fill="#93C5FD" />
                  <rect x="95" y="15" width="16" height="110" rx="3" fill="url(#lgt-purple-bar)" />
                  <rect x="114" y="35" width="16" height="90" rx="3" fill="#93C5FD" />
                  <rect x="165" y="60" width="16" height="65" rx="3" fill="url(#lgt-purple-bar)" />
                  <rect x="184" y="80" width="16" height="45" rx="3" fill="#93C5FD" />
                  <rect x="235" y="30" width="16" height="95" rx="3" fill="url(#lgt-purple-bar)" />
                  <rect x="254" y="55" width="16" height="70" rx="3" fill="#93C5FD" />
                  <text x="27" y="142" fill="rgba(0,0,0,0.3)" fontSize="9" fontWeight="bold">Evt-1</text>
                  <text x="97" y="142" fill="rgba(0,0,0,0.3)" fontSize="9" fontWeight="bold">Evt-2</text>
                  <text x="167" y="142" fill="rgba(0,0,0,0.3)" fontSize="9" fontWeight="bold">Evt-3</text>
                  <text x="237" y="142" fill="rgba(0,0,0,0.3)" fontSize="9" fontWeight="bold">Evt-4</text>
                </svg>
              </div>
              <div className="flex items-center gap-4 justify-center text-[10px] mt-2 border-t border-slate-100 pt-2">
                <div className="flex items-center gap-1.5 text-slate-600"><div className="w-2.5 h-2.5 rounded bg-indigo-500" /> RSVPs Cast</div>
                <div className="flex items-center gap-1.5 text-slate-600"><div className="w-2.5 h-2.5 rounded bg-blue-300" /> Checked In</div>
              </div>
            </div>

            {/* Chart 3: Matrimonial Activity */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Matrimonial Activity</h4>
                <p className="text-[11px] text-slate-500">Interests sent (Rose) vs Approvals (Indigo)</p>
              </div>
              <div className="h-40 mt-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 150">
                  <line x1="20" y1="20" x2="280" y2="20" stroke="rgba(0,0,0,0.04)" />
                  <line x1="20" y1="70" x2="280" y2="70" stroke="rgba(0,0,0,0.04)" />
                  <line x1="20" y1="120" x2="280" y2="120" stroke="rgba(0,0,0,0.04)" />
                  <path d="M20,110 Q60,60 110,80 T200,45 T280,30" fill="none" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M20,120 Q60,90 110,110 T200,65 T280,45" fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="280" cy="30" r="3" fill="#F43F5E" stroke="white" strokeWidth="1" />
                  <circle cx="280" cy="45" r="3" fill="#6366F1" stroke="white" strokeWidth="1" />
                </svg>
              </div>
              <div className="flex items-center gap-4 justify-center text-[10px] border-t border-slate-100 pt-2">
                <div className="flex items-center gap-1.5 text-slate-600"><div className="w-2.5 h-2.5 rounded bg-rose-500" /> Requests</div>
                <div className="flex items-center gap-1.5 text-slate-600"><div className="w-2.5 h-2.5 rounded bg-indigo-500" /> Matches</div>
              </div>
            </div>

            {/* Chart 4: Professional Domains Donut */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Professional Directory Domains</h4>
                <p className="text-[11px] text-slate-500">Sector metrics across verified community profiles</p>
              </div>
              <div className="h-40 mt-4 flex items-center justify-between gap-4">
                <div className="w-24 h-24 shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="rgba(0,0,0,0.05)" strokeWidth="4" />
                    <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#6366F1" strokeWidth="4" strokeDasharray="35 65" strokeDashoffset="25" />
                    <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#3B82F6" strokeWidth="4" strokeDasharray="25 75" strokeDashoffset="90" />
                    <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#10B981" strokeWidth="4" strokeDasharray="20 80" strokeDashoffset="115" />
                    <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#F59E0B" strokeWidth="4" strokeDasharray="20 80" strokeDashoffset="135" />
                  </svg>
                </div>
                <div className="flex-1 space-y-1.5 text-[11px] font-bold text-slate-700">
                  <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-indigo-500" /> IT / Tech</span><span>35%</span></div>
                  <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-blue-500" /> CA / Finance</span><span>25%</span></div>
                  <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-emerald-500" /> Medical / MD</span><span>20%</span></div>
                  <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-amber-500" /> Business</span><span>20%</span></div>
                </div>
              </div>
            </div>

            {/* Chart 5: Engagement Waves */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Weekly Activity Engagement</h4>
                <p className="text-[11px] text-slate-500">Total platform interactions log count</p>
              </div>
              <div className="h-40 mt-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 150">
                  <line x1="10" y1="20" x2="290" y2="20" stroke="rgba(0,0,0,0.04)" />
                  <line x1="10" y1="70" x2="290" y2="70" stroke="rgba(0,0,0,0.04)" />
                  <line x1="10" y1="120" x2="290" y2="120" stroke="rgba(0,0,0,0.04)" />
                  <defs>
                    <linearGradient id="lgt-engage-grad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="50%" stopColor="#818CF8" />
                      <stop offset="100%" stopColor="#A5B4FC" />
                    </linearGradient>
                  </defs>
                  <path d="M10,80 C50,15 80,130 130,50 C180,-10 220,140 290,60" fill="none" stroke="url(#lgt-engage-grad)" strokeWidth="3" strokeLinecap="round" />
                  <path d="M10,95 C50,30 80,145 130,65 C180,5 220,155 290,75" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Chart 6: Active vs Inactive */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Active vs Inactive Ratio</h4>
                <p className="text-[11px] text-slate-500">Accounts accessed in the last 14 days</p>
              </div>
              <div className="h-40 mt-4 flex flex-col items-center justify-center relative">
                <div className="w-28 h-28">
                  <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="rgba(99,102,241,0.1)" strokeWidth="4.5" />
                    <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="url(#lgt-purple-bar)" strokeWidth="4.5" strokeDasharray="88 12" strokeDashoffset="0" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-3">
                  <span className="text-2xl font-black text-slate-900">88%</span>
                  <span className="text-[9px] font-bold text-emerald-600 tracking-wider uppercase">Active</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ─── PENDING APPROVALS WIDGET ─── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Left: Pending Approvals */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden lg:col-span-2">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-black text-slate-800 flex items-center gap-2">
                  <ShieldAlert size={16} className="text-amber-500" />
                  Pending Verification Requests
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Approve new profiles to allow full catalog directory access</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-100 text-purple-700 border border-purple-200">
                {pendingMembers.length} Requests
              </span>
            </div>
            <div className="p-5 space-y-3 overflow-y-auto max-h-[300px]">
              {pendingMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center bg-slate-50 border border-slate-200 border-dashed rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
                    <Check size={18} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">All Clear!</h4>
                  <p className="text-xs text-slate-500 mt-1">No pending verification requests.</p>
                </div>
              ) : (
                pendingMembers.map((member) => (
                  <div key={member.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar initials={member.initials} size="md" imageUrl={member.avatar} color="bg-gradient-to-br from-indigo-400 to-purple-600 text-white font-bold" />
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{member.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{member.city} • {member.profession || 'Self Employed'} • <span className="text-indigo-600 font-semibold">{member.phone}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => setSelectedProofMember(member)} className="px-3 py-1.5 rounded-lg text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-1">
                        <Eye size={12} /> Proof
                      </button>
                      <button onClick={() => handleReject(member.id, member.name)} className="px-3 py-1.5 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 text-xs font-bold border border-rose-200 transition-all">
                        Reject
                      </button>
                      <button onClick={() => handleApprove(member.id, member.name)} className="px-3 py-1.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 text-xs font-bold transition-all shadow-sm">
                        Approve
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Quick Nav */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-[14px] font-black text-slate-800 flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-500" />
                Quick Navigation
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Instant portal access bookmarks</p>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {[
                { icon: Users, label: 'Members Desk', color: 'text-purple-600', bg: 'bg-purple-50 hover:bg-purple-100 border-purple-100' },
                { icon: Heart, label: 'Matrimonial', color: 'text-pink-600', bg: 'bg-pink-50 hover:bg-pink-100 border-pink-100' },
                { icon: Calendar, label: 'Events Desk', color: 'text-indigo-600', bg: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-100' },
                { icon: Briefcase, label: 'Professionals', color: 'text-amber-600', bg: 'bg-amber-50 hover:bg-amber-100 border-amber-100' },
                { icon: FileText, label: 'Financials', color: 'text-purple-600', bg: 'bg-purple-50 hover:bg-purple-100 border-purple-100', onClick: () => setActiveModal('reports') },
                { icon: Settings, label: 'System Config', color: 'text-slate-600', bg: 'bg-slate-50 hover:bg-slate-100 border-slate-200' },
              ].map(({ icon: Icon, label, color, bg, onClick }) => (
                <button key={label} onClick={onClick} className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all group ${bg}`}>
                  <Icon size={16} className={`${color} group-hover:scale-110 duration-200`} />
                  <span className={`text-xs font-bold ${color} mt-4 block`}>{label}</span>
                </button>
              ))}
            </div>
          </div>

        </section>

        {/* ─── RECENT REGISTRATIONS TABLE ─── */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-[14px] font-black text-slate-800 flex items-center gap-2">
                <Users size={16} className="text-indigo-600" />
                Recent Portal Registrations
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Chronological registry of community accounts</p>
            </div>
            <div className="relative w-full sm:w-60">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Profile</th>
                  <th className="px-5 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Name</th>
                  <th className="px-5 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">City</th>
                  <th className="px-5 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Profession</th>
                  <th className="px-5 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-5 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-xs text-slate-500">No community profile matches the search query.</td>
                  </tr>
                ) : (
                  filteredMembers.slice(0, 6).map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-5 py-4">
                        <Avatar initials={member.initials} imageUrl={member.avatar} size="sm" color="bg-gradient-to-br from-purple-400 to-indigo-600 text-white font-bold" />
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900 text-sm">{member.name}</td>
                      <td className="px-5 py-4 text-slate-500 text-sm">{member.city}</td>
                      <td className="px-5 py-4 font-semibold text-indigo-600 text-sm">{member.profession || 'Registered Member'}</td>
                      <td className="px-5 py-4">
                        {member.isVerified ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200">
                            <Check size={10} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 border border-amber-200">
                            <AlertCircle size={10} /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {member.isVerified ? (
                            <button onClick={() => { showToast(`Revoking verification profile ${member.name}`); verifyMember(member.id); }} className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold border border-rose-200 transition-all">Revoke</button>
                          ) : (
                            <button onClick={() => handleApprove(member.id, member.name)} className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200 transition-all">Approve</button>
                          )}
                          <button onClick={() => setSelectedProofMember(member)} className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold border border-slate-200 transition-all">Details</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ─── EVENTS & ACTIVITY LOG ─── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Events List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden lg:col-span-2">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-black text-slate-800 flex items-center gap-2">
                  <Calendar size={16} className="text-indigo-600" />
                  Community Events Desk
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Upcoming celebrations, assemblies and schedules</p>
              </div>
              <button
                onClick={() => setActiveModal('event')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 text-xs font-bold uppercase tracking-wider transition-all"
              >
                <Plus size={12} /> Add Event
              </button>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[360px]">
              {events.length === 0 ? (
                <div className="col-span-2 flex flex-col items-center justify-center h-40 bg-slate-50 border border-slate-200 border-dashed rounded-2xl">
                  <p className="text-xs text-slate-500">No upcoming events listed.</p>
                </div>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col group hover:border-indigo-200 transition-all shadow-sm">
                    <div className="h-28 overflow-hidden relative shrink-0">
                      <img
                        src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 duration-500"
                      />
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-indigo-600 text-white">
                        {event.category || 'General'}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{event.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1"><MapPin size={10} /> {event.venue}</p>
                        <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1"><Clock size={10} /> {event.date} • {event.time || '6:00 PM'}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold mb-1">
                          <span>RSVP Register Target</span>
                          <span className="text-indigo-600">{event.attendees || 0} Registered</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${Math.min(100, ((event.attendees || 0) / 150) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-[14px] font-black text-slate-800 flex items-center gap-2">
                <Clock size={16} className="text-indigo-600" />
                Community Activity Log
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Chronological system events audit</p>
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {['all', 'members', 'events', 'matrimony'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTimelineFilter(tab)}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all ${
                      timelineFilter === tab
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto max-h-[300px]">
              {filteredActivities.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-10">No logs for this category.</p>
              ) : (
                filteredActivities.map((act) => (
                  <div key={act.id} className="relative pl-6 pb-2 border-l-2 border-slate-200 last:border-none">
                    <div className="absolute left-0 top-1 -translate-x-[5px] w-2.5 h-2.5 rounded-full bg-indigo-600 border-2 border-white" />
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] text-slate-800">
                          <span className="font-bold">{act.user}</span> {act.action}
                        </p>
                        {act.details && (
                          <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{act.details}</p>
                        )}
                      </div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase shrink-0">{act.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </section>

        {/* ─── ENGAGEMENT SUMMARY ─── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Today/Weekly/Monthly Stats */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-[14px] font-black text-slate-800 flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-600" />
                Community Engagement Report
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Platform interactions statistics</p>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Today's Visits</p>
                  <h4 className="text-xl font-black text-slate-900 mt-1">124</h4>
                  <span className="text-[10px] font-bold text-emerald-600 mt-1 block">+2.4%</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Weekly Visits</p>
                  <h4 className="text-xl font-black text-slate-900 mt-1">842</h4>
                  <span className="text-[10px] font-bold text-emerald-600 mt-1 block">+8.5%</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Monthly Visits</p>
                  <h4 className="text-xl font-black text-slate-900 mt-1">3.4k</h4>
                  <span className="text-[10px] font-bold text-emerald-600 mt-1 block">+12%</span>
                </div>
              </div>
              <div className="mt-4 p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-700">
                <span className="font-bold text-indigo-800 block">Adhyaksh Insight:</span>
                Weekly check-ins rose due to newly created marriage match registrations and local dharmashala booking schedules.
              </div>
            </div>
          </div>

          {/* Top Contributors */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-[14px] font-black text-slate-800 flex items-center gap-2">
                <Award size={16} className="text-amber-500" />
                Council Top Contributors
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Top volunteers and donors in community portal</p>
            </div>
            <div className="p-5 space-y-3">
              {topContributors.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all">
                  <div className="flex items-center gap-3">
                    <Avatar initials={c.initials} size="sm" color="bg-gradient-to-br from-purple-400 to-indigo-600 text-white font-bold" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{c.name}</h4>
                      <p className="text-[10px] font-medium text-indigo-600">{c.role}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {c.points}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </section>

      </div>

      {/* ─── MODALS ─── */}
      <AnimatePresence>

        {/* Modal 1: Approve Members */}
        {activeModal === 'approve' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveModal(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 15 }} className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl relative z-10 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2"><ShieldAlert size={16} className="text-amber-500" /> Approve Pending Accounts</h3>
                <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"><X size={16} /></button>
              </div>
              <div className="p-5 space-y-3 overflow-y-auto max-h-[380px]">
                {pendingMembers.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-10">No pending accounts need verification.</p>
                ) : (
                  pendingMembers.map((member) => (
                    <div key={member.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar initials={member.initials} size="sm" imageUrl={member.avatar} color="bg-gradient-to-br from-indigo-400 to-purple-600 text-white font-bold" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{member.name}</h4>
                          <p className="text-[10px] text-slate-500">{member.city} • {member.phone}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleReject(member.id, member.name)} className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-200 hover:bg-rose-100 transition-all">Reject</button>
                        <button onClick={() => handleApprove(member.id, member.name)} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[10px] font-bold hover:bg-indigo-700 transition-all shadow-sm">Approve</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal 2: Create Event */}
        {activeModal === 'event' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveModal(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 15 }} className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl relative z-10 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2"><Calendar size={16} className="text-indigo-600" /> Schedule Samaj Celebration</h3>
                <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"><X size={16} /></button>
              </div>
              <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Event Title *</label>
                  <input type="text" required placeholder="e.g., Annual Sneh Milan" value={eventForm.title} onChange={(e) => setEventForm({...eventForm, title: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 text-sm text-slate-800 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Event Date *</label>
                    <input type="date" required value={eventForm.date} onChange={(e) => setEventForm({...eventForm, date: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 text-sm text-slate-800" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Time</label>
                    <input type="text" placeholder="e.g., 07:00 PM" value={eventForm.time} onChange={(e) => setEventForm({...eventForm, time: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 text-sm text-slate-800" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Venue Location *</label>
                  <input type="text" required placeholder="e.g., Samaj Bhawan, Indore" value={eventForm.venue} onChange={(e) => setEventForm({...eventForm, venue: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 text-sm text-slate-800" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Event Category</label>
                  <select value={eventForm.category} onChange={(e) => setEventForm({...eventForm, category: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 text-sm text-slate-800">
                    <option value="General">General Gatherings</option>
                    <option value="Festival">Festival & Satsang</option>
                    <option value="Youth">Youth Careers & Seminars</option>
                    <option value="Education">Education Awards</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                  <textarea rows="3" placeholder="Enter short event synopsis..." value={eventForm.description} onChange={(e) => setEventForm({...eventForm, description: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 text-sm text-slate-800 resize-none" />
                </div>
                <button type="submit" className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-wider text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-all">
                  Create & Broadcast Event
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal 3: Announcement */}
        {activeModal === 'announce' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveModal(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 15 }} className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl relative z-10 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2"><Send size={16} className="text-indigo-600" /> Broadcast Announcement</h3>
                <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"><X size={16} /></button>
              </div>
              <form onSubmit={handleSendAnnouncement} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Announcement Text</label>
                  <textarea rows="5" required placeholder="Write official council circular text here..." value={announcementText} onChange={(e) => setAnnouncementText(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 text-sm text-slate-800 resize-none" />
                </div>
                <button type="submit" className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-wider text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-all">
                  Broadcast to Feed
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal 4: Reports */}
        {activeModal === 'reports' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveModal(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 15 }} className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl relative z-10 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2"><FileText size={16} className="text-indigo-600" /> Samaj Financial Audit Reports</h3>
                <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"><X size={16} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Donations / Funds Collected</h4>
                    <div className="mt-3 space-y-2">
                      {funds.map((f) => {
                        const fContribs = contributions[f.id] || [];
                        const fCollected = fContribs.reduce((acc, curr) => acc + (curr.paidAmount || 0), 0);
                        return (
                          <div key={f.id} className="flex justify-between text-sm text-slate-700">
                            <span>{f.name}</span>
                            <span className="font-bold">₹{fCollected.toLocaleString('en-IN')}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Expenses Audited</h4>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-sm text-slate-700"><span>Hall Renovation Costs</span><span className="font-bold text-rose-600">₹45,000</span></div>
                      <div className="flex justify-between text-sm text-slate-700"><span>Food Distribution Event</span><span className="font-bold text-rose-600">₹18,500</span></div>
                      <div className="flex justify-between text-sm text-slate-700"><span>Scholarship Allocations</span><span className="font-bold text-rose-600">₹25,000</span></div>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-sm text-indigo-700">
                  <h4 className="font-bold text-indigo-800 mb-1">Treasury Overview:</h4>
                  Total cash reserves are audited and synced to localStorage records. Invoices are archived for secure verification audits.
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal 5: Proof Viewer */}
        {selectedProofMember && (
          <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProofMember(null)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 15 }} className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl relative z-10 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Verification Credential</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Proof submitted by {selectedProofMember.name}</p>
                </div>
                <button onClick={() => setSelectedProofMember(null)} className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"><X size={16} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-indigo-900 to-purple-950 p-4 border border-white/10 flex flex-col justify-between text-white relative overflow-hidden">
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
                <div className="flex gap-3">
                  <button onClick={() => handleReject(selectedProofMember.id, selectedProofMember.name)} className="flex-1 py-2.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200 hover:bg-rose-100 active:scale-95 transition-all text-center">Reject Proof</button>
                  <button onClick={() => handleApprove(selectedProofMember.id, selectedProofMember.name)} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold active:scale-95 transition-all text-center">Approve Member</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </div>
  );
};

// Inline icon for dashboard header (LayoutDashboard from lucide)
const LayoutDashboardIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
  </svg>
);

export default HeadDashboard;
