const express = require('express');
const router = express.Router();
const adminGroupController = require('../../controllers/admin/adminGroupController');

// All routes are prepended with /api/v1/admin/groups
router.get('/', adminGroupController.getGroups);
router.post('/', adminGroupController.createGroup);
router.get('/:id', adminGroupController.getGroupById);
router.patch('/:id/status', adminGroupController.updateGroupStatus);
router.patch('/:id/archive', adminGroupController.archiveGroup);
router.patch('/:id/restore', adminGroupController.restoreGroup);
router.delete('/:id', adminGroupController.deleteGroup);

module.exports = router;
