import React from 'react';
import { Users } from 'lucide-react';

export const DirectorySettings = ({ settings, updateDraft }) => {
  const dir = settings?.directory || {};

  const handleSelect = (key, value) => {
    updateDraft('directory', key, value);
  };

  const renderVisibilitySelect = (label, key) => (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
      <h4 className="text-sm font-bold text-white">{label}</h4>
      <select 
        value={dir[key] || 'members'}
        onChange={(e) => handleSelect(key, e.target.value)}
        className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg outline-none focus:border-brand-primary text-xs font-bold text-white"
      >
        <option value="public" className="bg-surface">Public</option>
        <option value="members" className="bg-surface">Members Only</option>
        <option value="verified" className="bg-surface">Verified Members</option>
        <option value="committee" className="bg-surface">Committee Only</option>
        <option value="head" className="bg-surface">Community Head Only</option>
      </select>
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Users size={20} className="text-brand-primary" />
          Member Directory Visibility
        </h2>
        <p className="text-xs text-white/50">Configure who can see specific member fields in the directory.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderVisibilitySelect('Phone Number', 'showPhone')}
        {renderVisibilitySelect('Email Address', 'showEmail')}
        {renderVisibilitySelect('Business Details', 'showBusiness')}
        {renderVisibilitySelect('Residential Address', 'showAddress')}
        {renderVisibilitySelect('Blood Group', 'showBloodGroup')}
        {renderVisibilitySelect('Profession', 'showProfession')}
        {renderVisibilitySelect('Family Members', 'showFamily')}
        {renderVisibilitySelect('Donation History', 'showDonations')}
        {renderVisibilitySelect('Event Participation', 'showEvents')}
      </div>
    </div>
  );
};
