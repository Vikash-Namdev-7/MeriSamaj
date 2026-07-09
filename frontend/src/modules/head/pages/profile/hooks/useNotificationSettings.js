import { useState, useEffect } from 'react';

const MOCK_NOTIFICATIONS = {
  memberRegistration: { email: true, sms: false, push: true, inApp: true },
  memberApproval: { email: true, sms: true, push: true, inApp: true },
  events: { email: false, sms: false, push: true, inApp: true },
  matrimonial: { email: true, sms: false, push: false, inApp: true },
  professionalDirectory: { email: false, sms: false, push: false, inApp: true },
  reports: { email: true, sms: false, push: false, inApp: true },
  announcements: { email: true, sms: true, push: true, inApp: true },
  communityAlerts: { email: true, sms: true, push: true, inApp: true },
  marketing: { email: false, sms: false, push: false, inApp: false },
  systemUpdates: { email: true, sms: false, push: true, inApp: true }
};

export const useNotificationSettings = () => {
  const [preferences, setPreferences] = useState(MOCK_NOTIFICATIONS);
  const [saving, setSaving] = useState(false);

  const togglePreference = (category, channel) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [channel]: !prev[category][channel]
      }
    }));
  };

  const savePreferences = async () => {
    setSaving(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setSaving(false);
  };

  return {
    preferences,
    saving,
    togglePreference,
    savePreferences
  };
};
