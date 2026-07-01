import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, X } from 'lucide-react';

/**
 * InteractionButtons — Haath Jode + Mala Arpan interactive buttons with counter modals.
 * Matches reference images screens 8 & 9.
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
  const [malaModal, setMalaModal] = useState(false);
  const [malaQty, setMalaQty] = useState(1);
  const [haathAnim, setHaathAnim] = useState(false);
  const [malaConfirmed, setMalaConfirmed] = useState(false);

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

  const handleMalaConfirm = () => {
    onIncrementMalaArpan(obituaryId, malaQty);
    setMalaConfirmed(true);
    setTimeout(() => {
      setMalaModal(false);
      setMalaConfirmed(false);
      setMalaQty(1);
    }, 1200);
  };

  return (
    <>
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
            हाथ जोड़ें
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
          onClick={() => setMalaModal(true)}
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
          <span className="text-[28px]">🪷</span>
          <span
            className="text-[13px] font-bold"
            style={{ color: userHasMalaArpan ? '#9F1239' : '#374151' }}
          >
            माला अर्पण करें
          </span>
          <span
            className="text-[12px] font-semibold"
            style={{ color: userHasMalaArpan ? '#F43F5E' : '#6B7280' }}
          >
            🌸 {formatCount(malaArpanCount)}
          </span>
        </motion.button>
      </div>

      {/* Mala Arpan Modal */}
      <AnimatePresence>
        {malaModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMalaModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="w-full max-w-md rounded-t-[28px] p-6 pb-10"
              style={{ background: 'white' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5" />

              {malaConfirmed ? (
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-3 py-4"
                >
                  <span className="text-[56px]">🪷</span>
                  <p className="text-[18px] font-bold text-gray-900">माला अर्पित हो गई!</p>
                  <p className="text-[13px] text-gray-500">आपकी {malaQty} माला अर्पण हो गई</p>
                </motion.div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[18px] font-bold text-gray-900">माला अर्पण करें</h3>
                    <button
                      onClick={() => setMalaModal(false)}
                      className="p-1.5 rounded-full bg-gray-100 text-gray-500"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <p className="text-[13px] text-gray-500 mb-6">
                    आपके श्रद्धा भाव के लिए धन्यवाद
                  </p>

                  {/* Mala emoji large */}
                  <div className="flex justify-center mb-6">
                    <span className="text-[72px]">🪷</span>
                  </div>

                  {/* Counter */}
                  <div className="flex items-center justify-center gap-6 mb-6">
                    <button
                      onClick={() => setMalaQty(Math.max(1, malaQty - 1))}
                      className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 press-scale"
                    >
                      <Minus size={18} />
                    </button>
                    <motion.span
                      key={malaQty}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="text-[32px] font-bold w-12 text-center"
                      style={{ color: '#7C5C2E' }}
                    >
                      {malaQty}
                    </motion.span>
                    <button
                      onClick={() => setMalaQty(malaQty + 1)}
                      className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 press-scale"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  {/* Confirm button */}
                  <button
                    onClick={handleMalaConfirm}
                    className="w-full py-4 rounded-2xl font-bold text-[16px] text-white press-scale"
                    style={{
                      background: 'linear-gradient(135deg, #B8395A 0%, #F43F5E 100%)',
                      boxShadow: '0 4px 14px rgba(244,63,94,0.3)'
                    }}
                  >
                    माला अर्पित करें 🪷
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InteractionButtons;
