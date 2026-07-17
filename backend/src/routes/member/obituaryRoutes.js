const express = require('express');
const router = express.Router();
const {
  createObituary,
  getObituaries,
  getObituaryById,
  updateObituary,
  deleteObituary,
  toggleHaathJode,
  incrementMalaArpan,
  toggleSave,
  incrementViews,
  addComment,
  toggleCommentLike,
  updateObituaryStatus
} = require('../../controllers/member/obituaryController');
const upload = require('../../middleware/uploadMiddleware');

router.route('/')
  .get(getObituaries)
  .post(upload.single('image'), createObituary);

router.route('/:id')
  .get(getObituaryById)
  .put(upload.single('image'), updateObituary)
  .delete(deleteObituary);

router.route('/:id/status')
  .put(updateObituaryStatus);

router.route('/:id/haathjode')
  .put(toggleHaathJode);

router.route('/:id/malaarpan')
  .put(incrementMalaArpan);

router.route('/:id/save')
  .put(toggleSave);

router.route('/:id/view')
  .put(incrementViews);

router.route('/:id/comments')
  .post(addComment);

router.route('/:id/comments/:commentId/like')
  .put(toggleCommentLike);

module.exports = router;
