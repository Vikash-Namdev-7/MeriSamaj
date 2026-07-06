import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Share2, MapPin, Calendar, Clock, Heart, Users, Check, X, Phone } from 'lucide-react';
import { useData } from '../../context/DataProvider';
import { Avatar } from '../../components/common/Avatar';

export default function NimantranDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invitations, currentUser, members, updateInvitationRSVP } = useData();
  
  const inv = invitations.find(i => i.id === id);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!inv) return;

    const eventDate = new Date(inv.date);
    eventDate.setHours(12, 0, 0, 0); // Approx time

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = eventDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [inv]);

  if (!inv) return <div className="p-10 text-center">Invitation not found.</div>;

  const currentRSVP = (inv.rsvps || []).find(r => r.memberId === currentUser.id)?.status;

  const handleRSVP = (status) => {
    updateInvitationRSVP(inv.id, status);
  };

  const rsvpMembers = (inv.rsvps || []).map(r => {
    const m = members.find(mem => mem.id === r.memberId);
    return m ? { ...m, status: r.status } : null;
  }).filter(Boolean);

  const displayTitle = inv.title || `Wedding of ${inv.groomName} & ${inv.brideName}`;
  const displayHost = inv.hostName || inv.familyName;
  const images = inv.images || (inv.image ? [inv.image] : []);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${displayTitle} - Invitation`,
          text: 'You are cordially invited.',
          url: window.location.href,
        });
      } else {
        alert('Sharing is not supported on this browser.');
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  // Build schedule list dynamically based on availability
  const hasGroomBride = inv.groomName && inv.brideName && !inv.title;
  const scheduleItems = [];
  if (hasGroomBride) {
    if (inv.timeFood) scheduleItems.push({ label: 'Reception', value: inv.timeFood });
    if (inv.timeBaraat) scheduleItems.push({ label: 'Baraat', value: inv.timeBaraat });
    if (inv.timePhere) scheduleItems.push({ label: 'Phere', value: inv.timePhere });
  } else {
    if (inv.timeFood) scheduleItems.push({ label: 'Feast Time', value: inv.timeFood });
    if (inv.timeProgram || inv.timeBaraat) scheduleItems.push({ label: 'Program Time', value: inv.timeProgram || inv.timeBaraat });
    if (inv.timeOther || inv.timePhere) scheduleItems.push({ label: 'Other Time', value: inv.timeOther || inv.timePhere });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 h-14 flex items-center justify-between sticky top-0 z-30 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-[17px] font-bold text-slate-800">Invitation Details</h1>
        </div>
        <button onClick={handleShare} className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors">
          <Share2 size={20} />
        </button>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4 max-w-2xl mx-auto w-full">
        {/* Full Card Visual */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
          <div className="relative overflow-hidden flex flex-col items-center justify-center text-center">
            {images.length > 0 ? (
              <div className="relative w-full h-72 overflow-hidden bg-slate-100 flex items-center justify-center group">
                <img src={images[currentImgIndex]} alt="Invitation Event Card" className="w-full h-full object-cover" />
                
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setCurrentImgIndex(prev => (prev - 1 + images.length) % images.length); }} 
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-black/60 transition-colors text-lg"
                    >
                      ‹
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setCurrentImgIndex(prev => (prev + 1) % images.length); }} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-black/60 transition-colors text-lg"
                    >
                      ›
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, idx) => (
                        <div 
                          key={idx} 
                          className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImgIndex ? 'bg-white w-3' : 'bg-white/50'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="p-8 w-full min-h-[220px] flex flex-col items-center justify-center relative bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-inner">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }} />
                
                {hasGroomBride ? (
                  <>
                    <h3 className="text-white/80 font-bold text-[14px] mb-4 tracking-widest relative z-10 uppercase">Wedding Invitation</h3>
                    <div className="flex flex-col items-center justify-center gap-2 mb-4 relative z-10">
                      <span className="text-3xl font-black">{inv.groomName}</span>
                      <div className="my-1">
                        <Heart size={20} className="text-rose-400 fill-rose-400" />
                      </div>
                      <span className="text-3xl font-black">{inv.brideName}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-black leading-snug max-w-[85%] relative z-10 drop-shadow-sm">{displayTitle}</h3>
                    <p className="text-[13px] opacity-90 font-bold mt-2 z-10 uppercase tracking-wide">{displayHost}</p>
                  </>
                )}
                
                <p className="text-white/70 text-[13px] font-medium mt-4 z-10 border-t border-white/20 pt-2 px-8">- Cordially Invited -</p>
              </div>
            )}
          </div>
          
          <div className="bg-white p-5 border-t border-slate-100">
            <h4 className="text-center font-bold text-slate-700 text-[13px] mb-4">Time Remaining</h4>
            <div className="flex items-center justify-center gap-3">
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Mins', value: timeLeft.minutes },
                { label: 'Secs', value: timeLeft.seconds }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-700 font-black text-xl mb-1 border border-indigo-100/50 shadow-inner">
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="bg-[#F8F9FB] p-5 rounded-3xl border border-slate-200 shadow-sm">
          <h4 className="font-bold text-slate-800 text-[15px] mb-4 border-b border-slate-200/60 pb-2">Main Event Details</h4>
          
          <div className="space-y-3.5">
            {/* Date */}
            <div className="flex items-start gap-3">
              <Calendar size={16} className="text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
                <p className="font-bold text-slate-800 text-[14px]">{new Date(inv.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
              </div>
            </div>
            
            {/* Time */}
            {scheduleItems.length > 0 && (
              <div className="flex items-start gap-3 pt-3 border-t border-slate-200/50">
                <Clock size={16} className="text-indigo-600 mt-0.5 shrink-0" />
                <div className="w-full">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Schedule</p>
                  <div className="grid grid-cols-2 gap-y-1.5 mt-1 text-[13px]">
                    {scheduleItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-24 text-slate-500 font-semibold">{item.label}:</span> 
                        <span className="font-bold text-slate-800">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Location */}
            <div className="flex items-start gap-3 pt-3 border-t border-slate-200/50">
              <MapPin size={16} className="text-indigo-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Venue</p>
                <p className="font-bold text-slate-800 text-[14px] leading-snug">{inv.location}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 mt-6">
            {inv.mapLink && (
              <a href={inv.mapLink} target="_blank" rel="noreferrer" className="flex-1 py-2.5 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center gap-1.5 font-bold text-[12px] hover:bg-blue-200 transition-colors">
                <MapPin size={14} /> Directions
              </a>
            )}
            <a href={`tel:${inv.contact}`} className="flex-1 py-2.5 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center gap-1.5 font-bold text-[12px] hover:bg-emerald-200 transition-colors">
              <Phone size={14} /> Call
            </a>
            <button onClick={handleShare} className="flex-1 py-2.5 bg-rose-100 text-rose-700 rounded-xl flex items-center justify-center gap-1.5 font-bold text-[12px] hover:bg-rose-200 transition-colors">
              <Share2 size={14} /> Share
            </button>
          </div>
        </div>

        {/* RSVP Section */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
          <h4 className="font-bold text-slate-800 text-[15px] mb-4">RSVP (Attendance)</h4>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => handleRSVP('attending')}
              className={`w-full py-3.5 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-all border-2 ${
                currentRSVP === 'attending' 
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-md' 
                  : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'
              }`}
            >
              I am Attending
            </button>
            <div className="flex gap-3">
              <button 
                onClick={() => handleRSVP('attending_family')}
                className={`flex-1 py-3 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all border-2 ${
                  currentRSVP === 'attending_family' 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                    : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200'
                }`}
              >
                With Family
              </button>
              <button 
                onClick={() => handleRSVP('not_attending')}
                className={`flex-1 py-3 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all border-2 ${
                  currentRSVP === 'not_attending' 
                    ? 'border-slate-400 bg-slate-100 text-slate-700' 
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                Declined
              </button>
            </div>
          </div>

          {/* RSVP Members List */}
          {rsvpMembers.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-[13px] font-bold text-slate-600">
                Total {inv.rsvps.length} person(s) RSVP'd
              </p>
              <div className="flex -space-x-2">
                {rsvpMembers.slice(0, 4).map((member, i) => (
                  <div key={member.id} className="relative w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden z-10" style={{ zIndex: 10 - i }}>
                     <Avatar initials={member.initials} size="sm" imageUrl={member.avatar} />
                  </div>
                ))}
                {rsvpMembers.length > 4 && (
                  <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-bold text-slate-600 z-0 relative">
                    +{rsvpMembers.length - 4}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
