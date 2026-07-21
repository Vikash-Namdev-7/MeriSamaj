/**
 * notificationService.js
 * Centralized service for creating UserNotification documents.
 * Used by all modules: matrimonial, events, donations, voting, etc.
 */
const UserNotification = require('../models/UserNotification');

/**
 * @param {Object} params
 * @param {string|ObjectId} params.userId       - Recipient's user ID
 * @param {string}          params.module       - Module name (matrimonial, events…)
 * @param {string}          params.type         - Notification type key
 * @param {string}          params.title        - Notification title
 * @param {string}          params.message      - Notification body
 * @param {string}          [params.icon]       - Emoji or icon string
 * @param {string}          [params.priority]   - low | normal | high | urgent
 * @param {string}          [params.actionUrl]  - Deep link URL
 * @param {ObjectId}        [params.referenceId]
 * @param {string}          [params.referenceType]
 */
const createNotification = async (params) => {
  try {
    await UserNotification.create({
      userId:        params.userId,
      module:        params.module,
      type:          params.type,
      title:         params.title,
      message:       params.message,
      icon:          params.icon          || '🔔',
      priority:      params.priority      || 'normal',
      actionUrl:     params.actionUrl     || null,
      referenceId:   params.referenceId   || null,
      referenceType: params.referenceType || null,
      isRead:        false
    });
  } catch (err) {
    // Non-critical — log but don't crash the main flow
    console.error('[NotificationService] Failed to create notification:', err.message);
  }
};

// ─── Matrimonial Convenience Helpers ─────────────────────────────────────────
const notifyInterestReceived = (receiverId, senderName, interestId) =>
  createNotification({
    userId:        receiverId,
    module:        'matrimonial',
    type:          'matrimonial_interest_received',
    title:         'New Interest Received! 💌',
    message:       `${senderName} has sent you an interest request.`,
    icon:          '💌',
    priority:      'high',
    actionUrl:     '/member/matrimonial/interests',
    referenceId:   interestId,
    referenceType: 'InterestRequest'
  });

const notifyInterestAccepted = (senderId, receiverName, interestId) =>
  createNotification({
    userId:        senderId,
    module:        'matrimonial',
    type:          'matrimonial_interest_accepted',
    title:         'Interest Accepted! 🎉',
    message:       `${receiverName} has accepted your interest request. You can now chat!`,
    icon:          '🎉',
    priority:      'high',
    actionUrl:     '/member/matrimonial/interests',
    referenceId:   interestId,
    referenceType: 'InterestRequest'
  });

const notifyInterestRejected = (senderId, interestId) =>
  createNotification({
    userId:        senderId,
    module:        'matrimonial',
    type:          'matrimonial_interest_rejected',
    title:         'Interest Update',
    message:       'Your interest request was not accepted this time.',
    icon:          '💔',
    priority:      'normal',
    referenceId:   interestId,
    referenceType: 'InterestRequest'
  });

const notifySubscriptionExpired = (userId) =>
  createNotification({
    userId,
    module:   'matrimonial',
    type:     'matrimonial_subscription_expired',
    title:    'Subscription Expired',
    message:  'Your Premium subscription has expired. Renew now to keep premium features.',
    icon:     '⏰',
    priority: 'urgent',
    actionUrl:'/member/matrimonial/subscription'
  });

const notifySubscriptionActivated = (userId, planName) =>
  createNotification({
    userId,
    module:   'matrimonial',
    type:     'matrimonial_subscription_activated',
    title:    'Premium Activated! ✨',
    message:  `Your ${planName} plan is now active. Enjoy unlimited features!`,
    icon:     '✨',
    priority: 'high',
    actionUrl:'/member/matrimonial'
  });

const notifyNewMessage = (receiverId, senderName, conversationId) =>
  createNotification({
    userId:        receiverId,
    module:        'matrimonial',
    type:          'chat_new_message',
    title:         'New Message 💬',
    message:       `${senderName} sent you a message.`,
    icon:          '💬',
    priority:      'normal',
    actionUrl:     `/member/matrimonial/chat/${conversationId}`,
    referenceId:   conversationId,
    referenceType: 'Conversation'
  });

const notifyProfileViewed = (profileOwnerId, viewerName) =>
  createNotification({
    userId:   profileOwnerId,
    module:   'matrimonial',
    type:     'matrimonial_profile_viewed',
    title:    'Someone Viewed Your Profile 👀',
    message:  `${viewerName} viewed your matrimonial profile.`,
    icon:     '👀',
    priority: 'low',
    actionUrl:'/member/matrimonial/profile'
  });

module.exports = {
  createNotification,
  notifyInterestReceived,
  notifyInterestAccepted,
  notifyInterestRejected,
  notifySubscriptionExpired,
  notifySubscriptionActivated,
  notifyNewMessage,
  notifyProfileViewed
};
