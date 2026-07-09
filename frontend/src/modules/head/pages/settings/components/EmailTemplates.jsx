import React, { useState } from 'react';
import { Mail } from 'lucide-react';

export const EmailTemplates = () => {
  const [activeTpl, setActiveTpl] = useState('welcome');
  
  const templates = [
    { id: 'welcome', name: 'Welcome Email' },
    { id: 'approval', name: 'Profile Approval' },
    { id: 'rejection', name: 'Profile Rejection' },
    { id: 'event', name: 'Event Reminder' },
    { id: 'festival', name: 'Festival Greetings' }
  ];

  return (
    <div className="p-6 space-y-8 h-full flex flex-col">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Mail size={20} className="text-brand-primary" />
          Email Template Builder
        </h2>
        <p className="text-xs text-white/50">Design emails sent to your community members.</p>
      </div>

      <div className="flex gap-6 flex-1 min-h-[400px]">
        {/* Template List */}
        <div className="w-1/3 bg-white/5 border border-white/5 rounded-xl p-4 space-y-2">
          {templates.map(tpl => (
            <button
              key={tpl.id}
              onClick={() => setActiveTpl(tpl.id)}
              className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold transition-all ${
                activeTpl === tpl.id ? 'bg-brand-primary text-white' : 'text-white/60 hover:bg-white/10'
              }`}
            >
              {tpl.name}
            </button>
          ))}
        </div>

        {/* Editor Area (Mock) */}
        <div className="flex-1 bg-white/5 border border-white/5 rounded-xl p-6 flex flex-col">
          <div className="mb-4">
            <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider block mb-1">Subject Line</label>
            <input 
              type="text" 
              defaultValue={`Editing: ${templates.find(t => t.id === activeTpl)?.name}`}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand-primary"
            />
          </div>
          
          <div className="flex-1 bg-black/40 border border-white/10 rounded-lg p-4 relative">
            <div className="absolute top-2 right-2 text-[10px] text-white/30 font-bold uppercase">WYSIWYG Editor Mock</div>
            <textarea 
              className="w-full h-full bg-transparent border-none outline-none text-sm text-white/80 resize-none mt-4"
              defaultValue="Dear {{user.name}},\n\nWelcome to our community. We are thrilled to have you here.\n\nRegards,\nCommunity Admin"
            />
          </div>
          
          <div className="mt-4 flex gap-2">
            <span className="text-[10px] bg-white/10 text-white px-2 py-1 rounded cursor-pointer hover:bg-brand-primary">{'{{user.name}}'}</span>
            <span className="text-[10px] bg-white/10 text-white px-2 py-1 rounded cursor-pointer hover:bg-brand-primary">{'{{community.name}}'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
