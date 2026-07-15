const express = require('express');
const router = express.Router();

const invitationRoutes = require('./invitationRoutes');
const donationRoutes = require('./donationRoutes');

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

module.exports = router;
