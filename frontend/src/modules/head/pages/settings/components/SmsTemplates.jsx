import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';

export const SmsTemplates = () => {
  const [activeTpl, setActiveTpl] = useState('otp');
  
  const templates = [
    { id: 'otp', name: 'OTP Verification' },
    { id: 'approval', name: 'Profile Approval' },
    { id: 'reminder', name: 'Event Reminder' },
    { id: 'donation', name: 'Donation Receipt' },
    { id: 'festival', name: 'Festival Greetings' }
  ];

  return (
    <div className="p-6 space-y-8 h-full flex flex-col">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <MessageSquare size={20} className="text-brand-primary" />
          SMS Template Builder
        </h2>
        <p className="text-xs text-white/50">Manage text messages sent via SMS gateway. Keep it under 160 characters.</p>
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
            <textarea 
              className="w-full h-full bg-transparent border-none outline-none text-sm text-white/80 resize-none font-mono"
              defaultValue="Your OTP for Samaj Login is {{otp}}. Valid for 10 mins."
              maxLength={160}
            />
            <div className="absolute bottom-3 right-3 text-[10px] text-white/50 font-bold">
              58 / 160 chars
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <span className="text-[10px] bg-white/10 text-white px-2 py-1 rounded cursor-pointer hover:bg-brand-primary">{'{{otp}}'}</span>
            <span className="text-[10px] bg-white/10 text-white px-2 py-1 rounded cursor-pointer hover:bg-brand-primary">{'{{user.name}}'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
