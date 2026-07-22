/**
 * announcementController.js
 * REST endpoints for Announcement Channels.
 */
const AnnouncementChannel = require('../../models/AnnouncementChannel');
const AnnouncementAuditLog = require('../../models/AnnouncementAuditLog');
const Community           = require('../../models/Community');
const User                = require('../../models/User');
const Conversation        = require('../../models/Conversation');
const Message             = require('../../models/Message');
const { findOrCreateGroupConversation } = require('../../services/conversationService');
const { createMessage, getMessages, pinMessage, unpinMessage, deleteMessageForEveryone } = require('../../services/messageService');
const { notifyAnnouncement } = require('../../services/notificationService');

// ─── Helpers ─────────────────────────────────────────────────────────────────

const logAction = async (channelId, communityId, action, userId, details = {}) => {
  try {
    await AnnouncementAuditLog.create({ channelId, communityId, action, userId, details });
  } catch (err) {
    console.error('[AuditLog Error]', err.message);
  }
};

const canPostInChannel = (channel, userRole) => {
  if (userRole === 'admin') return true; // Master Admin override
  if (channel.whoCanPost === 'everyone') return true;
  if (channel.whoCanPost === 'verified_members' && ['verified', 'head', 'admin'].includes(userRole)) return true;
  if (channel.whoCanPost === 'moderators' && ['head', 'admin', 'moderator'].includes(userRole)) return true;
  if (channel.whoCanPost === 'head_and_admins' && ['head', 'admin'].includes(userRole)) return true;
  if (channel.whoCanPost === 'head_only') return userRole === 'head';
  return false;
};

const canViewChannel = (channel, userRole) => {
  if (userRole === 'admin') return true; // Master Admin override
  if (channel.whoCanView === 'everyone') return true;
  if (channel.whoCanView === 'verified_members' && ['verified', 'head', 'admin'].includes(userRole)) return true;
  if (channel.whoCanView === 'moderators' && ['head', 'admin', 'moderator'].includes(userRole)) return true;
  if (channel.whoCanView === 'head_and_admins' && ['head', 'admin'].includes(userRole)) return true;
  if (channel.whoCanView === 'head_only') return userRole === 'head';
  return false;
};

const getRateLimitByRole = (role) => {
  if (role === 'admin') return 50;
  if (role === 'head') return 20;
  if (role === 'admin') return 10;
  if (role === 'moderator') return 5;
  return 1; // Default member
};

// ─── Create Announcement Channel ──────────────────────────────────────────────
exports.createChannel = async (req, res) => {
  try {
    const isMasterAdmin = req.user.role === 'admin';
    const isHead = req.user.role === 'head';
    if (!isMasterAdmin && !isHead) {
      return res.status(403).json({ status: 'error', message: 'Only the Community Head or Master Admin can create announcement channels.' });
    }

    const { name, description, whoCanPost, whoCanView, communityId: bodyCommId } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ status: 'error', message: 'Channel name is required.' });
    }

    const communityId = isMasterAdmin && bodyCommId ? bodyCommId : req.user.communityId;
    if (!communityId) return res.status(400).json({ status: 'error', message: 'Community not found.' });

    // Check Channel Limits
    const channelCount = await AnnouncementChannel.countDocuments({ communityId, isDeleted: false });
    if (channelCount >= 100) {
      return res.status(400).json({ status: 'error', message: 'Maximum limit of 100 announcement channels reached for this community.' });
    }

    let avatarUrl = null, avatarPublicId = null;
    if (req.file) {
      avatarUrl = req.file.path || null;
      avatarPublicId = req.file.filename || req.file.public_id || null;
    }

    const channel = await AnnouncementChannel.create({
      communityId,
      name: name.trim(),
      description: description?.trim() || '',
      whoCanPost: whoCanPost || 'head_only',
      whoCanView: whoCanView || 'everyone',
      creator: req.user._id,
      avatar: avatarUrl,
      avatarPublicId
    });

    const { conversation } = await findOrCreateGroupConversation(
      channel._id,
      [req.user._id],
      'community',
      req.user._id
    );
    channel.conversationId = conversation._id;
    await channel.save();

    await logAction(channel._id, communityId, 'CHANNEL_CREATED', req.user._id, { name: channel.name });

    res.status(201).json({ status: 'success', data: { channel } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Get All Channels ────────────────────────────────────────────────────────
exports.getChannels = async (req, res) => {
  try {
    const communityId = req.user.communityId;
    if (!communityId) return res.status(400).json({ status: 'error', message: 'Community not found.' });

    const allChannels = await AnnouncementChannel.find({
      communityId,
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .populate('creator', 'name avatar');

    const visibleChannels = allChannels.filter(c => canViewChannel(c, req.user.role));

    res.json({ status: 'success', data: { channels: visibleChannels } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Get Channel Detail ───────────────────────────────────────────────────────
exports.getChannelById = async (req, res) => {
  try {
    const { id } = req.params;
    const isMasterAdmin = req.user.role === 'admin';
    const query = { _id: id, isDeleted: false };
    if (!isMasterAdmin) query.communityId = req.user.communityId;

    const channel = await AnnouncementChannel.findOne(query).populate('creator', 'name avatar');

    if (!channel) return res.status(404).json({ status: 'error', message: 'Channel not found.' });
    if (!canViewChannel(channel, req.user.role)) return res.status(403).json({ status: 'error', message: 'You do not have permission to view this channel.' });

    res.json({ status: 'success', data: { channel } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Update Channel ───────────────────────────────────────────────────────────
exports.updateChannel = async (req, res) => {
  try {
    const isMasterAdmin = req.user.role === 'admin';
    const isHead = req.user.role === 'head';
    if (!isMasterAdmin && !isHead) {
      return res.status(403).json({ status: 'error', message: 'Only the Community Head or Master Admin can edit channels.' });
    }

    const { id } = req.params;
    const { name, description, whoCanPost, whoCanView } = req.body;

    const query = { _id: id, isDeleted: false };
    if (!isMasterAdmin) query.communityId = req.user.communityId;

    const channel = await AnnouncementChannel.findOne(query);
    if (!channel) return res.status(404).json({ status: 'error', message: 'Channel not found.' });

    const oldDetails = { name: channel.name, whoCanPost: channel.whoCanPost, whoCanView: channel.whoCanView };

    if (name) channel.name = name.trim();
    if (description !== undefined) channel.description = description.trim();
    if (whoCanPost) channel.whoCanPost = whoCanPost;
    if (whoCanView) channel.whoCanView = whoCanView;

    if (req.file) {
      if (channel.avatarPublicId) {
        try { const cloudinary = require('cloudinary').v2; await cloudinary.uploader.destroy(channel.avatarPublicId); } catch (e) {}
      }
      channel.avatar = req.file.path || null;
      channel.avatarPublicId = req.file.filename || req.file.public_id || null;
    }

    await channel.save();

    if (oldDetails.whoCanPost !== channel.whoCanPost || oldDetails.whoCanView !== channel.whoCanView) {
      await logAction(channel._id, channel.communityId, 'PERMISSION_CHANGED', req.user._id, { from: oldDetails, to: { whoCanPost: channel.whoCanPost, whoCanView: channel.whoCanView } });
    } else {
      await logAction(channel._id, channel.communityId, 'CHANNEL_EDITED', req.user._id, { name: channel.name });
    }

    res.json({ status: 'success', data: { channel } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Delete Channel ───────────────────────────────────────────────────────────
exports.deleteChannel = async (req, res) => {
  try {
    const isMasterAdmin = req.user.role === 'admin';
    const isHead = req.user.role === 'head';
    if (!isMasterAdmin && !isHead) {
      return res.status(403).json({ status: 'error', message: 'Only the Community Head or Admin can delete channels.' });
    }

    const query = { _id: req.params.id, isDeleted: false };
    if (!isMasterAdmin) query.communityId = req.user.communityId;

    const channel = await AnnouncementChannel.findOne(query);
    if (!channel) return res.status(404).json({ status: 'error', message: 'Channel not found.' });

    if (channel.isDefault && !isMasterAdmin) {
      return res.status(403).json({ status: 'error', message: 'The default Community Announcements channel cannot be deleted.' });
    }

    // Soft delete
    channel.isDeleted = true;
    channel.deletedAt = new Date();
    await channel.save();

    await logAction(channel._id, channel.communityId, 'SOFT_DELETED', req.user._id, {});

    if (channel.conversationId) {
      await Conversation.findByIdAndUpdate(channel.conversationId, { isDeleted: true, deletedAt: new Date() });
    }

    res.json({ status: 'success', message: 'Channel deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Archive / Unarchive Channel ──────────────────────────────────────────────
exports.archiveChannel = async (req, res) => {
  try {
    const isMasterAdmin = req.user.role === 'admin';
    const isHead = req.user.role === 'head';
    if (!isMasterAdmin && !isHead) {
      return res.status(403).json({ status: 'error', message: 'Only the Community Head or Admin can archive channels.' });
    }

    const query = { _id: req.params.id, isDeleted: false };
    if (!isMasterAdmin) query.communityId = req.user.communityId;

    const channel = await AnnouncementChannel.findOne(query);
    if (!channel) return res.status(404).json({ status: 'error', message: 'Channel not found.' });

    channel.isArchived = !channel.isArchived;
    channel.archivedAt = channel.isArchived ? new Date() : null;
    await channel.save();

    await logAction(channel._id, channel.communityId, channel.isArchived ? 'ARCHIVED' : 'RESTORED', req.user._id, {});

    res.json({ status: 'success', message: channel.isArchived ? 'Channel archived.' : 'Channel restored.', data: { isArchived: channel.isArchived } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Post Announcement ────────────────────────────────────────────────────────
exports.postAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const isMasterAdmin = req.user.role === 'admin';
    const query = { _id: id, isDeleted: false, isArchived: false };
    if (!isMasterAdmin) query.communityId = req.user.communityId;

    const channel = await AnnouncementChannel.findOne(query);
    if (!channel) return res.status(404).json({ status: 'error', message: 'Channel not found or is archived.' });

    if (!canPostInChannel(channel, req.user.role)) {
      return res.status(403).json({ status: 'error', message: 'You do not have permission to post announcements in this channel.' });
    }

    if (!channel.conversationId) {
      return res.status(500).json({ status: 'error', message: 'Channel conversation not found. Please contact admin.' });
    }

    // Message Validation
    if ((!message || !message.trim()) && !req.file) {
      return res.status(400).json({ status: 'error', message: 'Announcement cannot be empty.' });
    }
    if (message && message.length > 5000) {
      return res.status(400).json({ status: 'error', message: 'Message exceeds maximum length of 5000 characters.' });
    }

    // Rate Limiting Check
    const recentMessages = await Message.countDocuments({
      senderId: req.user._id,
      conversationId: channel.conversationId,
      createdAt: { $gt: new Date(Date.now() - 60000) }
    });
    if (recentMessages >= getRateLimitByRole(req.user.role)) {
      return res.status(429).json({ status: 'error', message: 'Rate limit exceeded. Please wait a moment before sending more announcements.' });
    }

    let mediaUrl = null, mediaPublicId = null;
    let msgType = 'text';
    if (req.file) {
      mediaUrl = req.file.path || null;
      mediaPublicId = req.file.filename || req.file.public_id || null;
      msgType = 'image';
    }

    const populatedMsg = await createMessage({
      conversationId: channel.conversationId,
      senderId: req.user._id,
      type: msgType,
      message: message || '',
      mediaUrl,
      mediaPublicId
    });

    await logAction(channel._id, channel.communityId, 'ANNOUNCEMENT_SENT', req.user._id, { messageId: populatedMsg._id });

    // Broadcast
    const io = req.app.get('io');
    if (io) {
      io.to(`conv:${channel.conversationId}`).emit('chat:new_message', {
        ...populatedMsg,
        channelId: channel._id,
        channelName: channel.name
      });
    }

    // Notify members who can view this channel
    User.find({
      communityId: channel.communityId,
      verificationStatus: 'verified',
      accountStatus: 'active',
      _id: { $ne: req.user._id }
    })
      .select('_id role')
      .lean()
      .then(users => {
        const memberIds = users.filter(u => canViewChannel(channel, u.role || 'user')).map(u => u._id);
        if (memberIds.length > 0) {
          notifyAnnouncement(memberIds, channel.name, message, channel._id);
        }
      })
      .catch(err => console.error('[AnnouncementController] Notify error:', err.message));

    res.status(201).json({ status: 'success', data: { message: populatedMsg } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Get Announcements ────────────────────────────────────────────────────────
exports.getAnnouncements = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 30 } = req.query;

    const isMasterAdmin = req.user.role === 'admin';
    const query = { _id: id, isDeleted: false };
    if (!isMasterAdmin) query.communityId = req.user.communityId;

    const channel = await AnnouncementChannel.findOne(query);
    if (!channel) return res.status(404).json({ status: 'error', message: 'Channel not found.' });

    if (!canViewChannel(channel, req.user.role)) {
      return res.status(403).json({ status: 'error', message: 'You do not have permission to view messages in this channel.' });
    }

    if (!channel.conversationId) {
      return res.json({ status: 'success', data: { messages: [], total: 0 } });
    }

    const { messages, total } = await getMessages(channel.conversationId, req.user._id, Number(page), Number(limit));

    res.json({ status: 'success', data: { messages, total, page: Number(page) } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Pin Announcement ─────────────────────────────────────────────────────────
exports.pinAnnouncement = async (req, res) => {
  try {
    const isMasterAdmin = req.user.role === 'admin';
    const isHead = req.user.role === 'head';
    if (!isMasterAdmin && !isHead) {
      return res.status(403).json({ status: 'error', message: 'Only the Community Head or Admin can pin announcements.' });
    }

    const { messageId } = req.params;
    const msg = await pinMessage(messageId, req.user._id);
    if (!msg) return res.status(404).json({ status: 'error', message: 'Message not found.' });

    const channel = await AnnouncementChannel.findOne({ conversationId: msg.conversationId });
    if (channel) {
      await logAction(channel._id, channel.communityId, 'PINNED', req.user._id, { messageId });
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`conv:${msg.conversationId}`).emit('chat:message_pinned', { messageId, conversationId: msg.conversationId });
    }

    res.json({ status: 'success', message: 'Announcement pinned.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Delete Announcement Message ──────────────────────────────────────────────
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ status: 'error', message: 'Message not found.' });

    const isMasterAdmin = req.user.role === 'admin';
    const isHead = req.user.role === 'head';
    const isSender = msg.senderId.toString() === userId.toString();
    
    if (!isSender && !isMasterAdmin && !isHead) {
      return res.status(403).json({ status: 'error', message: 'You do not have permission to delete this announcement.' });
    }

    await deleteMessageForEveryone(messageId, msg.senderId);

    const channel = await AnnouncementChannel.findOne({ conversationId: msg.conversationId });
    if (channel) {
      await logAction(channel._id, channel.communityId, 'ANNOUNCEMENT_DELETED', req.user._id, { messageId });
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`conv:${msg.conversationId}`).emit('chat:message_deleted', {
        messageId,
        conversationId: msg.conversationId
      });
    }

    res.json({ status: 'success', message: 'Announcement deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
