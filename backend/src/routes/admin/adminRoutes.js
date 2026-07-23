const express = require('express');
const router = express.Router();
const communityRoutes = require('./communityRoutes');
const cityRoutes = require('./cityRoutes');
const communityHeadRoutes = require('./communityHeadRoutes');
const userRoutes = require('./userRoutes');
const adminEventRoutes = require('./adminEventRoutes');
const adminFundRoutes = require('./adminFundRoutes');

const adminController = require('../../controllers/admin/adminController');

// Test Route
router.get('/test', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Admin routes working fine!'
  });
});

// Dashboard Overview Route
router.get('/dashboard/overview', adminController.getDashboardOverview);

// Community Management Routes
// All routes: /api/v1/admin/communities/*
router.use('/communities', communityRoutes);



// City Management Routes
router.use('/cities', cityRoutes);
router.use('/community-heads', communityHeadRoutes);
router.use('/users', userRoutes);
router.use('/events', adminEventRoutes);
router.use('/funds', adminFundRoutes);

// Professional Directory Management Routes
const adminProfessionalRoutes = require('./adminProfessionalRoutes');
router.use('/professional', adminProfessionalRoutes);

// Matrimonial Management Routes
const adminMatrimonialRoutes = require('./adminMatrimonialRoutes');
router.use('/matrimonial', adminMatrimonialRoutes);

// Social / Feed Management Routes
const adminSocialRoutes = require('./adminSocialRoutes');
router.use('/social', adminSocialRoutes);

// Donation Management Routes
const adminDonationRoutes = require('../adminDonationRoutes');
router.use('/donations', adminDonationRoutes);

module.exports = router;

