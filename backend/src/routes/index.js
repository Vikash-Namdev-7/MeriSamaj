const express = require('express');
const router = express.Router();

// Import Panel Routes
const adminRoutes = require('./admin/adminRoutes');
const headRoutes = require('./head/headRoutes');
const memberRoutes = require('./member/memberRoutes');

// Mount Routes
router.use('/admin', adminRoutes);
router.use('/head', headRoutes);
router.use('/member', memberRoutes);



module.exports = router;
