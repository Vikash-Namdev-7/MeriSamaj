const express = require('express');
const router = express.Router();
const donationController = require('../../controllers/head/donationController');

// Define routes for head panel donations
router.get('/dashboard-stats', donationController.getDashboardStats);
router.get('/campaigns', donationController.getAllCampaigns);
router.post('/campaigns', donationController.createCampaign);
router.get('/campaigns/:id', donationController.getCampaignById);
router.put('/campaigns/:id', donationController.updateCampaign);
router.delete('/campaigns/:id', donationController.deleteCampaign);
router.patch('/campaigns/:id/status', donationController.updateCampaignStatus);
router.get('/campaigns/:id/donors', donationController.getCampaignDonors);

router.post('/campaigns/:id/expenses', donationController.addExpense);
router.get('/campaigns/:id/expenses', donationController.getCampaignExpenses);
router.get('/ledger', donationController.getLedger);

module.exports = router;
