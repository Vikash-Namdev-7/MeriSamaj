const express = require('express');
const router  = express.Router();
const groupCtrl     = require('../../controllers/member/groupController');
const groupChatCtrl = require('../../controllers/member/groupChatController');
const { uploadChatImage, uploadSinglePhoto } = require('../../middleware/uploadMiddleware');
const rateLimit = require('express-rate-limit');

// Rate limiter for image uploads
const imageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  message: { status: 'error', message: 'Upload limit exceeded.' }
});

// ─── Static routes FIRST (must come before /:id to avoid conflicts) ──────────

// Group Chat — static paths first
router.get('/conversations/:conversationId/messages',    groupChatCtrl.getGroupMessages);
router.post('/conversations/:conversationId/messages',   imageLimiter, uploadChatImage, groupChatCtrl.sendGroupMessage);
router.get('/conversations/:conversationId/pinned',      groupChatCtrl.getPinnedMessages);
router.post('/conversations/:conversationId/seen',       groupChatCtrl.markGroupSeen);
router.patch('/messages/:messageId/pin',                 groupChatCtrl.pinMessage);
router.patch('/messages/:messageId/unpin',               groupChatCtrl.unpinMessage);
router.delete('/messages/:messageId',                    groupChatCtrl.deleteGroupMessage);

// Static member routes
router.get('/mine',   groupCtrl.getMyGroups);

// ─── Group CRUD ───────────────────────────────────────────────────────────────
router.post('/',      uploadSinglePhoto, groupCtrl.createGroup);
router.get('/',       groupCtrl.getGroups);
router.get('/:id',    groupCtrl.getGroupById);
router.patch('/:id',  uploadSinglePhoto, groupCtrl.updateGroup);
router.delete('/:id', groupCtrl.deleteGroup);

// ─── Approval (Head only) ─────────────────────────────────────────────────────
router.patch('/:id/approve', groupCtrl.approveGroup);

// ─── Join / Leave ─────────────────────────────────────────────────────────────
router.post('/:id/join',  groupCtrl.joinGroup);
router.post('/:id/leave', groupCtrl.leaveGroup);

// ─── Member Management ────────────────────────────────────────────────────────
router.get('/:id/members',                   groupCtrl.getGroupMembers);   // NEW
router.post('/:id/members',                  groupCtrl.addMember);
router.delete('/:id/members/:userId',        groupCtrl.removeMember);
router.patch('/:id/members/:userId/promote', groupCtrl.promoteToAdmin);
router.patch('/:id/members/:userId/demote',  groupCtrl.demoteAdmin);

// ─── Settings ─────────────────────────────────────────────────────────────────
router.patch('/:id/settings', groupCtrl.updateGroupSettings);

// ─── Group Conversation Link ───────────────────────────────────────────────────
router.get('/:groupId/conversation', groupChatCtrl.getGroupConversation);

module.exports = router;
