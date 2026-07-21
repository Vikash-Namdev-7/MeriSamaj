/**
 * notificationController.js
 * Centralized notification management for all modules.
 */
const UserNotification = require('../models/UserNotification');

// ─── List Notifications ───────────────────────────────────────────────────────
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, module, isRead } = req.query;
    const query = { userId: req.user._id };
    if (module) query.module = module;
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const total = await UserNotification.countDocuments(query);
    const notifications = await UserNotification.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    const unreadCount = await UserNotification.countDocuments({ userId: req.user._id, isRead: false });

    res.json({
      status: 'success',
      data: {
        notifications,
        unreadCount,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Unread Count ─────────────────────────────────────────────────────────────
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await UserNotification.countDocuments({ userId: req.user._id, isRead: false });
    // Return both 'count' and 'unreadCount' for compatibility with all consumers
    res.json({ status: 'success', data: { count, unreadCount: count } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Mark One as Read ─────────────────────────────────────────────────────────
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await UserNotification.findOne({ _id: id, userId: req.user._id });
    if (!notification) return res.status(404).json({ status: 'error', message: 'Notification not found.' });

    notification.isRead = true;
    notification.readAt  = new Date();
    await notification.save();

    res.json({ status: 'success', message: 'Marked as read.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Mark All as Read ─────────────────────────────────────────────────────────
exports.markAllAsRead = async (req, res) => {
  try {
    const { module } = req.body;
    const query = { userId: req.user._id, isRead: false };
    if (module) query.module = module;

    await UserNotification.updateMany(query, { $set: { isRead: true, readAt: new Date() } });
    res.json({ status: 'success', message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Delete Notification ──────────────────────────────────────────────────────
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await UserNotification.findOneAndDelete({ _id: id, userId: req.user._id });
    res.json({ status: 'success', message: 'Notification deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Clear All ────────────────────────────────────────────────────────────────
exports.clearAll = async (req, res) => {
  try {
    const { module } = req.body;
    const query = { userId: req.user._id };
    if (module) query.module = module;

    await UserNotification.deleteMany(query);
    res.json({ status: 'success', message: 'All notifications cleared.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
