const express = require('express');
const router = express.Router();
const headInvitationController = require('../../controllers/head/headInvitationController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// Require Head authorization (Head, Sub-Head, Admins)
router.use(protect, authorize('head', 'sub_head', 'admin', 'super_admin', 'master_admin'));

// Head Digital Invitation Operations
router.get('/', headInvitationController.getAllInvitations);
router.get('/stats', headInvitationController.getInvitationStats);
router.get('/:id', headInvitationController.getInvitationById);
router.patch('/:id/status', headInvitationController.updateInvitationStatus);
router.delete('/:id', headInvitationController.deleteInvitation);

module.exports = router;
