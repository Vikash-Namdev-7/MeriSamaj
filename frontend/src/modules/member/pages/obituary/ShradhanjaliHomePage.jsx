import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X, Eye, MessageCircle, Bell } from 'lucide-react';
import { useData } from '../../context/DataProvider';
import { AnimatedPage } from '../../components/layout/AnimatedPage';

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'recent', label: 'Recent' },
  { id: 'ceremony', label: 'Upcoming Ceremonies' },
];

const formatCount = (n) => {
  if (!n && n !== 0) return '0';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
};

/* ─── Full dark memorial card — same style for ALL posts ─── */
const MemorialCard = ({ obituary, index }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => navigate(`/member/shradhanjali/${obituary.id}`)}
      className="relative rounded-[24px] overflow-hidden cursor-pointer card-press"
      style={{
        background: 'linear-gradient(160deg, #2D1A0E 0%, #1A0D05 100%)',
        boxShadow: '0 10px 36px rgba(124,92,46,0.30)',
      }}
    >
      {/* ── Hero photo ── */}
      <div className="relative h-[220px]">
        <img
          src={obituary.image}
          alt={obituary.deceasedName}
          className="w-full h-full object-cover"
          style={{ objectPosition: 'top center' }}
        />

        {/* Om Shanti badge */}
        <div
          className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold"
          style={{
            background: 'rgba(20,12,0,0.78)',
            backdropFilter: 'blur(14px)',
            color: '#D4AF37',
            border: '1px solid rgba(212,175,55,0.3)',
          }}
        >
          🪔 Om Shanti
        </div>

        {/* Floral corners */}
        <div className="absolute bottom-2 left-3 right-3 flex justify-between pointer-events-none">
          <span className="text-[22px] opacity-50 select-none">🌸</span>
          <span className="text-[22px] opacity-50 select-none">🌸</span>
        </div>
      </div>

      {/* ── Info block ── */}
      <div className="px-4 pt-3 pb-4">

        {/* Name */}
        <h2
          className="text-[19px] font-bold leading-snug mb-0.5"
          style={{ color: '#F5E6C8', fontFamily: 'Outfit, serif' }}
        >
          {obituary.deceasedName}
        </h2>

        {/* Age + dates */}
        <p className="text-[12px] mb-1" style={{ color: 'rgba(212,175,55,0.8)' }}>
          {obituary.age > 0 ? `Age: ${obituary.age} Years` : ''}
          {obituary.age > 0 && obituary.dateOfPassing ? ' • ' : ''}
          {obituary.dateOfPassing ? `Passing: ${obituary.dateOfPassing}` : ''}
        </p>

        {/* Birth date */}
        {obituary.birthDate && (
          <p className="text-[11px] mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
            🌸 Birth: {obituary.birthDate}
          </p>
        )}

        {/* Message */}
        <p
          className="text-[12px] leading-relaxed line-clamp-2 mb-3"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          "{obituary.message}"
        </p>

        {/* ── Stats row ── */}
        <div
          className="flex items-center justify-around py-2.5 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(212,175,55,0.13)',
          }}
        >
          {/* Alignment stats */}
          {/* Haath Jode */}
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[18px]">🙏</span>
            <span className="text-[13px] font-bold" style={{ color: '#D4AF37' }}>
              {formatCount(obituary.haathJodeCount ?? obituary.shraddhanjaliCount)}
            </span>
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.38)' }}>
              Folded Hands
            </span>
          </div>

          <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} />

          {/* Mala Arpan */}
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[18px]">🪷</span>
            <span className="text-[13px] font-bold" style={{ color: '#F9A8D4' }}>
              {formatCount(obituary.malaArpanCount)}
            </span>
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.38)' }}>
              Garland
            </span>
          </div>

          <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} />

          {/* Views */}
          <div className="flex flex-col items-center gap-0.5">
            <Eye size={16} style={{ color: 'rgba(255,255,255,0.55)' }} />
            <span className="text-[13px] font-bold" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {formatCount(obituary.views)}
            </span>
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.38)' }}>
              Views
            </span>
          </div>
        </div>

        {/* ── Author + timestamp row ── */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            {/* Author initials bubble */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
              style={{ background: 'rgba(212,175,55,0.18)', color: '#D4AF37' }}
            >
              {obituary.author?.initials || '?'}
            </div>
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {obituary.author?.name} ({obituary.author?.relation})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {obituary.comments?.length || 0}
            </span>
            <span className="text-[11px] ml-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {obituary.timestamp}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Page ─── */
const ShradhanjaliHomePage = () => {
  const navigate = useNavigate();
  const { obituaries, obituariesLoading, obituariesError, loadObituaries, getUnreadCountForModule, currentUser } = useData();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showSearch, setShowSearch] = useState(false);

  const communityId = useMemo(() => {
    const comName = currentUser?.community;
    return comName ? comName.toLowerCase().replace(/\s/g, '_') : 'cm_123';
  }, [currentUser]);

  const settings = useMemo(() => {
    const saved = localStorage.getItem(`community_settings_${communityId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.shradhanjali) return parsed.shradhanjali;
      } catch (e) {}
    }
    return { enabled: true, memberSubmissionEnabled: true, requireApproval: true };
  }, [communityId]);

  const filtered = obituaries.filter((ob) => {
    // 1. Search filter
    if (search) {
      const q = search.toLowerCase();
      const matchSearch = (
        ob.deceasedName?.toLowerCase().includes(q) ||
        ob.deceasedNameEn?.toLowerCase().includes(q) ||
        ob.author?.name?.toLowerCase().includes(q)
      );
      if (!matchSearch) return false;
    }

    // 2. Tab filter
    if (activeFilter === 'recent') {
      if (ob.dateOfPassing) {
        const passingDate = new Date(ob.dateOfPassing);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return passingDate >= thirtyDaysAgo;
      }
      return true;
    }

    if (activeFilter === 'ceremony') {
      if (ob.funeralDetails?.date) {
        const ritesDate = new Date(ob.funeralDetails.date);
        ritesDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return ritesDate >= today;
      }
      return false;
    }

    return true;
  });

  if (!settings.enabled) {
    return (
      <AnimatedPage>
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center gap-4">
          <span className="text-[64px]">🪔</span>
          <h2 className="text-xl font-bold text-gray-800">Obituary Section Disabled</h2>
          <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
            The Obituary (Shradhanjali) portal has been disabled by your Samaj Administrator or Community Head. Please contact them for more details.
          </p>
          <button 
            onClick={() => navigate('/member/home')}
            className="mt-2 px-6 py-2.5 rounded-xl text-[13px] font-bold text-white press-scale"
            style={{ background: '#7C5C2E' }}
          >
            Go back to Home
          </button>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      {/* ─── Header ─── */}
      <div
        className="responsive-fixed-top z-40 border-b"
        style={{
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(24px)',
          borderColor: 'rgba(212,175,55,0.22)',
          boxShadow: '0 2px 14px rgba(124,92,46,0.04)',
          paddingTop: 'var(--spacing-safe-top)',
        }}
      >
        <div className="flex items-center h-16 px-4 gap-3">
          <AnimatePresence mode="wait">
            {showSearch ? (
              <motion.div
                key="search"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex-1 flex items-center gap-2 rounded-2xl px-3.5 py-2 border shadow-inner"
                style={{ borderColor: 'rgba(212,175,55,0.3)', background: 'rgba(253,248,240,0.5)' }}
              >
                <Search size={16} className="text-amber-700/60 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name..."
                  className="flex-1 bg-transparent border-none text-[14px] text-gray-900 placeholder-amber-900/40 focus:outline-none font-medium"
                />
                {search && (
                  <button onClick={() => setSearch('')}>
                    <X size={14} className="text-amber-800" />
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="title"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-2 flex-1"
              >
                <span className="text-[20px]">🪔</span>
                <div>
                  <h1 className="text-[16px] font-bold leading-tight" style={{ color: '#7C5C2E' }}>
                    Obituary
                  </h1>
                  <p className="text-[10px] text-gray-400">Om Shanti</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right: count badge + bell + search toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {!showSearch && filtered.length > 0 && (
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(124,92,46,0.1)', color: '#7C5C2E' }}
              >
                {filtered.length}
              </span>
            )}
            <button
              onClick={() => navigate('/member/notifications?module=shradhanjali')}
              className="p-2 rounded-full press-scale relative"
              style={{ background: 'rgba(124,92,46,0.08)' }}
            >
              <Bell size={18} style={{ color: '#7C5C2E' }} />
              {getUnreadCountForModule('shradhanjali') > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => { setShowSearch(!showSearch); if (showSearch) setSearch(''); }}
              className="p-2 rounded-full press-scale"
              style={{ background: showSearch ? 'rgba(212,175,55,0.15)' : 'rgba(124,92,46,0.08)' }}
            >
              {showSearch
                ? <X size={18} style={{ color: '#7C5C2E' }} />
                : <Search size={18} style={{ color: '#7C5C2E' }} />}
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className="shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all press-scale"
              style={{
                background: activeFilter === tab.id ? '#7C5C2E' : 'rgba(124,92,46,0.08)',
                color: activeFilter === tab.id ? 'white' : '#7C5C2E',
                border: activeFilter === tab.id ? 'none' : '1px solid rgba(124,92,46,0.15)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── All posts as full memorial cards ─── */}
      <div className="pt-[116px] pb-32 px-4 max-w-lg mx-auto space-y-5">
        {obituariesLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="text-[44px]"
            >
              🪔
            </motion.div>
            <p className="text-[14px] text-gray-500 font-medium">Loading tributes...</p>
          </div>
        ) : obituariesError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <span className="text-[44px]">⚠️</span>
            <p className="text-[14px] text-red-500 font-medium">{obituariesError}</p>
            <button
              onClick={loadObituaries}
              className="px-4 py-2 rounded-xl text-[12px] font-bold text-white press-scale"
              style={{ background: '#7C5C2E' }}
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {filtered.length > 0 && (
              <div className="flex items-center justify-between pt-1 pb-1">
                <span className="text-[13px] font-semibold text-gray-400">
                  {filtered.length} Obituary Posts
                </span>
              </div>
            )}

            {filtered.map((ob, idx) => (
              <MemorialCard key={ob.id} obituary={ob} index={idx} />
            ))}

            {/* Empty state */}
            {filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3 py-20"
              >
                <span className="text-[64px]">🕊️</span>
                <p className="text-[16px] font-bold text-gray-500">No obituaries found</p>
                {search && (
                  <p className="text-[13px] text-gray-400 text-center">
                    No results for "{search}"
                  </p>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* ─── FAB ─── */}
      {settings.memberSubmissionEnabled && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/member/shradhanjali/create')}
          className="responsive-fixed-fab flex items-center gap-2 px-5 py-3.5 rounded-2xl text-white font-bold text-[14px] shadow-xl z-40"
          style={{
            background: 'linear-gradient(135deg, #7C5C2E 0%, #D4AF37 100%)',
            boxShadow: '0 8px 24px rgba(124,92,46,0.4)',
          }}
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>Post Obituary</span>
        </motion.button>
      )}
    </AnimatedPage>
  );
};

export default ShradhanjaliHomePage;
