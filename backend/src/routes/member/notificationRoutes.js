const express = require('express');
const router  = express.Router();
const notifCtrl = require('../../controllers/notificationController');

router.get('/',          notifCtrl.getNotifications);
router.get('/unread',    notifCtrl.getUnreadCount);
router.put('/read-all',  notifCtrl.markAllAsRead);    // Static BEFORE /:id
router.put('/:id/read',  notifCtrl.markAsRead);
router.delete('/:id',    notifCtrl.deleteNotification);
router.delete('/',       notifCtrl.clearAll);

module.exports = router;
