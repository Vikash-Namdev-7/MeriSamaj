const express = require('express');
const { getObituarySettings, updateObituarySettings } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// GET settings (available to any authenticated user in the community)
router.get('/obituary', protect, getObituarySettings);

// PUT settings (only available to community heads and admins)
router.put('/obituary', protect, authorize('head', 'head_admin', 'admin', 'super_admin', 'master_admin'), updateObituarySettings);

module.exports = router;
