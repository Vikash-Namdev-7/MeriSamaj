const express = require('express');
const router = express.Router();
const adminReportsController = require('../../controllers/admin/adminReportsController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// Protect all admin report routes
router.use(protect, authorize('admin', 'super_admin', 'master_admin', 'master'));

router.get('/revenue', adminReportsController.getRevenueReport);
router.get('/community', adminReportsController.getCommunityReport);
router.get('/user', adminReportsController.getUserReport);
router.get('/matrimonial', adminReportsController.getMatrimonialReport);
router.get('/subscriptions', adminReportsController.getSubscriptionReport);

module.exports = router;
