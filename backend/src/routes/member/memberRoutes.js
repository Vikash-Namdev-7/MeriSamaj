const express = require('express');
const router = express.Router();

const invitationRoutes = require('./invitationRoutes');
const donationRoutes = require('./donationRoutes');
const obituaryRoutes = require('./obituaryRoutes');
const dharmashalaRoutes = require('./dharmashalaRoutes');

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

module.exports = router;
