import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Upload, MapPin, Search, Check, X, CheckCircle2 } from 'lucide-react';
import { useData } from '../../context/DataProvider';

export default function CreateNimantranPage() {
  const navigate = useNavigate();
  const { createInvitation, members, currentUser, addNotification } = useData();
  
  const [formData, setFormData] = useState({
    title: '',
    hostName: '',
    date: '',
    timeFood: '',
    timeProgram: '',
    timeOther: '',
    location: '',
    mapLink: '',
    contact: '',
    message: 'You are cordially invited.',
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [isCreated, setIsCreated] = useState(false);
  const [createdInv, setCreatedInv] = useState(null);
  
  // Member inviting states
  const [invitedMemberIds, setInvitedMemberIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newUrls = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newUrls]);
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newUrls]
      }));
    }
  };

  const removeImage = (indexToRemove) => {
    setImagePreviews(prev => prev.filter((_, idx) => idx !== indexToRemove));
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'contact') {
      const formatted = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.hostName || !formData.date || !formData.location || !formData.contact) {
      alert("Please fill in Title, Host/Family name, Date, Venue, and Contact Number.");
      return;
    }

    const newInvitation = {
      ...formData,
      // Support backward compatibility (old code might expect groomName/brideName/familyName)
      groomName: formData.title.split('&')[0]?.trim() || formData.title,
      brideName: formData.title.split('&')[1]?.trim() || '',
      familyName: formData.hostName,
    };
    
    createInvitation(newInvitation);
    setCreatedInv(newInvitation);
    setIsCreated(true);
  };

  const handleToggleInvite = (member) => {
    const memberId = member.id;
    const isCurrentlyInvited = invitedMemberIds.includes(memberId);
    
    if (isCurrentlyInvited) {
      setInvitedMemberIds(prev => prev.filter(id => id !== memberId));
    } else {
      setInvitedMemberIds(prev => [...prev, memberId]);
      
      // Trigger notification for the invited member
      addNotification({
        type: 'nimantran',
        title: 'आमंत्रण भेजा गया (Invitation Sent)',
        message: `${member.name} को "${createdInv?.title || 'कार्यक्रम'}" के लिए आमंत्रित किया गया है।`,
      });
    }
  };

  // Extract unique cities from members list
  const uniqueCities = Array.from(new Set(members.map(m => m.city).filter(Boolean)));

  // Filter members by search and selected city
  const filteredMembers = members.filter(member => {
    // Exclude current user from inviting themselves
    if (member.id === currentUser?.id) return false;

    // Search query match
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      const matchName = member.name?.toLowerCase().includes(lowerQuery);
      const matchProfession = member.profession?.toLowerCase().includes(lowerQuery);
      const matchCity = member.city?.toLowerCase().includes(lowerQuery);
      if (!matchName && !matchProfession && !matchCity) return false;
    }

    // City match
    if (selectedCity !== 'All') {
      if (member.city !== selectedCity) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30 shadow-sm border-b border-slate-100">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-[17px] font-bold text-slate-800">
          {isCreated ? 'Invitation Created' : 'Create New Invitation'}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 max-w-2xl mx-auto w-full">
        {!isCreated ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* File Upload Section (Multiple photos) */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-700 block">
                Upload Event Photos / Invitation Cards
              </label>
              
              <label className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50 transition-colors relative overflow-hidden min-h-32 block w-full">
                <input 
                  type="file" 
                  multiple
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-indigo-500 mb-2">
                  <Upload size={20} />
                </div>
                <p className="text-indigo-900 text-[13px] font-bold">Upload Event Photos (Multiple)</p>
                <p className="text-[11px] text-slate-400 mt-1">Tap to select photos of card, venue, or program</p>
              </label>

              {/* Multiple Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group bg-slate-100">
                      <img src={preview} alt={`preview-${index}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-colors shadow-md"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Event Details Form Card */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <h3 className="font-bold text-slate-800 text-[15px] border-b border-slate-100 pb-2">
                Enter Invitation Details
              </h3>
              
              {/* Event Title */}
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-slate-500">Event Title *</label>
                <input 
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Marriage Ceremony, House Warming & Dinner"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-colors font-medium text-slate-800"
                />
              </div>
              
              {/* Host/Family Name */}
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-slate-500">Host / Family Name *</label>
                <input 
                  type="text"
                  name="hostName"
                  value={formData.hostName}
                  onChange={handleChange}
                  placeholder="e.g. Verma Family / Shri Ramesh Gupta"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-colors font-medium text-slate-800"
                />
              </div>

              {/* Event Date */}
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-slate-500">Event Date *</label>
                <input 
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-colors font-medium text-slate-800"
                />
              </div>

              {/* Event Schedules / Timings */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Feast Time</label>
                  <input 
                    type="time"
                    name="timeFood"
                    value={formData.timeFood}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 text-[12px] outline-none focus:border-indigo-500 focus:bg-white transition-colors font-medium text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Program Time</label>
                  <input 
                    type="time"
                    name="timeProgram"
                    value={formData.timeProgram}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 text-[12px] outline-none focus:border-indigo-500 focus:bg-white transition-colors font-medium text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Other Time</label>
                  <input 
                    type="time"
                    name="timeOther"
                    value={formData.timeOther}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 text-[12px] outline-none focus:border-indigo-500 focus:bg-white transition-colors font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1 pt-2">
                <label className="text-[12px] font-bold text-slate-500">Venue *</label>
                <textarea 
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  rows={2}
                  placeholder="e.g. Shriram Garden, Indore, MP"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-colors font-medium text-slate-800 resize-none"
                />
              </div>

              {/* Google Maps link */}
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-slate-500">Google Map Link</label>
                <input 
                  type="url"
                  name="mapLink"
                  value={formData.mapLink}
                  onChange={handleChange}
                  placeholder="Paste map link here"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-colors font-medium text-slate-800"
                />
              </div>

              {/* Contact Number */}
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-slate-500">Contact Number *</label>
                <input 
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="9999999999"
                  maxLength={10}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-colors font-medium text-slate-800"
                />
              </div>

              {/* Personal Message */}
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-slate-500">Message (Optional)</label>
                <input 
                  type="text"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="You are cordially invited."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-colors font-medium text-slate-800"
                />
              </div>

            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white font-black text-[15px] py-4 rounded-xl shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 active:scale-95 transition-all"
            >
              Create Invitation
            </button>
          </form>
        ) : (
          /* SUCCESS VIEW & MEMBER DIRECTORY */
          <div className="space-y-6">
            {/* Success message */}
            <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex flex-col items-center text-center gap-2">
              <CheckCircle2 size={44} className="text-emerald-500" />
              <h2 className="text-[16px] font-black text-emerald-800">आमंत्रण सफलतापूर्वक बनाया गया!</h2>
              <p className="text-[12px] text-emerald-700 font-semibold">
                Your invitation is successfully created and live. You can now search and invite community members.
              </p>
            </div>

            {/* Created Invitation Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="relative h-40 bg-gradient-to-r from-purple-600 to-indigo-700 flex flex-col items-center justify-center text-center p-4">
                {createdInv.images && createdInv.images.length > 0 ? (
                  <>
                    <img src={createdInv.images[0]} alt="Card Main" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-slate-900/40" />
                    <div className="text-white z-10 p-2">
                      <h3 className="font-extrabold text-[17px] tracking-wide line-clamp-1">{createdInv.title}</h3>
                      <p className="text-[12px] opacity-90 mt-0.5 font-bold">{createdInv.hostName}</p>
                      <p className="text-[11px] opacity-75 mt-1 font-semibold">{createdInv.date}</p>
                    </div>
                  </>
                ) : (
                  <div className="text-white z-10 p-4">
                    <h3 className="font-extrabold text-[17px] tracking-wide line-clamp-1">{createdInv.title}</h3>
                    <p className="text-[12px] opacity-90 mt-0.5 font-bold">{createdInv.hostName}</p>
                    <p className="text-[11px] opacity-75 mt-1.5 font-semibold">{createdInv.date}</p>
                  </div>
                )}
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-[12px] font-semibold text-slate-600 flex flex-col gap-1">
                <p className="truncate">📍 {createdInv.location}</p>
                <p>📞 {createdInv.contact}</p>
              </div>
            </div>

            {/* Member Inviting Directory */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-black text-slate-800 text-[14px]">
                  {currentUser?.community || 'Samaj'} Members Directory
                </h3>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-lg">
                  {filteredMembers.length} Members
                </span>
              </div>

              {/* Search & City Filter Dropdown Row */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    placeholder="Search by name, place..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-[13px] outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-800"
                  />
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                <div className="relative">
                  <button 
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-bold text-slate-700 flex items-center gap-1.5 hover:bg-slate-100 hover:border-slate-300 transition-colors h-full press-scale whitespace-nowrap"
                  >
                    <span>📍 {selectedCity === 'All' ? 'All Cities' : selectedCity}</span>
                    <span className="text-[9px] text-slate-400">▼</span>
                  </button>
                  
                  {isDropdownOpen && (
                    <>
                      {/* Overlay Backdrop to close drop down when clicking outside */}
                      <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 max-h-60 overflow-y-auto">
                        <div className="px-3 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          Select City
                        </div>
                        <button 
                          type="button"
                          onClick={() => { setSelectedCity('All'); setIsDropdownOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-[12px] font-bold transition-colors ${selectedCity === 'All' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}
                        >
                          All Cities ({members.length})
                        </button>
                        {uniqueCities.map(city => (
                          <button 
                            key={city}
                            type="button"
                            onClick={() => { setSelectedCity(city); setIsDropdownOpen(false); }}
                            className={`w-full text-left px-4 py-2 text-[12px] font-bold transition-colors ${selectedCity === city ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}
                          >
                            {city} ({members.filter(m => m.city === city).length})
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {filteredMembers.map(member => {
                  const isInvited = invitedMemberIds.includes(member.id);
                  return (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50/50 border border-slate-100 rounded-xl hover:border-slate-200 hover:bg-white transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-extrabold flex items-center justify-center text-[12px] border border-indigo-100/30 uppercase">
                          {member.initials}
                        </div>
                        <div>
                          <h4 className="text-[13px] font-bold text-slate-800">{member.name}</h4>
                          <p className="text-[11px] text-slate-500 font-semibold">
                            {member.profession || 'Member'} • {member.city || 'No city'}
                          </p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleToggleInvite(member)}
                        className={`px-4 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1 transition-all press-scale ${
                          isInvited 
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-250/20' 
                            : 'bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-50'
                        }`}
                      >
                        {isInvited ? (
                          <>
                            <Check size={12} strokeWidth={3} /> Invited
                          </>
                        ) : (
                          'Invite'
                        )}
                      </button>
                    </div>
                  );
                })}
                {filteredMembers.length === 0 && (
                  <div className="text-center py-10 text-slate-400 text-[12px] font-semibold flex flex-col items-center justify-center">
                    <p>No community members found in {selectedCity === 'All' ? 'any city' : selectedCity}.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <button 
              onClick={() => navigate('/member/nimantran')}
              className="w-full bg-slate-800 text-white font-black text-[15px] py-4 rounded-xl shadow-lg hover:bg-slate-900 active:scale-95 transition-all"
            >
              Done &amp; View All Invitations
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
