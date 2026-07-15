const express = require('express');
const router = express.Router();
const donationRoutes = require('./donationRoutes');

// Test Route
router.get('/test', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Head routes working fine!'
  });
});

router.use('/donations', donationRoutes);

module.exports = router;
