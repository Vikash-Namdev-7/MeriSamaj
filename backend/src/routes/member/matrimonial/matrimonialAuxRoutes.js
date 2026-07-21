const express = require('express');
const router  = express.Router();

const dashboardCtrl = require('../../../controllers/matrimonial/matrimonialDashboardController');
const modCtrl = require('../../../controllers/matrimonial/matrimonialModerationController');
const { checkFeature, attachSubscription } = require('../../../middleware/subscriptionMiddleware');

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard', attachSubscription, dashboardCtrl.getDashboard);

// ─── Shortlist ────────────────────────────────────────────────────────────────
router.post('/shortlist',              modCtrl.addToShortlist);
router.delete('/shortlist/:profileId', modCtrl.removeFromShortlist);
router.get('/shortlist',               modCtrl.getShortlist);

// ─── Visitors (Premium Only) ─────────────────────────────────────────────────
router.get('/visitors', checkFeature('visitorHistory'), modCtrl.getMyVisitors);

// ─── Block/Unblock ────────────────────────────────────────────────────────────
router.post('/block',            modCtrl.blockUser);
router.delete('/block/:userId',  modCtrl.unblockUser);
router.get('/blocked',           modCtrl.getBlockedUsers);

// ─── Reports ─────────────────────────────────────────────────────────────────
router.post('/report', modCtrl.reportProfile);

module.exports = router;
