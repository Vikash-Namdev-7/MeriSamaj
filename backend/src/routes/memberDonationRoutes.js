const express = require('express');
const router = express.Router();
const memberDonationController = require('../controllers/memberDonationController');

router.get('/', memberDonationController.getActiveDonations);
router.get('/:id', memberDonationController.getDonationById);
router.post('/:id/donate', memberDonationController.donate);

module.exports = router;
