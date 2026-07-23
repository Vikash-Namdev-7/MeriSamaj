/**
 * MarriageSuccessScreen.jsx
 * Full-screen celebration screen displayed after marriage is confirmed.
 * Shown to BOTH partners when marriage request is accepted.
 * Uses CSS animations only — no external animation library needed.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Home, CheckCircle2, Sparkles } from 'lucide-react';
import { successStoryService } from '../../../../../core/api/matrimonialService';

// ─── Confetti Particle ────────────────────────────────────────────────────────
const CONFETTI_COLORS = [
  '#FF6B6B', '#FFE66D', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE'
];

const ConfettiParticle = ({ style }) => (
  <div
    style={style}
    className="absolute w-2.5 h-2.5 rounded-sm opacity-0"
  />
);

// ─── Main Component ───────────────────────────────────────────────────────────
const MarriageSuccessScreen = ({ partnerName, onDismiss }) => {
  const navigate = useNavigate();
  const [particles, setParticles] = useState([]);
  const [visible, setVisible]     = useState(true);
  
  // Consent State
  const [showConsent, setShowConsent] = useState(false);
  const [consentUpdating, setConsentUpdating] = useState(false);

  // Generate confetti particles
  useEffect(() => {
    const generated = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left:     `${Math.random() * 100}%`,
      color:    CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay:    `${Math.random() * 2}s`,
      duration: `${2 + Math.random() * 2}s`,
      size:     `${6 + Math.floor(Math.random() * 8)}px`
    }));
    setParticles(generated);

    // Instead of auto-dismissing to home, auto-transition to consent prompt after 8 seconds
    const timer = setTimeout(() => {
      setShowConsent(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleUpdateConsent = async (allowPublicStory) => {
    try {
      setConsentUpdating(true);
      await successStoryService.updateConsent({ allowPublicStory });
    } catch (err) {
      console.error('Failed to update consent:', err);
    } finally {
      setConsentUpdating(false);
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => {
      if (onDismiss) onDismiss();
      else navigate('/member/matrimonial');
    }, 400);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 40%, #f093fb 100%)',
        animation: 'fadeIn 0.5s ease-out'
      }}
    >
      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-sm"
            style={{
              left:            p.left,
              top:             '-10px',
              width:           p.size,
              height:          p.size,
              backgroundColor: p.color,
              animationName:   'confettiFall',
              animationDuration: p.duration,
              animationDelay:  p.delay,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              animationFillMode: 'both'
            }}
          />
        ))}
      </div>

      {/* Content Card */}
      <div
        className="relative z-10 text-center px-8 py-10 mx-4"
        style={{ maxWidth: '400px' }}
      >
        {/* Ring Icon */}
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
          style={{
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            animation: 'pulseRing 1.5s ease-in-out infinite'
          }}
        >
          <span style={{ fontSize: '56px', lineHeight: 1 }} role="img" aria-label="wedding rings">💍</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight drop-shadow-lg">
          🎊 Congratulations! 🎊
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-white/90 font-semibold mb-1">
          Your Marriage is Confirmed!
        </p>
        {partnerName && (
          <p className="text-white/80 text-base mb-6">
            You & <span className="font-bold text-yellow-200">{partnerName}</span> are now married 💑
          </p>
        )}

        {/* Dynamic Content: Celebration or Consent */}
        {!showConsent ? (
          <>
            {/* Info box */}
            <div
              className="rounded-2xl px-5 py-4 mb-8 text-left"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
            >
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle2 size={18} className="text-green-300 mt-0.5 shrink-0" />
                <p className="text-white/90 text-sm">Your matrimonial profile has been successfully <strong>closed</strong>.</p>
              </div>
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle2 size={18} className="text-green-300 mt-0.5 shrink-0" />
                <p className="text-white/90 text-sm">You have been <strong>removed from matchmaking</strong>, search, and recommendations.</p>
              </div>
              <div className="flex items-start gap-3">
                <Heart size={18} className="text-pink-300 mt-0.5 shrink-0" />
                <p className="text-white/90 text-sm">Your matrimonial chat history is preserved as a <strong>read-only archive</strong>.</p>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => setShowConsent(true)}
              className="w-full py-3.5 rounded-2xl font-bold text-purple-700 shadow-xl transition-all duration-200 active:scale-95 hover:shadow-2xl"
              style={{ background: 'white' }}
            >
              <span className="flex items-center justify-center gap-2">
                Continue
              </span>
            </button>
          </>
        ) : (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="bg-white/20 p-6 rounded-2xl mb-8 backdrop-blur-md">
              <Sparkles size={32} className="text-yellow-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Share Your Story!</h3>
              <p className="text-white/90 text-sm leading-relaxed mb-4">
                Would you like to inspire other families by sharing your success story on our platform?
              </p>
              <p className="text-white/70 text-xs italic">
                (Both partners must agree before your story can be published by the admin.)
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleUpdateConsent(true)}
                disabled={consentUpdating}
                className="w-full py-3.5 rounded-2xl font-bold text-purple-700 shadow-xl transition-all duration-200 active:scale-95 hover:shadow-2xl disabled:opacity-50"
                style={{ background: 'white' }}
              >
                {consentUpdating ? 'Saving...' : 'Yes, Share My Story! 💖'}
              </button>
              
              <button
                onClick={() => handleUpdateConsent(false)}
                disabled={consentUpdating}
                className="w-full py-3.5 rounded-2xl font-bold text-white shadow-xl transition-all duration-200 active:scale-95 hover:bg-white/20 border border-white/40 disabled:opacity-50"
              >
                No Thanks / Maybe Later
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CSS Keyframes */}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes pulseRing {
          0%, 100% { transform: scale(1);    box-shadow: 0 0 0 0 rgba(255,255,255,0.4); }
          50%       { transform: scale(1.07); box-shadow: 0 0 0 20px rgba(255,255,255,0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default MarriageSuccessScreen;
