import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Heart, BookmarkCheck, Trash2, ArrowRight } from 'lucide-react';
import { useMatrimonial } from './MatrimonialContext';
import { useData } from '../../context/DataProvider';

const MatrimonialShortlistPage = () => {
  const navigate = useNavigate();
  const { shortlistedProfiles, toggleShortlist } = useMatrimonial();
  const { toggleMatrimonialInterest } = useData();

  const handleInterest = (id) => {
    toggleMatrimonialInterest(id);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 h-14 flex items-center gap-3 sticky top-0 z-30 shadow-sm shrink-0">
        <button onClick={() => navigate(-1)} className="p-1 active:opacity-60">
          <ArrowLeft size={22} className="text-slate-800" />
        </button>
        <div>
          <h1 className="text-[17px] font-black text-slate-800 leading-none">Shortlisted Profiles</h1>
          <p className="text-[10px] font-bold text-rose-500 mt-0.5">Profiles you saved for later</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {shortlistedProfiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-18 h-18 bg-amber-50 rounded-full flex items-center justify-center mb-4 border border-amber-100">
              <Star size={28} className="text-amber-500 fill-amber-500" />
            </div>
            <h3 className="text-[15.5px] font-black text-slate-850 mb-1">No shortlisted profiles</h3>
            <p className="text-[12.5px] text-slate-400 max-w-[220px] leading-relaxed font-semibold">
              When browsing matches, tap the bookmark icon to save profiles you like here.
            </p>
            <button
              onClick={() => navigate('/member/matrimonial')}
              className="mt-5 px-6 py-2.5 bg-rose-500 text-white rounded-xl text-[13px] font-bold active:scale-95 transition-transform"
            >
              Browse Matches
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {shortlistedProfiles.map(profile => {
              const interestSent = profile.interests?.sent;
              return (
                <div key={profile.id} className="bg-white rounded-2xl border border-slate-100 p-3.5 shadow-sm flex gap-3.5 items-center">
                  {/* Photo */}
                  <div
                    className="w-16 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 cursor-pointer"
                    onClick={() => navigate(`/member/matrimonial/${profile.id}`)}
                  >
                    <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[14.5px] font-extrabold text-slate-800 truncate">{profile.name}, {profile.age}</h4>
                    <p className="text-[12px] text-slate-500 font-semibold mt-0.5">{profile.height} · {profile.gotra} Gotra</p>
                    <p className="text-[11.5px] text-slate-400 font-semibold truncate">{profile.profession} · {profile.city}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleInterest(profile.id)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                        interestSent
                          ? 'bg-rose-50 text-rose-500 border border-rose-100'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      <Heart size={11} fill={interestSent ? 'currentColor' : 'none'} /> {interestSent ? 'Sent' : 'Interest'}
                    </button>
                    <button
                      onClick={() => toggleShortlist(profile.id)}
                      className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-500 text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                    >
                      <Trash2 size={11} /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatrimonialShortlistPage;
