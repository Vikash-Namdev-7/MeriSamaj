const express = require('express');
const router = express.Router();
const adminInvitationController = require('../../controllers/admin/adminInvitationController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// Require Admin authorization
router.use(protect, authorize('admin'));

// Admin Digital Invitation Operations
router.get('/', adminInvitationController.getAllInvitations);
router.get('/stats', adminInvitationController.getInvitationStats);
router.get('/:id', adminInvitationController.getInvitationById);
router.patch('/:id/status', adminInvitationController.updateInvitationStatus);
router.delete('/:id', adminInvitationController.deleteInvitation);

module.exports = router;
