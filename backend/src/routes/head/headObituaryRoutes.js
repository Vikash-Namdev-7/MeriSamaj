const express = require('express');
const router = express.Router();
const headObituaryController = require('../../controllers/head/headObituaryController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// Require Head authorization (Head, Sub-Head, Admins)
router.use(protect, authorize('head', 'sub_head', 'admin', 'super_admin', 'master_admin'));

// Head Obituary Operations
router.get('/', headObituaryController.getAllObituaries);
router.get('/stats', headObituaryController.getObituaryStats);
router.get('/:id', headObituaryController.getObituaryById);
router.patch('/:id/status', headObituaryController.updateObituaryStatus);
router.delete('/:id', headObituaryController.deleteObituary);

module.exports = router;
