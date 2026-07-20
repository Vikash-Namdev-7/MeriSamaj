const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/head/eventController');

router.get('/', ctrl.getHeadEvents);
router.post('/', ctrl.createEvent);
router.get('/monitoring', ctrl.getMonitoringLogs);
router.get('/analytics', ctrl.getAnalytics);

router.put('/:eventId', ctrl.updateEvent);
router.delete('/:eventId', ctrl.deleteEvent);
router.patch('/:eventId/feature', ctrl.toggleFeatured);
router.patch('/:eventId/status', ctrl.updateStatus);
router.get('/:eventId/attendees', ctrl.getAttendees);
router.get('/:eventId/interested', ctrl.getInterested);

module.exports = router;
