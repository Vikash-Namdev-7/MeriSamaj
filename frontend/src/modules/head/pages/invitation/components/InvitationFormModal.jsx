import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Clock, Image as ImageIcon, Type, Link, Phone, Users, Check, AlertCircle } from 'lucide-react';

export default function InvitationFormModal({ isOpen, onClose, invitationData, onSave }) {
  const isEditing = !!invitationData;
  const [formData, setFormData] = useState({
    title: '',
    hostName: '',
    groomName: '',
    brideName: '',
    familyName: '',
    date: '',
    timeFood: '',
    timeProgram: '',
    timeBaraat: '',
    timePhere: '',
    location: '',
    mapLink: '',
    contact: '',
    message: '',
    type: 'Standard' // custom field for UI to toggle wedding vs standard
  });

  useEffect(() => {
    if (invitationData) {
      setFormData({
        ...invitationData,
        type: (invitationData.groomName || invitationData.brideName) && !invitationData.title ? 'Wedding' : 'Standard'
      });
    } else {
      setFormData({
        title: '',
        hostName: '',
        groomName: '',
        brideName: '',
        familyName: '',
        date: '',
        timeFood: '',
        timeProgram: '',
        timeBaraat: '',
        timePhere: '',
        location: '',
        mapLink: '',
        contact: '',
        message: '',
        type: 'Standard'
      });
    }
  }, [invitationData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-[17px] font-black text-slate-800">
              {isEditing ? 'Edit Invitation' : 'Create New Invitation'}
            </h2>
            <p className="text-[12px] font-semibold text-slate-500 mt-0.5">
              {isEditing ? 'Update event details and visibility settings' : 'Draft a new invitation for the community'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center !text-slate-500 hover:bg-slate-100 hover:!text-rose-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="invitation-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Type Toggle */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Event Type</label>
              <div className="flex p-1 bg-slate-100 rounded-xl w-full max-w-sm">
                {['Standard', 'Wedding'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type }))}
                    className={`flex-1 py-2 text-[12px] font-bold rounded-lg transition-all ${
                      formData.type === type 
                        ? 'bg-white !text-indigo-600 shadow-sm border border-slate-200/50' 
                        : '!text-slate-500 hover:!text-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Info based on Type */}
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
              <h3 className="text-[12px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-200 pb-2 mb-4">
                <Type size={14} className="text-indigo-500" /> Basic Details
              </h3>
              
              {formData.type === 'Standard' ? (
                <>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Event Title *</label>
                    <input 
                      type="text" 
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Diwali Milan Samaroh"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Host / Organizer Name *</label>
                    <input 
                      type="text" 
                      name="hostName"
                      value={formData.hostName}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Agrawal Samaj Committee"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 font-medium"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Groom's Name</label>
                      <input 
                        type="text" 
                        name="groomName"
                        value={formData.groomName}
                        onChange={handleChange}
                        placeholder="e.g. Rahul"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Bride's Name</label>
                      <input 
                        type="text" 
                        name="brideName"
                        value={formData.brideName}
                        onChange={handleChange}
                        placeholder="e.g. Priya"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Family Name (Host)</label>
                    <input 
                      type="text" 
                      name="familyName"
                      value={formData.familyName}
                      onChange={handleChange}
                      placeholder="e.g. The Agrawal Family"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 font-medium"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Date & Location */}
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
              <h3 className="text-[12px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-200 pb-2 mb-4">
                <Calendar size={14} className="text-indigo-500" /> Date & Venue
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-slate-600 mb-1.5 flex items-center gap-1">Event Date *</label>
                  <input 
                    type="date" 
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-slate-600 mb-1.5 flex items-center gap-1">Venue Name *</label>
                  <input 
                    type="text" 
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Grand Palace Hotel"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 font-medium"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[12px] font-semibold text-slate-600 mb-1.5 flex items-center gap-1">Google Maps Link (Optional)</label>
                <div className="relative">
                  <Link size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="url" 
                    name="mapLink"
                    value={formData.mapLink}
                    onChange={handleChange}
                    placeholder="https://maps.google.com/..."
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
              <h3 className="text-[12px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-200 pb-2 mb-4">
                <Clock size={14} className="text-indigo-500" /> Schedule Details
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Food / Reception Time</label>
                  <input 
                    type="time" 
                    name="timeFood"
                    value={formData.timeFood}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Program Time</label>
                  <input 
                    type="time" 
                    name="timeProgram"
                    value={formData.timeProgram}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 font-medium"
                  />
                </div>
                {formData.type === 'Wedding' && (
                  <>
                    <div>
                      <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Baraat Time</label>
                      <input 
                        type="time" 
                        name="timeBaraat"
                        value={formData.timeBaraat}
                        onChange={handleChange}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Phere Time</label>
                      <input 
                        type="time" 
                        name="timePhere"
                        value={formData.timePhere}
                        onChange={handleChange}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 font-medium"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Additional Contact */}
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
               <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Contact Number *</label>
               <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    required
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 font-medium"
                  />
               </div>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-[13px] !text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="invitation-form"
            className="px-6 py-2.5 rounded-xl font-bold text-[13px] !text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <Check size={16} strokeWidth={3} className="!text-white" />
            <span className="!text-white">{isEditing ? 'Save Changes' : 'Create Invitation'}</span>
          </button>
        </div>
        
      </div>
    </div>
  );
}
