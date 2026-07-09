import React from 'react';
import { Calendar } from 'lucide-react';

export const EventSettings = ({ settings, updateDraft }) => {
  const evt = settings?.events || {};

  const handleToggle = (key) => {
    updateDraft('events', key, !evt[key]);
  };

  const handleChange = (e) => {
    updateDraft('events', e.target.name, e.target.value);
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
          checked={!!evt[key]}
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
          <Calendar size={20} className="text-brand-primary" />
          Event Settings
        </h2>
        <p className="text-xs text-white/50">Global configurations for community events and ticketing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderToggle('QR Attendance tracking', 'qrAttendance', 'Enable QR scanning at event venue.')}
        {renderToggle('Guest Registration', 'guestRegistration', 'Allow non-members to buy tickets.')}
        {renderToggle('Auto Waiting List', 'autoWaitingList', 'When seats are full, add to waitlist.')}
        {renderToggle('Certificate Generation', 'certificateGen', 'Auto-generate certificates for attendees.')}
        
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Default Max Seats</label>
            <input 
              type="number"
              name="maxSeatsDefault"
              value={evt.maxSeatsDefault || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-sm text-white transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Reminder Notifications (Hours Before)</label>
            <input 
              type="number"
              name="reminderHours"
              value={evt.reminderHours || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-sm text-white transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
