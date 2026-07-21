const express = require('express');
const router = express.Router();
const headSocialController = require('../../controllers/head/headSocialController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// Protect all routes: only authorized Head and Admin users
router.use(protect);
router.use(authorize('head', 'admin'));

// City Feed & Community Feed endpoints
router.get('/city-feed', headSocialController.getCityFeed);
router.get('/community-feed', headSocialController.getCommunityFeed);

// Post Details, Soft Delete, and Restore
router.get('/posts/:id', headSocialController.getPostDetails);
router.delete('/posts/:id', headSocialController.softDeletePost);
router.post('/posts/:id/restore', headSocialController.restorePost);

module.exports = router;
