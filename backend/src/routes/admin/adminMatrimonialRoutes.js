const express = require('express');
const router  = express.Router();
const adminMatCtrl = require('../../controllers/admin/adminMatrimonialController');

// ─── Stats & Analytics ────────────────────────────────────────────────────────
router.get('/stats',      adminMatCtrl.getStats);
router.get('/analytics',  adminMatCtrl.getAnalytics);

// ─── Profile Management ───────────────────────────────────────────────────────
router.get('/profiles',                    adminMatCtrl.listProfiles);
router.put('/profiles/:id/verify',         adminMatCtrl.verifyProfile);

// ─── Photo Moderation ─────────────────────────────────────────────────────────
router.get('/photos/pending',              adminMatCtrl.listPendingPhotos);
router.put('/photos/:profileId/:photoId',  adminMatCtrl.moderatePhoto);

// ─── Reports ─────────────────────────────────────────────────────────────────
router.get('/reports',         adminMatCtrl.listReports);
router.put('/reports/:id',     adminMatCtrl.actionReport);

// ─── Subscription Plans ───────────────────────────────────────────────────────
router.get('/plans',           adminMatCtrl.listPlans);
router.post('/plans',          adminMatCtrl.createPlan);
router.post('/plans/grant',    adminMatCtrl.grantSubscription);  // Static must come before /:id
router.put('/plans/:id',       adminMatCtrl.updatePlan);
router.delete('/plans/:id',    adminMatCtrl.deletePlan);

// ─── Settings ─────────────────────────────────────────────────────────────────
router.get('/settings',        adminMatCtrl.getSettings);
router.put('/settings',        adminMatCtrl.updateSettings);

module.exports = router;
