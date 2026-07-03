import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Share2, Gift, UserPlus, Coins, ChevronRight, CheckCircle2, Trophy, Medal, Star, Target } from 'lucide-react';
import { useReferral } from './ReferralContext';

const ReferralDashboardPage = () => {
  const navigate = useNavigate();
  const { referralCode, totalReferrals, successfulReferrals, currentLevel, nextLevel, unlockedBadges, monthlyRank } = useReferral();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Join MeriSamaj',
      text: `Use my referral code ${referralCode} to get 10% OFF on your first purchase and exclusive benefits!`,
      url: `https://app.merisamaj.com/register?ref=${referralCode}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      handleCopy();
      alert('Referral link copied to clipboard!');
    }
  };

  return (
    <div className="bg-[#F8F7FC] min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white px-5 h-16 flex items-center border-b border-gray-150/40 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-slate-800 active:scale-95 transition-transform">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-[17px] font-black text-slate-800 ml-3">Refer & Earn</h1>
      </div>

      <div className="p-5 space-y-6">
        
        {/* Main Card */}
        <div className="relative rounded-[24px] overflow-hidden shadow-[0_12px_40px_rgba(76,29,149,0.25)] bg-gradient-to-br from-[#1E1B4B] via-[#3B0764] to-[#4C1D95] border border-purple-400/20">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/30 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 blur-[40px] rounded-full -translate-x-1/2 translate-y-1/2" />
          
          <div className="relative z-10 p-6 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-4 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
              <Gift size={32} className="text-white drop-shadow-md" />
            </div>
            <h2 className="text-white text-2xl font-black text-center leading-tight mb-2">Invite Friends &<br/>Earn Rewards</h2>
            <p className="text-purple-100/90 text-[13px] font-medium text-center mb-8 px-2 leading-relaxed">Share your code and get exclusive benefits for every successful signup.</p>
            
            {/* Code Box */}
            <div className="w-full bg-white rounded-2xl p-4 shadow-lg shadow-purple-900/5 border border-purple-50">
              <p className="text-[11px] font-bold text-gray-400 uppercase text-center tracking-wider mb-2">Your Referral Code</p>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-1 pl-4">
                <span className="text-lg font-black text-brand-primary tracking-widest">{referralCode}</span>
                <button 
                  onClick={handleCopy}
                  className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 active:scale-95 transition-transform"
                >
                  {copied ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
                </button>
              </div>
              
              <button 
                onClick={handleShare}
                className="w-full mt-3 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-400 text-white rounded-xl text-[14px] font-bold shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <Share2 size={18} /> Share Now
              </button>
            </div>
          </div>
        </div>



        {/* ─── GAMIFICATION: BADGES ─── */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100/80">
          <h3 className="text-[14px] font-black text-slate-800 mb-4 flex items-center gap-2">
            <Medal size={16} className="text-amber-500" /> My Badges
          </h3>
          <div className="flex overflow-x-auto gap-3 pb-2 snap-x hide-scrollbar">
            {unlockedBadges.map(badge => (
              <div key={badge.id} className="snap-start shrink-0 w-24 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100/60 rounded-2xl p-3 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-10 h-10 bg-amber-200/20 blur-xl rounded-full" />
                <span className="text-2xl mb-2 drop-shadow-sm">{badge.icon}</span>
                <span className="text-[10px] font-black text-amber-900 leading-tight">{badge.name}</span>
              </div>
            ))}
            <div className="snap-start shrink-0 w-24 bg-slate-50 border border-slate-100 border-dashed rounded-2xl p-3 flex flex-col items-center justify-center text-center">
              <Target size={20} className="text-slate-300 mb-2" />
              <span className="text-[9px] font-bold text-slate-400">Unlock More</span>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100/50">
          <h3 className="text-[15px] font-black text-slate-800 mb-5">How it Works?</h3>
          
          <div className="space-y-6 relative">
            <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-purple-100 to-transparent" />
            
            <div className="flex gap-4 relative z-10">
              <div className="w-10 h-10 rounded-full bg-purple-50 border-2 border-white flex items-center justify-center shrink-0 shadow-sm">
                <Share2 size={18} className="text-brand-primary" />
              </div>
              <div>
                <h4 className="text-[13.5px] font-bold text-slate-800 mb-0.5">Share your referral code</h4>
                <p className="text-[12px] font-medium text-slate-500 leading-snug">Share with your friends and family via WhatsApp or any social media.</p>
              </div>
            </div>
            
            <div className="flex gap-4 relative z-10">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border-2 border-white flex items-center justify-center shrink-0 shadow-sm">
                <UserPlus size={18} className="text-emerald-500" />
              </div>
              <div>
                <h4 className="text-[13.5px] font-bold text-slate-800 mb-0.5">They sign up</h4>
                <p className="text-[12px] font-medium text-slate-500 leading-snug">When they register using your code, they get instant benefits.</p>
              </div>
            </div>

            <div className="flex gap-4 relative z-10">
              <div className="w-10 h-10 rounded-full bg-amber-50 border-2 border-white flex items-center justify-center shrink-0 shadow-sm">
                <Coins size={18} className="text-amber-500" />
              </div>
              <div>
                <h4 className="text-[13.5px] font-bold text-slate-800 mb-0.5">You earn points</h4>
                <p className="text-[12px] font-medium text-slate-500 leading-snug">You receive points for every successful registration and purchase.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Link */}
        <button 
          onClick={() => navigate('/member/referral/earnings')}
          className="w-full bg-white rounded-[20px] p-4 flex items-center justify-between shadow-sm border border-gray-100/50 active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-primary to-purple-500 text-white flex items-center justify-center shadow-md shadow-brand-primary/20">
              <Coins size={22} />
            </div>
            <div className="text-left">
              <h4 className="text-[14px] font-black text-slate-800">My Earnings Dashboard</h4>
              <p className="text-[11.5px] font-semibold text-brand-primary mt-0.5">Check your points & redeem</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
            <ChevronRight size={18} />
          </div>
        </button>

      </div>
    </div>
  );
};

export default ReferralDashboardPage;
