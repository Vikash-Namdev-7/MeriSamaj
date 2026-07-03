import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Heart, Check, Star, Bookmark, BookmarkCheck, ShieldCheck, Crown,
  MapPin, Briefcase, GraduationCap, Users, Home as HomeIcon, Utensils, Eye,
  Lock, ChevronLeft, ChevronRight, MoreVertical, X, MessageCircle, Phone,
  Share2, Flag, Ban, Clock, Cigarette, Wine, Dumbbell, Palette, Moon,
  Sparkles, Image
} from 'lucide-react';
import { useData } from '../../context/DataProvider';
import { useMatrimonial } from './MatrimonialContext';
import MatchScoreBadge from './components/MatchScoreBadge';

const MatrimonialProfilePage = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const { matrimonialProfiles, toggleMatrimonialInterest } = useData();
  const { toggleShortlist, isShortlisted, addToRecentlyViewed, toggleBlock, isBlocked } = useMatrimonial();

  const profile = matrimonialProfiles.find(p => p.id === profileId) || matrimonialProfiles[0];

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const interested = profile?.interests?.sent;
  const isConnected = profile?.interests?.accepted;
  const isPhotoVisible = profile?.photoVisibility === 'all' || isConnected;

  // Track viewed profile
  useEffect(() => {
    if (profile?.id) addToRecentlyViewed(profile.id);
  }, [profile?.id, addToRecentlyViewed]);

  // Simulated interest acceptance listener
  useEffect(() => {
    if (!profile) return;
    const handleAccepted = (e) => {
      if (e.detail.profileId === profile.id) {
        showToast(`${e.detail.name} accepted your interest! Connection established. 💖`);
      }
    };
    window.addEventListener('matrimonialInterestAccepted', handleAccepted);
    return () => window.removeEventListener('matrimonialInterestAccepted', handleAccepted);
  }, [profile]);

  const showToast = (msg) => { setToastMessage(msg); setTimeout(() => setToastMessage(''), 2500); };

  // Scroll lock effect for overlays
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isMenuOpen]);

  const photos = profile?.photos || [profile?.avatar];

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Profile not found</p>
      </div>
    );
  }

  // ─── INFO ROW HELPER ───
  const InfoRow = ({ label, value, icon: Icon }) => (
    <div className="flex items-start gap-3 py-2.5">
      {Icon && <Icon size={15} className="text-rose-400 shrink-0 mt-0.5" />}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-[13px] font-bold text-slate-800 mt-0.5">{value || 'Not specified'}</p>
      </div>
    </div>
  );

  // ─── SECTION CARD HELPER ───
  const SectionCard = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-2xl border border-slate-100/70 shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-4.5 mb-3.5">
      <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-slate-100/60">
        {Icon && <Icon size={16} className="text-rose-500" />}
        <h3 className="text-[13px] font-extrabold text-slate-800 uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-28">

      {/* ─── PHOTO GALLERY ─── */}
      <div className="relative bg-zinc-900">
        {/* Sticky Header Over Photo */}
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pt-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition-transform"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { toggleShortlist(profile.id); showToast(isShortlisted(profile.id) ? 'Removed from shortlist' : 'Added to shortlist ⭐'); }}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition-transform"
            >
              {isShortlisted(profile.id) ? <BookmarkCheck size={18} className="text-amber-400" /> : <Bookmark size={18} />}
            </button>
            <button
              onClick={() => setIsMenuOpen(true)}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition-transform"
            >
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* Photo Carousel */}
        <div className="relative aspect-[3/4] max-h-[480px] overflow-hidden">
          <img
            src={photos[activePhotoIndex] || profile.avatar}
            alt={profile.name}
            className={`w-full h-full object-cover transition-all duration-300 ${
              !isPhotoVisible ? 'blur-2xl brightness-75 scale-105' : ''
            }`}
          />

          {/* Privacy Overlay (Locked connection illustration matching Image) */}
          {!isPhotoVisible && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/40 backdrop-blur-xs z-10">
              <div className="w-18 h-18 bg-white/10 rounded-full flex items-center justify-center border border-white/20 relative mb-4">
                <Image size={30} className="text-white/80" />
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md">
                  <Lock size={14} className="text-slate-800 fill-slate-800" />
                </div>
              </div>
              <p className="text-[14px] text-white font-extrabold px-6 leading-relaxed max-w-[280px]">
                Photo visible only after connection is established
              </p>
            </div>
          )}

          {/* Photo Navigation */}
          {photos.length > 1 && isPhotoVisible && (
            <>
              {activePhotoIndex > 0 && (
                <button
                  onClick={() => setActivePhotoIndex(prev => prev - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-12 bg-black/40 rounded-r-xl flex items-center justify-center text-white active:scale-90 z-20"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              {activePhotoIndex < photos.length - 1 && (
                <button
                  onClick={() => setActivePhotoIndex(prev => prev + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-12 bg-black/40 rounded-l-xl flex items-center justify-center text-white active:scale-90 z-20"
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </>
          )}

          {/* Photo Dot Indicators */}
          {photos.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {photos.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all ${i === activePhotoIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`} />
              ))}
            </div>
          )}

          {/* Bottom Gradient */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-20 pb-5 px-5">
            {/* Badges Row */}
            <div className="flex items-center gap-2 mb-2">
              {profile.premiumStatus && (
                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-400 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  <Crown size={10} /> Premium
                </span>
              )}
              {profile.verifiedStatus && (
                <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  <ShieldCheck size={10} /> Verified
                </span>
              )}
            </div>

            {/* Name & Basic Info */}
            <h1 className="text-white text-[24px] font-black tracking-tight leading-none">
              {profile.name}, {profile.age}
            </h1>
            <p className="text-white/80 text-[13px] font-bold mt-2">{profile.height} · {profile.gotra} Gotra · {profile.profession}</p>
            <div className="flex items-center gap-1 mt-1.5">
              <MapPin size={12} className="text-white/60" />
              <span className="text-white/65 text-[12px] font-semibold">{profile.city}, {profile.state}</span>
            </div>

            {/* Status + Match Score */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                {profile.online ? (
                  <div className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-400/25 px-2.5 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-wide">Online</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-white/10 border border-white/15 px-2.5 py-1 rounded-full">
                    <Clock size={10} className="text-white/60" />
                    <span className="text-[9px] text-white/60 font-bold">{profile.lastActive}</span>
                  </div>
                )}
                <span className="text-[10px] text-white/40 font-semibold">Joined {profile.joinedDate}</span>
              </div>
              <MatchScoreBadge score={profile.matchScore || 75} size={48} strokeWidth={3.5} />
            </div>
          </div>
        </div>
      </div>

      {/* ─── PROFILE CONTENT ─── */}
      <div className="px-4 mt-4">

        {/* About Section */}
        <SectionCard title="About" icon={Sparkles}>
          <p className="text-[13px] text-slate-650 leading-relaxed font-bold">
            "{profile.about || 'Looking for a compatible life partner with shared family values.'}"
          </p>
          {profile.hobbies?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {profile.hobbies.map((h, i) => (
                <span key={i} className="bg-rose-50 text-rose-600 text-[10.5px] font-bold px-2.5 py-1 rounded-full border border-rose-100">
                  {h}
                </span>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Basic Details */}
        <SectionCard title="Basic Details" icon={Users}>
          <div className="grid grid-cols-2 gap-x-4">
            <InfoRow label="Height" value={profile.height} />
            <InfoRow label="Weight" value={profile.weight} />
            <InfoRow label="Body Type" value={profile.bodyType} />
            <InfoRow label="Complexion" value={profile.complexion} />
            <InfoRow label="Blood Group" value={profile.bloodGroup} />
            <InfoRow label="Marital Status" value={profile.maritalStatus} />
            <InfoRow label="Mother Tongue" value={profile.motherTongue} />
          </div>
        </SectionCard>

        {/* Locked Detail Sections or Full Details */}
        {isPhotoVisible ? (
          <>
            {/* Religious Background */}
            <SectionCard title="Religious Background" icon={Moon}>
              <div className="grid grid-cols-2 gap-x-4">
                <InfoRow label="Community" value={profile.community} />
                <InfoRow label="Gotra" value={profile.gotra} />
                <InfoRow label="Manglik" value={profile.manglik} />
                <InfoRow label="Star (Nakshatra)" value={profile.star} />
                <InfoRow label="Rashi" value={profile.rashi} />
              </div>
            </SectionCard>

            {/* Education & Career */}
            <SectionCard title="Education & Career" icon={GraduationCap}>
              <div className="space-y-0">
                <InfoRow label="Education" value={profile.education} icon={GraduationCap} />
                <InfoRow label="College/University" value={profile.college} />
                <InfoRow label="Profession" value={profile.profession} icon={Briefcase} />
                <InfoRow label="Company" value={profile.company} />
                <InfoRow label="Annual Income" value={profile.annualIncome} />
              </div>
            </SectionCard>

            {/* Family Details */}
            <SectionCard title="Family Details" icon={HomeIcon}>
              <div className="grid grid-cols-2 gap-x-4">
                <InfoRow label="Father's Occupation" value={profile.fatherOccupation} />
                <InfoRow label="Mother's Occupation" value={profile.motherOccupation} />
                <InfoRow label="Brothers" value={profile.brothers} />
                <InfoRow label="Sisters" value={profile.sisters} />
                <InfoRow label="Family Type" value={profile.familyType} />
                <InfoRow label="Family Values" value={profile.familyValues} />
                <InfoRow label="Family Affluence" value={profile.familyAffluence} />
              </div>
            </SectionCard>

            {/* Lifestyle */}
            <SectionCard title="Lifestyle" icon={Palette}>
              <div className="grid grid-cols-2 gap-x-4">
                <InfoRow label="Diet" value={profile.diet} icon={Utensils} />
                <InfoRow label="Smoking" value={profile.smoking} icon={Cigarette} />
                <InfoRow label="Drinking" value={profile.drinking} icon={Wine} />
              </div>
            </SectionCard>

            {/* Partner Preferences */}
            {profile.partnerPreferences && (
              <SectionCard title="Partner Preferences" icon={Heart}>
                <div className="grid grid-cols-2 gap-x-4">
                  <InfoRow label="Age Range" value={profile.partnerPreferences.ageRange} />
                  <InfoRow label="Height Range" value={profile.partnerPreferences.heightRange} />
                  <InfoRow label="Education" value={profile.partnerPreferences.education} />
                  <InfoRow label="Profession" value={profile.partnerPreferences.profession} />
                  <InfoRow label="Location" value={profile.partnerPreferences.location} />
                  <InfoRow label="Diet" value={profile.partnerPreferences.diet} />
                  <InfoRow label="Manglik" value={profile.partnerPreferences.manglik} />
                </div>
              </SectionCard>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center shadow-[0_2px_12px_rgba(0,0,0,0.03)] mb-4">
            <Lock size={20} className="text-slate-400 mx-auto mb-2" />
            <p className="text-[12.5px] font-black text-slate-800">Additional Profile Details Locked</p>
            <p className="text-[11.5px] text-slate-400 mt-1 font-semibold leading-relaxed">
              Send an interest request to this profile. Family, horoscope, and lifestyle details will automatically unlock once she accepts your interest request.
            </p>
          </div>
        )}
      </div>

      {/* ─── FIXED BOTTOM ACTION BAR ─── */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 p-3 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)' }}>
        <div className="flex items-center gap-2.5">
          {/* Skip */}
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 active:scale-90 transition-transform"
          >
            <X size={22} />
          </button>

          {/* Shortlist */}
          <button
            onClick={() => { toggleShortlist(profile.id); showToast(isShortlisted(profile.id) ? 'Removed' : 'Shortlisted ⭐'); }}
            className={`w-12 h-12 rounded-xl flex items-center justify-center active:scale-90 transition-transform ${
              isShortlisted(profile.id) ? 'bg-amber-100 text-amber-500 border border-amber-200' : 'bg-amber-50 text-amber-400 border border-amber-100'
            }`}
          >
            <Star size={22} fill={isShortlisted(profile.id) ? 'currentColor' : 'none'} />
          </button>

          {/* Express Interest / Connected */}
          <button
            onClick={() => {
              if (isConnected) {
                navigate(`/member/matrimonial/chat/${profile.id}`);
              } else {
                toggleMatrimonialInterest(profile.id);
                showToast(interested ? 'Interest withdrawn' : 'Interest sent! 💕');
              }
            }}
            className={`flex-1 py-3.5 rounded-xl text-[14px] font-extrabold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all ${
              isConnected
                ? 'bg-emerald-500 text-white'
                : interested
                ? 'bg-rose-100 text-rose-500 border border-rose-200'
                : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-rose-200'
            }`}
          >
            {isConnected ? (
              <><MessageCircle size={18} /> Chat Now</>
            ) : interested ? (
              <><Check size={18} strokeWidth={3} /> Interest Sent</>
            ) : (
              <><Heart size={18} fill="currentColor" /> Express Interest</>
            )}
          </button>

          {/* Call (only if connected) */}
          {isConnected && (
            <a
              href="tel:+919876543210"
              className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-500 active:scale-90 transition-transform"
            >
              <Phone size={22} />
            </a>
          )}
        </div>
      </div>

      {/* ─── 3-DOT MENU ─── */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center animate-fade-in" data-swipe-block="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsMenuOpen(false)} />
          <div className="bg-white w-full rounded-t-[28px] p-5 pb-safe z-50 relative shadow-2xl max-w-md animate-slide-up">
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
            <h3 className="text-[15px] font-black text-slate-800 text-center mb-5">Profile Options</h3>
            <div className="space-y-2.5 mb-5">
              <button
                onClick={() => { toggleShortlist(profile.id); showToast(isShortlisted(profile.id) ? 'Removed from shortlist' : 'Shortlisted!'); setIsMenuOpen(false); }}
                className="w-full py-3 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl text-[13.5px] font-bold flex items-center justify-center gap-2"
              >
                {isShortlisted(profile.id) ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                {isShortlisted(profile.id) ? 'Remove from Shortlist' : 'Shortlist Profile'}
              </button>
              <button className="w-full py-3 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl text-[13.5px] font-bold flex items-center justify-center gap-2">
                <Share2 size={16} /> Share Profile
              </button>
              <button
                onClick={() => { toggleBlock(profile.id); showToast(isBlocked(profile.id) ? 'Unblocked' : 'Profile blocked'); setIsMenuOpen(false); }}
                className="w-full py-3 bg-slate-50 text-red-500 hover:bg-red-50 rounded-xl text-[13.5px] font-bold flex items-center justify-center gap-2"
              >
                <Ban size={16} /> {isBlocked(profile.id) ? 'Unblock Profile' : 'Block Profile'}
              </button>
              <button
                onClick={() => { showToast('Profile reported'); setIsMenuOpen(false); }}
                className="w-full py-3 bg-slate-50 text-red-500 hover:bg-red-50 rounded-xl text-[13.5px] font-bold flex items-center justify-center gap-2"
              >
                <Flag size={16} /> Report Abuse / Fake Profile
              </button>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-[13.5px] font-bold active:scale-95 transition-transform"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ─── TOAST ─── */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm text-white text-[12.5px] font-black px-5 py-3 rounded-full shadow-lg z-[60] animate-bounce-in border border-white/10">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default MatrimonialProfilePage;
