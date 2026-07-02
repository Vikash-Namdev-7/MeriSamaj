import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * InteractionButtons — Haath Jode + Mala Arpan interactive buttons.
 * Modified to directly increment count by 1 without showing a quantity selector modal.
 */
const InteractionButtons = ({
  obituaryId,
  haathJodeCount = 0,
  malaArpanCount = 0,
  userHasHaathJode = false,
  userHasMalaArpan = false,
  onToggleHaathJode,
  onIncrementMalaArpan,
}) => {
  const [haathAnim, setHaathAnim] = useState(false);
  const [malaAnim, setMalaAnim] = useState(false);

  const formatCount = (n) => {
    if (!n && n !== 0) return '0';
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const handleHaathJode = () => {
    onToggleHaathJode(obituaryId);
    setHaathAnim(true);
    setTimeout(() => setHaathAnim(false), 600);
  };

  const handleOfferGarland = () => {
    onIncrementMalaArpan(obituaryId, 1);
    setMalaAnim(true);
    setTimeout(() => setMalaAnim(false), 600);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Haath Jode Button */}
      <motion.button
        onClick={handleHaathJode}
        whileTap={{ scale: 0.94 }}
        className="flex flex-col items-center gap-1.5 rounded-2xl py-4 px-3 border transition-all"
        style={{
          background: userHasHaathJode
            ? 'linear-gradient(135deg, #FEF3E2 0%, #FDE8CD 100%)'
            : 'white',
          borderColor: userHasHaathJode ? 'rgba(212,175,55,0.5)' : 'rgba(229,231,235,1)',
          boxShadow: userHasHaathJode
            ? '0 4px 14px rgba(212,175,55,0.2)'
            : '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={haathAnim ? 'anim' : 'idle'}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.3, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="text-[28px]"
          >
            🙏
          </motion.span>
        </AnimatePresence>
        <span
          className="text-[13px] font-bold"
          style={{ color: userHasHaathJode ? '#7C5C2E' : '#374151' }}
        >
          Folded Hands
        </span>
        <span
          className="text-[12px] font-semibold"
          style={{ color: userHasHaathJode ? '#D4AF37' : '#6B7280' }}
        >
          🙏 {formatCount(haathJodeCount)}
        </span>
      </motion.button>

      {/* Mala Arpan Button */}
      <motion.button
        onClick={handleOfferGarland}
        whileTap={{ scale: 0.94 }}
        className="flex flex-col items-center gap-1.5 rounded-2xl py-4 px-3 border transition-all"
        style={{
          background: userHasMalaArpan
            ? 'linear-gradient(135deg, #FFF0F3 0%, #FFE4EA 100%)'
            : 'white',
          borderColor: userHasMalaArpan ? 'rgba(244,63,94,0.3)' : 'rgba(229,231,235,1)',
          boxShadow: userHasMalaArpan
            ? '0 4px 14px rgba(244,63,94,0.15)'
            : '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={malaAnim ? 'anim' : 'idle'}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.3, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="text-[28px]"
          >
            🪷
          </motion.span>
        </AnimatePresence>
        <span
          className="text-[13px] font-bold"
          style={{ color: userHasMalaArpan ? '#9F1239' : '#374151' }}
        >
          Offer Garland
        </span>
        <span
          className="text-[12px] font-semibold"
          style={{ color: userHasMalaArpan ? '#F43F5E' : '#6B7280' }}
        >
          🌸 {formatCount(malaArpanCount)}
        </span>
      </motion.button>
    </div>
  );
};

export default InteractionButtons;
