/**
 * Service for Notification Settings and Templates.
 */

const INITIAL_TEMPLATES = {
  email: {
    welcome: 'Welcome to our community! We are glad to have you.',
    approval: 'Your profile has been approved.',
    rejection: 'Your profile registration was declined. Please contact admin.',
    eventReminder: 'Reminder: Upcoming Event tomorrow!',
    festival: 'Wishing you a very Happy Festival from the community.'
  },
  sms: {
    otp: 'Your OTP is {{otp}}. Do not share it.',
    approval: 'Your Samaj profile is approved. Login now.',
    festival: 'Happy Festival! - Samaj Council'
  },
  whatsapp: {
    approval: 'Hello! Your profile has been officially verified and approved.',
    reminder: 'Gentle reminder for the meeting tomorrow at 10 AM.'
  }
};

export const fetchNotificationTemplates = async (communityId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const saved = localStorage.getItem(`community_templates_${communityId}`);
      if (saved) {
        resolve(JSON.parse(saved));
      } else {
        resolve(INITIAL_TEMPLATES);
      }
    }, 500);
  });
};

export const updateNotificationTemplates = async (communityId, templates) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.setItem(`community_templates_${communityId}`, JSON.stringify(templates));
      resolve({ success: true });
    }, 800);
  });
};
