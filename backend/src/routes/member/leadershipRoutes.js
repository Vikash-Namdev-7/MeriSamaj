const express = require('express');
const router = express.Router();
const { getCommunityLeadership } = require('../../controllers/member/leadershipController');

// GET /api/v1/member/leadership → Fetch community leadership team
router.get('/', getCommunityLeadership);

module.exports = router;
