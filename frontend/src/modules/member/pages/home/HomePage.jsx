import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDraggableScroll } from '../../../../hooks/useDraggableScroll';
import { Bell, Search, Calendar, Heart, Users, BookOpen, Briefcase, Vote, ChevronRight, MapPin, Shield, Crown, ImagePlus, ArrowRight, Plus, Sparkles, GraduationCap, HeartHandshake, Flame, User, Smile, Phone, MessageCircle, Clock, CalendarDays, Mail, Home, Wallet, Megaphone } from 'lucide-react';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { useData } from '../../context/DataProvider';
import { t } from '../../utils/translations';
import { StoryViewer } from '../../components/common/StoryViewer';
import { CityLandscape } from '../../components/common/CityLandscape';
import { mockAdmins as mockAdminsRaw } from '../../data/mockUsers';
import { mockSuccessStories } from '../../data/mockMatrimonial';
// Removed broken mockFundData import



const OmIcon = ({ size, className }) => (
  <span style={{ fontSize: `${size}px`, lineHeight: 1 }} className={`${className} font-serif select-none`}>
    ॐ
  </span>
);

const DiyaIcon = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.5s-3 4-3 7.5c0 1.9 1.2 3.5 3 3.5s3-1.6 3-3.5c0-3.5-3-7.5-3-7.5z" />
    <path d="M4 14.5c0 3 3.5 5.5 8 5.5s8-2.5 8-5.5H4z" />
  </svg>
);

const quickActions = [
  { icon: Briefcase, label: 'Professional Network', path: '/member/professional', bg: 'bg-gradient-to-br from-orange-50 to-amber-50', text: 'text-orange-600', iconBg: 'bg-gradient-to-br from-orange-400 to-amber-500', desc: 'Find jobs & hire within the community', span: 'col-span-2' },
  { icon: BookOpen, label: 'Directory', path: '/member/directory', bg: 'bg-gradient-to-br from-emerald-50 to-green-50', text: 'text-emerald-600', iconBg: 'bg-gradient-to-br from-emerald-400 to-green-500', desc: 'Browse Samaj Members', span: 'col-span-2' },
  { icon: Users, label: 'Groups', path: '/member/groups', bg: 'bg-gradient-to-br from-blue-50 to-sky-50', text: 'text-blue-600', iconBg: 'bg-gradient-to-br from-blue-400 to-sky-500', desc: 'Discussions', span: 'col-span-1' },
  { icon: Vote, label: 'Voting', path: '/member/voting', bg: 'bg-gradient-to-br from-purple-50 to-violet-50', text: 'text-purple-600', iconBg: 'bg-gradient-to-br from-purple-400 to-violet-500', desc: 'Community Polls', span: 'col-span-1' },
  { icon: Home, label: 'Dharmashala', path: '/member/dharmashala', bg: 'bg-gradient-to-br from-emerald-50 to-teal-50', text: 'text-emerald-700', iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-500', desc: 'Book Rooms', span: 'col-span-1' },
  { icon: Wallet, label: 'Samaj Fund', path: '/member/fund', bg: 'bg-gradient-to-br from-indigo-50 to-violet-50', text: 'text-indigo-700', iconBg: 'bg-gradient-to-br from-indigo-400 to-violet-500', desc: 'Community Fund', span: 'col-span-1' },
  { icon: Mail, label: 'Nimantran', path: '/member/nimantran', bg: 'bg-gradient-to-br from-indigo-50 to-purple-50', text: 'text-indigo-600', iconBg: 'bg-gradient-to-br from-indigo-400 to-purple-500', desc: 'Event Invitations', span: 'col-span-2' },
  { icon: OmIcon, label: 'Shraddhanjali', path: '/member/shradhanjali', bg: 'bg-gradient-to-br from-amber-50 to-orange-50', text: 'text-orange-600', iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500', desc: 'Om Shanti & Condolences', span: 'col-span-2' },
  { icon: HeartHandshake, label: 'Donation', path: '/member/donation', bg: 'bg-gradient-to-br from-rose-50 to-pink-50', text: 'text-rose-600', iconBg: 'bg-gradient-to-br from-rose-400 to-pink-500', desc: 'Contribute to Samaj', span: 'col-span-2' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const { currentUser, members: mockMembers, admins: contextAdmins, posts: mockPosts, events: mockEvents, language, setLanguage, notifications, getUnreadCountForModule } = useData();
  const mockAdmins = contextAdmins && contextAdmins.length > 0 ? contextAdmins : mockAdminsRaw;
  const subHeadsRef = useDraggableScroll();
  const updatesScrollRef = useDraggableScroll();
  
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning,' : hour < 18 ? 'Good afternoon,' : 'Good evening,';

  // Dynamic counts for quick actions (with fallbacks for UI demonstration)
  const nimantranCount = getUnreadCountForModule('nimantran') || 3;
  const donationCount = getUnreadCountForModule('donation') || 5;
  const shradhanjaliCount = getUnreadCountForModule('shradhanjali') || 2;

  // Dynamic counts for summary cards
  const newDonationsCount = notifications?.filter(n => n.type === 'donation' && !n.isRead)?.length || 0;
  const newNoticesCount = notifications?.filter(n => n.type === 'announcement' && !n.isRead)?.length || 0;
  const newEventsCount = notifications?.filter(n => n.type === 'event' && !n.isRead)?.length || 0;
  const totalUpdatesCount = newDonationsCount + newNoticesCount + newEventsCount + 2; // +2 for bookings & funds mockup

  const unreadCount = getUnreadCountForModule('home');

  const communityPosts = mockPosts.filter(p => p.community === currentUser.community || true).slice(0, 10);

  const getSamajImage = (community) => {
    const c = community.toLowerCase();
    const base = window.location.pathname.includes('/MeriSamaj') ? '/MeriSamaj/' : '/';
    if (c.includes('agrawal')) return `${base}assets/images/rajwada.png`;
    if (c.includes('mali')) return `${base}assets/images/mali.png`;
    if (c.includes('gupta')) return `${base}assets/images/gupta.png`;
    if (c.includes('sharma')) return `${base}assets/images/sharma.png`;
    if (c.includes('jain')) return `${base}assets/images/jain.png`;
    if (c.includes('patel')) return `${base}assets/images/patel.png`;
    if (c.includes('verma')) return `${base}assets/images/verma.png`;
    return `${base}assets/images/rajwada.png`; // fallback
  };

  return (
    <div className="min-h-screen bg-surface pb-28">

      {/* ─── SAMAJ HERO BANNER ─── */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: '280px' }}>
        {/* Background Image — Cultural landmark */}
        <img 
          src={getSamajImage(currentUser.community)} 
          alt={currentUser.community}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlays — purple-tinted for brand cohesion */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#4C1D95]/60 via-[#4C1D95]/25 to-[#1e1145]/80 z-[1]" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#1e1145]/90 to-transparent z-[1]" />

        {/* Floating Navbar */}
        <div className="relative z-10 px-5 pt-6 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer press-scale" onClick={() => navigate('/member/settings')}>
            <div className="w-[44px] h-[44px] rounded-2xl bg-white/15 backdrop-blur-xl text-white flex items-center justify-center text-[18px] font-serif shadow-lg border border-white/20">
              {currentUser.community.substring(0, 1)}
            </div>
            <div>
              <p className="text-[11px] font-medium text-white/60 tracking-wide">{t(greeting, language)}</p>
              <h1 className="text-[20px] font-bold text-white tracking-tight leading-tight drop-shadow-md">{currentUser.name.split(' ')[0]}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="w-10 h-10 rounded-xl bg-white/12 backdrop-blur-xl shadow-sm border border-white/15 flex items-center justify-center text-white text-[11px] font-bold uppercase press-scale transition-all hover:bg-white/20"
            >
              {language === 'en' ? 'HI' : 'EN'}
            </button>
            <button className="relative w-10 h-10 rounded-xl bg-white/12 backdrop-blur-xl shadow-sm border border-white/15 flex items-center justify-center press-scale transition-all hover:bg-white/20" onClick={() => navigate('/member/notifications?module=home')}>
              <Bell size={19} className="text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-[#4C1D95]/60 flex items-center justify-center">
                  <span className="text-[7px] text-white font-bold">{unreadCount}</span>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Samaj Identity Content — bottom of hero */}
        <div className="relative z-10 px-5 pt-8 pb-4 flex flex-col justify-end" />
      </div>

      {/* Spacer */}
      <div className="h-4" />

      {/* ─── INTERACTIVE HIGHLIGHTS MODULE ─── */}
      <div className="px-5 mt-3 relative z-10 flex gap-3">
        {/* Invitations (Nimantran) */}
        <div 
          onClick={() => navigate('/member/nimantran')}
          className="flex-1 card-neo p-3 pb-3.5 flex flex-col items-center justify-center text-center cursor-pointer press-scale relative overflow-hidden"
        >
          {nimantranCount > 0 && (
            <div className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
              {nimantranCount}
            </div>
          )}
          <div className="w-13 h-13 bg-gradient-to-br from-indigo-400 to-purple-600 shadow-lg shadow-purple-500/30 rounded-2xl flex items-center justify-center mb-2.5">
            <Mail className="text-white" size={22} strokeWidth={2} />
          </div>
          <h4 className="text-[12px] font-bold text-text-primary leading-tight">Invitations</h4>
          <p className="text-[8px] font-medium text-text-muted mt-0.5 leading-tight">View new invites</p>
        </div>

        {/* Contributions (Yogdan) */}
        <div 
          onClick={() => navigate('/member/donation')}
          className="flex-1 card-neo p-3 pb-3.5 flex flex-col items-center justify-center text-center cursor-pointer press-scale relative overflow-hidden"
        >
          {donationCount > 0 && (
            <div className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
              {donationCount}
            </div>
          )}
          <div className="w-13 h-13 bg-gradient-to-br from-pink-400 to-rose-500 shadow-lg shadow-rose-500/30 rounded-2xl flex items-center justify-center mb-2.5">
            <HeartHandshake className="text-white" size={22} strokeWidth={2} />
          </div>
          <h4 className="text-[12px] font-bold text-text-primary leading-tight">Contributions</h4>
          <p className="text-[8px] font-medium text-text-muted mt-0.5 leading-tight">Support the Samaj</p>
        </div>

        {/* Obituary (Shradhanjali) */}
        <div 
          onClick={() => navigate('/member/shradhanjali')}
          className="flex-1 card-neo p-3 pb-3.5 flex flex-col items-center justify-center text-center cursor-pointer press-scale relative overflow-hidden"
        >
          {shradhanjaliCount > 0 && (
            <div className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
              {shradhanjaliCount}
            </div>
          )}
          <div className="w-13 h-13 bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/30 rounded-2xl flex items-center justify-center mb-2.5">
            <DiyaIcon className="text-white" size={24} />
          </div>
          <h4 className="text-[12px] font-bold text-text-primary leading-tight">Obituary</h4>
          <p className="text-[8px] font-medium text-text-muted mt-0.5 leading-tight">Heartfelt tributes</p>
        </div>
      </div>

      {/* ─── TODAY'S UPDATES SECTION ─── */}
      <div className="mt-5 relative z-10">
        {/* Header */}
        <div className="px-5 flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="text-brand-primary" size={17} strokeWidth={2.5} />
              {totalUpdatesCount > 0 && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-surface rounded-full"></div>
              )}
            </div>
            <h3 className="text-[15px] font-bold text-text-primary tracking-tight">Today's Updates</h3>
            {totalUpdatesCount > 0 && (
              <span className="bg-purple-50 text-brand-primary text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-purple-100/50">
                {totalUpdatesCount}
              </span>
            )}
          </div>
          <button onClick={() => navigate('/member/notifications')} className="text-[11px] font-bold text-brand-primary flex items-center press-scale">
            View All <ChevronRight size={14} />
          </button>
        </div>

        {/* Compact Summary Cards */}
        <div className="card-neo p-3 mx-5 mb-2 flex items-center justify-between">
          
          {/* New Bookings */}
          <div onClick={() => navigate('/member/dharmashala')} className="flex flex-col items-center justify-center text-center cursor-pointer press-scale flex-1 border-r border-purple-100/30 last:border-0 px-0.5">
            <div className="flex items-center gap-1 mb-1">
              <Home className="text-emerald-500" size={13} strokeWidth={2.5} />
              <span className="text-[11px] font-bold text-text-primary leading-none">2</span>
            </div>
            <span className="text-[8px] font-medium text-text-muted leading-tight">New Bookings</span>
          </div>

          {/* New Funds Received */}
          <div onClick={() => navigate('/member/fund')} className="flex flex-col items-center justify-center text-center cursor-pointer press-scale flex-1 border-r border-purple-100/30 last:border-0 px-0.5">
            <div className="flex items-center gap-0.5 mb-1">
              <Wallet className="text-brand-primary" size={12} strokeWidth={2.5} />
              <span className="text-[10px] font-bold text-text-primary leading-none tracking-tighter">₹245k</span>
            </div>
            <span className="text-[8px] font-medium text-text-muted leading-tight">New Funds Received</span>
          </div>

          {/* New Contributions */}
          <div onClick={() => navigate('/member/donation')} className="flex flex-col items-center justify-center text-center cursor-pointer press-scale flex-1 border-r border-purple-100/30 last:border-0 px-0.5">
            <div className="flex items-center gap-1 mb-1">
              <Heart className="text-rose-500" size={13} strokeWidth={2.5} />
              <span className="text-[11px] font-bold text-text-primary leading-none">{newDonationsCount > 0 ? newDonationsCount : '5'}</span>
            </div>
            <span className="text-[8px] font-medium text-text-muted leading-tight">New Contributions</span>
          </div>

          {/* Important Notice */}
          <div onClick={() => navigate('/member/notifications')} className="flex flex-col items-center justify-center text-center cursor-pointer press-scale flex-1 border-r border-purple-100/30 last:border-0 px-0.5">
            <div className="flex items-center gap-1 mb-1">
              <Megaphone className="text-amber-500" size={13} strokeWidth={2.5} />
              <span className="text-[11px] font-bold text-text-primary leading-none">{newNoticesCount > 0 ? newNoticesCount : '1'}</span>
            </div>
            <span className="text-[8px] font-medium text-text-muted leading-tight">Important Notice</span>
          </div>

          {/* New Events */}
          <div onClick={() => navigate('/member/events')} className="flex flex-col items-center justify-center text-center cursor-pointer press-scale flex-1 border-r border-purple-100/30 last:border-0 px-0.5">
            <div className="flex items-center gap-1 mb-1">
              <Calendar className="text-blue-500" size={13} strokeWidth={2.5} />
              <span className="text-[11px] font-bold text-text-primary leading-none">{newEventsCount > 0 ? newEventsCount : '3'}</span>
            </div>
            <span className="text-[8px] font-medium text-text-muted leading-tight">New Events</span>
          </div>
          
        </div>
      </div>

      {/* ─── CENSUS DASHBOARD BANNER ─── */}
      <div className="px-3 mt-5 relative z-10">
        <div
          onClick={() => navigate('/member/census')}
          className="w-full bg-gradient-to-br from-[#4C1D95] via-[#6D28D9] to-[#7C3AED] rounded-[28px] shadow-xl shadow-purple-500/15 border border-purple-400/15 text-white relative overflow-hidden cursor-pointer press-scale"
        >
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-300/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          {/* Top section */}
          <div className="relative z-10 p-4 pb-2 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-white/15 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-white/10 backdrop-blur-md">
                  Community Census
                </span>
              </div>
              <h3 className="text-[19px] font-bold leading-tight tracking-tight">
                Community Census Dashboard
              </h3>
              <p className="text-white/65 text-[11px] mt-1.5 font-medium leading-snug">
                Detailed breakdown of total members, men, women &amp; children with percentage
              </p>
              
              <button
                onClick={(e) => { e.stopPropagation(); navigate('/member/census'); }}
                className="mt-3 mb-1 px-4 py-1.5 bg-white/12 hover:bg-white/20 border border-white/20 rounded-xl text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors backdrop-blur-md"
              >
                View Details <ArrowRight size={12} />
              </button>
            </div>

            {/* Premium clipboard illustration */}
            <div className="relative w-[110px] h-[110px] shrink-0 flex items-center justify-center select-none pointer-events-none mr-1">
              <svg viewBox="0 0 160 160" className="w-full h-full">
                <rect x="35" y="25" width="90" height="110" rx="8" fill="#ffffff" />
                <path d="M65 25c0-4 3-7 7-7h26c4 0 7 3 7 7v4H65v-4z" fill="#cbd5e1" />
                <rect x="73" y="15" width="14" height="6" rx="2" fill="#94a3b8" />
                <circle cx="70" cy="55" r="18" fill="#7C3AED" />
                <path d="M70 55 L70 37 A18 18 0 0 1 88 55 Z" fill="#F59E0B" />
                <path d="M70 55 L88 55 A18 18 0 0 1 70 73 Z" fill="#10b981" />
                <path d="M70 55 L70 73 A18 18 0 0 1 52 55 Z" fill="#A78BFA" />
                <rect x="43" y="80" width="30" height="3" rx="1.5" fill="#e2e8f0" />
                <rect x="43" y="87" width="20" height="3" rx="1.5" fill="#e2e8f0" />
                <rect x="97" y="65" width="5" height="25" rx="1" fill="#93c5fd" />
                <rect x="105" y="55" width="5" height="35" rx="1" fill="#8B5CF6" />
                <rect x="113" y="72" width="5" height="18" rx="1" fill="#c084fc" />
                <g transform="translate(10, 10)">
                  <line x1="120" y1="120" x2="145" y2="145" stroke="#374151" strokeWidth="9" strokeLinecap="round" />
                  <circle cx="105" cy="105" r="22" fill="#ffffff" stroke="#374151" strokeWidth="6" />
                  <circle cx="105" cy="105" r="19" fill="#f8fafc" />
                  <rect x="95" y="105" width="4" height="12" rx="1" fill="#10b981" />
                  <rect x="102" y="96" width="4" height="21" rx="1" fill="#f59e0b" />
                  <rect x="109" y="101" width="4" height="16" rx="1" fill="#7C3AED" />
                </g>
              </svg>
              
              <div className="absolute bottom-1 left-0 flex items-end">
                <svg viewBox="0 0 24 32" className="w-8 h-10 drop-shadow-md -mr-1.5">
                  <circle cx="12" cy="7" r="6" fill="#7C3AED" />
                  <path d="M2 28c0-6 4-11 10-11s10 5 10 11" fill="#7C3AED" />
                </svg>
                <svg viewBox="0 0 24 32" className="w-8 h-10 drop-shadow-md z-10 -mr-1.5">
                  <circle cx="12" cy="6" r="6" fill="#ec4899" />
                  <path d="M4 30c0-7 3-12 8-12s8 5 8 12" fill="#ec4899" />
                </svg>
                <svg viewBox="0 0 24 32" className="w-6 h-8 drop-shadow-md">
                  <circle cx="12" cy="6" r="5" fill="#10b981" />
                  <path d="M4 28c0-5 3-9 8-9s8 4 8 9" fill="#10b981" />
                </svg>
              </div>

              <div className="absolute top-1 right-1 w-7 h-7 rounded-full bg-purple-400/80 border border-white/20 flex items-center justify-center shadow-md">
                <Users size={12} className="text-white" />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="relative z-10 mx-2 mb-2 bg-white/8 backdrop-blur-md rounded-2xl border border-white/10 grid grid-cols-4 divide-x divide-white/10">
            {[
              {
                icon: <Users size={15} className="text-white" />,
                iconBg: 'bg-purple-400/30', value: '100%', label: 'Total Members', sublabel: 'Total Count', bar: 'bg-purple-300', barW: 'w-full'
              },
              {
                icon: <User size={15} className="text-white" />,
                iconBg: 'bg-blue-400/30', value: '52%', label: 'Men', sublabel: '% of Total', bar: 'bg-blue-300', barW: 'w-[52%]'
              },
              {
                icon: <User size={15} className="text-white" />,
                iconBg: 'bg-pink-400/30', value: '38%', label: 'Women', sublabel: '% of Total', bar: 'bg-pink-300', barW: 'w-[38%]'
              },
              {
                icon: <Smile size={15} className="text-white" />,
                iconBg: 'bg-green-400/30', value: '10%', label: 'Children', sublabel: '(0-17 yrs)', bar: 'bg-green-300', barW: 'w-[10%]'
              },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center py-2.5 px-1 gap-0.5">
                <div className={`w-8 h-8 rounded-xl ${stat.iconBg} flex items-center justify-center mb-0.5 border border-white/10`}>
                  {stat.icon}
                </div>
                <span className="text-[14px] font-bold text-white leading-none">{stat.value}</span>
                <span className="text-[8px] font-medium text-white/80 text-center leading-tight">{stat.label}</span>
                <div className="w-full px-1 mt-0.5">
                  <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${stat.bar} ${stat.barW} rounded-full`} />
                  </div>
                </div>
                <span className="text-[7px] text-white/50 text-center leading-tight">{stat.sublabel}</span>
              </div>
            ))}
          </div>

          {/* Info footer */}
          <div className="relative z-10 mx-2 mb-2 px-3 py-1.5 bg-white/6 border border-white/8 rounded-xl flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <span className="text-[9px] font-bold text-white">i</span>
            </div>
            <p className="text-[10px] text-white/60 font-medium leading-tight">
              View detailed community member count &amp; percentage breakdown in this dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* ─── BENTO GRID (QUICK ACTIONS) ─── */}
      <div className="px-5 mt-6 relative z-10">
        <h3 className="text-[13px] font-bold text-text-secondary tracking-widest uppercase mb-3 px-1">{t('Exclusive Features', language)}</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, idx) => (
            <motion.button
              key={action.label}
              onClick={() => navigate(action.path)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (idx * 0.08) }}
              whileTap={{ scale: 0.97 }}
              className={`p-4 rounded-[24px] border border-white/60 ${action.bg} shadow-[0_2px_12px_rgba(124,58,237,0.04)] hover:shadow-[0_4px_20px_rgba(124,58,237,0.08)] transition-all text-left w-full flex ${action.span === 'col-span-2' ? 'flex-row items-center justify-between col-span-2' : 'flex-col items-start col-span-1'}`}
            >
              {action.span === 'col-span-2' ? (
                <>
                  <div className="pr-4">
                    <span className="font-serif font-bold text-text-primary tracking-tight block text-[19px]">{t(action.label, language)}</span>
                    <span className="text-[12px] font-medium text-text-secondary mt-1 block leading-tight">{t(action.desc, language)}</span>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl ${action.iconBg} flex items-center justify-center shrink-0 shadow-lg`}>
                    <action.icon size={24} className="text-white" strokeWidth={2.5} />
                  </div>
                </>
              ) : (
                <>
                  <div className={`w-12 h-12 rounded-2xl ${action.iconBg} flex items-center justify-center shrink-0 mb-3.5 shadow-lg`}>
                    <action.icon size={22} className="text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <span className="font-serif font-bold text-text-primary tracking-tight block text-[15px]">{t(action.label, language)}</span>
                    <span className="text-[11px] font-medium text-text-secondary mt-0.5 block leading-tight">{t(action.desc, language)}</span>
                  </div>
                </>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ─── SECTION DIVIDER ─── */}
      <div className="mx-5 mt-8 mb-6 h-[1px] bg-gradient-to-r from-transparent via-purple-200/40 to-transparent" />

      {/* ─── MATRIMONY SUCCESS STORIES ─── */}
      <div className="px-0 relative z-10">
        <div className="px-5 flex items-center justify-between mb-4">
          <h3 className="text-[17px] font-bold text-text-primary tracking-tight">{t('Success Stories', language)}</h3>
          <button onClick={() => navigate('/member/matrimonial')} className="text-[13px] text-pink-600 font-bold press-scale flex items-center gap-0.5">
            {t('Find Your Perfect Match', language)} <ChevronRight size={16} />
          </button>
        </div>
        
        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3 pb-4 px-5">
          {mockSuccessStories.map((story) => (
            <div 
              key={story.id} 
              onClick={() => navigate('/member/matrimonial')}
              className="snap-center shrink-0 w-[275px] h-[340px] rounded-[28px] relative overflow-hidden shadow-lg shadow-purple-500/10 active:scale-[0.98] transition-transform cursor-pointer border border-white/10"
            >
              <img src={story.avatar} alt={story.groomName} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
              
              <div className="absolute inset-0 p-5 flex flex-col justify-end">
                <div className="bg-pink-500/85 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest inline-flex self-start mb-3 shadow-sm border border-pink-400/40">
                  {t('Met through Samaj Matrimony', language)}
                </div>
                <h4 className="text-white text-[21px] font-serif font-bold leading-tight drop-shadow-md">{story.groomName}</h4>
                <p className="text-white/75 text-[12px] font-medium mt-1 drop-shadow-sm flex items-center gap-1.5">
                  <Heart size={12} className="text-pink-400" fill="currentColor" /> {t('Married in', language)} {story.marriageDate}
                </p>
                <div className="mt-3 pt-3 border-t border-white/15">
                  <p className="text-white/85 text-[13px] italic font-medium leading-snug drop-shadow-sm">
                    "{story.quote}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── SECTION DIVIDER ─── */}
      <div className="mx-5 mt-6 mb-6 h-[1px] bg-gradient-to-r from-transparent via-purple-200/40 to-transparent" />

      {/* ─── YOUR LEADERS (Samaj Netrutva) ─── */}
      <div className="px-5 mb-8">
        {(() => {
          const president = mockAdmins.find(a => a.role === 'President' && a.city?.toLowerCase() === currentUser.city?.toLowerCase()) || mockAdmins[1];
          const coreCommittee = mockAdmins.filter(a => ['Vice President', 'Secretary', 'Joint Secretary', 'Treasurer'].includes(a.role) && a.city?.toLowerCase() === currentUser.city?.toLowerCase());
          
          return (
            <div className="flex flex-col gap-5">
              {/* Core Committee Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[18px] font-bold text-text-primary tracking-tight">मुख्य पदाधिकारी</h3>
                  <p className="text-[12px] text-text-secondary font-medium">Core Committee</p>
                </div>
                <button onClick={() => navigate('/member/leadership')} className="text-[13px] text-brand-primary font-bold press-scale flex items-center gap-1">
                  सभी देखें <ChevronRight size={16} />
                </button>
              </div>

              {/* President Section */}
              <div 
                onClick={() => navigate('/member/leadership', { state: { selectedId: president.id } })}
                className="relative w-full rounded-[24px] bg-gradient-to-r from-[#1e1145] via-[#2d1b69] to-[#4C1D95] shadow-xl shadow-purple-500/10 border border-purple-400/10 overflow-hidden p-5 shrink-0 cursor-pointer active:scale-[0.99] transition-all duration-300"
              >
                {/* Blended portrait */}
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80" 
                  className="absolute right-0 top-0 bottom-0 w-[58%] h-full object-cover object-[center_30%] pointer-events-none z-0" 
                  style={{
                    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 8%, rgba(0,0,0,0.85) 60%, black 100%)',
                    maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 8%, rgba(0,0,0,0.85) 60%, black 100%)'
                  }}
                  alt={president.name} 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1e1145] via-[#2d1b69]/70 via-[#2d1b69]/15 to-transparent pointer-events-none z-0" />

                {/* Left content */}
                <div className="relative z-10 flex flex-col justify-between h-full max-w-[62%]">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full border-2 border-amber-400/60 flex items-center justify-center bg-black/20 shadow-sm shrink-0">
                      <Crown size={16} className="text-amber-400 fill-amber-400" />
                    </div>
                    <span className="bg-purple-500/80 backdrop-blur-sm text-white text-[9px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider border border-purple-400/30">
                      अध्यक्ष
                    </span>
                  </div>

                  <div className="mt-3.5">
                    <h4 className="text-white text-[18px] font-bold leading-tight tracking-tight drop-shadow-sm">
                      {president.name}
                    </h4>
                    <p className="text-amber-300/90 text-[11px] font-bold mt-0.5 uppercase tracking-wide">
                      समाज अध्यक्ष
                    </p>
                  </div>

                  {/* Golden Separator */}
                  <div className="flex items-center gap-1.5 my-3 w-28">
                    <div className="h-[1px] flex-1 bg-amber-400/25" />
                    <div className="w-1 h-1 rotate-45 bg-amber-400/60" />
                    <div className="h-[1px] flex-1 bg-amber-400/25" />
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-white/90 text-[10px] font-medium mb-3.5">
                    <MapPin size={11} className="text-white/70 shrink-0" />
                    <span>{president.city}, Madhya Pradesh</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                    <a 
                      href={`tel:${president.phone}`}
                      className="flex-1 py-1.5 rounded-xl border border-purple-300/30 hover:bg-white/5 text-white text-[10px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform text-center backdrop-blur-sm"
                    >
                      <Phone size={11} /> कॉल करें
                    </a>
                    <button 
                      onClick={() => navigate(`/member/chat/${president.id}`)}
                      className="flex-1 py-1.5 rounded-xl border border-emerald-300/30 hover:bg-white/5 text-white text-[10px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform backdrop-blur-sm"
                    >
                      <MessageCircle size={11} /> चैट करें
                    </button>
                  </div>
                </div>
              </div>
                
                <div className="grid grid-cols-3 gap-2.5 pb-4">
                  {coreCommittee.slice(0, 3).map(member => {
                    const badgeColor = member.role === 'Vice President' 
                      ? 'bg-blue-600' 
                      : member.role === 'Secretary' 
                      ? 'bg-rose-500' 
                      : member.role === 'Joint Secretary' 
                      ? 'bg-purple-600' 
                      : 'bg-emerald-600';
                    const hindiRole = member.role === 'Vice President' 
                      ? 'उपाध्यक्ष' 
                      : member.role === 'Secretary' 
                      ? 'सचिव' 
                      : member.role === 'Joint Secretary' 
                      ? 'मंत्री' 
                      : 'कोषाध्यक्ष';
                    return (
                      <div 
                        key={member.id} 
                        onClick={() => navigate('/member/leadership', { state: { selectedId: member.id } })}
                        className="w-full card-neo overflow-hidden flex flex-col items-center cursor-pointer active:scale-[0.98] transition-transform pb-2.5"
                      >
                        {/* Portrait Photo */}
                        <div className="w-full aspect-square overflow-hidden bg-gray-50 shrink-0 mb-2 relative rounded-t-[24px]">
                          <img src={`https://i.pravatar.cc/150?u=${member.initials}`} className="w-full h-full object-cover" alt={member.name} />
                          <div className="absolute top-1.5 left-1.5 z-10">
                            <span className={`text-white text-[7px] sm:text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-sm ${badgeColor}`}>
                              {hindiRole}
                            </span>
                          </div>
                        </div>
                        
                        <h4 className="text-text-primary text-[9px] sm:text-[10px] font-bold text-center leading-tight mb-2 px-1 line-clamp-2">
                          {member.name.replace(' Agrawal', '').replace(' Sharma', '').replace(' Patel', '')}
                        </h4>

                        {/* Purple divider */}
                        <div className="w-5 h-[1.5px] bg-gradient-to-r from-purple-400 to-violet-400 rounded-full mb-2" />
                        
                        {/* Action Buttons */}
                        <div className="flex gap-1.5 justify-center w-full mt-auto" onClick={(e) => e.stopPropagation()}>
                          <a 
                            href={`tel:${member.phone}`} 
                            className="w-7 h-7 rounded-xl border border-purple-200/50 flex items-center justify-center hover:bg-purple-50 transition-colors text-purple-600 shrink-0"
                          >
                            <Phone size={11} />
                          </a>
                          <button 
                            onClick={() => navigate(`/member/chat/${member.id}`)} 
                            className="w-7 h-7 rounded-xl border border-emerald-200/50 flex items-center justify-center hover:bg-emerald-50 transition-colors text-emerald-600 shrink-0"
                          >
                            <MessageCircle size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
            </div>
          );
        })()}
      </div>

      {/* ─── SECTION DIVIDER ─── */}
      <div className="mx-5 mt-8 mb-6 h-[1px] bg-gradient-to-r from-transparent via-purple-200/40 to-transparent" />

      {/* ─── UPCOMING EVENTS ─── */}
      <div className="px-0">
        <div className="px-5 flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[17px] font-bold text-text-primary tracking-tight">आगामी कार्यक्रम</h3>
            <p className="text-[11px] text-text-secondary font-medium mt-0.5">Upcoming Events</p>
          </div>
          <button onClick={() => navigate('/member/events')} className="text-[13px] text-brand-primary font-bold press-scale flex items-center gap-0.5">
            और देखें <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3 pb-3 px-5">
          {mockEvents.slice(0, 4).map((event) => {
            const gradients = {
              Cultural: 'from-purple-500 to-violet-600',
              Education: 'from-blue-500 to-cyan-600',
              Matrimonial: 'from-pink-500 to-rose-600',
              Health: 'from-emerald-500 to-teal-600',
              Sports: 'from-orange-500 to-amber-600',
            };
            const catGradient = gradients[event.category] || gradients.Cultural;
            return (
              <div
                key={event.id}
                className="snap-center shrink-0 w-[260px] card-neo overflow-hidden cursor-pointer active:scale-[0.97] transition-transform"
                onClick={() => navigate(`/member/events/${event.id}`)}
              >
                {/* Image / Gradient Header */}
                <div className="h-[100px] relative flex items-center justify-center overflow-hidden bg-gray-900 rounded-t-[24px]">
                  {event.image ? (
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${catGradient}`} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
                  
                  {!event.image && (
                    <CalendarDays size={48} className="text-white/10 absolute right-2 top-2" />
                  )}
                  
                  <div className="absolute bottom-[-12px] left-3 z-10">
                    <div className="w-[42px] h-[48px] bg-white rounded-xl shadow-md flex flex-col items-center justify-center border border-purple-100/30">
                      <span className="text-[17px] font-bold text-text-primary leading-none">{event.day}</span>
                      <span className="text-[8px] font-bold text-brand-primary mt-0.5 uppercase">{event.monthShort}</span>
                    </div>
                  </div>
                  {event.isFeatured && (
                    <span className="absolute top-2 left-2 bg-amber-400 text-amber-900 text-[8px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      ★ विशेष
                    </span>
                  )}
                  <span className="absolute top-2 right-2 bg-black/30 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/10">
                    {event.categoryHi || event.category}
                  </span>
                </div>
                {/* Card Body */}
                <div className="p-3 pt-5">
                  <h4 className="font-bold text-[13px] text-text-primary leading-snug line-clamp-2">{event.title}</h4>
                  <div className="flex flex-col gap-1 mt-2">
                    <p className="text-[11px] text-text-secondary flex items-center gap-1 line-clamp-1">
                      <Clock size={10} className="text-text-muted shrink-0" /> {event.time}
                    </p>
                    <p className="text-[11px] text-text-secondary flex items-center gap-1 line-clamp-1">
                      <MapPin size={10} className="text-text-muted shrink-0" /> {event.venue.split(',')[0]}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-purple-100/20">
                    <span className="text-[10px] text-text-secondary font-medium flex items-center gap-1">
                      <Users size={10} className="text-text-muted" /> {event.interested || event.attendees}+ रुचि
                    </span>
                    {event.isRegistered ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5">
                        ✓ पंजीकृत
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-brand-primary bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100/50">
                        शामिल हों →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── SECTION DIVIDER ─── */}
      <div className="mx-5 mt-8 mb-6 h-[1px] bg-gradient-to-r from-transparent via-purple-200/40 to-transparent" />

      {/* ─── COMMUNITY FEED PREVIEW ─── */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[17px] font-bold text-text-primary tracking-tight">Community Feed</h3>
          <button onClick={() => navigate('/member/social')} className="text-[13px] text-social-module font-bold press-scale flex items-center gap-0.5">
            View All <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3 pb-2 -mx-5 px-5">
          {communityPosts.slice(0, 5).map((post, i) => {
            const matchedMember = mockMembers.find(m => m.name === post.author.name) || mockAdmins.find(a => a.name === post.author.name);
            const handleAuthorClick = (e) => {
              if (matchedMember) {
                e.stopPropagation();
                navigate(`/member/directory/${matchedMember.id}`);
              }
            };

            return (
              <div key={post.id} className="card-neo p-4 press-scale animate-stagger-fade-in shrink-0 w-[275px] snap-center" style={{ animationDelay: `${i * 80}ms` }} onClick={() => navigate(`/member/social/${post.id}`)}>
                <div className="flex items-center gap-3 mb-3">
                  <div onClick={handleAuthorClick} className={matchedMember ? 'cursor-pointer' : ''}>
                    <Avatar initials={post.author.initials} size="sm" />
                  </div>
                  <div className="flex-1">
                    <h4 onClick={handleAuthorClick} className={`text-[14px] font-bold text-text-primary ${matchedMember ? 'cursor-pointer hover:underline hover:text-brand-primary' : ''}`}>{post.author.name}</h4>
                    <p className="text-[12px] text-text-secondary">{post.community} · {post.timestamp}</p>
                  </div>
                </div>
              <p className="text-[14px] text-text-primary leading-relaxed line-clamp-2">{post.content}</p>
              <div className="flex items-center gap-5 mt-3 pt-3 border-t border-purple-100/20">
                <span className="text-[13px] text-text-secondary font-medium">❤️ {post.likes}</span>
                <span className="text-[13px] text-text-secondary font-medium">💬 {post.comments}</span>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* ─── SECTION DIVIDER ─── */}
      <div className="mx-5 mt-8 mb-6 h-[1px] bg-gradient-to-r from-transparent via-purple-200/40 to-transparent" />




      {/* ─── END OF FEED ILLUSTRATION ─── */}
      <div className="mt-8 relative w-full h-[450px] flex flex-col items-center justify-end overflow-hidden pb-[160px] -mb-[120px] bg-gradient-to-b from-transparent to-purple-50/50">
        {/* The SVG Collage fills the background entirely */}
        <div className="absolute inset-0 w-full h-full pointer-events-none select-none text-brand-primary">
          <CityLandscape className="w-full h-full" />
        </div>
        
        {/* End text */}
        <div className="relative z-10 flex flex-col items-center">
           <h3 className="text-brand-primary/30 text-[42px] font-black italic tracking-tighter mb-2 drop-shadow-sm leading-none">#MeriSamaj</h3>
           <div className="bg-white/80 backdrop-blur-xl px-6 py-2.5 rounded-2xl border border-purple-200/30 shadow-sm flex flex-col items-center">
             <span className="text-text-secondary text-[14px] font-bold tracking-wide">You're all caught up!</span>
             <span className="text-text-muted text-[11px] font-medium mt-0.5">Check back later for new updates</span>
           </div>
        </div>
      </div>

      {/* ─── MEDIA FAB ─── */}
      <button
        onClick={() => navigate('/member/social/create')}
        className="fixed bottom-[100px] right-5 w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-glow text-white flex items-center justify-center shadow-[0_8px_30px_rgba(124,58,237,0.35)] press-scale z-40 hover:scale-105 transition-transform animate-glow-pulse"
      >
        <ImagePlus size={23} />
      </button>

    </div>
  );
};

export default HomePage;
