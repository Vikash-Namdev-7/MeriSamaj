const express = require('express');
const router  = express.Router();
const headMatCtrl = require('../../controllers/head/headMatrimonialController');
const { authorize } = require('../../middleware/authMiddleware');

const headOrAdmin = authorize('head', 'admin', 'super_admin', 'master_admin');
const headOrSubHead = authorize('head', 'sub_head', 'admin', 'super_admin', 'master_admin');

// READ: Community Matrimonial Directory & Stats (Head, Sub-Head, Admins)
router.get('/stats',                    headOrSubHead, headMatCtrl.getCommunityStats);
router.get('/profiles/pending',         headOrSubHead, headMatCtrl.getPendingProfiles);
router.get('/profiles/connected',       headOrSubHead, headMatCtrl.getConnectedMembers);
router.get('/profiles/married',         headOrSubHead, headMatCtrl.getMarriedMembers);
router.get('/profiles',                 headOrSubHead, headMatCtrl.listCommunityProfiles);
router.get('/profiles/:id',             headOrSubHead, headMatCtrl.getProfileById);
router.get('/reports',                  headOrSubHead, headMatCtrl.listCommunityReports);
router.get('/marriage-requests',        headOrSubHead, headMatCtrl.getCommunityMarriageRequests);

// WRITE/MUTATING: Profile Verification & Moderation (Main Head and Admins only)
router.put('/profiles/:id/verify',      headOrAdmin, headMatCtrl.verifyProfile);
router.put('/profiles/:id/status',      headOrAdmin, headMatCtrl.updateProfileStatus);
router.put('/reports/:id',              headOrAdmin, headMatCtrl.resolveReport);

module.exports = router;
