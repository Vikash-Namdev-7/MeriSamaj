const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/member/eventController');

router.get('/', ctrl.getEvents);
router.get('/:eventId', ctrl.getEventById);

router.post('/:eventId/react', ctrl.reactToEvent);
router.post('/:eventId/interested', ctrl.toggleInterested);
router.post('/:eventId/attend', ctrl.toggleAttend);
router.post('/:eventId/bookmark', ctrl.toggleBookmark);
router.post('/:eventId/reminder', ctrl.toggleReminder);

module.exports = router;
