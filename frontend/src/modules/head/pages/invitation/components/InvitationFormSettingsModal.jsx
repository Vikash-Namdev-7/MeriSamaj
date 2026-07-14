import React, { useState, useEffect } from 'react';
import { X, Settings, Check } from 'lucide-react';
import { useData } from '../../../../member/context/DataProvider';

export default function InvitationFormSettingsModal({ isOpen, onClose }) {
  const { invitationFormConfig, updateInvitationConfig } = useData();
  const [localConfig, setLocalConfig] = useState(invitationFormConfig);

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(invitationFormConfig);
    }
  }, [isOpen, invitationFormConfig]);

  if (!isOpen) return null;

  const handleToggle = (key) => {
    setLocalConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    updateInvitationConfig(localConfig);
    onClose();
  };

  const settingsOptions = [
    // Form Fields
    { key: 'enableFeastTime', label: 'Feast Time Field', desc: 'Allow members to specify food timing' },
    { key: 'enableProgramTime', label: 'Program Time Field', desc: 'Allow members to specify main event timing' },
    { key: 'enableMapLink', label: 'Google Map Link Field', desc: 'Allow members to add Google Map URLs' },
    { key: 'enableContact', label: 'Contact Number Field', desc: 'Require contact number on invitations' },
    { key: 'enableMessage', label: 'Personal Message Field', desc: 'Allow members to add a custom message' },
    { key: 'enablePhotos', label: 'Photo/Card Upload', desc: 'Allow members to upload images of their invitation cards' },
    
    // Member Directory & Sharing
    { key: 'enableMembersTab', label: 'Show Members Directory', desc: 'Allow inviting general members' },
    { key: 'enablePresidentsTab', label: 'Show Presidents Tab', desc: 'Allow inviting community presidents' },
    { key: 'enableGroupsTab', label: 'Show Groups Tab', desc: 'Allow inviting entire groups' },
    { key: 'enableFriendsTab', label: 'Show Friends Tab', desc: 'Allow inviting from friends list' },
    { key: 'enableBatchInvite', label: 'Batch Invite Actions', desc: 'Allow "Invite All" bulk actions' }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-[17px] font-black text-slate-800">Form Configuration</h2>
              <p className="text-[12px] font-semibold text-slate-500 mt-0.5">Toggle fields for member invitation form</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center !text-slate-500 hover:bg-slate-100 hover:!text-rose-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
          {settingsOptions.map(option => (
            <div key={option.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <h4 className="text-[14px] font-bold text-slate-800">{option.label}</h4>
                <p className="text-[11px] font-semibold text-slate-500">{option.desc}</p>
              </div>
              
              {/* Toggle Switch */}
              <button 
                onClick={() => handleToggle(option.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localConfig[option.key] ? 'bg-indigo-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localConfig[option.key] ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-[13px] !text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl font-bold text-[13px] !text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <Check size={16} strokeWidth={3} className="!text-white" />
            <span className="!text-white">Save Configuration</span>
          </button>
        </div>
        
      </div>
    </div>
  );
}
