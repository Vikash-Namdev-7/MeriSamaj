import React from 'react';
import { Briefcase } from 'lucide-react';

export const ProfessionalSettings = ({ settings, updateDraft }) => {
  const prof = settings?.professional || {};

  const handleToggle = (key) => {
    updateDraft('professional', key, !prof[key]);
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
          checked={!!prof[key]}
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
          <Briefcase size={20} className="text-brand-primary" />
          Professional Directory Settings
        </h2>
        <p className="text-xs text-white/50">Manage how business listings and professionals are displayed.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderToggle('Enable Directory', 'enabled', 'Turn on/off the professional networking module.')}
        {renderToggle('Verification Required', 'verificationRequired', 'Listings must be verified by admin before showing up.')}
        {renderToggle('Featured Listings', 'featuredListings', 'Allow admins to pin specific businesses at the top.')}
        {renderToggle('Business Promotion', 'businessPromotion', 'Members can post offers/coupons on their listing.')}
        {renderToggle('Category Approval', 'categoryApproval', 'Creating a new business category requires admin approval.')}
      </div>
    </div>
  );
};
