import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Check, X, Heart, Sparkles, MessageCircle, Phone, Clock, Mail,
  ShieldCheck, Crown, MapPin, Briefcase, GraduationCap, ChevronRight,
  BookmarkCheck, Bookmark, Users, TrendingUp, CheckCircle2, XCircle
} from 'lucide-react';
import { useData } from '../../context/DataProvider';
import { useMatrimonial } from './MatrimonialContext';

// ─── STAT CARD ───
const StatCard = ({ value, label, color, bgColor, icon: Icon }) => (
  <div className={`flex-1 ${bgColor} rounded-2xl p-4 flex flex-col items-center border border-white/50 shadow-[0_2px_8px_rgba(0,0,0,0.02)]`}>
    <div className="flex items-center gap-1.5 mb-1">
      {Icon && <Icon size={14} className={color} />}
      <span className={`text-[24px] font-black ${color} leading-none`}>{value}</span>
    </div>
    <p className="text-[10.5px] text-slate-500 font-bold tracking-tight text-center leading-snug mt-0.5">{label}</p>
  </div>
);

// ─── INTEREST CARD ───
const InterestCard = ({ profile, type, navigate, onAccept, onDecline, onCancel, toggleShortlist, isShortlisted }) => {
  const isBlurred = profile.photoVisibility === 'connections' && !profile.interests?.accepted;

  return (
    <div className="bg-white rounded-2xl border border-slate-100/70 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden mb-3 hover:border-rose-100 transition-all">
      <div className="flex gap-3.5 p-4">
        {/* Photo */}
        <div
          className="w-20 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 cursor-pointer relative shadow-sm border border-slate-100"
          onClick={() => navigate(`/member/matrimonial/${profile.id}`)}
        >
          <img
            src={profile.avatar}
            alt={profile.name}
            className={`w-full h-full object-cover transition-all duration-300 ${isBlurred ? 'blur-md brightness-90' : ''}`}
          />
          {isBlurred && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <span className="text-[8px] bg-black/60 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Private</span>
            </div>
          )}
          {profile.online && (
            <div className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between" onClick={() => navigate(`/member/matrimonial/${profile.id}`)}>
          <div>
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <h4 className="text-[14.5px] font-extrabold text-slate-800 truncate leading-tight">{profile.name}</h4>
              {profile.premiumStatus && (
                <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-600 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-amber-100">
                  <Crown size={8} /> Premium
                </span>
              )}
              {profile.verifiedStatus && <ShieldCheck size={14} className="text-emerald-500 shrink-0" />}
            </div>
            <p className="text-[12.5px] text-slate-600 font-semibold">{profile.age} Yrs · {profile.height} · {profile.gotra} Gotra</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Briefcase size={11} className="text-slate-400" />
              <span className="text-[11.5px] text-slate-500 font-medium truncate">{profile.profession}</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={11} className="text-slate-400" />
              <span className="text-[11.5px] text-slate-500 font-medium truncate">{profile.city}</span>
            </div>
          </div>

          {/* Match Score */}
          {profile.matchScore && (
            <div className="mt-1.5">
              <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                {profile.matchScore}% Match
              </span>
            </div>
          )}
        </div>

        {/* Shortlist */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleShortlist?.(profile.id); }}
          className="self-start p-1.5 text-slate-400 active:scale-90"
        >
          {isShortlisted ? <BookmarkCheck size={18} className="text-amber-500" /> : <Bookmark size={18} />}
        </button>
      </div>

      {/* Action Buttons */}
      {type === 'Received' && (
        <div className="flex gap-2.5 px-4 pb-4">
          <button
            onClick={() => onDecline(profile.id)}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[12.5px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
          >
            <X size={15} /> Decline
          </button>
          <button
            onClick={() => onAccept(profile.id)}
            className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 text-white rounded-xl text-[12.5px] font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-100 active:scale-95 transition-transform"
          >
            <Check size={15} /> Accept Match
          </button>
        </div>
      )}

      {type === 'Sent' && (
        <div className="flex items-center justify-between px-4 pb-4">
          <span className="text-rose-500 text-[11px] font-extrabold bg-rose-50 px-3 py-1.5 rounded-full uppercase tracking-wider border border-rose-100 flex items-center gap-1">
            <Clock size={12} /> Pending
          </span>
          <button
            onClick={() => onCancel(profile.id)}
            className="text-[12px] text-slate-400 hover:text-red-500 font-bold active:scale-95 transition-transform"
          >
            Cancel
          </button>
        </div>
      )}

      {type === 'Accepted' && (
        <div className="flex gap-2.5 px-4 pb-4">
          <button
            onClick={() => navigate(`/member/matrimonial/chat/${profile.id}`)}
            className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-xl text-[12.5px] font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
          >
            <MessageCircle size={15} /> Chat Now
          </button>
          <a
            href="tel:+919876543210"
            className="py-2.5 px-5 bg-gradient-to-r from-emerald-500 to-emerald-400 text-white rounded-xl text-[12.5px] font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
          >
            <Phone size={15} /> Call
          </a>
        </div>
      )}

      {type === 'Declined' && (
        <div className="px-4 pb-4">
          <span className="text-slate-400 text-[11px] font-bold bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 flex items-center gap-1 w-fit">
            <XCircle size={12} /> Declined
          </span>
        </div>
      )}
    </div>
  );
};

// ─── MAIN COMPONENT ───
const InterestsPage = ({ isHub = false }) => {
  const navigate = useNavigate();
  const { matrimonialProfiles, toggleMatrimonialInterest, handleMatrimonialInterestResponse } = useData();

  // Safely try to use MatrimonialContext (may not be available when isHub=true from old code paths)
  let matriContext;
  try { matriContext = useMatrimonial(); } catch { matriContext = null; }

  const [activeTab, setActiveTab] = useState('Received');

  // Categorize profiles
  const received = matrimonialProfiles.filter(p => p.interests?.received && !p.interests?.accepted && !p.interests?.declined);
  const sent = matrimonialProfiles.filter(p => p.interests?.sent && !p.interests?.accepted);
  const accepted = matrimonialProfiles.filter(p => p.interests?.accepted);
  const declined = matrimonialProfiles.filter(p => p.interests?.declined);

  const getActiveList = () => {
    switch (activeTab) {
      case 'Received': return received;
      case 'Sent': return sent;
      case 'Accepted': return accepted;
      case 'Declined': return declined;
      default: return [];
    }
  };

  const tabs = [
    { id: 'Received', label: `Received (${received.length})`, icon: Mail, color: 'text-rose-500' },
    { id: 'Accepted', label: `Connected (${accepted.length})`, icon: CheckCircle2, color: 'text-emerald-500' },
    { id: 'Sent', label: `Sent (${sent.length})`, icon: TrendingUp, color: 'text-blue-500' },
    { id: 'Declined', label: `Declined (${declined.length})`, icon: XCircle, color: 'text-slate-400' },
  ];

  return (
    <div className={isHub ? 'bg-slate-50 min-h-full pb-20' : 'min-h-screen bg-slate-50 pb-24'}>

      {/* Header */}
      {!isHub && (
        <div className="bg-white border-b border-slate-100 px-4 h-14 flex items-center gap-3 sticky top-0 z-30 shadow-sm">
          <button onClick={() => navigate(-1)} className="p-1 active:opacity-60">
            <ArrowLeft size={22} className="text-slate-800" />
          </button>
          <div>
            <h1 className="text-[17px] font-black text-slate-800 leading-none">Partner Inbox</h1>
            <p className="text-[10px] font-bold text-rose-500 mt-0.5">Manage your connections</p>
          </div>
        </div>
      )}

      {/* Stats Dashboard */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex gap-2.5">
          <StatCard value={received.length} label="Received" color="text-rose-500" bgColor="bg-rose-50" icon={Heart} />
          <StatCard value={accepted.length} label="Connected" color="text-emerald-500" bgColor="bg-emerald-50" icon={CheckCircle2} />
          <StatCard value={sent.length} label="Sent" color="text-blue-500" bgColor="bg-blue-50" icon={TrendingUp} />
        </div>
      </div>

      {/* Tab Pills */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide" data-swipe-block="true">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all active:scale-95 shrink-0 flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-white text-slate-500 border border-slate-100 hover:text-slate-700'
              }`}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-3">
        {/* Batch actions for Received */}
        {activeTab === 'Received' && received.length > 1 && (
          <div className="flex items-center justify-end gap-2 mb-3">
            <button
              onClick={() => received.forEach(p => handleMatrimonialInterestResponse(p.id, 'decline'))}
              className="text-[11px] font-bold text-slate-400 hover:text-red-500 px-3 py-1.5 rounded-lg border border-slate-100"
            >
              Decline All
            </button>
            <button
              onClick={() => received.forEach(p => handleMatrimonialInterestResponse(p.id, 'accept'))}
              className="text-[11px] font-bold text-emerald-500 hover:text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-100 bg-emerald-50"
            >
              Accept All
            </button>
          </div>
        )}

        {getActiveList().length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-18 h-18 bg-rose-50 rounded-full flex items-center justify-center mb-4 border border-rose-100">
              {activeTab === 'Received' && <Mail size={28} className="text-rose-400" />}
              {activeTab === 'Sent' && <TrendingUp size={28} className="text-blue-400" />}
              {activeTab === 'Accepted' && <CheckCircle2 size={28} className="text-emerald-400" />}
              {activeTab === 'Declined' && <XCircle size={28} className="text-slate-400" />}
            </div>
            <h3 className="text-[15px] font-extrabold text-slate-800 mb-1">
              No {activeTab.toLowerCase()} requests
            </h3>
            <p className="text-[12.5px] text-slate-400 max-w-[240px] leading-relaxed font-semibold">
              {activeTab === 'Received' && 'When community members express interest, they\'ll appear here.'}
              {activeTab === 'Sent' && 'Browse matches and send interests to start connecting!'}
              {activeTab === 'Accepted' && 'Accept interests to build connections and start chatting.'}
              {activeTab === 'Declined' && 'Declined interests will appear here for your reference.'}
            </p>
            {(activeTab === 'Sent' || activeTab === 'Accepted') && (
              <button
                onClick={() => navigate('/member/matrimonial')}
                className="mt-4 px-6 py-2.5 bg-rose-500 text-white rounded-xl text-[12.5px] font-bold active:scale-95 transition-transform"
              >
                Browse Matches
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-0">
            {getActiveList().map(profile => (
              <InterestCard
                key={profile.id}
                profile={profile}
                type={activeTab}
                navigate={navigate}
                onAccept={() => handleMatrimonialInterestResponse(profile.id, 'accept')}
                onDecline={() => handleMatrimonialInterestResponse(profile.id, 'decline')}
                onCancel={() => toggleMatrimonialInterest(profile.id)}
                toggleShortlist={matriContext?.toggleShortlist}
                isShortlisted={matriContext?.isShortlisted(profile.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterestsPage;
