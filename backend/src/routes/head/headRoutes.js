const express = require('express');
const router = express.Router();
const donationRoutes = require('./donationRoutes');
const dharmashalaRoutes = require('./dharmashalaRoutes');

// Test Route
router.get('/test', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Head routes working fine!'
  });
});

router.use('/donations', donationRoutes);
router.use('/dharmashala', dharmashalaRoutes);

module.exports = router;
