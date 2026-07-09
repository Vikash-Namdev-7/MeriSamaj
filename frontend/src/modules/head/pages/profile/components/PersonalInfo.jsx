import React from 'react';
import { User, Phone, MapPin, Calendar, Droplet, Users, AlertCircle } from 'lucide-react';
import { BLOOD_GROUPS, GENDERS } from '../utils/constants';

export const PersonalInfo = ({ profile, handleChange }) => {
  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div className="card-neo p-6">
        <h3 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2">
          <User size={16} className="text-brand-primary" />
          Basic Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">First Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm font-medium"
              value={profile.firstName || ''}
              onChange={(e) => handleChange('firstName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Last Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm font-medium"
              value={profile.lastName || ''}
              onChange={(e) => handleChange('lastName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Users size={12}/> Gender</label>
            <select 
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm font-medium appearance-none bg-white"
              value={profile.gender || ''}
              onChange={(e) => handleChange('gender', e.target.value)}
            >
              <option value="">Select Gender</option>
              {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Calendar size={12}/> Date of Birth</label>
            <input 
              type="date" 
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm font-medium"
              value={profile.dob || ''}
              onChange={(e) => handleChange('dob', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Droplet size={12} className="text-rose-500"/> Blood Group</label>
            <select 
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm font-medium appearance-none bg-white"
              value={profile.bloodGroup || ''}
              onChange={(e) => handleChange('bloodGroup', e.target.value)}
            >
              <option value="">Select Blood Group</option>
              {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card-neo p-6">
        <h3 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2">
          <Phone size={16} className="text-brand-primary" />
          Contact & Address
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
            <input 
              type="tel" 
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm font-medium"
              value={profile.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><AlertCircle size={12} className="text-amber-500"/> Emergency Contact</label>
            <input 
              type="tel" 
              className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all text-sm font-medium"
              value={profile.emergencyContact || ''}
              onChange={(e) => handleChange('emergencyContact', e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><MapPin size={12}/> Address Line</label>
            <textarea 
              rows="2"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm font-medium resize-none"
              value={profile.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
            ></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">City</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm font-medium"
                value={profile.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">State</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm font-medium"
                value={profile.state || ''}
                onChange={(e) => handleChange('state', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pincode</label>
              <input 
                type="text" 
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm font-medium"
                value={profile.pincode || ''}
                onChange={(e) => handleChange('pincode', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
