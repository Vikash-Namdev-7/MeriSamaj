const express = require('express');
const router = express.Router();
const censusController = require('../../controllers/censusController');
const { protect } = require('../../middleware/authMiddleware');

router.use(protect);

// GET /api/v1/member/census/summary — Get summary metrics, breakdowns & charts
router.get('/summary', censusController.getCensusSummary);

// GET /api/v1/member/census/members — Get filtered member list
router.get('/members', censusController.getCensusMembers);

// POST /api/v1/member/census/update-request — Submit data update request
router.post('/update-request', censusController.createUpdateRequest);

module.exports = router;
