import React from 'react';

export const GroupSettings = ({ settings, updateDraft }) => {
  const groupPolicy = settings?.groupCreationPolicy || 'head_admin';

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-gray-900">Community Groups Governance</h2>
        <p className="text-xs text-gray-500">Configure who can create groups and how they are approved.</p>
      </div>

      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-800">Group Creation Policy</h3>
        <p className="text-xs text-slate-500 mb-4">Determine which members have the permission to create new community groups.</p>
        
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-200">
            <input 
              type="radio" 
              name="groupCreationPolicy" 
              value="head_admin" 
              checked={groupPolicy === 'head_admin'}
              onChange={(e) => updateDraft('groupCreationPolicy', null, e.target.value)}
              className="mt-1 w-4 h-4 text-brand-primary border-slate-300 focus:ring-brand-primary"
            />
            <div>
              <span className="block text-sm font-bold text-slate-800">Admins & Head Only</span>
              <span className="block text-xs text-slate-500 mt-0.5">Only community administrators can create new groups.</span>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-200">
            <input 
              type="radio" 
              name="groupCreationPolicy" 
              value="verified_with_approval" 
              checked={groupPolicy === 'verified_with_approval'}
              onChange={(e) => updateDraft('groupCreationPolicy', null, e.target.value)}
              className="mt-1 w-4 h-4 text-brand-primary border-slate-300 focus:ring-brand-primary"
            />
            <div>
              <span className="block text-sm font-bold text-slate-800">Members (Requires Approval)</span>
              <span className="block text-xs text-slate-500 mt-0.5">Any verified member can create a group, but it must be approved by an Admin before becoming visible.</span>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-200">
            <input 
              type="radio" 
              name="groupCreationPolicy" 
              value="verified_instant" 
              checked={groupPolicy === 'verified_instant'}
              onChange={(e) => updateDraft('groupCreationPolicy', null, e.target.value)}
              className="mt-1 w-4 h-4 text-brand-primary border-slate-300 focus:ring-brand-primary"
            />
            <div>
              <span className="block text-sm font-bold text-slate-800">Members (Instant Creation)</span>
              <span className="block text-xs text-slate-500 mt-0.5">Any verified member can instantly create and publish groups without approval.</span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};
