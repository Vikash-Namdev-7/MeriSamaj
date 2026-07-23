/**
 * notificationService.js
 * Centralized service for creating UserNotification documents.
 * Used by all modules: matrimonial, events, donations, voting, chat, groups, announcements.
 */
const UserNotification = require('../models/UserNotification');
const { getIO } = require('./socketRegistry');

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
    const notification = await UserNotification.create({
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
    const io = getIO();
    if (io) { io.to(`user:${params.userId}`).emit('notification:new', notification); }
    return notification;
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

const notifyGroupJoinRejected = (userId, groupName) =>
  createNotification({
    userId,
    module:        'chat',
    type:          'group_join_rejected',
    title:         'Group Request Declined',
    message:       `Your request to join "${groupName}" was declined.`,
    icon:          '❌',
    priority:      'normal',
    actionUrl:     '/member/groups'
  });

const notifyGroupPromoted = (userId, groupName) =>
  createNotification({
    userId,
    module:        'chat',
    type:          'group_promoted',
    title:         'Promoted to Admin 🛡️',
    message:       `You are now an Admin of "${groupName}".`,
    icon:          '🛡️',
    priority:      'high',
    actionUrl:     `/member/groups`,
  });

const notifyGroupDemoted = (userId, groupName) =>
  createNotification({
    userId,
    module:        'chat',
    type:          'group_demoted',
    title:         'Admin Role Removed',
    message:       `You are no longer an Admin of "${groupName}".`,
    icon:          '⚠️',
    priority:      'normal',
    actionUrl:     `/member/groups`,
  });

const notifyGroupInviteAccepted = (inviterId, memberName, groupName) =>
  createNotification({
    userId:        inviterId,
    module:        'chat',
    type:          'group_invite_accepted',
    title:         'Invitation Accepted',
    message:       `${memberName} accepted your invitation to "${groupName}".`,
    icon:          '✅',
    priority:      'normal',
    actionUrl:     `/member/groups`,
  });

const notifyGroupInviteDeclined = (inviterId, memberName, groupName) =>
  createNotification({
    userId:        inviterId,
    module:        'chat',
    type:          'group_invite_declined',
    title:         'Invitation Declined',
    message:       `${memberName} declined your invitation to "${groupName}".`,
    icon:          '❌',
    priority:      'low',
    actionUrl:     `/member/groups`,
  });

/**
 * Notify community members about a new official post (Announcement/Emergency).
 * @param {string[]} memberIds
 * @param {string}   category       - 'Announcement' or 'Emergency'
 * @param {string}   authorName
 * @param {string}   messagePreview
 * @param {string}   postId
 */
const notifyOfficialPost = (memberIds, category, authorName, messagePreview, postId) => {
  const preview = (messagePreview || '').substring(0, 80);
  const isEmergency = category === 'Emergency';
  
  const promises = (memberIds || []).map(memberId =>
    createNotification({
      userId:        memberId,
      module:        'community',
      type:          isEmergency ? 'emergency' : 'announcement',
      title:         isEmergency ? `🚨 EMERGENCY UPDATE` : `📢 ${category} from ${authorName}`,
      message:       preview,
      icon:          isEmergency ? '🚨' : '📢',
      priority:      isEmergency ? 'urgent' : 'high',
      actionUrl:     `/member/social/${postId}`,
      referenceId:   postId,
      referenceType: 'Post'
    })
  );
  return Promise.allSettled(promises);
};

const notifyAnnouncement = (memberIds, authorName, messagePreview, postId) =>
  notifyOfficialPost(memberIds, 'Announcement', authorName, messagePreview, postId);

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


// ─── Event Notification Helpers ───────────────────────────────────────────────

/**
 * Notify community members that a new event has been created.
 * @param {string[]} memberIds
 * @param {string}   eventTitle
 * @param {string}   eventId
 */
const notifyEventCreated = (memberIds, eventTitle, eventId) => {
  const promises = (memberIds || []).map(memberId =>
    createNotification({
      userId:        memberId,
      module:        'events',
      type:          'event_created',
      title:         'New Event 📅',
      message:       `A new event "${eventTitle}" has been scheduled.`,
      icon:          '📅',
      priority:      'high',
      actionUrl:     `/member/events/${eventId}`,
      referenceId:   eventId,
      referenceType: 'Event'
    })
  );
  return Promise.allSettled(promises);
};

/**
 * Notify responded members that an event has been cancelled.
 * @param {string[]} memberIds
 * @param {string}   eventTitle
 * @param {string}   eventId
 */
const notifyEventCancelled = (memberIds, eventTitle, eventId) => {
  const promises = (memberIds || []).map(memberId =>
    createNotification({
      userId:        memberId,
      module:        'events',
      type:          'event_cancelled',
      title:         'Event Cancelled ❌',
      message:       `"${eventTitle}" has been cancelled.`,
      icon:          '❌',
      priority:      'urgent',
      actionUrl:     `/member/events/${eventId}`,
      referenceId:   eventId,
      referenceType: 'Event'
    })
  );
  return Promise.allSettled(promises);
};

/**
 * Notify responded members that an event has been deleted.
 * @param {string[]} memberIds
 * @param {string}   eventTitle
 * @param {string}   eventId
 */
const notifyEventDeleted = (memberIds, eventTitle, eventId) => {
  const promises = (memberIds || []).map(memberId =>
    createNotification({
      userId:        memberId,
      module:        'events',
      type:          'event_deleted',
      title:         'Event Removed 🗑️',
      message:       `"${eventTitle}" has been removed.`,
      icon:          '🗑️',
      priority:      'high',
      referenceId:   eventId,
      referenceType: 'Event'
    })
  );
  return Promise.allSettled(promises);
};

// ─── Donation & Campaign Notification Helpers ─────────────────────────────────

/**
 * Notify the community Head AND all admins of a new donation received.
 * @param {string|ObjectId} headId
 * @param {string[]}        adminIds
 * @param {string}          donorName
 * @param {number}          amount
 * @param {string}          campaignTitle
 * @param {string|ObjectId} donationId
 */
const notifyDonationReceived = (headId, adminIds, donorName, amount, campaignTitle, donationId) => {
  const recipients = [
    ...(headId ? [headId] : []),
    ...(adminIds || [])
  ];
  const promises = recipients.map(userId =>
    createNotification({
      userId,
      module:        'donations',
      type:          'donation_received',
      title:         'New Donation Received 💰',
      message:       `${donorName} donated ₹${amount} to "${campaignTitle}".`,
      icon:          '💰',
      priority:      'high',
      referenceId:   donationId,
      referenceType: 'Donation'
    })
  );
  return Promise.allSettled(promises);
};

/**
 * Notify the donor that their donation was received (receipt).
 * @param {string|ObjectId} donorId
 * @param {number}          amount
 * @param {string}          campaignTitle
 * @param {string|ObjectId} donationId
 */
const notifyDonationReceipt = (donorId, amount, campaignTitle, donationId) =>
  createNotification({
    userId:        donorId,
    module:        'donations',
    type:          'donation_receipt',
    title:         'Donation Receipt ✅',
    message:       `Thank you! Your donation of ₹${amount} to "${campaignTitle}" was received.`,
    icon:          '✅',
    priority:      'normal',
    referenceId:   donationId,
    referenceType: 'Donation'
  });

/**
 * Notify community members that a new donation campaign has been created.
 * @param {string[]}        memberIds
 * @param {string}          campaignTitle
 * @param {string|ObjectId} campaignId
 */
const notifyCampaignCreated = (memberIds, campaignTitle, campaignId) => {
  const promises = (memberIds || []).map(memberId =>
    createNotification({
      userId:        memberId,
      module:        'donations',
      type:          'campaign_created',
      title:         'New Donation Campaign 📢',
      message:       `A new campaign "${campaignTitle}" has been started.`,
      icon:          '📢',
      priority:      'high',
      actionUrl:     `/member/donations/${campaignId}`,
      referenceId:   campaignId,
      referenceType: 'Campaign'
    })
  );
  return Promise.allSettled(promises);
};

// ─── Professional Directory Notification Helpers ──────────────────────────────

const notifyListingSubmitted = (headId, ownerName, listingTitle, listingId) =>
  headId ? createNotification({
    userId:        headId,
    module:        'professional',
    type:          'listing_submitted',
    title:         'New Listing Pending Review 📋',
    message:       `${ownerName} submitted a new professional listing: "${listingTitle}".`,
    icon:          '📋',
    priority:      'high',
    actionUrl:     `/head/professional/${listingId}`,
    referenceId:   listingId,
    referenceType: 'Professional'
  }) : Promise.resolve();

const notifyListingApproved = (ownerId, listingTitle, listingId) =>
  createNotification({
    userId:        ownerId,
    module:        'professional',
    type:          'listing_approved',
    title:         'Listing Approved ✅',
    message:       `Your professional listing "${listingTitle}" has been approved and is now visible.`,
    icon:          '✅',
    priority:      'high',
    actionUrl:     `/member/professional/${listingId}`,
    referenceId:   listingId,
    referenceType: 'Professional'
  });

const notifyListingRejected = (ownerId, listingTitle, reason, listingId) =>
  createNotification({
    userId:        ownerId,
    module:        'professional',
    type:          'listing_rejected',
    title:         'Listing Not Approved',
    message:       `Your listing "${listingTitle}" was not approved. Reason: ${reason || 'Contact admin for details.'}`,
    icon:          '❌',
    priority:      'high',
    actionUrl:     `/member/professional/${listingId}`,
    referenceId:   listingId,
    referenceType: 'Professional'
  });

// ─── Voting / Elections Notification Helpers ──────────────────────────────────

const notifyElectionCreated = (memberIds, title, electionId) => {
  const promises = (memberIds || []).map(memberId =>
    createNotification({
      userId:        memberId,
      module:        'voting',
      type:          'election_created',
      title:         'New Election 🗳️',
      message:       `A new election "${title}" has been created. Cast your vote!`,
      icon:          '🗳️',
      priority:      'high',
      actionUrl:     `/member/voting/${electionId}`,
      referenceId:   electionId,
      referenceType: 'Voting'
    })
  );
  return Promise.allSettled(promises);
};

// ─── Fund Management Notification Helpers ─────────────────────────────────────

const notifyFundCreated = (memberIds, fundName, fundId) => {
  const promises = (memberIds || []).map(memberId =>
    createNotification({
      userId:        memberId,
      module:        'funds',
      type:          'fund_created',
      title:         'New Community Fund 💼',
      message:       `A new fund "${fundName}" has been created for the community.`,
      icon:          '💼',
      priority:      'high',
      actionUrl:     `/member/funds`,
      referenceId:   fundId,
      referenceType: 'Fund'
    })
  );
  return Promise.allSettled(promises);
};

const notifyContributionRecorded = (headId, memberName, amount, fundName, fundId) =>
  headId ? createNotification({
    userId:        headId,
    module:        'funds',
    type:          'contribution_recorded',
    title:         'Fund Contribution Received 💰',
    message:       `${memberName} contributed ₹${amount} to "${fundName}".`,
    icon:          '💰',
    priority:      'normal',
    actionUrl:     `/head/funds/${fundId}`,
    referenceId:   fundId,
    referenceType: 'Fund'
  }) : Promise.resolve();

// ─── Dharmashala / Booking Notification Helpers ───────────────────────────────

const notifyBookingReceived = (headId, bookedBy, dharmashalaName, bookingId) =>
  headId ? createNotification({
    userId:        headId,
    module:        'dharmashala',
    type:          'booking_received',
    title:         'New Booking Request 🏠',
    message:       `${bookedBy} requested a booking at "${dharmashalaName}".`,
    icon:          '🏠',
    priority:      'high',
    actionUrl:     `/head/dharmashala/bookings`,
    referenceId:   bookingId,
    referenceType: 'DharmashalaBooking'
  }) : Promise.resolve();

const notifyBookingStatusChanged = (userId, status, dharmashalaName, bookingId) =>
  createNotification({
    userId,
    module:        'dharmashala',
    type:          `booking_${status}`,
    title:         status === 'approved'  ? 'Booking Approved ✅'
                 : status === 'cancelled' ? 'Booking Cancelled ❌'
                 : 'Booking Updated',
    message:       status === 'approved'
      ? `Your booking at "${dharmashalaName}" has been approved.`
      : status === 'cancelled'
      ? `Your booking at "${dharmashalaName}" has been cancelled.`
      : `Your booking at "${dharmashalaName}" status has been updated to: ${status}.`,
    icon:          status === 'approved' ? '✅' : status === 'cancelled' ? '❌' : '🔔',
    priority:      'high',
    actionUrl:     `/member/dharmashala/bookings`,
    referenceId:   bookingId,
    referenceType: 'DharmashalaBooking'
  });

// ─── Obituary Notification Helpers ────────────────────────────────────────────

const notifyObituaryPosted = (memberIds, deceasedName, obituaryId) => {
  const promises = (memberIds || []).map(memberId =>
    createNotification({
      userId:        memberId,
      module:        'obituary',
      type:          'obituary_posted',
      title:         'Obituary Notice 🕊️',
      message:       `An obituary has been posted for "${deceasedName}". Please keep the family in your prayers.`,
      icon:          '🕊️',
      priority:      'high',
      actionUrl:     `/member/obituaries/${obituaryId}`,
      referenceId:   obituaryId,
      referenceType: 'Obituary'
    })
  );
  return Promise.allSettled(promises);
};

// ─── User Management / Account Notification Helpers ───────────────────────────

const notifyUserBlocked = (userId, reason) =>
  createNotification({
    userId,
    module:   'account',
    type:     'account_blocked',
    title:    'Account Blocked',
    message:  `Your account has been blocked. Reason: ${reason || 'Contact admin for details.'}`,
    icon:     '🚫',
    priority: 'urgent'
  });

const notifyUserActivated = (userId) =>
  createNotification({
    userId,
    module:   'account',
    type:     'account_activated',
    title:    'Account Activated ✅',
    message:  'Your account has been activated. You can now access all community features.',
    icon:     '✅',
    priority: 'high',
    actionUrl:'/member/home'
  });

const notifyHeadAssigned = (userId, communityName) =>
  createNotification({
    userId,
    module:   'account',
    type:     'head_assigned',
    title:    'You are now a Community Head 👑',
    message:  `You have been assigned as the Head of "${communityName}". Welcome to your new role!`,
    icon:     '👑',
    priority: 'urgent',
    actionUrl:'/head/dashboard'
  });

// ─── Matrimonial Extra Notification Helpers ───────────────────────────────────

const notifyProfileSubmittedToAdmin = (adminIds, memberName, profileId) => {
  const promises = (adminIds || []).map(adminId =>
    createNotification({
      userId:        adminId,
      module:        'matrimonial',
      type:          'matrimonial_profile_submitted',
      title:         'New Matrimonial Profile Pending 💍',
      message:       `${memberName} submitted a new matrimonial profile for review.`,
      icon:          '💍',
      priority:      'high',
      actionUrl:     `/admin/matrimonial/profiles/${profileId}`,
      referenceId:   profileId,
      referenceType: 'MatrimonialProfile'
    })
  );
  return Promise.allSettled(promises);
};

const notifyProfileSuspended = (userId, reason) =>
  createNotification({
    userId,
    module:   'matrimonial',
    type:     'matrimonial_profile_suspended',
    title:    'Profile Suspended',
    message:  `Your matrimonial profile has been suspended. Reason: ${reason || 'Contact admin for details.'}`,
    icon:     '⚠️',
    priority: 'urgent',
    actionUrl:'/member/matrimonial/profile'
  });

const notifyReportActioned = (reporterId, action) =>
  createNotification({
    userId:   reporterId,
    module:   'matrimonial',
    type:     'matrimonial_report_actioned',
    title:    'Report Update 📋',
    message:  `Your report has been ${action === 'actioned' ? 'reviewed and actioned' : 'reviewed and dismissed'} by admin.`,
    icon:     '📋',
    priority: 'normal',
    actionUrl:'/member/matrimonial'
  });

// ─── Groups & Chat Extra Notification Helpers ─────────────────────────────────

const notifyGroupCreatedToHead = (headId, creatorName, groupName, groupId) =>
  headId ? createNotification({
    userId:        headId,
    module:        'chat',
    type:          'group_created',
    title:         'New Group Created 👥',
    message:       `${creatorName} created a new group "${groupName}".`,
    icon:          '👥',
    priority:      'normal',
    actionUrl:     `/member/groups/${groupId}`,
    referenceId:   groupId,
    referenceType: 'Group'
  }) : Promise.resolve();

const notifyGroupCreatedInstant = (memberIds, groupName, groupId) => {
  const promises = (memberIds || []).map(memberId =>
    createNotification({
      userId:        memberId,
      module:        'chat',
      type:          'group_created_instant',
      title:         `New Group: ${groupName} 👥`,
      message:       `A new group "${groupName}" has been created.`,
      icon:          '👥',
      priority:      'normal',
      actionUrl:     `/member/groups/${groupId}`,
      referenceId:   groupId,
      referenceType: 'Group'
    })
  );
  return Promise.allSettled(promises);
};

const notifyMemberPromoted = (userId, groupName, groupId) =>
  createNotification({
    userId,
    module:        'chat',
    type:          'group_member_promoted',
    title:         'You are now a Group Admin 🌟',
    message:       `You have been promoted to admin in the group "${groupName}".`,
    icon:          '🌟',
    priority:      'high',
    actionUrl:     `/member/groups/${groupId}`,
    referenceId:   groupId,
    referenceType: 'Group'
  });

const notifyMemberDemoted = (userId, groupName, groupId) =>
  createNotification({
    userId,
    module:        'chat',
    type:          'group_member_demoted',
    title:         'Admin Role Removed',
    message:       `Your admin role in the group "${groupName}" has been removed.`,
    icon:          'ℹ️',
    priority:      'normal',
    actionUrl:     `/member/groups/${groupId}`,
    referenceId:   groupId,
    referenceType: 'Group'
  });

// ─── Announcement Channel Notification Helpers ────────────────────────────────

const notifyChannelCreated = (memberIds, channelName, channelId) => {
  const promises = (memberIds || []).map(memberId =>
    createNotification({
      userId:        memberId,
      module:        'chat',
      type:          'channel_created',
      title:         `New Channel: ${channelName} 📢`,
      message:       `A new announcement channel "${channelName}" has been created.`,
      icon:          '📢',
      priority:      'normal',
      actionUrl:     `/member/announcements/${channelId}`,
      referenceId:   channelId,
      referenceType: 'AnnouncementChannel'
    })
  );
  return Promise.allSettled(promises);
};

const notifyChannelDeleted = (memberIds, channelName) => {
  const promises = (memberIds || []).map(memberId =>
    createNotification({
      userId:        memberId,
      module:        'chat',
      type:          'channel_deleted',
      title:         'Channel Removed',
      message:       `The channel "${channelName}" has been removed.`,
      icon:          'ℹ️',
      priority:      'normal'
    })
  );
  return Promise.allSettled(promises);
};

// ─── Social Posts Notification Helpers ────────────────────────────────────────

const notifyPostActioned = (userId, action, postPreview, postId) =>
  createNotification({
    userId,
    module:        'social',
    type:          `post_${action}`,
    title:         action === 'deleted'  ? 'Post Removed by Admin 🗑️'
                 : action === 'hidden'   ? 'Post Hidden by Admin'
                 : action === 'pinned'   ? 'Post Pinned! 📌'
                 : action === 'featured' ? 'Post Featured! ⭐'
                 : `Post ${action}`,
    message:       action === 'deleted'  ? `Your post "${postPreview}" was removed by an admin.`
                 : action === 'hidden'   ? `Your post "${postPreview}" has been hidden by an admin.`
                 : action === 'pinned'   ? `Your post "${postPreview}" has been pinned by admin.`
                 : action === 'featured' ? `Your post "${postPreview}" has been featured by admin!`
                 : `Your post "${postPreview}" was ${action}.`,
    icon:          action === 'deleted' ? '🗑️' : action === 'hidden' ? '👁️' : action === 'pinned' ? '📌' : '⭐',
    priority:      ['deleted', 'hidden'].includes(action) ? 'high' : 'normal',
    referenceId:   postId,
    referenceType: 'Post'
  });

// ─── Invitation Notification Helpers ──────────────────────────────────────────

const notifyInvitationReceived = (memberIds, hostName, title, invitationId) => {
  const promises = (memberIds || []).map(memberId =>
    createNotification({
      userId:        memberId,
      module:        'invitations',
      type:          'invitation_received',
      title:         `You're Invited! 🎉`,
      message:       `${hostName} has invited you to "${title}".`,
      icon:          '🎉',
      priority:      'high',
      actionUrl:     `/member/invitations/${invitationId}`,
      referenceId:   invitationId,
      referenceType: 'Invitation'
    })
  );
  return Promise.allSettled(promises);
};

const notifyInvitationAccepted = (inviterId, inviteeName) =>
  createNotification({
    userId:        inviterId,
    module:        'referral',
    type:          'invitation_accepted',
    title:         'Invitation Accepted 🎉',
    message:       `${inviteeName} accepted your invitation!`,
    icon:          '🎉',
    priority:      'normal'
  });

const notifyReferralBonusEarned = (memberId, bonusAmount) =>
  createNotification({
    userId:        memberId,
    module:        'referral',
    type:          'referral_bonus_earned',
    title:         'Referral Bonus Earned 💰',
    message:       `You earned a referral bonus of ₹${bonusAmount}!`,
    icon:          '💰',
    priority:      'high'
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
  notifyGroupJoinRejected,
  notifyGroupRemoved,
  notifyGroupPromoted,
  notifyGroupDemoted,
  notifyGroupInviteAccepted,
  notifyGroupInviteDeclined,
  notifyOfficialPost,
  notifyAnnouncement,
  notifyMention,
  // ─── Events ──────────────────────────────────────────────────────────────────
  notifyEventCreated,
  notifyEventCancelled,
  notifyEventDeleted,
  // ─── Donations & Campaigns ───────────────────────────────────────────────────
  notifyDonationReceived,
  notifyDonationReceipt,
  notifyCampaignCreated,
  // ─── Professional Directory ───────────────────────────────────────────────────
  notifyListingSubmitted,
  notifyListingApproved,
  notifyListingRejected,
  // ─── Voting / Elections ───────────────────────────────────────────────────────
  notifyElectionCreated,
  // ─── Fund Management ─────────────────────────────────────────────────────────
  notifyFundCreated,
  notifyContributionRecorded,
  // ─── Dharmashala / Booking ────────────────────────────────────────────────────
  notifyBookingReceived,
  notifyBookingStatusChanged,
  // ─── Obituary ────────────────────────────────────────────────────────────────
  notifyObituaryPosted,
  // ─── User Management / Account ────────────────────────────────────────────────
  notifyUserBlocked,
  notifyUserActivated,
  notifyHeadAssigned,
  // ─── Matrimonial Extras ───────────────────────────────────────────────────────
  notifyProfileSubmittedToAdmin,
  notifyProfileSuspended,
  notifyReportActioned,
  // ─── Groups & Chat Extras ─────────────────────────────────────────────────────
  notifyGroupCreatedToHead,
  notifyGroupCreatedInstant,
  notifyMemberPromoted,
  notifyMemberDemoted,
  // ─── Announcement Channels ────────────────────────────────────────────────────
  notifyChannelCreated,
  notifyChannelDeleted,
  // ─── Social Posts ────────────────────────────────────────────────────────────
  notifyPostActioned,
  // ─── Invitations ─────────────────────────────────────────────────────────────
  notifyInvitationReceived,
  notifyInvitationAccepted,
  notifyReferralBonusEarned
};
