import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Clock, Type, Link, Phone, Check, AlertCircle, Upload, Settings } from 'lucide-react';
import DatePicker from '../../../../../components/ui/DatePicker';
import TimePicker from '../../../../../components/ui/TimePicker';
import { useData } from '../../../../member/context/DataProvider';

export default function InvitationFormModal({ isOpen, onClose, invitationData, onSave }) {
  const isEditing = !!invitationData;
  const { invitationFormConfig } = useData();
  const [error, setError] = useState('');

  const isFieldEnabled = (fieldId) => {
    const field = invitationFormConfig?.formFields?.find(f => f.id === fieldId);
    return field ? field.enabled !== false : true;
  };

  const [formData, setFormData] = useState({
    title: '',
    hostName: '',
    date: '',
    timeFood: '',
    timeProgram: '',
    location: '',
    mapLink: '',
    contact: '',
    message: 'You are cordially invited.',
    customFields: {}
  });

  const [photoItems, setPhotoItems] = useState([]); // Array of { id, type: 'existing' | 'file', url, file }

  useEffect(() => {
    setError('');
    if (invitationData) {
      setFormData({
        title: invitationData.title || (invitationData.groomName && invitationData.brideName ? `${invitationData.groomName} & ${invitationData.brideName}` : invitationData.groomName || invitationData.brideName || ''),
        hostName: invitationData.hostName || invitationData.familyName || '',
        date: invitationData.date || '',
        timeFood: invitationData.timeFood || '',
        timeProgram: invitationData.timeProgram || '',
        location: invitationData.location || '',
        mapLink: invitationData.mapLink || '',
        contact: invitationData.contact || '',
        message: invitationData.message || 'You are cordially invited.',
        customFields: invitationData.customFields || {},
      });
      const existingImages = invitationData.images || (invitationData.image ? [invitationData.image] : []);
      setPhotoItems(existingImages.map((url, idx) => ({ id: `existing-${idx}`, type: 'existing', url })));
    } else {
      setFormData({
        title: '',
        hostName: '',
        date: '',
        timeFood: '',
        timeProgram: '',
        location: '',
        mapLink: '',
        contact: '',
        message: 'You are cordially invited.',
        customFields: {},
      });
      setPhotoItems([]);
    }
  }, [invitationData, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newItems = files.map(file => ({
        id: `file-${Date.now()}-${Math.random()}`,
        type: 'file',
        url: URL.createObjectURL(file),
        file
      }));
      setPhotoItems(prev => [...prev, ...newItems]);
    }
  };

  const removePhoto = (idToRemove) => {
    setPhotoItems(prev => prev.filter(item => item.id !== idToRemove));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'contact') {
      const formatted = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    
    if (name === 'title' || name === 'hostName') {
      // Remove standard keyboard special characters but allow unicode/languages
      const formatted = value.replace(/[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?~`]/g, '');
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomFieldChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [fieldId]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const isContactRequired = invitationFormConfig ? invitationFormConfig.enableContact : true;
    if (
      !formData.title || 
      !formData.hostName || 
      !formData.date || 
      !formData.location || 
      (isContactRequired && !formData.contact)
    ) {
      setError("Please fill in Title, Host/Family name, Date, Venue" + (isContactRequired ? ", and Contact Number." : "."));
      return;
    }

    // Validate custom required fields
    if (invitationFormConfig?.customFields?.length > 0) {
      const missingFields = invitationFormConfig.customFields
        .filter(f => f.required && !formData.customFields?.[f.id])
        .map(f => f.label);
      if (missingFields.length > 0) {
        setError(`Please fill in required custom fields: ${missingFields.join(', ')}`);
        return;
      }
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('hostName', formData.hostName);
    data.append('date', formData.date);
    data.append('timeFood', formData.timeFood);
    data.append('timeProgram', formData.timeProgram);
    data.append('location', formData.location);
    data.append('mapLink', formData.mapLink);
    data.append('contact', formData.contact);
    data.append('message', formData.message);
    data.append('customFields', JSON.stringify(formData.customFields || {}));
    
    // Backward compatibility fields
    data.append('groomName', formData.title.split('&')[0]?.trim() || formData.title);
    data.append('brideName', formData.title.split('&')[1]?.trim() || '');
    data.append('familyName', formData.hostName);

    // Append new uploaded files
    const newFiles = photoItems.filter(item => item.type === 'file').map(item => item.file);
    newFiles.forEach(file => {
      data.append('images', file);
    });

    // Send the remaining existing images so backend knows what to keep
    const remainingExisting = photoItems.filter(item => item.type === 'existing').map(item => item.url);
    data.append('existingImages', JSON.stringify(remainingExisting));

    onSave(data);
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
          {error && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-2.5 text-rose-700 text-[12px] font-semibold mb-4 animate-shake">
              <AlertCircle size={16} className="text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form id="invitation-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* File Upload Section (Multiple photos) */}
            {isFieldEnabled('photos') && (
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700 block">
                  Upload Event Photos / Invitation Cards
                </label>
                
                <label className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50 transition-colors relative overflow-hidden min-h-28 block w-full">
                  <input 
                    type="file" 
                    multiple
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                  <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-indigo-500 mb-2">
                    <Upload size={18} />
                  </div>
                  <p className="text-indigo-900 text-[12px] font-bold">Upload Event Photos (Multiple)</p>
                  <p className="text-[10px] text-slate-400 mt-1">Tap to select photos of card, venue, or program</p>
                </label>

                {/* Multiple Previews */}
                {photoItems.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {photoItems.map((item) => (
                      <div key={item.id} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group bg-slate-100">
                        <img src={item.url} alt="preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(item.id)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-colors shadow-md"
                        >
                          <X size={12} strokeWidth={3} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Event Details Form Card */}
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
              <h3 className="text-[12px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-200 pb-2 mb-4">
                <Type size={14} className="text-indigo-500" /> Enter Invitation Details
              </h3>
              
              {/* Event Title */}
              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Event Title *</label>
                <input 
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  autoComplete="off"
                  placeholder="e.g. Marriage Ceremony, House Warming & Dinner"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 font-medium"
                />
              </div>

              {/* Host / Family Name */}
              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Host / Family Name *</label>
                <input 
                  type="text"
                  name="hostName"
                  value={formData.hostName}
                  onChange={handleChange}
                  autoComplete="off"
                  placeholder="e.g. Verma Family / Shri Ramesh Gupta"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 font-medium"
                />
              </div>

              {/* Event Date */}
              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Event Date *</label>
                <DatePicker 
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  placeholder="Select Date"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 font-medium"
                />
              </div>

              {/* Timings (Feast & Program) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isFieldEnabled('timeFood') && (
                  <div className="space-y-1">
                    <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Feast Time</label>
                    <TimePicker 
                      name="timeFood"
                      value={formData.timeFood}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-850 font-medium"
                    />
                  </div>
                )}
                {isFieldEnabled('timeProgram') && (
                  <div className="space-y-1">
                    <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Program Time</label>
                    <TimePicker 
                      name="timeProgram"
                      value={formData.timeProgram}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-855 font-medium"
                    />
                  </div>
                )}
              </div>

              {/* Venue Location */}
              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Venue *</label>
                <textarea 
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  rows={2}
                  placeholder="e.g. Shriram Garden, Indore, MP"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 font-medium resize-none"
                />
              </div>

              {/* Google Map Link */}
              {isFieldEnabled('mapLink') && (
                <div className="space-y-1">
                  <label className="block text-[12px] font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                    <Link size={12} className="text-slate-400" /> Google Map Link
                  </label>
                  <input 
                    type="url"
                    name="mapLink"
                    value={formData.mapLink}
                    onChange={handleChange}
                    autoComplete="off"
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 font-medium"
                  />
                </div>
              )}

              {/* Contact Number */}
              {isFieldEnabled('contact') && (
                <div className="space-y-1">
                  <label className="block text-[12px] font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                    <Phone size={12} className="text-slate-400" /> Contact Number *
                  </label>
                  <input 
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    autoComplete="off"
                    placeholder="9999999999"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-850 font-medium"
                  />
                </div>
              )}

              {/* Personal Message */}
              {isFieldEnabled('message') && (
                <div className="space-y-1">
                  <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Personal Message / Note</label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={2}
                    placeholder="You are cordially invited."
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 font-medium resize-none"
                  />
                </div>
              )}

              {/* Custom Fields */}
              {invitationFormConfig?.customFields && invitationFormConfig.customFields.map(field => (
                <div key={field.id} className="space-y-1">
                  <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
                    {field.label} {field.required && '*'}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea 
                      value={formData.customFields?.[field.id] || ''}
                      onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                      rows={2}
                      placeholder={`Enter ${field.label}`}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 font-medium resize-none"
                    />
                  ) : (
                    <input 
                      type={field.type}
                      value={formData.customFields?.[field.id] || ''}
                      onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                      placeholder={`Enter ${field.label}`}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 font-medium"
                    />
                  )}
                </div>
              ))}
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-[13px] transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="invitation-form"
            className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-extrabold rounded-xl text-[13px] shadow-sm transition-all press-scale flex items-center gap-1.5"
          >
            <Check size={16} strokeWidth={3} /> {isEditing ? 'Save Changes' : 'Create Invitation'}
          </button>
        </div>

      </div>
    </div>
  );
}
