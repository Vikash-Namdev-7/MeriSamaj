const express = require('express');
const router = express.Router();
const headLeadershipController = require('../../controllers/head/headLeadershipController');

// All routes require Head authentication
router.post('/sub-leaders', headLeadershipController.createSubLeader);
router.get('/sub-leaders', headLeadershipController.getSubLeaders);
router.put('/sub-leaders/:id', headLeadershipController.updateSubLeader);
router.patch('/sub-leaders/:id/status', headLeadershipController.toggleSubLeaderStatus);
router.delete('/sub-leaders/:id', headLeadershipController.deleteSubLeader);

module.exports = router;
