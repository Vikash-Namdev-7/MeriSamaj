/**
 * notificationService.js
 * Centralized service for creating UserNotification documents.
 * Used by all modules: matrimonial, events, donations, voting, chat, groups, announcements.
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

/**
 * New Message notification — supports matrimonial and community chat.
 * @param {string} receiverId
 * @param {string} senderName
 * @param {string} conversationId
 * @param {string} [module='matrimonial'] - 'matrimonial' | 'chat'
 */
const notifyNewMessage = (receiverId, senderName, conversationId, module = 'matrimonial') =>
  createNotification({
    userId:        receiverId,
    module,
    type:          'chat_new_message',
    title:         'New Message 💬',
    message:       `${senderName} sent you a message.`,
    icon:          '💬',
    priority:      'normal',
    actionUrl:     module === 'matrimonial'
      ? `/member/matrimonial/chat/${conversationId}`
      : `/member/chat/${conversationId}`,
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

// ─── Group & Community Chat Notification Helpers ──────────────────────────────

/**
 * Notify a list of group members about a new group message (offline only).
 * @param {string[]} memberIds   - Array of user IDs to notify (excludes sender)
 * @param {string}   senderName
 * @param {string}   groupId
 * @param {string}   groupName
 */
const notifyGroupMessage = (memberIds, senderName, groupId, groupName) => {
  const promises = (memberIds || []).map(memberId =>
    createNotification({
      userId:        memberId,
      module:        'chat',
      type:          'group_new_message',
      title:         `New message in ${groupName}`,
      message:       `${senderName} sent a message.`,
      icon:          '👥',
      priority:      'normal',
      actionUrl:     `/member/groups/${groupId}`,
      referenceId:   groupId,
      referenceType: 'Group'
    })
  );
  return Promise.allSettled(promises);
};

/**
 * Notify a user they were added to a group.
 */
const notifyGroupInvite = (userId, inviterName, groupId, groupName) =>
  createNotification({
    userId,
    module:        'chat',
    type:          'group_invite',
    title:         `You were added to ${groupName} 👥`,
    message:       `${inviterName} added you to the group "${groupName}".`,
    icon:          '👥',
    priority:      'high',
    actionUrl:     `/member/groups/${groupId}`,
    referenceId:   groupId,
    referenceType: 'Group'
  });

/**
 * Notify Community Head of a pending group creation request.
 */
const notifyGroupJoinRequest = (headUserId, requesterName, groupId, groupName) =>
  createNotification({
    userId:        headUserId,
    module:        'chat',
    type:          'group_join_request',
    title:         'New Group Creation Request',
    message:       `${requesterName} wants to create the group "${groupName}". Approval required.`,
    icon:          '📋',
    priority:      'high',
    actionUrl:     `/member/groups/${groupId}`,
    referenceId:   groupId,
    referenceType: 'Group'
  });

/**
 * Notify user their group creation/join request was approved.
 */
const notifyGroupJoinApproved = (userId, groupId, groupName) =>
  createNotification({
    userId,
    module:        'chat',
    type:          'group_join_approved',
    title:         'Group Request Approved ✅',
    message:       `Your request for "${groupName}" has been approved.`,
    icon:          '✅',
    priority:      'high',
    actionUrl:     `/member/groups/${groupId}`,
    referenceId:   groupId,
    referenceType: 'Group'
  });

/**
 * Notify user they were removed from a group.
 */
const notifyGroupRemoved = (userId, groupName) =>
  createNotification({
    userId,
    module:        'chat',
    type:          'group_removed',
    title:         'Removed from Group',
    message:       `You have been removed from "${groupName}".`,
    icon:          '❌',
    priority:      'normal',
    actionUrl:     '/member/groups'
  });

/**
 * Notify community members about a new announcement.
 * @param {string[]} memberIds
 * @param {string}   channelName
 * @param {string}   messagePreview
 * @param {string}   channelId
 */
const notifyAnnouncement = (memberIds, channelName, messagePreview, channelId) => {
  const preview = (messagePreview || '').substring(0, 80);
  const promises = (memberIds || []).map(memberId =>
    createNotification({
      userId:        memberId,
      module:        'chat',
      type:          'announcement',
      title:         `📢 ${channelName}`,
      message:       preview,
      icon:          '📢',
      priority:      'high',
      actionUrl:     `/member/announcements/${channelId}`,
      referenceId:   channelId,
      referenceType: 'AnnouncementChannel'
    })
  );
  return Promise.allSettled(promises);
};

/**
 * Notify a user they were @mentioned in a message.
 */
const notifyMention = (userId, mentionerName, conversationId) =>
  createNotification({
    userId,
    module:        'chat',
    type:          'mention',
    title:         `${mentionerName} mentioned you 🔔`,
    message:       'You were mentioned in a conversation.',
    icon:          '@',
    priority:      'high',
    actionUrl:     `/member/chat/${conversationId}`,
    referenceId:   conversationId,
    referenceType: 'Conversation'
  });

module.exports = {
  createNotification,
  notifyInterestReceived,
  notifyInterestAccepted,
  notifyInterestRejected,
  notifySubscriptionExpired,
  notifySubscriptionActivated,
  notifyNewMessage,
  notifyProfileViewed,
  // ─── Group & Community Chat ─────────────────────────────────────────────────
  notifyGroupMessage,
  notifyGroupInvite,
  notifyGroupJoinRequest,
  notifyGroupJoinApproved,
  notifyGroupRemoved,
  notifyAnnouncement,
  notifyMention
};
