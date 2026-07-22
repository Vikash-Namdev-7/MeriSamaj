const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/authMiddleware');
const adminAnnCtrl = require('../../controllers/admin/adminAnnouncementController');

// Secure all endpoints with Master Admin Auth
router.use(protect);
router.use(authorize('admin'));

// ─── Global Channel Management ───────────────────────────────────────────────
router.get('/', adminAnnCtrl.getGlobalChannels);
router.get('/:id', adminAnnCtrl.getChannelById);
router.patch('/:id/posting-permission', adminAnnCtrl.updateChannelPermission);
router.patch('/:id/archive', adminAnnCtrl.archiveChannel);
router.delete('/:id', adminAnnCtrl.deleteChannel);

module.exports = router;
