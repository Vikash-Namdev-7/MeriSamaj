const express = require('express');
const router = express.Router();
const {
  createInvitation,
  getInvitations,
  getInvitationById,
  updateRSVP,
  deleteInvitation,
  updateInvitation
} = require('../../controllers/member/invitationController');
const { protect } = require('../../middleware/authMiddleware');
const upload = require('../../middleware/uploadMiddleware');

// Apply protection to all routes in this file
router.use(protect);

router.route('/')
  .get(getInvitations)
  // Accept multiple images with the field name 'images'
  .post(upload.array('images', 5), createInvitation);

router.route('/:id')
  .get(getInvitationById)
  .put(upload.array('images', 5), updateInvitation)
  .delete(deleteInvitation);

router.route('/:id/rsvp')
  .put(updateRSVP);

module.exports = router;
