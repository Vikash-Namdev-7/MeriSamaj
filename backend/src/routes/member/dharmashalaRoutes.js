const express = require('express');
const router = express.Router();
const dharmashalaController = require('../../controllers/member/dharmashalaController');

// Define routes for member Dharmashala
router.get('/', dharmashalaController.getAllDharmashalas);
router.post('/bookings', dharmashalaController.createBooking);
router.get('/bookings', dharmashalaController.getBookingHistory);
router.post('/bookings/:id/pay', dharmashalaController.payBooking);
router.get('/:id', dharmashalaController.getDharmashalaById);
router.get('/:id/availability', dharmashalaController.getAvailability);

module.exports = router;
