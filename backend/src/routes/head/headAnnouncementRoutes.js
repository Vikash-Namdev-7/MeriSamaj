const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/authMiddleware');

// The Head uses the exact same core controller logic as members (with elevated privileges)
const annCtrl = require('../../controllers/member/announcementController');
const { uploadChatImage, uploadSinglePhoto } = require('../../middleware/uploadMiddleware');

// Secure all endpoints with Head Auth
router.use(protect);
router.use(authorize('head', 'admin'));

// ─── Channel Management ────────────────────────────────────────────────────────
router.post('/', uploadSinglePhoto, annCtrl.createChannel);
router.get('/', annCtrl.getChannels);
router.get('/:id', annCtrl.getChannelById);
router.patch('/:id', uploadSinglePhoto, annCtrl.updateChannel);
router.delete('/:id', annCtrl.deleteChannel);
router.patch('/:id/archive', annCtrl.archiveChannel);

// ─── Messages & Interactions ───────────────────────────────────────────────────
router.post('/:id/messages', uploadChatImage, annCtrl.postAnnouncement);
router.get('/:id/messages', annCtrl.getAnnouncements);
router.patch('/messages/:messageId/pin', annCtrl.pinAnnouncement);
router.delete('/messages/:messageId', annCtrl.deleteAnnouncement);

module.exports = router;
