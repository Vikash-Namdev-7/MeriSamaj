/**
 * ReferAndEarnBanner — Compact slim version
 * Left: badge + heading + short desc + 2 CTA buttons
 * Right: SVG illustration
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, ArrowRight, ChevronRight } from 'lucide-react';

/* ── Singleton style injection ── */
const STYLE_ID = 'reb-styles-v3';

function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const tag = document.createElement('style');
  tag.id = STYLE_ID;
  tag.textContent = `
    @media (prefers-reduced-motion: reduce) {
      .reb-section { transition: none !important; }
      .reb-coin-1, .reb-coin-2, .reb-coin-3,
      .reb-gift, .reb-card-top, .reb-card-bot,
      .reb-node-l, .reb-node-r, .reb-sparkle { animation: none !important; }
    }

    /* Entrance */
    .reb-section {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1),
                  transform 0.6s cubic-bezier(0.16,1,0.3,1);
    }
    .reb-section.reb-visible { opacity: 1; transform: translateY(0); }

    /* Banner shell */
    .reb-shell {
      position: relative;
      overflow: hidden;
      border-radius: 24px;
      background: rgba(255,255,255,0.90);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(124,58,237,0.09);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.9),
        0 4px 24px -4px rgba(124,58,237,0.10),
        0 16px 48px -8px rgba(124,58,237,0.07);
    }

    /* Top gradient line */
    .reb-shell::before {
      content: '';
      position: absolute;
      top: 0; left: 8%; right: 8%; height: 2px;
      border-radius: 2px;
      background: linear-gradient(90deg, transparent, rgba(124,58,237,0.30), rgba(59,130,246,0.25), transparent);
      z-index: 2;
      pointer-events: none;
    }

    /* Mesh bg */
    .reb-mesh {
      position: absolute; inset: 0; z-index: 0; pointer-events: none;
      background:
        radial-gradient(ellipse 55% 80% at 0% 50%, rgba(124,58,237,0.05) 0%, transparent 70%),
        radial-gradient(ellipse 45% 70% at 100% 50%, rgba(59,130,246,0.04) 0%, transparent 70%);
    }

    /* Two-col grid — true 50/50 split */
    .reb-grid {
      position: relative; z-index: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: center;
      gap: 0;
      padding: 22px 20px 22px 28px;
    }
    @media (max-width: 540px) {
      .reb-grid {
        grid-template-columns: 1fr;
        padding: 20px 20px 0;
      }
      .reb-illus-col { justify-content: center; padding: 8px 16px 16px; }
    }

    /* Illustration column */
    .reb-illus-col {
      display: flex; align-items: center; justify-content: center;
      padding: 8px 16px 8px 8px;
    }
    .reb-illus-wrap { width: 100%; max-width: 240px; }
    @media (max-width: 540px) { .reb-illus-wrap { max-width: 200px; } }
    .reb-illus-wrap svg { width: 100%; height: auto; overflow: visible; }

    /* Badge */
    .reb-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 10px;
      border-radius: 100px;
      font-size: 10px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase;
      background: rgba(124,58,237,0.08);
      border: 1px solid rgba(124,58,237,0.16);
      color: #7C3AED;
      margin-bottom: 10px;
    }

    /* Primary button */
    .reb-btn-primary {
      display: inline-flex; align-items: center; gap: 7px;
      background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
      color: white; font-weight: 700; font-size: 13.5px;
      border-radius: 100px; padding: 11px 22px;
      border: none; cursor: pointer; white-space: nowrap;
      position: relative; overflow: hidden;
      box-shadow: 0 4px 16px rgba(124,58,237,0.28), 0 1px 3px rgba(124,58,237,0.15);
      transition: transform 200ms cubic-bezier(0.25,1,0.5,1), box-shadow 220ms ease;
    }
    .reb-btn-primary::before {
      content: ''; position: absolute; top: 0; left: -80%; width: 55%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.20), transparent);
      transform: skewX(-18deg); pointer-events: none;
    }
    .reb-btn-primary:hover::before { animation: rebShine 0.6s ease forwards; }
    .reb-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 7px 24px rgba(124,58,237,0.35), 0 2px 8px rgba(124,58,237,0.18);
    }
    .reb-btn-primary:active { transform: scale(0.96); }

    /* Secondary button (blue) */
    .reb-btn-secondary {
      display: inline-flex; align-items: center; gap: 6px;
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      color: white; font-weight: 700; font-size: 13.5px;
      border-radius: 100px; padding: 11px 20px;
      border: none; cursor: pointer; white-space: nowrap;
      box-shadow: 0 4px 16px rgba(59,130,246,0.28), 0 1px 3px rgba(59,130,246,0.15);
      transition: transform 200ms cubic-bezier(0.25,1,0.5,1), box-shadow 220ms ease;
    }
    .reb-btn-secondary:hover {
      transform: translateY(-2px);
      box-shadow: 0 7px 24px rgba(59,130,246,0.35), 0 2px 8px rgba(59,130,246,0.18);
    }
    .reb-btn-secondary:active { transform: scale(0.96); }

    /* SVG element animations */
    .reb-coin-1 { animation: rebCoin1 3.8s ease-in-out infinite; }
    .reb-coin-2 { animation: rebCoin2 4.5s ease-in-out infinite 0.6s; }
    .reb-coin-3 { animation: rebCoin3 4.1s ease-in-out infinite 1.2s; }
    .reb-gift   { animation: rebGift  5.0s ease-in-out infinite 0.3s; }
    .reb-card-top { animation: rebFloat1 4.8s ease-in-out infinite; }
    .reb-card-bot { animation: rebFloat2 5.5s ease-in-out infinite 0.8s; }
    .reb-node-l { animation: rebFloat1 4.4s ease-in-out infinite 0.4s; }
    .reb-node-r { animation: rebFloat2 5.2s ease-in-out infinite 1.0s; }
    .reb-sparkle { animation: rebSparkle 3.2s ease-in-out infinite; }
    .reb-orb { animation: rebOrb 6s ease-in-out infinite; }

    @keyframes rebFloat1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
    @keyframes rebFloat2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }
    @keyframes rebGift   { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-6px) rotate(1.5deg)} }
    @keyframes rebCoin1  { 0%,100%{transform:translateY(0) rotate(0deg)} 33%{transform:translateY(-9px) rotate(8deg)} 66%{transform:translateY(-3px) rotate(-4deg)} }
    @keyframes rebCoin2  { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-6px) scale(1.07)} }
    @keyframes rebCoin3  { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(5px) rotate(-9deg)} }
    @keyframes rebSparkle { 0%,100%{opacity:0.4;transform:scale(1) rotate(0deg)} 50%{opacity:1;transform:scale(1.3) rotate(22deg)} }
    @keyframes rebOrb    { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.75;transform:scale(1.06)} }
    @keyframes rebShine  { from{left:-80%} to{left:120%} }
  `;
  document.head.appendChild(tag);
}

/* ── Compact SVG Illustration ── */
const ReferIllustration = () => (
  <div className="reb-illus-wrap" aria-hidden="true">
    <svg viewBox="0 0 220 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rebv3-phone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#4C1D95"/>
          <stop offset="100%" stopColor="#7C3AED"/>
        </linearGradient>
        <linearGradient id="rebv3-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#F5F3FF"/>
          <stop offset="100%" stopColor="#EDE9FE"/>
        </linearGradient>
        <linearGradient id="rebv3-coin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#FCD34D"/>
          <stop offset="100%" stopColor="#F59E0B"/>
        </linearGradient>
        <linearGradient id="rebv3-gift" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#7C3AED"/>
          <stop offset="100%" stopColor="#A78BFA"/>
        </linearGradient>
        <linearGradient id="rebv3-card" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.96)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0.78)"/>
        </linearGradient>
        <radialGradient id="rebv3-orb" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(124,58,237,0.11)"/>
          <stop offset="100%" stopColor="rgba(124,58,237,0)"/>
        </radialGradient>

        <filter id="rebv3-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(124,58,237,0.16)"/>
        </filter>
        <filter id="rebv3-coin-sh" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="rgba(245,158,11,0.28)"/>
        </filter>
      </defs>

      {/* Ambient orb */}
      <ellipse cx="110" cy="100" rx="90" ry="75" fill="url(#rebv3-orb)" className="reb-orb"/>

      {/* Dashed network lines */}
      <line x1="60" y1="52" x2="95" y2="78"  stroke="rgba(124,58,237,0.12)" strokeWidth="1.2" strokeDasharray="3 3"/>
      <line x1="160" y1="52" x2="125" y2="78" stroke="rgba(124,58,237,0.12)" strokeWidth="1.2" strokeDasharray="3 3"/>

      {/* ── Smartphone ── */}
      <g filter="url(#rebv3-shadow)">
        <rect x="82" y="30" width="56" height="108" rx="12" fill="url(#rebv3-phone)"/>
        <rect x="99" y="33" width="22" height="4"   rx="2"  fill="rgba(255,255,255,0.14)"/>
        <rect x="138" y="52" width="2.5" height="10" rx="1.2" fill="rgba(255,255,255,0.20)"/>
        <rect x="101" y="131" width="18" height="2.5" rx="1.2" fill="rgba(255,255,255,0.18)"/>
      </g>

      {/* Phone screen */}
      <rect x="87" y="40" width="46" height="84" rx="7" fill="url(#rebv3-screen)"/>

      {/* Success circle */}
      <circle cx="110" cy="68" r="14" fill="rgba(124,58,237,0.09)"/>
      <circle cx="110" cy="68" r="9"  fill="#7C3AED"/>
      <polyline points="104.5,68 108,72.5 115.5,62.5"
        fill="none" stroke="white" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round"/>

      {/* Screen content lines */}
      <rect x="92" y="86"  width="36" height="4"  rx="2"   fill="rgba(124,58,237,0.08)" stroke="rgba(124,58,237,0.18)" strokeWidth="0.6"/>
      <rect x="95" y="88"  width="20" height="2"  rx="1"   fill="#7C3AED" opacity="0.5"/>
      <rect x="92" y="95"  width="28" height="3.5" rx="1.8" fill="rgba(245,158,11,0.30)"/>
      <rect x="92" y="102" width="22" height="3"  rx="1.5" fill="rgba(124,58,237,0.18)"/>
      <rect x="92" y="108" width="34" height="2.5" rx="1.2" fill="rgba(167,139,250,0.22)"/>
      <rect x="92" y="113" width="26" height="2.5" rx="1.2" fill="rgba(167,139,250,0.16)"/>

      {/* ── Top-right reward card ── */}
      <g className="reb-card-top" filter="url(#rebv3-shadow)">
        <rect x="145" y="28" width="66" height="38" rx="10" fill="url(#rebv3-card)" stroke="rgba(124,58,237,0.10)" strokeWidth="0.8"/>
        <rect x="146" y="29" width="64" height="4" rx="9"   fill="rgba(255,255,255,0.55)"/>
        <circle cx="157" cy="47" r="7.5" fill="rgba(124,58,237,0.09)"/>
        <text x="157" y="51" textAnchor="middle" fontSize="8" fill="#7C3AED">✦</text>
        <rect x="170" y="36" width="36" height="3.5" rx="1.8" fill="rgba(124,58,237,0.14)"/>
        <rect x="170" y="43" width="25" height="3"   rx="1.5" fill="#7C3AED" opacity="0.70"/>
        <rect x="170" y="50" width="32" height="2.5" rx="1.2" fill="rgba(167,139,250,0.36)"/>
        <rect x="183" y="29" width="25" height="12" rx="6"   fill="#7C3AED"/>
        <text x="195.5" y="38" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="white">+50 pts</text>
      </g>

      {/* ── Avatar node left ── */}
      <g className="reb-node-l">
        <circle cx="48" cy="55" r="14" fill="rgba(255,255,255,0.92)" filter="url(#rebv3-shadow)"/>
        <circle cx="48" cy="55" r="10" fill="rgba(124,58,237,0.07)"/>
        <circle cx="48" cy="52" r="4.5" fill="#7C3AED"/>
        <path   d="M42 64 Q48 59 54 64" fill="#A78BFA"/>
        <circle cx="58" cy="45" r="4"  fill="#10B981" stroke="white" strokeWidth="1.2"/>
      </g>

      {/* ── Avatar node right ── */}
      <g className="reb-node-r">
        <circle cx="172" cy="65" r="13" fill="rgba(255,255,255,0.92)" filter="url(#rebv3-shadow)"/>
        <circle cx="172" cy="65" r="9"  fill="rgba(245,158,11,0.07)"/>
        <circle cx="172" cy="62" r="4"  fill="#F59E0B"/>
        <path   d="M166 74 Q172 69 178 74" fill="#FBBF24"/>
        <circle cx="181" cy="55" r="3.8" fill="#10B981" stroke="white" strokeWidth="1.2"/>
      </g>

      {/* ── Gift box ── */}
      <g className="reb-gift" filter="url(#rebv3-shadow)">
        <rect x="10" y="108" width="38" height="30" rx="6" fill="url(#rebv3-gift)"/>
        <rect x="7"  y="100" width="44" height="12" rx="5" fill="#A78BFA"/>
        <rect x="27" y="100" width="8"  height="38" rx="2.5" fill="rgba(255,255,255,0.26)"/>
        <rect x="7"  y="104" width="44" height="5"  rx="1.5" fill="rgba(255,255,255,0.16)"/>
        <ellipse cx="23" cy="100" rx="7" ry="5" fill="#C4B5FD" transform="rotate(-20 23 100)"/>
        <ellipse cx="44" cy="100" rx="7" ry="5" fill="#C4B5FD" transform="rotate(20 44 100)"/>
        <circle cx="33" cy="100" r="3.8" fill="white"/>
      </g>

      {/* ── Coins ── */}
      <g className="reb-coin-1" filter="url(#rebv3-coin-sh)">
        <circle cx="165" cy="118" r="11" fill="url(#rebv3-coin)"/>
        <circle cx="165" cy="118" r="7.5" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1"/>
        <text x="165" y="122" textAnchor="middle" fontSize="9" fontWeight="800" fill="rgba(255,255,255,0.80)">₹</text>
      </g>
      <g className="reb-coin-2" filter="url(#rebv3-coin-sh)">
        <circle cx="192" cy="98" r="8"  fill="url(#rebv3-coin)"/>
        <circle cx="192" cy="98" r="5.5" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="0.8"/>
        <text x="192" y="101.5" textAnchor="middle" fontSize="7" fontWeight="800" fill="rgba(255,255,255,0.80)">₹</text>
      </g>
      <g className="reb-coin-3" filter="url(#rebv3-coin-sh)">
        <circle cx="28" cy="88" r="9"  fill="url(#rebv3-coin)"/>
        <circle cx="28" cy="88" r="6"  fill="none" stroke="rgba(255,255,255,0.26)" strokeWidth="0.8"/>
        <text x="28" y="91.5" textAnchor="middle" fontSize="8" fontWeight="800" fill="rgba(255,255,255,0.80)">₹</text>
      </g>

      {/* ── QR share card (bottom) ── */}
      <g className="reb-card-bot" filter="url(#rebv3-shadow)">
        <rect x="8" y="148" width="68" height="44" rx="10" fill="url(#rebv3-card)" stroke="rgba(124,58,237,0.10)" strokeWidth="0.8"/>
        <rect x="9" y="149" width="66" height="4" rx="9" fill="rgba(255,255,255,0.55)"/>
        {/* QR blocks */}
        <rect x="15" y="156" width="22" height="22" rx="3" fill="rgba(124,58,237,0.06)" stroke="rgba(124,58,237,0.16)" strokeWidth="0.6"/>
        <rect x="17" y="158" width="6" height="6" rx="1.5" fill="#7C3AED" opacity="0.65"/>
        <rect x="17" y="168" width="6" height="6" rx="1.5" fill="#7C3AED" opacity="0.65"/>
        <rect x="27" y="158" width="6" height="6" rx="1.5" fill="#7C3AED" opacity="0.65"/>
        <rect x="22" y="163" width="4" height="4" rx="1"   fill="#A78BFA" opacity="0.55"/>
        <rect x="27" y="167" width="4" height="4" rx="1"   fill="#7C3AED" opacity="0.50"/>
        {/* label */}
        <rect x="42" y="158" width="28" height="3.5" rx="1.8" fill="rgba(124,58,237,0.20)"/>
        <rect x="42" y="165" width="22" height="3"   rx="1.5" fill="rgba(167,139,250,0.28)"/>
        <rect x="42" y="171" width="26" height="2.5" rx="1.2" fill="rgba(167,139,250,0.18)"/>
        {/* share btn */}
        <rect x="15" y="182" width="54" height="14" rx="7" fill="#7C3AED"/>
        <text x="42" y="192" textAnchor="middle" fontSize="7" fontWeight="700" fill="white">Share Referral</text>
      </g>

      {/* Sparkle */}
      <g className="reb-sparkle">
        <path d="M200 42 L201.5 37 L203 42 L208 43.5 L203 45 L201.5 50 L200 45 L195 43.5 Z"
          fill="#F59E0B" opacity="0.70"/>
      </g>
      <g className="reb-sparkle" style={{animationDelay:'1.2s'}}>
        <path d="M12 75 L13 71 L14 75 L18 76 L14 77 L13 81 L12 77 L8 76 Z"
          fill="#A78BFA" opacity="0.60"/>
      </g>
    </svg>
  </div>
);

/* ── Main Component ── */
const ReferAndEarnBanner = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => { injectStyles(); }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.10 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className={`reb-section${visible ? ' reb-visible' : ''}`}
      aria-labelledby="reb-heading"
    >
      <div className="reb-shell">
        <div className="reb-mesh"/>

        <div className="reb-grid">

          {/* ── LEFT: Text ── */}
          <div>
            {/* Badge */}
            <div className="reb-badge">
              <Gift size={10} strokeWidth={2.5} aria-hidden="true"/>
              <span>Exclusive Referral Program</span>
            </div>

            {/* Heading */}
            <h2
              id="reb-heading"
              style={{
                fontSize: 'clamp(18px, 3.5vw, 24px)',
                fontWeight: 800,
                color: '#1A1A2E',
                letterSpacing: '-0.03em',
                lineHeight: 1.2,
                marginBottom: '8px',
              }}
            >
              Invite Friends &amp; Earn{' '}
              <span style={{
                background: 'linear-gradient(135deg,#7C3AED,#A78BFA)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Rewards
              </span>
            </h2>

            {/* Short description */}
            <p style={{
              fontSize: '13px',
              color: '#6B7280',
              lineHeight: 1.55,
              marginBottom: '18px',
              maxWidth: '380px',
            }}>
              Share your referral code with friends. When they join, both of you get
              exciting rewards and exclusive Samaj benefits instantly.
            </p>

            {/* CTA row */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'nowrap' }}>
              <button
                className="reb-btn-primary"
                onClick={() => navigate('/member/referral')}
                id="reb-refer-now-btn"
                aria-label="Refer Now"
              >
                <Gift size={15} strokeWidth={2.3} aria-hidden="true"/>
                Refer Now
                <ArrowRight size={14} strokeWidth={2.5} aria-hidden="true"/>
              </button>

              <button
                className="reb-btn-secondary"
                onClick={() => navigate('/member/referral')}
                id="reb-learn-more-btn"
                aria-label="Learn More"
              >
                Learn More
                <ChevronRight size={14} strokeWidth={2.5} aria-hidden="true"/>
              </button>
            </div>
          </div>

          {/* ── RIGHT: Illustration ── */}
          <div className="reb-illus-col">
            <ReferIllustration/>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ReferAndEarnBanner;
