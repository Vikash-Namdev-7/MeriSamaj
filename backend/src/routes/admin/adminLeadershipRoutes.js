const express = require('express');
const router = express.Router();
const adminLeadershipController = require('../../controllers/admin/adminLeadershipController');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin', 'super_admin', 'master_admin'));

// GET /api/v1/admin/leadership — Get global leadership directory
router.get('/', adminLeadershipController.getGlobalLeadership);

// POST /api/v1/admin/leadership — Create new App Leader or Board Leader
router.post('/', adminLeadershipController.createLeader);

// PATCH /api/v1/admin/leadership/:id/status — Toggle status safely
router.patch('/:id/status', adminLeadershipController.toggleLeaderStatus);

// DELETE /api/v1/admin/leadership/:id — Safe soft-deactivation
router.delete('/:id', adminLeadershipController.deleteLeader);

module.exports = router;
