export const engagementNotificationService = {
  sendReminder: async (communityId, memberId, reminderType, customMessage) => {
    console.log(`Sending reminder to member ${memberId} in community ${communityId}`, { reminderType, customMessage });
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 600));
  },

  sendVolunteerInvitation: async (communityId, memberIds, eventId) => {
    console.log(`Inviting members to volunteer for event ${eventId}`);
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 600));
  },

  sendRecognitionMessage: async (communityId, memberId, badgeId, message) => {
    console.log(`Sending recognition badge ${badgeId} to member ${memberId}`);
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 600));
  },

  sendCommunityAppreciation: async (communityId, message) => {
    console.log(`Sending community appreciation message: ${message}`);
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 600));
  }
};
