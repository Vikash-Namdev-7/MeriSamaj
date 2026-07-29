const express = require('express');
const router  = express.Router();
const notifCtrl = require('../../controllers/notificationController');

router.get('/',           notifCtrl.getNotifications);
router.get('/unread',     notifCtrl.getUnreadCount);
router.put('/read-all',   notifCtrl.markAllAsRead);    // Static BEFORE /:id
router.post('/push-token', notifCtrl.registerPushToken);
router.delete('/push-token', notifCtrl.unregisterPushToken);
router.put('/:id/read',   notifCtrl.markAsRead);
router.delete('/:id',     notifCtrl.deleteNotification);

module.exports = router;
