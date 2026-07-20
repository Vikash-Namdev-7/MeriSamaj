const express = require('express');
const router = express.Router();
const fundController = require('../../controllers/member/fundController');

// Samaj Fund routes for members
router.get('/funds-data', fundController.getFundsData);
router.get('/history', fundController.getHistory);
router.post('/:fundId/pay', fundController.makePayment);
router.post('/', fundController.createFund);
router.post('/:fundId/expense', fundController.addExpense);

module.exports = router;
