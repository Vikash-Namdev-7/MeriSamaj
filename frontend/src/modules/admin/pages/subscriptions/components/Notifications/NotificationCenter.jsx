import React from 'react';
import { Bell, Mail, Smartphone, Settings } from 'lucide-react';

export const NotificationCenter = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-white">Notification Templates</h2>
          <p className="text-xs text-gray-400">Configure automated emails and SMS for subscription lifecycle</p>
        </div>
        <button className="btn-secondary py-2 px-4 flex items-center gap-2 text-sm">
          <Settings size={16} /> SMTP Settings
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: "Renewal Reminder", desc: "Sent 7 days before subscription expires", enabled: true, channels: ['email', 'sms'] },
          { title: "Payment Success", desc: "Sent immediately after successful charge", enabled: true, channels: ['email'] },
          { title: "Payment Failed", desc: "Sent immediately after failed charge", enabled: true, channels: ['email', 'sms'] },
          { title: "Trial Ending", desc: "Sent 3 days before trial expires", enabled: false, channels: ['email'] },
        ].map((tpl, i) => (
          <div key={i} className="card-neo p-5 flex items-start justify-between">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <Bell size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{tpl.title}</h3>
                <p className="text-xs text-gray-500 mb-3">{tpl.desc}</p>
                <div className="flex gap-2">
                  {tpl.channels.map(c => (
                    <span key={c} className="flex items-center gap-1 text-[10px] uppercase font-bold text-gray-400 bg-white/5 px-2 py-1 rounded">
                      {c === 'email' ? <Mail size={10} /> : <Smartphone size={10} />} {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked={tpl.enabled} />
                <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary peer-checked:after:bg-white"></div>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationCenter;
