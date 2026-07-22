const express = require('express');
const router = express.Router();
const headGroupController = require('../../controllers/head/headGroupController');

// All routes are prepended with /api/v1/head/groups
router.get('/', headGroupController.getGroups);
router.post('/', headGroupController.createGroup);
router.get('/:id', headGroupController.getGroupById);
router.patch('/:id/status', headGroupController.updateGroupStatus); // { status: 'approved' | 'rejected' }
router.patch('/:id/archive', headGroupController.archiveGroup);
router.patch('/:id/restore', headGroupController.restoreGroup);
router.delete('/:id', headGroupController.deleteGroup);

module.exports = router;
