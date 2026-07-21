const express = require('express');
const router  = express.Router();
const headMatCtrl = require('../../controllers/head/headMatrimonialController');

router.get('/stats',                    headMatCtrl.getCommunityStats);
router.get('/profiles',                 headMatCtrl.listCommunityProfiles);
router.put('/profiles/:id/verify',      headMatCtrl.verifyProfile);
router.put('/profiles/:id/status',      headMatCtrl.updateProfileStatus);  // Toggle active/hidden
router.get('/reports',                  headMatCtrl.listCommunityReports);
router.put('/reports/:id',              headMatCtrl.resolveReport);         // Resolve or dismiss

module.exports = router;
