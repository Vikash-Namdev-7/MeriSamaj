import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Star, CheckCircle, Phone, MessageCircle, MapPin, Share2 } from 'lucide-react';
import { useData } from '../../context/DataProvider';
import useProfessionalDirectory from '../../hooks/useProfessionalDirectory';

const ProfessionalDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useData();
  const { listings, isLoading, error } = useProfessionalDirectory(currentUser?.communityId || 'default');

  // Find the specific professional by ID
  const activeProfessional = listings.find(p => p.id === id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm font-bold text-gray-500">Loading Details...</p>
        </div>
      </div>
    );
  }

  if (error || !activeProfessional) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-5 text-center">
        <h2 className="text-xl font-bold text-gray-800">Professional Not Found</h2>
        <p className="text-sm text-gray-500 mt-2">The business you are looking for does not exist or has been removed.</p>
        <button onClick={() => navigate(-1)} className="mt-6 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-full shadow-md active:scale-95 transition-transform">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 flex items-center justify-between px-4 h-14 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 press-scale transition-colors">
            <ArrowLeft size={22} className="text-gray-800" />
          </button>
          <h1 className="text-[17px] font-black text-gray-900 tracking-tight leading-none">Business Profile</h1>
        </div>
        <button 
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: activeProfessional.title,
                text: `Check out ${activeProfessional.title} on Professional Directory`,
                url: window.location.href,
              }).catch(console.error);
            } else {
              alert('Link copied to clipboard!');
            }
          }}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 press-scale"
        >
          <Share2 size={18} />
        </button>
      </div>

      <div className="px-5 pt-6 pb-6 space-y-5 flex-1 max-w-2xl mx-auto w-full">
        
        {/* Main Identity Info */}
        <div className="flex items-start gap-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          {activeProfessional.logo ? (
            <img
              src={activeProfessional.logo}
              alt={activeProfessional.title}
              className="w-16 h-16 rounded-2xl object-cover border border-gray-100 shadow-sm shrink-0"
            />
          ) : (
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm shrink-0 ${activeProfessional.color}`}>
              {activeProfessional.initials}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-[20px] font-black text-gray-900 leading-tight">{activeProfessional.title}</h3>
              {activeProfessional.verified && (
                <CheckCircle size={18} className="text-emerald-500 fill-emerald-50 shrink-0" />
              )}
            </div>
            <p className="text-[13px] font-bold text-indigo-600 mt-1">
              {activeProfessional.category} · {activeProfessional.city}
            </p>
          </div>
        </div>


        {/* Description */}
        {activeProfessional.description && (
          <div className="space-y-2">
            <h4 className="text-[12px] font-black text-gray-400 uppercase tracking-wider">Business Description</h4>
            <p className="text-[14px] text-gray-700 leading-relaxed font-semibold bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
              {activeProfessional.description}
            </p>
          </div>
        )}

        {/* Working Hours & Address */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm space-y-1">
            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Working Hours</h4>
            <p className="text-[13px] font-black text-gray-800 mt-1">09:00 AM - 08:00 PM</p>
            <p className="text-[11px] text-emerald-500 font-black">Open Now</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm space-y-1">
            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Location</h4>
            <p className="text-[13px] font-black text-gray-800 leading-snug truncate mt-1 flex items-center gap-1"><MapPin size={12}/> {activeProfessional.city || 'Indore'}, MP</p>
            <p className="text-[11px] text-gray-500 font-bold">1.2 km away</p>
          </div>
        </div>

        {/* Mobile Number Info */}
        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Contact Number</h4>
            <p className="text-[16px] font-black text-gray-800 mt-1">{activeProfessional.phone}</p>
          </div>
          <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
            Verified
          </span>
        </div>
      </div>

      {/* Fixed Action Buttons at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40 max-w-2xl mx-auto">
        <a
          href={`tel:${activeProfessional.phone}`}
          className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-[14px] font-black text-center shadow-lg shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Phone size={18} />
          Call Now
        </a>
        <button
          onClick={() => {
            navigate(`/member/chat/${activeProfessional.id}`);
          }}
          className="flex-1 py-4 bg-white text-indigo-700 border-2 border-indigo-100 rounded-2xl text-[14px] font-black hover:bg-indigo-50 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <MessageCircle size={18} />
          Message
        </button>
      </div>
    </div>
  );
};

export default ProfessionalDetailPage;
