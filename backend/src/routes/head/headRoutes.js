const express = require('express');
const router = express.Router();
const donationRoutes = require('./donationRoutes');
const dharmashalaRoutes = require('./dharmashalaRoutes');
const votingRoutes = require('./votingRoutes');
const eventRoutes = require('./eventRoutes');
const headFundRoutes = require('./headFundRoutes');

// Test Route
router.get('/test', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Head routes working fine!'
  });
});

router.use('/donations', donationRoutes);
router.use('/dharmashala', dharmashalaRoutes);
router.use('/voting', votingRoutes);
router.use('/events', eventRoutes);
router.use('/funds', headFundRoutes);

// Social Moderation Routes
const headSocialRoutes = require('./headSocialRoutes');
router.use('/social', headSocialRoutes);

// Announcement Channels Routes
const headAnnouncementRoutes = require('./headAnnouncementRoutes');
router.use('/announcements', headAnnouncementRoutes);

// Group Management Routes
const headGroupRoutes = require('./headGroupRoutes');
router.use('/groups', headGroupRoutes);

// Professional Directory Approval Routes
const headProfessionalRoutes = require('./headProfessionalRoutes');
router.use('/professional', headProfessionalRoutes);

// Matrimonial Community Routes
const headMatrimonialRoutes = require('./headMatrimonialRoutes');
router.use('/matrimonial', headMatrimonialRoutes);

module.exports = router;
