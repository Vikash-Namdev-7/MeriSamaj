const express = require('express');
const router = express.Router();

const invitationRoutes = require('./invitationRoutes');
const donationRoutes = require('./donationRoutes');
const obituaryRoutes = require('./obituaryRoutes');
const dharmashalaRoutes = require('./dharmashalaRoutes');
const postRoutes = require('./postRoutes');
const memberListingRoutes = require('./memberListingRoutes');
const votingRoutes = require('./votingRoutes');
const eventRoutes = require('./eventRoutes');
const fundRoutes = require('./fundRoutes');

// Test Route
router.get('/test', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Member routes working fine!'
  });
});

// Invitation routes
router.use('/invitations', invitationRoutes);

// Donation routes
router.use('/donations', donationRoutes);

// Obituary routes
router.use('/obituaries', obituaryRoutes);

// Dharmashala routes
router.use('/dharmashala', dharmashalaRoutes);

// Community Social Feed (Posts)
router.use('/posts', postRoutes);

// Community Member Listing
router.use('/members', memberListingRoutes);

// Voting
router.use('/voting', votingRoutes);

// Events
router.use('/events', eventRoutes);

// Samaj Fund Module
router.use('/fund', fundRoutes);

// Professional Directory
const professionalRoutes = require('./professionalRoutes');
router.use('/professional', professionalRoutes);

module.exports = router;
