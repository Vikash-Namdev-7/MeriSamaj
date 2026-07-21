/**
 * matrimonialChatController.js
 * REST endpoints for Conversation listing and Message fetching.
 * Real-time events handled via Socket.io (matrimonialSocket.js).
 */
const Conversation = require('../../models/Conversation');
const Message      = require('../../models/Message');
const InterestRequest = require('../../models/InterestRequest');
const { checkFeature } = require('../../middleware/subscriptionMiddleware');
const { notifyNewMessage } = require('../../services/notificationService');

// ─── Open or Find Conversation by Profile ID ──────────────────────────────────
exports.openConversation = async (req, res) => {
  try {
    const { profileId } = req.body;
    if (!profileId) {
      return res.status(400).json({ status: 'error', message: 'profileId is required.' });
    }

    const MatrimonialProfile = require('../../models/MatrimonialProfile');
    const profile = await MatrimonialProfile.findOne({ _id: profileId, isDeleted: false });
    if (!profile) {
      return res.status(404).json({ status: 'error', message: 'Profile not found.' });
    }

    const otherUserId = profile.userId;

    // Verify accepted interest between the two users
    const interest = await InterestRequest.findOne({
      $or: [
        { senderId: req.user._id, receiverId: otherUserId, status: 'accepted' },
        { senderId: otherUserId, receiverId: req.user._id, status: 'accepted' }
      ]
    });
    if (!interest) {
      return res.status(403).json({ status: 'error', message: 'Chat is only available after an interest is accepted.' });
    }

    // Find existing conversation or create one
    let conversation = await Conversation.findOne({
      type: 'matrimonial',
      participants: { $all: [req.user._id, otherUserId] },
      isDeleted: false
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, otherUserId],
        type: 'matrimonial',
        referenceId: interest._id,
        createdBy: req.user._id,
        isActive: true
      });
      // Link conversation to interest
      interest.conversationId = conversation._id;
      await interest.save();
    }

    res.json({ status: 'success', data: { conversation } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Get All Conversations for User ──────────────────────────────────────────
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
      type: 'matrimonial',
      isDeleted: false
    })
      .sort({ lastMessageAt: -1 })
      .populate('participants', 'name avatar')
      .populate('lastMessageId', 'message type senderId createdAt');

    res.json({ status: 'success', data: { conversations } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Get Messages in a Conversation ──────────────────────────────────────────
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
      isDeleted: false
    });
    if (!conversation) {
      return res.status(403).json({ status: 'error', message: 'Access denied to this conversation.' });
    }

    // Check chat is backed by accepted interest
    const interest = await InterestRequest.findOne({
      _id: conversation.referenceId,
      status: 'accepted'
    });
    if (!interest) {
      return res.status(403).json({ status: 'error', message: 'Chat is only available after an interest is accepted.' });
    }

    const total = await Message.countDocuments({ conversationId, isDeleted: false });
    const messages = await Message.find({ conversationId, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('senderId', 'name avatar')
      .populate('replyTo', 'message type senderId');

    // Mark as delivered/seen — batch update
    await Message.updateMany(
      { conversationId, senderId: { $ne: req.user._id }, 'seenBy.userId': { $ne: req.user._id } },
      { $push: { seenBy: { userId: req.user._id, seenAt: new Date() }, deliveredTo: req.user._id } }
    );

    res.json({
      status: 'success',
      data: { messages: messages.reverse(), total, page: Number(page) } // Oldest first
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Send Message via REST (Socket.io is preferred, this is a fallback) ───────
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { message, type = 'text', mediaUrl, replyTo } = req.body;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
      isDeleted: false
    });
    if (!conversation) {
      return res.status(403).json({ status: 'error', message: 'Access denied.' });
    }

    // ─── Verify accepted interest ─────────────────────────────────────────────
    const interest = await InterestRequest.findOne({ _id: conversation.referenceId, status: 'accepted' });
    if (!interest) {
      return res.status(403).json({ status: 'error', message: 'Chat requires an accepted interest request.' });
    }

    const newMsg = await Message.create({
      conversationId,
      senderId: req.user._id,
      type,
      message: message || '',
      mediaUrl: mediaUrl || null,
      replyTo:  replyTo  || null,
      deliveredTo: [req.user._id]
    });

    // Update conversation last message cache
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessageId:      newMsg._id,
      lastMessageAt:      newMsg.createdAt,
      lastMessagePreview: type === 'text' ? (message || '').substring(0, 80) : `📷 ${type}`
    });

    // Notify other participants
    const otherParticipants = conversation.participants.filter(p => !p.equals(req.user._id));
    for (const participantId of otherParticipants) {
      notifyNewMessage(participantId, req.user.name, conversationId);
    }

    res.status(201).json({ status: 'success', data: { message: newMsg } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Delete Message (for sender) ─────────────────────────────────────────────
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { deleteFor = 'me' } = req.body; // 'me' or 'everyone'

    const msg = await Message.findOne({ _id: messageId });
    if (!msg) return res.status(404).json({ status: 'error', message: 'Message not found.' });

    if (deleteFor === 'everyone' && msg.senderId.equals(req.user._id)) {
      msg.isDeleted = true;
      msg.deletedAt = new Date();
      msg.message   = '';
    } else {
      if (!msg.deletedFor.includes(req.user._id)) {
        msg.deletedFor.push(req.user._id);
      }
    }
    await msg.save();
    res.json({ status: 'success', message: 'Message deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
