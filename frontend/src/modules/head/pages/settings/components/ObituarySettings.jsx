import React from 'react';
import { Award } from 'lucide-react';

export const ObituarySettings = ({ settings, updateDraft }) => {
  const shradh = settings?.shradhanjali || {};

  const handleToggle = (key) => {
    updateDraft('shradhanjali', key, !shradh[key]);
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
          checked={!!shradh[key]}
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
          <Award size={20} className="text-brand-primary" />
          Obituary / Condolence Settings
        </h2>
        <p className="text-xs text-white/50">Rules and features configuration for the Obituary (Shradhanjali) module.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderToggle('Enable Obituary Module', 'enabled', 'Turn on/off the entire condolences portal for members.')}
        {renderToggle('Allow Member Submissions', 'memberSubmissionEnabled', 'Enable members to write and submit obituary entries.')}
        {renderToggle('Require Head Approval', 'requireApproval', 'Require Community Head verification before member submissions go live.')}
      </div>
    </div>
  );
};
