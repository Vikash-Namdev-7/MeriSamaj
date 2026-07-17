const express = require('express');
const router = express.Router();
const dharmashalaController = require('../../controllers/head/dharmashalaController');
const upload = require('../../middleware/uploadMiddleware');

// Define Head Panel routes
router.get('/dashboard-stats', dharmashalaController.getDashboardStats);

router.get('/properties', dharmashalaController.getProperties);
router.post('/properties', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'galleryImages', maxCount: 10 }
]), dharmashalaController.createProperty);
router.put('/properties/:id', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'galleryImages', maxCount: 10 }
]), dharmashalaController.updateProperty);
router.delete('/properties/:id', dharmashalaController.deleteProperty);

router.get('/properties/:id/rooms', dharmashalaController.getDharmashalaRooms);
router.post('/rooms', upload.fields([{ name: 'images', maxCount: 5 }]), dharmashalaController.createRoom);
router.put('/rooms/:roomId', upload.fields([{ name: 'images', maxCount: 5 }]), dharmashalaController.updateRoom);
router.delete('/rooms/:roomId', dharmashalaController.deleteRoom);

router.get('/bookings', dharmashalaController.getAllBookings);
router.patch('/bookings/:id/status', dharmashalaController.updateBookingStatus);

router.post('/maintenance', dharmashalaController.logMaintenance);
router.get('/maintenance', dharmashalaController.getMaintenanceLogs);

module.exports = router;
