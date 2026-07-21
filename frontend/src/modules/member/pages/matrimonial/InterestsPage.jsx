import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Check, X, Heart, MessageCircle, Clock,
  Mail, ShieldCheck, Crown, MapPin, Briefcase,
  BookmarkCheck, Bookmark, TrendingUp, CheckCircle2,
  XCircle, Loader2, RefreshCw
} from 'lucide-react';
import { useInterests } from '../../../../hooks/useInterests';
import { useMatrimonial } from './MatrimonialContext';
import { matrimonialChatService } from '../../../../core/api/matrimonialService';

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ value, label, color, bgColor, icon: Icon }) => (
  <div className={`flex-1 ${bgColor} rounded-2xl p-3.5 flex flex-col items-center border border-white/50 shadow-sm`}>
    <div className="flex items-center gap-1 mb-0.5">
      {Icon && <Icon size={13} className={color} />}
      <span className={`text-[22px] font-black ${color} leading-none`}>{value}</span>
    </div>
    <p className="text-[10px] text-slate-500 font-bold text-center mt-0.5">{label}</p>
  </div>
);

// ─── Interest Card ────────────────────────────────────────────────────────────
const InterestCard = ({ interest, tab, onAccept, onReject, onCancel, onChat, toggleShortlist, isShortlisted, actionLoading }) => {
  const navigate = useNavigate();

  // The "other" profile depends on tab
  const otherProfile = tab === 'Received'
    ? interest.senderProfile
    : interest.receiverProfile;

  if (!otherProfile) return null;

  const profileId  = otherProfile._id;
  const name       = otherProfile.personal?.fullName || 'Unknown';
  const photo      = otherProfile.photos?.find(p => p.isPrimary && p.status === 'approved')?.url
                  || otherProfile.photos?.[0]?.url
                  || null;
  const age        = otherProfile.age;
  const city       = otherProfile.location?.city;
  const profession = otherProfile.education?.occupation || otherProfile.education?.profession;
  const isPremium  = interest.senderSubscription?.isActive || interest.receiverSubscription?.isActive;
  const isVerified = otherProfile.verificationStatus === 'verified';
  const matchScore = interest.matchScore;
  const sentAt     = interest.createdAt ? new Date(interest.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';
  const message    = interest.message;

  return (
    <div className="bg-white rounded-2xl border border-slate-100/70 shadow-sm overflow-hidden mb-3">
      <div className="flex gap-3.5 p-4">
        {/* Photo */}
        <div
          className="w-20 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 cursor-pointer relative shadow-sm"
          onClick={() => navigate(`/member/matrimonial/${profileId}`)}
        >
          {photo ? (
            <img src={photo} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[28px] bg-gradient-to-br from-rose-100 to-pink-100">
              {name?.[0] || '?'}
            </div>
          )}
          {interest.status === 'pending' && tab === 'Received' && (
            <div className="absolute bottom-0 left-0 right-0 h-5 bg-rose-500 flex items-center justify-center">
              <span className="text-[8px] text-white font-black uppercase tracking-wide">New</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0" onClick={() => navigate(`/member/matrimonial/${profileId}`)}>
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <h4 className="text-[14px] font-extrabold text-slate-800 truncate">{name}</h4>
            {isPremium && (
              <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-600 text-[8px] font-black px-1.5 py-0.5 rounded border border-amber-100">
                <Crown size={7} /> Premium
              </span>
            )}
            {isVerified && <ShieldCheck size={13} className="text-emerald-500 shrink-0" />}
          </div>
          <p className="text-[12px] text-slate-600 font-semibold">{age ? `${age} Yrs` : ''}{city ? ` · ${city}` : ''}</p>
          {profession && (
            <div className="flex items-center gap-1 mt-0.5">
              <Briefcase size={10} className="text-slate-400" />
              <span className="text-[11px] text-slate-500 font-medium truncate">{profession}</span>
            </div>
          )}
          {message && (
            <p className="text-[11px] text-slate-500 italic mt-1 truncate">"{message}"</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            {matchScore && (
              <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                {matchScore}% Match
              </span>
            )}
            <span className="text-[9px] text-slate-400 font-semibold">{sentAt}</span>
          </div>
        </div>

        {/* Shortlist */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleShortlist?.(profileId); }}
          className="self-start p-1.5 text-slate-400 active:scale-90"
        >
          {isShortlisted?.(profileId)
            ? <BookmarkCheck size={17} className="text-amber-500" />
            : <Bookmark size={17} />}
        </button>
      </div>

      {/* Actions */}
      {tab === 'Received' && interest.status === 'pending' && (
        <div className="flex gap-2 px-4 pb-4">
          <button onClick={() => onReject(interest._id)} disabled={actionLoading}
            className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform disabled:opacity-50">
            <X size={14} /> Decline
          </button>
          <button onClick={() => onAccept(interest._id)} disabled={actionLoading}
            className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 text-white rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform disabled:opacity-50">
            {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <Check size={14} />} Accept
          </button>
        </div>
      )}

      {tab === 'Sent' && interest.status === 'pending' && (
        <div className="flex items-center justify-between px-4 pb-4">
          <span className="text-rose-500 text-[10px] font-extrabold bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 flex items-center gap-1">
            <Clock size={11} /> Pending Response
          </span>
          <button onClick={() => onCancel(interest._id)} disabled={actionLoading}
            className="text-[11px] text-slate-400 hover:text-red-500 font-bold active:scale-95 disabled:opacity-50">
            Withdraw
          </button>
        </div>
      )}

      {interest.status === 'accepted' && (
        <div className="flex gap-2 px-4 pb-4">
          <button onClick={() => onChat(interest)} disabled={actionLoading}
            className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform">
            <MessageCircle size={14} /> Chat Now
          </button>
        </div>
      )}

      {interest.status === 'rejected' && (
        <div className="px-4 pb-3">
          <span className="text-slate-400 text-[10px] font-bold bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 flex items-center gap-1 w-fit">
            <XCircle size={11} /> Declined
          </span>
        </div>
      )}

      {interest.status === 'cancelled' && (
        <div className="px-4 pb-3">
          <span className="text-slate-400 text-[10px] font-bold bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 flex items-center gap-1 w-fit">
            <XCircle size={11} /> Withdrawn
          </span>
        </div>
      )}
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ tab, navigate }) => {
  const config = {
    Received: { icon: Mail,         color: 'text-rose-400',   msg: 'No interest requests received yet.' },
    Sent:     { icon: TrendingUp,   color: 'text-blue-400',   msg: 'Browse matches and send interests!' },
    Accepted: { icon: CheckCircle2, color: 'text-emerald-400',msg: 'Accept interests to start chatting.' },
    Declined: { icon: XCircle,      color: 'text-slate-400',  msg: 'Declined requests appear here.' },
    Withdrawn:{ icon: XCircle,      color: 'text-slate-400',  msg: 'Withdrawn interests appear here.' },
  }[tab] || { icon: Mail, color: 'text-slate-400', msg: '' };

  const Icon = config.icon;
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
        <Icon size={26} className={config.color} />
      </div>
      <h3 className="text-[14px] font-extrabold text-slate-800 mb-1">No {tab.toLowerCase()} interests</h3>
      <p className="text-[12px] text-slate-400 max-w-[220px] leading-relaxed font-semibold">{config.msg}</p>
      {(tab === 'Sent' || tab === 'Accepted') && (
        <button onClick={() => navigate('/member/matrimonial')}
          className="mt-4 px-6 py-2.5 bg-rose-500 text-white rounded-xl text-[12px] font-bold active:scale-95 transition-transform">
          Browse Matches
        </button>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const InterestsPage = ({ isHub = false }) => {
  const navigate = useNavigate();
  const {
    sent, received, loading, actionLoading,
    fetchSentInterests, fetchReceivedInterests,
    acceptInterest, rejectInterest, cancelInterest
  } = useInterests();

  let matriCtx = null;
  try { matriCtx = useMatrimonial(); } catch {}

  const [activeTab, setActiveTab] = useState('Received');
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const loadAll = useCallback(() => {
    fetchReceivedInterests();
    fetchSentInterests();
  }, [fetchReceivedInterests, fetchSentInterests]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Derived lists by status
  const receivedPending  = received.filter(i => i.status === 'pending');
  const receivedAccepted = received.filter(i => i.status === 'accepted');
  const receivedRejected = received.filter(i => i.status === 'rejected');
  const sentPending      = sent.filter(i => i.status === 'pending');
  const sentAccepted     = sent.filter(i => i.status === 'accepted');
  const sentCancelled    = sent.filter(i => i.status === 'cancelled');

  // Unified accepted list
  const allAccepted = [...receivedAccepted, ...sentAccepted];
  const allDeclined = receivedRejected;
  const allWithdrawn = sentCancelled;

  const getActiveList = () => {
    switch (activeTab) {
      case 'Received': return receivedPending;
      case 'Sent':     return sentPending;
      case 'Accepted': return allAccepted;
      case 'Declined': return allDeclined;
      case 'Withdrawn':return allWithdrawn;
      default: return [];
    }
  };

  const tabs = [
    { id: 'Received', label: `Received`, count: receivedPending.length,  icon: Mail,         color: 'text-rose-500' },
    { id: 'Accepted', label: `Connected`,count: allAccepted.length,       icon: CheckCircle2, color: 'text-emerald-500' },
    { id: 'Sent',     label: `Sent`,      count: sentPending.length,       icon: TrendingUp,   color: 'text-blue-500' },
    { id: 'Declined', label: `Declined`,  count: allDeclined.length,       icon: XCircle,      color: 'text-slate-400' },
    { id: 'Withdrawn',label: `Withdrawn`, count: allWithdrawn.length,      icon: XCircle,      color: 'text-slate-300' },
  ];

  const handleAccept = async (id) => {
    const res = await acceptInterest(id);
    if (res.success) showToast('Interest accepted! You can now chat. 💕');
    else showToast(`Error: ${res.error}`);
  };

  const handleReject = async (id) => {
    const res = await rejectInterest(id);
    if (res.success) showToast('Interest declined.');
    else showToast(`Error: ${res.error}`);
  };

  const handleCancel = async (id) => {
    const res = await cancelInterest(id);
    if (res.success) showToast('Interest withdrawn.');
    else showToast(`Error: ${res.error}`);
  };

  const handleChat = async (interest) => {
    const conversationId = interest.conversationId;
    if (conversationId) {
      navigate(`/member/matrimonial/chat/${conversationId}`);
    } else {
      const otherProfileId = interest.senderProfile?._id || interest.receiverProfile?._id;
      try {
        const res = await matrimonialChatService.openConversation(otherProfileId);
        navigate(`/member/matrimonial/chat/${res.data.data.conversation._id}`);
      } catch (err) {
        showToast('Cannot open chat. Make sure interest is accepted.');
      }
    }
  };

  return (
    <div className={isHub ? 'bg-slate-50 min-h-full pb-20' : 'min-h-screen bg-slate-50 pb-24'}>
      {/* Header */}
      {!isHub && (
        <div className="bg-white border-b border-slate-100 px-4 h-14 flex items-center gap-3 sticky top-0 z-30 shadow-sm">
          <button onClick={() => navigate(-1)} className="p-1 active:opacity-60">
            <ArrowLeft size={22} className="text-slate-800" />
          </button>
          <div className="flex-1">
            <h1 className="text-[17px] font-black text-slate-800 leading-none">Partner Inbox</h1>
            <p className="text-[10px] font-bold text-rose-500 mt-0.5">Manage your connections</p>
          </div>
          <button onClick={loadAll} className="p-2 text-slate-400 active:scale-90">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex gap-2">
          <StatCard value={receivedPending.length}  label="Received"  color="text-rose-500"    bgColor="bg-rose-50"    icon={Heart} />
          <StatCard value={allAccepted.length}       label="Connected" color="text-emerald-500" bgColor="bg-emerald-50" icon={CheckCircle2} />
          <StatCard value={sentPending.length}       label="Pending"   color="text-blue-500"    bgColor="bg-blue-50"    icon={TrendingUp} />
        </div>
      </div>

      {/* Tab Pills */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-[11.5px] font-bold transition-all active:scale-95 shrink-0 flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-white text-slate-500 border border-slate-100'
              }`}>
              <tab.icon size={12} />
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-2">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={32} className="text-rose-400 animate-spin" />
          </div>
        ) : getActiveList().length === 0 ? (
          <EmptyState tab={activeTab} navigate={navigate} />
        ) : (
          <div>
            {/* Batch actions for Received */}
            {activeTab === 'Received' && receivedPending.length > 1 && (
              <div className="flex justify-end gap-2 mb-3">
                <button onClick={() => receivedPending.forEach(i => handleReject(i._id))}
                  className="text-[11px] font-bold text-slate-400 px-3 py-1.5 rounded-lg border border-slate-100">
                  Decline All
                </button>
                <button onClick={() => receivedPending.forEach(i => handleAccept(i._id))}
                  className="text-[11px] font-bold text-emerald-500 px-3 py-1.5 rounded-lg border border-emerald-100 bg-emerald-50">
                  Accept All
                </button>
              </div>
            )}
            {getActiveList().map(interest => (
              <InterestCard
                key={interest._id}
                interest={interest}
                tab={activeTab}
                onAccept={handleAccept}
                onReject={handleReject}
                onCancel={handleCancel}
                onChat={handleChat}
                actionLoading={actionLoading}
                toggleShortlist={matriCtx?.toggleShortlist}
                isShortlisted={matriCtx?.isShortlisted}
              />
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[12px] font-black px-5 py-3 rounded-full shadow-lg z-[60] max-w-[90vw] text-center">
          {toast}
        </div>
      )}
    </div>
  );
};

export default InterestsPage;
