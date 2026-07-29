const express = require('express');
const router = express.Router();
const adminObituaryController = require('../../controllers/admin/adminObituaryController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// Protect all admin obituary endpoints under master admin RBAC
router.use(protect);
router.use(authorize('admin', 'super_admin', 'master_admin'));

// GET /api/v1/admin/obituaries — Get global obituaries list
router.get('/', adminObituaryController.getAllObituaries);

// GET /api/v1/admin/obituaries/:id — Get single obituary
router.get('/:id', adminObituaryController.getObituaryById);

// PATCH /api/v1/admin/obituaries/:id/status — Moderation status toggle
router.patch('/:id/status', adminObituaryController.updateObituaryStatus);

// DELETE /api/v1/admin/obituaries/:id — Delete obituary post
router.delete('/:id', adminObituaryController.deleteObituary);

module.exports = router;
