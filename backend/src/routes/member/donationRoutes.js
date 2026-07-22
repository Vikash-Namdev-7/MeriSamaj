const express = require('express');
const router = express.Router();
const donationController = require('../../controllers/member/donationController');

// Define routes for member donations
router.get('/campaigns', donationController.getCampaigns);
router.get('/campaigns/:id', donationController.getCampaignById);
router.get('/campaigns/:id/donors', donationController.getRecentDonors);
router.get('/history', donationController.getHistory);
router.post('/submit', donationController.createDonation);
router.get('/stats', donationController.getStats);

// Aliases for root endpoint compatibility
router.get('/', donationController.getCampaigns);
router.get('/:id', donationController.getCampaignById);

module.exports = router;
