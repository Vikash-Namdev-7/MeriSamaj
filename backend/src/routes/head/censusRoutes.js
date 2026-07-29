const express = require('express');
const router = express.Router();
const censusController = require('../../controllers/censusController');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

// GET /api/v1/head/census/summary — Get community census summary (Head, Sub-Head, Admins)
router.get('/summary', authorize('head', 'sub_head', 'admin', 'super_admin', 'master_admin'), censusController.getCensusSummary);

// GET /api/v1/head/census/members — Get community members list (Head, Sub-Head, Admins)
router.get('/members', authorize('head', 'sub_head', 'admin', 'super_admin', 'master_admin'), censusController.getCensusMembers);

// GET /api/v1/head/census/update-requests — Get update requests (Head, Sub-Head, Admins)
router.get('/update-requests', authorize('head', 'sub_head', 'admin', 'super_admin', 'master_admin'), censusController.getUpdateRequests);

// PATCH /api/v1/head/census/update-requests/:id — Approve/Reject request (Main Head and Admins)
router.patch('/update-requests/:id', authorize('head', 'admin', 'super_admin', 'master_admin'), censusController.updateRequestStatus);

module.exports = router;
