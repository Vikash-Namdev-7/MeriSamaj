const express = require('express');
const router = express.Router();
const censusController = require('../../controllers/censusController');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin', 'super_admin', 'master_admin'));

// GET /api/v1/admin/census/summary — Get system-wide census summary with optional ?communityId
router.get('/summary', censusController.getCensusSummary);

// GET /api/v1/admin/census/members — Get global census members list
router.get('/members', censusController.getCensusMembers);

// GET /api/v1/admin/census/update-requests — Get all global update requests
router.get('/update-requests', censusController.getUpdateRequests);

// PATCH /api/v1/admin/census/update-requests/:id — Moderate request status
router.patch('/update-requests/:id', censusController.updateRequestStatus);

module.exports = router;
