const express = require('express');
const router  = express.Router();
const headMatCtrl = require('../../controllers/head/headMatrimonialController');

router.get('/stats',                    headMatCtrl.getCommunityStats);
router.get('/profiles/pending',         headMatCtrl.getPendingProfiles);      // Pending verification queue (before /:id)
router.get('/profiles/connected',       headMatCtrl.getConnectedMembers);     // Connected members (before /:id)
router.get('/profiles/married',         headMatCtrl.getMarriedMembers);       // Married members (before /:id)
router.get('/profiles',                 headMatCtrl.listCommunityProfiles);
router.get('/profiles/:id',             headMatCtrl.getProfileById);
router.put('/profiles/:id/verify',      headMatCtrl.verifyProfile);
router.put('/profiles/:id/status',      headMatCtrl.updateProfileStatus);     // Toggle active/hidden
router.get('/reports',                  headMatCtrl.listCommunityReports);
router.put('/reports/:id',              headMatCtrl.resolveReport);           // Resolve or dismiss
router.get('/marriage-requests',        headMatCtrl.getCommunityMarriageRequests);

module.exports = router;
