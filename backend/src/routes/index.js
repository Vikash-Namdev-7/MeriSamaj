const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// Import Panel Routes
const authRoutes = require('./authRoutes');
const adminRoutes = require('./admin/adminRoutes');
const headRoutes = require('./head/headRoutes');
const memberRoutes = require('./member/memberRoutes');

// Mount Routes
router.use('/auth', authRoutes);
router.use('/admin', protect, authorize('admin', 'super_admin', 'master_admin'), adminRoutes);
router.use('/head', protect, authorize('head', 'head_admin', 'admin', 'super_admin', 'master_admin', 'user'), headRoutes);
router.use('/member', protect, memberRoutes);

module.exports = router;
