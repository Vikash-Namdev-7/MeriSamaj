import React, { useState } from 'react';
import { Phone } from 'lucide-react';

export const WhatsAppTemplates = () => {
  const [activeTpl, setActiveTpl] = useState('approval');
  
  const templates = [
    { id: 'registration', name: 'Registration Received' },
    { id: 'approval', name: 'Profile Approval' },
    { id: 'invitation', name: 'Event Invitation' },
    { id: 'reminder', name: 'Meeting Reminder' },
    { id: 'festival', name: 'Festival Greetings' },
    { id: 'donation', name: 'Donation Appeal' }
  ];

  return (
    <div className="p-6 space-y-8 h-full flex flex-col">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Phone size={20} className="text-brand-primary" />
          WhatsApp Templates
        </h2>
        <p className="text-xs text-white/50">Manage Meta Business API approved WhatsApp templates.</p>
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

        {/* Editor Area */}
        <div className="flex-1 bg-white/5 border border-white/5 rounded-xl p-6 flex flex-col">
          <div className="flex-1 bg-black/40 border border-white/10 rounded-lg p-4 relative">
            <div className="absolute top-2 right-2 text-[10px] text-white/30 font-bold uppercase flex items-center gap-1">
               Meta Status: <span className="text-emerald-400">Approved</span>
            </div>
            <textarea 
              className="w-full h-full bg-transparent border-none outline-none text-sm text-white/80 resize-none mt-4 font-sans"
              defaultValue="Namaste {{user.name}} 🙏\n\nYour profile has been officially verified by the committee.\nWelcome to the community!"
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
