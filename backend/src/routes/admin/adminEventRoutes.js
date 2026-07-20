const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/authMiddleware');
const ctrl = require('../../controllers/admin/adminEventController');

// Secure all endpoints with admin authentication
router.use(protect);
router.use(authorize('admin'));

router.get('/', ctrl.getAllEvents);
router.post('/', ctrl.createEvent);
router.get('/analytics', ctrl.getAnalytics);
router.get('/monitoring', ctrl.getMonitoringLogs);
router.get('/:eventId', ctrl.getEventById);
router.put('/:eventId', ctrl.updateEvent);
router.delete('/:eventId', ctrl.deleteEvent);
router.patch('/:eventId/feature', ctrl.toggleFeatured);
router.patch('/:eventId/status', ctrl.updateStatus);

module.exports = router;
