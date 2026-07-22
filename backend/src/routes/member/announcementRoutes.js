const express = require('express');
const router  = express.Router();
const annCtrl = require('../../controllers/member/announcementController');
const { uploadChatImage, uploadSinglePhoto } = require('../../middleware/uploadMiddleware');
const rateLimit = require('express-rate-limit');

const imageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  message: { status: 'error', message: 'Upload limit exceeded.' }
});

// ─── Static routes FIRST (before dynamic /:id to avoid conflicts) ─────────────

// Messages (static segments must precede /:id)
router.patch('/messages/:messageId/pin',  annCtrl.pinAnnouncement);
router.delete('/messages/:messageId',     annCtrl.deleteAnnouncement);

// ─── Channel Management ────────────────────────────────────────────────────────
router.post('/',              uploadSinglePhoto, annCtrl.createChannel);
router.get('/',               annCtrl.getChannels);          // GET /member/announcements
router.get('/:id',            annCtrl.getChannelById);
router.patch('/:id',          uploadSinglePhoto, annCtrl.updateChannel);
router.delete('/:id',         annCtrl.deleteChannel);
router.patch('/:id/archive',  annCtrl.archiveChannel);

// ─── Channel Messages ──────────────────────────────────────────────────────────
router.post('/:id/messages',  imageLimiter, uploadChatImage, annCtrl.postAnnouncement);
router.get('/:id/messages',   annCtrl.getAnnouncements);

module.exports = router;
