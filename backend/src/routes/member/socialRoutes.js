const express = require('express');
const router = express.Router();
const socialController = require('../../controllers/member/socialController');
const storyController = require('../../controllers/member/storyController');
const followerController = require('../../controllers/member/followerController');
const authMiddleware = require('../../middleware/authMiddleware');

// Secure all endpoints under member authentication middleware
router.use(authMiddleware.protect);

// ─────────────────────────────────────────────
// POSTS & FEEDS ROUTES
// ─────────────────────────────────────────────
router.route('/posts')
  .get(socialController.getPosts)
  .post(socialController.createPost);

router.route('/posts/:id')
  .get(socialController.getPostById);

router.post('/posts/:id/like', socialController.toggleLike);
router.post('/posts/:id/save', socialController.toggleSave);
router.post('/posts/:id/view', socialController.recordView);
router.post('/posts/:id/share', socialController.recordShare);

router.route('/posts/:id/comments')
  .get(socialController.getComments)
  .post(socialController.addComment);

router.get('/search', socialController.searchSocial);

// ─────────────────────────────────────────────
// STORIES ROUTES
// ─────────────────────────────────────────────
router.route('/stories')
  .get(storyController.getStories)
  .post(storyController.createStory);

router.delete('/stories/:id', storyController.deleteStory);
router.post('/stories/:id/view', storyController.viewStory);
router.post('/stories/:id/like', storyController.likeStory);
router.get('/stories/:id/viewers', storyController.getStoryViewers);

// ─────────────────────────────────────────────
// FOLLOWER RELATIONSHIP ROUTES
// ─────────────────────────────────────────────
router.post('/follow/:id', followerController.toggleFollow);
router.get('/users/:id/followers', followerController.getFollowers);
router.get('/users/:id/following', followerController.getFollowing);

module.exports = router;
