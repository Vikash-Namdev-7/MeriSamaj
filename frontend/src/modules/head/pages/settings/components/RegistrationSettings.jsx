import React from 'react';
import { UserPlus } from 'lucide-react';

export const RegistrationSettings = ({ settings, updateDraft }) => {
  const reg = settings?.registration || {};

  const handleToggle = (key) => {
    updateDraft('registration', key, !reg[key]);
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
          checked={!!reg[key]}
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
          <UserPlus size={20} className="text-brand-primary" />
          Registration Rules
        </h2>
        <p className="text-xs text-white/50">Define how new members can join your community.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {renderToggle('Enable Registration', 'enabled', 'Allow new users to sign up.')}
        {renderToggle('Require Manual Approval', 'manualApproval', 'Head/Committee must approve new members.')}
        {renderToggle('Family Registration', 'family', 'Members can add family tree/dependents.')}
        {renderToggle('Referral Registration', 'referral', 'Existing members can refer new ones.')}
        {renderToggle('Invitation Only', 'invitation', 'Users can only join via unique invite links.')}
        {renderToggle('Waiting List', 'waitingList', 'Put new members on a waitlist automatically.')}
        
        <div className="lg:col-span-2 mt-4 space-y-1">
          <h3 className="text-md font-bold text-white">Verification & Documents</h3>
        </div>
        
        {renderToggle('Require Aadhaar', 'requireAadhaar', 'Mandatory Aadhaar entry for Indian KYC.')}
        {renderToggle('Require Address Proof', 'requireAddress', 'Upload utility bill or equivalent.')}
        {renderToggle('Require Community Certificate', 'requireCertificate', 'Upload official Samaj letter/certificate.')}
        {renderToggle('Require Profile Photo', 'requirePhoto', 'Mandatory recognizable photo.')}

        <div className="lg:col-span-2 mt-4 space-y-1">
          <h3 className="text-md font-bold text-white">Automation</h3>
        </div>

        {renderToggle('Auto-Generate QR', 'autoQR', 'Generate an ID card QR immediately upon approval.')}
        {renderToggle('Auto-Generate Member ID', 'autoID', 'Sequential member numbering (e.g. MS-1001).')}
      </div>
    </div>
  );
};
