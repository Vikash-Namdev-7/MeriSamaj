const express = require('express');
const router = express.Router();
const headLeadershipController = require('../../controllers/head/headLeadershipController');
const { authorize } = require('../../middleware/authMiddleware');

const headOrAdmin = authorize('head', 'admin', 'super_admin', 'master_admin');
const headOrSubHead = authorize('head', 'sub_head', 'admin', 'super_admin', 'master_admin');

// READ: View sub-leaders list (Head, Sub-Head, Admins)
router.get('/sub-leaders', headOrSubHead, headLeadershipController.getSubLeaders);

// WRITE/MUTATING: Sub-leader management (Main Head and Admins only)
router.post('/sub-leaders', headOrAdmin, headLeadershipController.createSubLeader);
router.put('/sub-leaders/:id', headOrAdmin, headLeadershipController.updateSubLeader);
router.patch('/sub-leaders/:id/status', headOrAdmin, headLeadershipController.toggleSubLeaderStatus);
router.delete('/sub-leaders/:id', headOrAdmin, headLeadershipController.deleteSubLeader);

module.exports = router;
