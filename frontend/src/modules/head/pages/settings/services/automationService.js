/**
 * Service for Automation Rules Workflow.
 */

const INITIAL_RULES = [
  {
    id: 1,
    name: 'New Member Onboarding',
    trigger: 'Member Approved',
    actions: ['Generate Member ID', 'Generate QR', 'Send Welcome Email', 'Push Notification'],
    active: true
  },
  {
    id: 2,
    name: 'Event Registration Confirmation',
    trigger: 'Event Ticket Booked',
    actions: ['Send WhatsApp Confirmation', 'Email Ticket PDF'],
    active: true
  }
];

export const fetchAutomationRules = async (communityId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const saved = localStorage.getItem(`community_automation_${communityId}`);
      if (saved) {
        resolve(JSON.parse(saved));
      } else {
        resolve(INITIAL_RULES);
      }
    }, 600);
  });
};

export const updateAutomationRules = async (communityId, payload) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.setItem(`community_automation_${communityId}`, JSON.stringify(payload));
      resolve({ success: true });
    }, 800);
  });
};
