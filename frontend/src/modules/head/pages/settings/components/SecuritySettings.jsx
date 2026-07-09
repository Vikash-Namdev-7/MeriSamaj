import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const SecuritySettings = ({ settings, updateDraft }) => {
  const sec = settings?.security || {};

  const handleToggle = (key) => {
    updateDraft('security', key, !sec[key]);
  };

  const handleChange = (e) => {
    updateDraft('security', e.target.name, parseInt(e.target.value) || 0);
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
          checked={!!sec[key]}
          onChange={() => handleToggle(key)}
        />
        <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
      </label>
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldAlert size={20} className="text-rose-400" />
          Security Preferences
        </h2>
        <p className="text-xs text-white/50">Protect community data and head panel access.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderToggle('Require 2-Step Approval', 'twoStepApproval', 'Major changes need OTP verification.')}
        {renderToggle('Sensitive Action Confirmation', 'sensitiveActionConfirm', 'Show password prompt before deleting.')}
        {renderToggle('Login Alerts', 'loginAlerts', 'Email admins on new device login.')}
        
        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
          <div>
             <h4 className="text-sm font-bold text-white mb-0.5">Session Timeout</h4>
             <p className="text-[10px] text-white/50">Minutes of inactivity before auto-logout.</p>
          </div>
          <input 
            type="number"
            name="sessionTimeout"
            value={sec.sessionTimeout || ''}
            onChange={handleChange}
            className="w-20 px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg outline-none focus:border-rose-400 text-xs font-bold text-white text-center"
          />
        </div>
      </div>
    </div>
  );
};
