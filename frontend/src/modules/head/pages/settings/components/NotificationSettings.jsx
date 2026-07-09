import React from 'react';
import { Bell } from 'lucide-react';

export const NotificationSettings = ({ settings, updateDraft }) => {
  // We'll map notifications from a hypothetical settings.notifications object
  // If it doesn't exist, we fallback to defaults
  const notif = settings?.notifications || {
    push: true, email: true, sms: false, whatsapp: false,
    announcements: true, approvals: true, birthdays: true, festivals: true,
    donations: true
  };

  const handleToggle = (key) => {
    updateDraft('notifications', key, !notif[key]);
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
          checked={!!notif[key]}
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
          <Bell size={20} className="text-brand-primary" />
          Notification Preferences
        </h2>
        <p className="text-xs text-white/50">Configure which channels and events trigger notifications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 space-y-1 mb-2">
          <h3 className="text-md font-bold text-white">Active Channels</h3>
        </div>
        {renderToggle('Push Notifications', 'push', 'In-app web/mobile push alerts.')}
        {renderToggle('Email Delivery', 'email', 'Send emails via configured SMTP.')}
        {renderToggle('SMS Gateway', 'sms', 'Send SMS (requires API setup).')}
        {renderToggle('WhatsApp API', 'whatsapp', 'Send WhatsApp messages (requires Meta API).')}

        <div className="md:col-span-2 space-y-1 mb-2 mt-4">
          <h3 className="text-md font-bold text-white">Event Triggers</h3>
        </div>
        {renderToggle('Official Announcements', 'announcements', 'Notify members on new circulars.')}
        {renderToggle('Approval Alerts', 'approvals', 'Notify admins on new registrations.')}
        {renderToggle('Birthday & Anniversary Wishes', 'birthdays', 'Automated greetings.')}
        {renderToggle('Festival Greetings', 'festivals', 'Send bulk greetings on marked festivals.')}
        {renderToggle('Donation Alerts', 'donations', 'Thank you alerts for donations.')}
      </div>
    </div>
  );
};
