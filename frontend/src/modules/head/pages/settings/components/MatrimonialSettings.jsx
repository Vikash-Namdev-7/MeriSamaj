import React from 'react';
import { Heart } from 'lucide-react';

export const MatrimonialSettings = ({ settings, updateDraft }) => {
  const mat = settings?.matrimonial || {};

  const handleToggle = (key) => {
    updateDraft('matrimonial', key, !mat[key]);
  };

  const handleSelect = (key, value) => {
    updateDraft('matrimonial', key, value);
  };

  const renderToggle = (label, key, description) => (
    <div className="flex items-start justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
      <div className="pr-4">
        <h4 className="text-sm font-bold text-white mb-0.5">{label}</h4>
        <p className="text-[10px] text-white/50">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={!!mat[key]}
          onChange={() => handleToggle(key)}
        />
        <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary"></div>
      </label>
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Heart size={20} className="text-brand-primary" />
          Matrimonial Settings
        </h2>
        <p className="text-xs text-white/50">Rules for the community matchmaking portal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderToggle('Enable Matrimonial', 'enabled', 'Turn on/off the entire module.')}
        {renderToggle('Profile Approval', 'profileApproval', 'Require head approval before profiles go live.')}
        {renderToggle('Auto-Hide Incomplete', 'autoHideIncomplete', 'Hide profiles missing photo or biodata.')}
        {renderToggle('Require Verification', 'requireVerification', 'Only verified Samaj members can post.')}
        {renderToggle('Require Family Approval', 'requireFamilyApproval', 'Family head must approve childs profile.')}
        {renderToggle('Show Contact After Approval', 'showContactAfterApproval', 'Users must request contact info.')}
        
        <div className="md:col-span-2 flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl">
          <div>
            <h4 className="text-sm font-bold text-white mb-0.5">Default Profile Privacy</h4>
            <p className="text-[10px] text-white/50">Default visibility when a new profile is created.</p>
          </div>
          <select 
            value={mat.defaultPrivacy || 'private'}
            onChange={(e) => handleSelect('defaultPrivacy', e.target.value)}
            className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg outline-none focus:border-brand-primary text-xs font-bold text-white"
          >
            <option value="public" className="bg-surface">Public (All Members)</option>
            <option value="private" className="bg-surface">Private (On Request)</option>
            <option value="premium" className="bg-surface">Premium Members Only</option>
          </select>
        </div>
      </div>
    </div>
  );
};
