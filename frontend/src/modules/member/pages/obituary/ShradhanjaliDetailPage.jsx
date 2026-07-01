import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Bookmark, BookmarkCheck, Flower, Phone, Eye } from 'lucide-react';
import { useData } from '../../context/DataProvider';
import { AnimatedPage } from '../../components/layout/AnimatedPage';
import TributeHeroImage from './components/TributeHeroImage';
import CeremonySection from './components/CeremonySection';
import InteractionButtons from './components/InteractionButtons';
import TributeMessages from './components/TributeMessages';
import { Avatar } from '../../components/common/Avatar';

const ShradhanjaliDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    obituaries,
    toggleHaathJode,
    incrementMalaArpan,
    saveShradhanjali,
    shareShradhanjali,
    incrementObituaryViews,
  } = useData();

  const obituary = obituaries.find(ob => ob.id === id);

  // Increment view count on mount
  useEffect(() => {
    if (obituary && incrementObituaryViews) {
      incrementObituaryViews(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!obituary) {
    return (
      <AnimatedPage>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <span className="text-[56px]">🕊️</span>
          <p className="text-gray-500 font-medium">Post not found</p>
          <button onClick={() => navigate(-1)} className="text-[13px] font-semibold" style={{ color: '#7C5C2E' }}>
            Back
          </button>
        </div>
      </AnimatedPage>
    );
  }

  const formatCount = (n) => {
    if (!n && n !== 0) return '0';
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const handleShare = async () => {
    shareShradhanjali && shareShradhanjali(id);
    if (navigator.share) {
      try {
        await navigator.share({
          title: obituary.deceasedName,
          text: `${obituary.deceasedName}'s Tribute — MeriSamaj`,
          url: window.location.href
        });
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <AnimatedPage>
      {/* Floating top bar */}
      <div
        className="responsive-fixed-top z-40"
        style={{ paddingTop: 'var(--spacing-safe-top)' }}
      >
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full press-scale"
            style={{ background: 'rgba(20,12,0,0.6)', backdropFilter: 'blur(12px)', color: '#D4AF37' }}
          >
            <ArrowLeft size={18} />
            <span className="text-[13px] font-bold">Tribute</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full flex items-center justify-center press-scale"
              style={{ background: 'rgba(20,12,0,0.6)', backdropFilter: 'blur(12px)', color: '#D4AF37' }}
            >
              <Share2 size={16} />
            </button>
            <button
              onClick={() => saveShradhanjali && saveShradhanjali(id)}
              className="w-9 h-9 rounded-full flex items-center justify-center press-scale"
              style={{ background: 'rgba(20,12,0,0.6)', backdropFilter: 'blur(12px)', color: obituary.isSaved ? '#D4AF37' : 'rgba(212,175,55,0.6)' }}
            >
              {obituary.isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
            <span className="text-[20px]">🪔</span>
          </div>
        </div>
      </div>

      {/* ── Scrollable Content ── */}
      <div className="pb-28 max-w-lg mx-auto">

        {/* Hero Image */}
        <TributeHeroImage
          src={obituary.image}
          alt={obituary.deceasedName}
          deceasedName={obituary.deceasedName}
        />

        {/* Main content card */}
        <div className="px-4 -mt-4 relative z-10 space-y-4">

          {/* ── Name & Bio Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-elevated text-center px-5 py-6"
          >
            {/* Name */}
            <h1
              className="text-[22px] font-bold leading-tight mb-1"
              style={{ color: '#1A1A1A', fontFamily: 'Outfit, serif' }}
            >
              {obituary.deceasedName}
            </h1>

            {/* Age divider */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="h-px flex-1 max-w-[60px]" style={{ background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.5))' }} />
              <span className="text-[13px] font-semibold text-gray-500">Age: {obituary.age} Years</span>
              <div className="h-px flex-1 max-w-[60px]" style={{ background: 'linear-gradient(to left, transparent, rgba(212,175,55,0.5))' }} />
            </div>

            {/* Quote */}
            <p
              className="text-[13px] leading-relaxed italic text-gray-600 mb-4 px-2"
              style={{ fontFamily: 'Outfit, serif' }}
            >
              "{obituary.message}"
            </p>

            {/* Birth / Death dates */}
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="flex items-center gap-1.5 justify-center">
                  <Flower size={13} style={{ color: '#7C5C2E' }} />
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Birth</span>
                </div>
                <p className="text-[13px] font-semibold text-gray-800 mt-0.5">
                  {obituary.birthDate || '—'}
                </p>
              </div>
              <div className="w-px h-10 bg-gray-100" />
              <div className="text-center">
                <div className="flex items-center gap-1.5 justify-center">
                  <span className="text-[13px]">🕊️</span>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Passing</span>
                </div>
                <p className="text-[13px] font-semibold text-gray-800 mt-0.5">
                  {obituary.dateOfPassing}
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── Ceremony Section ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CeremonySection funeralDetails={obituary.funeralDetails} />
          </motion.div>

          {/* ── Interaction Buttons ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <InteractionButtons
              obituaryId={id}
              haathJodeCount={obituary.haathJodeCount || obituary.shraddhanjaliCount || 0}
              malaArpanCount={obituary.malaArpanCount || 0}
              userHasHaathJode={obituary.userHasHaathJode || obituary.hasOfferedShraddhanjali}
              userHasMalaArpan={obituary.userHasMalaArpan}
              onToggleHaathJode={toggleHaathJode}
              onIncrementMalaArpan={incrementMalaArpan}
            />
          </motion.div>

          {/* ── Author & Family Contact ── */}
          {obituary.author && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="card-std px-4 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Avatar initials={obituary.author.initials} size="sm" />
                <div>
                  <p className="text-[13px] font-bold text-gray-900">{obituary.author.name}</p>
                  <p className="text-[11px] text-gray-500">
                    {obituary.author.relation} &bull; {obituary.timestamp}
                  </p>
                </div>
              </div>
              {obituary.familyContact && (
                <a
                  href={`tel:${obituary.familyContact}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold press-scale"
                  style={{
                    background: 'linear-gradient(135deg, rgba(124,92,46,0.1) 0%, rgba(212,175,55,0.1) 100%)',
                    color: '#7C5C2E',
                    border: '1px solid rgba(212,175,55,0.3)'
                  }}
                >
                  <Phone size={12} />
                  Contact
                </a>
              )}
            </motion.div>
          )}

          {/* ── Messages / Comments ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TributeMessages
              obituaryId={id}
              comments={obituary.comments || []}
            />
          </motion.div>

          {/* ── Stats Bar ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="card-std px-4 py-3"
          >
            <div className="flex items-center justify-around">
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex items-center gap-1">
                  <Eye size={14} className="text-gray-400" />
                  <span className="text-[13px] font-bold text-gray-700">{formatCount(obituary.views)}</span>
                </div>
                <span className="text-[10px] text-gray-400">Views</span>
              </div>
              <div className="w-px h-8 bg-gray-100" />
              <button
                onClick={handleShare}
                className="flex flex-col items-center gap-0.5 press-scale"
              >
                <div className="flex items-center gap-1">
                  <Share2 size={14} className="text-gray-400" />
                  <span className="text-[13px] font-bold text-gray-700">{formatCount(obituary.shares)}</span>
                </div>
                <span className="text-[10px] text-gray-400">Shares</span>
              </button>
              <div className="w-px h-8 bg-gray-100" />
              <button
                onClick={() => saveShradhanjali && saveShradhanjali(id)}
                className="flex flex-col items-center gap-0.5 press-scale"
              >
                <div className="flex items-center gap-1">
                  {obituary.isSaved
                    ? <BookmarkCheck size={14} style={{ color: '#7C5C2E' }} />
                    : <Bookmark size={14} className="text-gray-400" />
                  }
                  <span className="text-[13px] font-bold text-gray-700">{formatCount(obituary.saves)}</span>
                </div>
                <span
                  className="text-[10px]"
                  style={{ color: obituary.isSaved ? '#7C5C2E' : '#9CA3AF' }}
                >
                  {obituary.isSaved ? 'Saved' : 'Save'}
                </span>
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </AnimatedPage>
  );
};

export default ShradhanjaliDetailPage;
