const express = require('express');
const router = express.Router();
const {
  getCommunityMembers,
  getMemberProfile,
  getMemberStats
} = require('../../controllers/member/memberController');

// GET  /api/v1/member/members         → Community member listing (with search/filter)
router.get('/', getCommunityMembers);

// GET  /api/v1/member/members/stats   → Community member statistics (aggregations)
router.get('/stats', getMemberStats);

// GET  /api/v1/member/members/:id     → Single member public profile
router.get('/:id', getMemberProfile);

module.exports = router;
