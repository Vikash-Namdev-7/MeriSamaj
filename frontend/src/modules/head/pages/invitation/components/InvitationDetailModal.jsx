import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Clock, Phone, Heart, Users } from 'lucide-react';
import { useData } from '../../../../member/context/DataProvider';
import { Avatar } from '../../../../member/components/common/Avatar';

export default function InvitationDetailModal({ isOpen, onClose, invitation }) {
  const { members, invitationFormConfig } = useData();
  const [activeTab, setActiveTab] = useState('attending');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!invitation) return;

    const eventDate = new Date(invitation.date);
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
  }, [invitation, isOpen]);

  if (!isOpen || !invitation) return null;

  const displayTitle = invitation.title || `Wedding: ${invitation.groomName} & ${invitation.brideName}`;
  const displayHost = invitation.hostName || invitation.familyName;
  const images = invitation.images || (invitation.image ? [invitation.image] : []);

  // Build schedule list dynamically based on availability
  const hasGroomBride = invitation.groomName && invitation.brideName;
  const scheduleItems = [];
  if (hasGroomBride && !invitation.title) {
    if (invitation.timeFood && invitationFormConfig?.enableFeastTime !== false) scheduleItems.push({ label: 'Reception Time', value: invitation.timeFood });
    if (invitation.timeBaraat && invitationFormConfig?.enableProgramTime !== false) scheduleItems.push({ label: 'Baraat Time', value: invitation.timeBaraat });
    if (invitation.timePhere && invitationFormConfig?.enableProgramTime !== false) scheduleItems.push({ label: 'Phere Time', value: invitation.timePhere });
  } else {
    if (invitation.timeFood && invitationFormConfig?.enableFeastTime !== false) scheduleItems.push({ label: 'Feast Time', value: invitation.timeFood });
    if ((invitation.timeProgram || invitation.timeBaraat) && invitationFormConfig?.enableProgramTime !== false) scheduleItems.push({ label: 'Program Time', value: invitation.timeProgram || invitation.timeBaraat });
    if ((invitation.timeOther || invitation.timePhere) && invitationFormConfig?.enableProgramTime !== false) scheduleItems.push({ label: 'Other Time', value: invitation.timeOther || invitation.timePhere });
  }

  // RSVP Processing
  const rsvpMembers = (invitation.rsvps || []).map(r => {
    const m = members.find(mem => mem.id === r.memberId);
    return m ? { ...m, status: r.status } : null;
  }).filter(Boolean);

  const attendingList = rsvpMembers.filter(m => m.status === 'attending');
  const familyList = rsvpMembers.filter(m => m.status === 'attending_family');
  const declinedList = rsvpMembers.filter(m => m.status === 'not_attending');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-[17px] font-black text-slate-800">
              Invitation Details Card
            </h2>
            <p className="text-[12px] font-semibold text-slate-500 mt-0.5">
              Detailed breakdown of event details and RSVPs
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-rose-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Column 1: Details */}
            <div className="space-y-5">
              
              {/* Event Card Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-md">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }} />
                
                {images.length > 0 ? (
                  <div className="absolute inset-0 w-full h-full">
                    <img src={images[0]} alt="Event Banner" className="w-full h-full object-cover opacity-35" />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-900/60 to-indigo-900/60" />
                  </div>
                ) : null}

                <div className="relative z-10">
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 px-2 py-0.5 rounded-md">
                    Event Card
                  </span>
                  <h3 className="text-xl font-extrabold mt-3 tracking-wide leading-tight drop-shadow-sm">
                    {displayTitle}
                  </h3>
                  <p className="text-[13px] font-semibold opacity-90 mt-1 uppercase tracking-wide">
                    By: {displayHost}
                  </p>
                  {invitationFormConfig?.enableMessage !== false && (
                    <p className="text-[12px] opacity-75 mt-3 border-t border-white/20 pt-2 italic">
                      "{invitation.message || 'You are cordially invited.'}"
                    </p>
                  )}
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm text-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Time Remaining</p>
                <div className="flex items-center justify-center gap-3">
                  {[
                    { label: 'Days', value: timeLeft.days },
                    { label: 'Hours', value: timeLeft.hours },
                    { label: 'Mins', value: timeLeft.minutes },
                    { label: 'Secs', value: timeLeft.seconds }
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 font-extrabold text-[16px] mb-0.5 border border-indigo-100/30 shadow-sm">
                        {String(item.value).padStart(2, '0')}
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Event Information List */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-800 text-[14px] border-b border-slate-100 pb-2">Event Information</h4>
                
                <div className="space-y-3.5 text-[13px]">
                  {/* Date */}
                  <div className="flex items-start gap-3">
                    <Calendar size={16} className="text-indigo-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
                      <p className="font-bold text-slate-800">{new Date(invitation.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
                    </div>
                  </div>

                  {/* Groom & Bride Details (if wedding) */}
                  {hasGroomBride && (
                    <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                      <Users size={16} className="text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Groom & Bride</p>
                        <p className="font-bold text-slate-800">{invitation.groomName} & {invitation.brideName}</p>
                      </div>
                    </div>
                  )}

                  {/* Schedule Timings */}
                  {scheduleItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 pt-3 border-t border-slate-100">
                      <Clock size={16} className="text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                        <p className="font-bold text-slate-800">{item.value}</p>
                      </div>
                    </div>
                  ))}

                  {/* Venue */}
                  <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                    <MapPin size={16} className="text-indigo-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Venue</p>
                      <p className="font-bold text-slate-800 leading-snug">{invitation.location}</p>
                    </div>
                  </div>

                  {/* Contact Number */}
                  {invitation.contact && invitationFormConfig?.enableContact !== false && (
                    <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                      <Phone size={16} className="text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Number</p>
                        <p className="font-bold text-slate-800">{invitation.contact}</p>
                      </div>
                    </div>
                  )}

                  {/* Custom Fields */}
                  {invitationFormConfig?.customFields && invitationFormConfig.customFields.map(field => {
                    const val = invitation.customFields?.[field.id];
                    if (!val) return null;
                    return (
                      <div key={field.id} className="flex items-start gap-3 pt-3 border-t border-slate-100">
                        <div className="w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[8px] font-bold text-indigo-700">{field.label.substring(0, 1).toUpperCase()}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{field.label}</p>
                          <p className="font-bold text-slate-800 whitespace-pre-wrap leading-snug">{val}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Directions Button */}
                {invitation.mapLink && invitationFormConfig?.enableMapLink !== false && (
                  <a 
                    href={invitation.mapLink} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center gap-1.5 font-bold text-[12px] transition-colors border border-indigo-150"
                  >
                    <MapPin size={14} /> View Map Directions
                  </a>
                )}
              </div>

            </div>
            
            {/* Column 2: RSVPs */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col min-h-[350px]">
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3 shrink-0">
                <div>
                  <h4 className="font-bold text-slate-800 text-[14px]">RSVP Responses</h4>
                  <p className="text-[11px] text-slate-500 font-semibold">Track invitation RSVPs</p>
                </div>
                <span className="text-[11px] bg-indigo-100 text-indigo-800 font-bold px-2.5 py-0.5 rounded-lg">
                  Total: {rsvpMembers.length}
                </span>
              </div>

              {/* Metric Tabs */}
              <div className="grid grid-cols-3 gap-2 mb-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('attending')}
                  className={`flex flex-col items-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                    activeTab === 'attending'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold shadow-sm'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-350'
                  }`}
                >
                  <span className="text-[16px] font-black">{attendingList.length}</span>
                  <span className="text-[9px] uppercase tracking-wide">Attending</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setActiveTab('attending_family')}
                  className={`flex flex-col items-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                    activeTab === 'attending_family'
                      ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold shadow-sm'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-350'
                  }`}
                >
                  <span className="text-[16px] font-black">{familyList.length}</span>
                  <span className="text-[9px] uppercase tracking-wide">With Family</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('not_attending')}
                  className={`flex flex-col items-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                    activeTab === 'not_attending'
                      ? 'border-slate-500 bg-slate-100 text-slate-700 font-bold shadow-sm'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-350'
                  }`}
                >
                  <span className="text-[16px] font-black">{declinedList.length}</span>
                  <span className="text-[9px] uppercase tracking-wide">Declined</span>
                </button>
              </div>

              {/* RSVP List Area */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[500px] custom-scrollbar">
                
                {activeTab === 'attending' && (
                  attendingList.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-[12px] bg-white rounded-2xl border border-dashed border-slate-200">
                      No members attending yet.
                    </div>
                  ) : (
                    attendingList.map(member => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-slate-200 transition-all">
                        <div className="flex items-center gap-3">
                          <Avatar initials={member.initials} size="md" imageUrl={member.avatar} />
                          <div>
                            <h4 className="text-[12px] font-bold text-slate-800 leading-tight">{member.name}</h4>
                            <p className="text-[10px] text-slate-500 font-semibold">{member.profession} • {member.city}</p>
                          </div>
                        </div>
                        {member.phone && (
                          <a 
                            href={`tel:${member.phone}`}
                            className="w-7 h-7 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors press-scale shrink-0"
                          >
                            <Phone size={12} />
                          </a>
                        )}
                      </div>
                    ))
                  )
                )}

                {activeTab === 'attending_family' && (
                  familyList.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-[12px] bg-white rounded-2xl border border-dashed border-slate-200">
                      No members attending with family yet.
                    </div>
                  ) : (
                    familyList.map(member => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-slate-200 transition-all">
                        <div className="flex items-center gap-3">
                          <Avatar initials={member.initials} size="md" imageUrl={member.avatar} />
                          <div>
                            <h4 className="text-[12px] font-bold text-slate-800 leading-tight">{member.name}</h4>
                            <p className="text-[10px] text-slate-500 font-semibold">{member.profession} • {member.city}</p>
                          </div>
                        </div>
                        {member.phone && (
                          <a 
                            href={`tel:${member.phone}`}
                            className="w-7 h-7 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors press-scale shrink-0"
                          >
                            <Phone size={12} />
                          </a>
                        )}
                      </div>
                    ))
                  )
                )}

                {activeTab === 'not_attending' && (
                  declinedList.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-[12px] bg-white rounded-2xl border border-dashed border-slate-200">
                      No members declined yet.
                    </div>
                  ) : (
                    declinedList.map(member => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-slate-200 transition-all">
                        <div className="flex items-center gap-3">
                          <Avatar initials={member.initials} size="md" imageUrl={member.avatar} />
                          <div>
                            <h4 className="text-[12px] font-bold text-slate-800 leading-tight">{member.name}</h4>
                            <p className="text-[10px] text-slate-500 font-semibold">{member.profession} • {member.city}</p>
                          </div>
                        </div>
                        {member.phone && (
                          <a 
                            href={`tel:${member.phone}`}
                            className="w-7 h-7 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors press-scale shrink-0"
                          >
                            <Phone size={12} />
                          </a>
                        )}
                      </div>
                    ))
                  )
                )}

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
