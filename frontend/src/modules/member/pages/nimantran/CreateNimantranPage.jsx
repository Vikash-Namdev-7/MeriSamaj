import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Upload, Map, MapPin } from 'lucide-react';
import { useData } from '../../context/DataProvider';

export default function CreateNimantranPage() {
  const navigate = useNavigate();
  const { createInvitation } = useData();
  
  const [formData, setFormData] = useState({
    groomName: '',
    brideName: '',
    familyName: '',
    date: '',
    timeFood: '',
    timeBaraat: '',
    timePhere: '',
    location: '',
    mapLink: '',
    contact: '',
    message: 'You are cordially invited.',
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a local object URL for preview and mock storage
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setFormData(prev => ({ ...prev, image: url }));
    }
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
    if (!formData.groomName || !formData.brideName || !formData.date) {
      alert("Please fill in Groom's name, Bride's name, and Date.");
      return;
    }
    
    createInvitation(formData);
    navigate('/member/nimantran');
  };

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
        <h1 className="text-[17px] font-bold text-slate-800">Send New Invitation</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-slate-700 block">Upload Wedding Card (Image)</label>
            <label className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50 transition-colors relative overflow-hidden h-48 block w-full">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="hidden" 
              />
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <>
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-indigo-500 mb-3">
                    <Upload size={20} />
                  </div>
                  <p className="text-indigo-900 text-[13px] font-bold">Upload Card Photo</p>
                </>
              )}
            </label>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-800 text-[15px] border-b border-slate-100 pb-2">2. Enter Invitation Details</h3>
            
            <div className="space-y-1">
              <label className="text-[12px] font-bold text-slate-500">Groom's Name *</label>
              <input 
                type="text"
                name="groomName"
                value={formData.groomName}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-colors font-medium text-slate-800"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[12px] font-bold text-slate-500">Bride's Name *</label>
              <input 
                type="text"
                name="brideName"
                value={formData.brideName}
                onChange={handleChange}
                placeholder="e.g. Priya Verma"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-colors font-medium text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-bold text-slate-500">Family Name *</label>
              <input 
                type="text"
                name="familyName"
                value={formData.familyName}
                onChange={handleChange}
                placeholder="e.g. Shri Motilal Sharma"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-colors font-medium text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-bold text-slate-500">Wedding Date *</label>
              <input 
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-colors font-medium text-slate-800"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">Reception Time</label>
                <input 
                  type="time"
                  name="timeFood"
                  value={formData.timeFood}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 text-[12px] outline-none focus:border-indigo-500 focus:bg-white transition-colors font-medium text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">Baraat Time</label>
                <input 
                  type="time"
                  name="timeBaraat"
                  value={formData.timeBaraat}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 text-[12px] outline-none focus:border-indigo-500 focus:bg-white transition-colors font-medium text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">Phere Time</label>
                <input 
                  type="time"
                  name="timePhere"
                  value={formData.timePhere}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 text-[12px] outline-none focus:border-indigo-500 focus:bg-white transition-colors font-medium text-slate-800"
                />
              </div>
            </div>

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

            <div className="space-y-1">
              <label className="text-[12px] font-bold text-slate-500 flex justify-between">
                <span>Google Map Location</span>
                <span className="text-indigo-500 flex items-center gap-1 cursor-pointer"><MapPin size={12}/> View on Map</span>
              </label>
              <input 
                type="url"
                name="mapLink"
                value={formData.mapLink}
                onChange={handleChange}
                placeholder="Google Maps link"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-indigo-500 focus:bg-white transition-colors font-medium text-slate-800"
              />
            </div>

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
            Send Invitation
          </button>
        </form>
      </div>
    </div>
  );
}
