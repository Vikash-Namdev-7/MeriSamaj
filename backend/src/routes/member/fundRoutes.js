const express = require('express');
const router = express.Router();
const fundController = require('../../controllers/member/fundController');

// Samaj Fund routes for members
router.get('/funds-data', fundController.getFundsData);
router.get('/history', fundController.getHistory);
router.post('/create-order', fundController.createFundOrder);
router.post('/verify-payment', fundController.verifyFundPayment);
router.post('/webhook', fundController.handleFundWebhook);

// Legacy route kept for backward compatibility (deprecated — no longer called by frontend)
router.post('/:fundId/pay', fundController.makePayment);
router.post('/', fundController.createFund);
router.post('/:fundId/expense', fundController.addExpense);

module.exports = router;

