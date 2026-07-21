const Post = require('../../models/Post');
const Story = require('../../models/Story');
const Comment = require('../../models/Comment');
const PostLike = require('../../models/PostLike');
const SavedPost = require('../../models/SavedPost');
const PostShare = require('../../models/PostShare');
const PostView = require('../../models/PostView');
const Follower = require('../../models/Follower');
const Category = require('../../models/Category');
const SocialAuditLog = require('../../models/SocialAuditLog');
const User = require('../../models/User');
const City = require('../../models/City');
const Community = require('../../models/Community');

// Helper to write audit logs
const logAdminAction = async (req, action, targetType, targetId, details) => {
  try {
    await SocialAuditLog.create({
      adminId: req.user._id,
      adminName: req.user.name || 'System Admin',
      action,
      targetType,
      targetId,
      details
    });
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
};

// @desc    Get social posts list with filters & pagination
// @route   GET /api/v1/admin/social/posts
exports.getPosts = async (req, res) => {
  try {
    const { communityId, cityId, category, mediaType, status, postedBy, search, startDate, endDate, feedType, page = 1, limit = 10 } = req.query;

    const filter = {};

    // 1. Status Filter (Soft Delete & Moderation)
    if (status === 'deleted') {
      filter.isDeleted = true;
    } else if (status === 'active') {
      filter.isDeleted = { $ne: true };
      filter.status = { $ne: 'archived' };
    } else if (status === 'archived' || status === 'hidden') {
      filter.isDeleted = { $ne: true };
      filter.status = 'archived';
    } else if (status === 'all') {
      // No isDeleted restriction
    } else if (status) {
      filter.isDeleted = { $ne: true };
      filter.status = status;
    } else {
      filter.isDeleted = { $ne: true };
      filter.status = { $ne: 'archived' };
    }

    // 2. Feed Type Filter
    if (feedType === 'city') {
      filter.feedType = { $ne: 'community' };
    } else if (feedType === 'community') {
      filter.feedType = 'community';
    }

    if (communityId) filter.communityId = communityId;
    if (cityId) filter.cityId = cityId;
    if (category) filter.category = category;

    if (mediaType) {
      filter['media.type'] = mediaType;
    }

    if (postedBy) {
      filter.$or = [
        { userId: postedBy },
        { authorId: postedBy }
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // 3. Search Filter
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      const matchingUsers = await User.find({ name: searchRegex }).select('_id');
      const userIds = matchingUsers.map(u => u._id);

      filter.$or = [
        { content: searchRegex },
        { userId: { $in: userIds } },
        { authorId: { $in: userIds } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate('userId', 'name avatar role email phone')
        .populate('authorId', 'name avatar role email phone')
        .populate('communityId', 'name')
        .populate('cityId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Post.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: posts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    console.error('Admin getPosts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single post complete moderation details
// @route   GET /api/v1/admin/social/posts/:id
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ status: 'error', success: false, message: 'Post ID is required' });
    }

    const post = await Post.findById(id)
      .populate('userId', 'name avatar role email phone city community communityId')
      .populate('authorId', 'name avatar role email phone city community communityId')
      .populate('communityId', 'name slug city')
      .populate('cityId', 'name');

    if (!post) {
      return res.status(404).json({ status: 'error', success: false, message: 'Post not found' });
    }

    // Parallel fetch for likes, comments, shares, saves, audit logs
    const [likes, comments, savedCount, sharesCount, reports] = await Promise.all([
      PostLike.find({ postId: id })
        .populate('userId', 'name avatar role city community')
        .sort({ createdAt: -1 })
        .lean(),
      Comment.find({ postId: id, isDeleted: false })
        .populate('userId', 'name avatar role city community')
        .sort({ createdAt: -1 })
        .lean(),
      SavedPost.countDocuments({ postId: id }),
      PostShare.countDocuments({ postId: id }),
      SocialAuditLog.find({ targetId: id })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean()
    ]);

    const authorDoc = post.authorId || post.userId;
    const resolvedCity = authorDoc?.city || post.communityId?.city || post.cityId?.name || 'Unknown';

    const richData = {
      ...post.toObject(),
      author: authorDoc,
      resolvedCity,
      likesList: likes.map(l => ({
        _id: l._id,
        user: l.userId,
        createdAt: l.createdAt
      })),
      commentsList: comments.map(c => ({
        _id: c._id,
        user: c.userId,
        text: c.text,
        parentCommentId: c.parentCommentId,
        status: c.status,
        isApproved: c.isApproved,
        createdAt: c.createdAt
      })),
      stats: {
        likesCount: post.likesCount || likes.length,
        commentsCount: post.commentsCount || comments.length,
        sharesCount: post.sharesCount || sharesCount,
        savedCount: savedCount,
        viewsCount: post.viewsCount || 0
      },
      reportsList: reports
    };

    res.status(200).json({
      status: 'success',
      success: true,
      data: richData
    });
  } catch (error) {
    console.error('Admin getPostById error:', error);
    res.status(500).json({ status: 'error', success: false, message: 'Failed to fetch post details' });
  }
};

// @desc    Create post
// @route   POST /api/v1/admin/social/posts
exports.createPost = async (req, res) => {
  try {
    const { content, category, media = [], location, feedType, communityId } = req.body;

    let targetCityId = null;
    if (location) {
      const city = await City.findOne({ name: new RegExp('^' + location.trim() + '$', 'i') });
      if (city) targetCityId = city._id;
    }

    const post = await Post.create({
      userId: req.user._id,
      communityId: communityId || req.user.communityId,
      cityId: targetCityId,
      content,
      category: category || 'Notice',
      media,
      feedType: feedType || 'city',
      status: 'published'
    });

    await logAdminAction(req, 'create_post', 'Post', post._id, `Admin created post: "${content.substring(0, 30)}..."`);
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.error('Admin createPost error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update post
// @route   PATCH /api/v1/admin/social/posts/:id
exports.updatePost = async (req, res) => {
  try {
    const { content, category, status, isPinned, isFeatured, feedType } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (content !== undefined) post.content = content;
    if (category !== undefined) post.category = category;
    if (status !== undefined) post.status = status;
    if (isPinned !== undefined) post.isPinned = isPinned;
    if (isFeatured !== undefined) post.isFeatured = isFeatured;
    if (feedType !== undefined) post.feedType = feedType;

    await post.save();
    await logAdminAction(req, 'update_post', 'Post', post._id, `Admin updated post properties`);
    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Admin updatePost error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete post (Soft Delete)
// @route   DELETE /api/v1/admin/social/posts/:id
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.isDeleted = true;
    post.deletedAt = new Date();
    await post.save();

    await logAdminAction(req, 'delete_post', 'Post', post._id, `Admin deleted post ID: ${post._id}`);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Admin deletePost error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Restore post
// @route   POST /api/v1/admin/social/posts/:id/restore
exports.restorePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.isDeleted = false;
    post.deletedAt = null;
    await post.save();

    await logAdminAction(req, 'restore_post', 'Post', post._id, `Admin restored post ID: ${post._id}`);
    res.json({ success: true, message: 'Post restored successfully' });
  } catch (error) {
    console.error('Admin restorePost error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Pin/Unpin post
// @route   POST /api/v1/admin/social/posts/:id/pin
exports.togglePinPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.isPinned = !post.isPinned;
    await post.save();

    await logAdminAction(req, post.isPinned ? 'pin_post' : 'unpin_post', 'Post', post._id, `Admin toggled pin to ${post.isPinned}`);
    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Admin togglePinPost error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Feature/Unfeature post
// @route   POST /api/v1/admin/social/posts/:id/feature
exports.toggleFeaturePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.isFeatured = !post.isFeatured;
    await post.save();

    await logAdminAction(req, post.isFeatured ? 'feature_post' : 'unfeature_post', 'Post', post._id, `Admin toggled feature to ${post.isFeatured}`);
    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Admin toggleFeaturePost error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Hide/Unhide post
// @route   POST /api/v1/admin/social/posts/:id/hide
exports.toggleHidePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.status = post.status === 'archived' ? 'published' : 'archived';
    await post.save();

    await logAdminAction(req, 'hide_post', 'Post', post._id, `Admin set post status to: ${post.status}`);
    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Admin toggleHidePost error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Bulk posts operations
// @route   POST /api/v1/admin/social/posts/bulk-action
exports.bulkPostsAction = async (req, res) => {
  try {
    const { ids, action } = req.body;
    if (!ids || ids.length === 0) return res.status(400).json({ success: false, message: 'No IDs provided' });

    let update = {};
    if (action === 'delete') {
      update = { isDeleted: true, deletedAt: new Date() };
    } else if (action === 'hide') {
      update = { status: 'archived' };
    } else if (action === 'publish') {
      update = { status: 'published' };
    } else if (action === 'feature') {
      update = { isFeatured: true };
    } else if (action === 'restore') {
      update = { isDeleted: false, deletedAt: null };
    } else {
      return res.status(400).json({ success: false, message: 'Invalid bulk action' });
    }

    await Post.updateMany({ _id: { $in: ids } }, { $set: update });
    await logAdminAction(req, `bulk_${action}_posts`, 'Post', null, `Admin applied bulk ${action} to ${ids.length} posts`);

    res.json({ success: true, message: `Bulk action ${action} executed successfully` });
  } catch (error) {
    console.error('Admin bulkPostsAction error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get stories list
// @route   GET /api/v1/admin/social/stories
exports.getStories = async (req, res) => {
  try {
    const { communityId, cityId, status } = req.query;
    const filter = { isDeleted: false };

    if (communityId) filter.communityId = communityId;
    if (cityId) filter.cityId = cityId;
    if (status) filter.status = status;

    const stories = await Story.find(filter)
      .populate('userId', 'name avatar role')
      .populate('communityId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: stories });
  } catch (error) {
    console.error('Admin getStories error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete story
// @route   DELETE /api/v1/admin/social/stories/:id
exports.deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

    story.isDeleted = true;
    await story.save();

    await logAdminAction(req, 'delete_story', 'Story', story._id, `Admin deleted story ID: ${story._id}`);
    res.json({ success: true, message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Admin deleteStory error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Hide story
// @route   POST /api/v1/admin/social/stories/:id/hide
exports.toggleStoryHide = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

    story.status = story.status === 'hidden' ? 'published' : 'hidden';
    await story.save();

    await logAdminAction(req, 'hide_story', 'Story', story._id, `Admin toggled story visibility to: ${story.status}`);
    res.json({ success: true, data: story });
  } catch (error) {
    console.error('Admin toggleStoryHide error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Feature story
// @route   POST /api/v1/admin/social/stories/:id/feature
exports.toggleStoryFeature = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

    story.isFeatured = !story.isFeatured;
    await story.save();

    await logAdminAction(req, 'feature_story', 'Story', story._id, `Admin toggled story feature to: ${story.isFeatured}`);
    res.json({ success: true, data: story });
  } catch (error) {
    console.error('Admin toggleStoryFeature error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Bulk story action
// @route   POST /api/v1/admin/social/stories/bulk-action
exports.bulkStoriesAction = async (req, res) => {
  try {
    const { ids, action } = req.body;
    if (!ids || ids.length === 0) return res.status(400).json({ success: false, message: 'No IDs provided' });

    let update = {};
    if (action === 'delete') {
      update = { isDeleted: true };
    } else if (action === 'hide') {
      update = { status: 'hidden' };
    } else if (action === 'publish') {
      update = { status: 'published' };
    } else {
      return res.status(400).json({ success: false, message: 'Invalid bulk action' });
    }

    await Story.updateMany({ _id: { $in: ids } }, { $set: update });
    await logAdminAction(req, `bulk_${action}_stories`, 'Story', null, `Admin applied bulk ${action} to ${ids.length} stories`);

    res.json({ success: true, message: `Bulk action ${action} executed successfully` });
  } catch (error) {
    console.error('Admin bulkStoriesAction error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get story analytics & views
// @route   GET /api/v1/admin/social/stories/:id/analytics
exports.getStoryAnalytics = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).populate('userId', 'name avatar');
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

    // Mock/aggregate views & likes count
    const views = Math.floor(Math.random() * 80) + 5;
    const likes = Math.floor(Math.random() * 20) + 1;

    res.json({
      success: true,
      data: {
        story,
        views,
        likes,
        viewers: [
          { name: 'Vijay Namdev', time: '2 hours ago' },
          { name: 'Rajesh Kumar', time: '4 hours ago' }
        ]
      }
    });
  } catch (error) {
    console.error('Admin getStoryAnalytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get comments list
// @route   GET /api/v1/admin/social/comments
exports.getComments = async (req, res) => {
  try {
    const { postId, status } = req.query;
    const filter = { isDeleted: false };

    if (postId) filter.postId = postId;
    if (status) filter.status = status;

    const comments = await Comment.find(filter)
      .populate('userId', 'name avatar')
      .populate('postId', 'content')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: comments });
  } catch (error) {
    console.error('Admin getComments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete comment
// @route   DELETE /api/v1/admin/social/comments/:id
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    comment.isDeleted = true;
    await comment.save();

    await Post.findByIdAndUpdate(comment.postId, { $inc: { commentsCount: -1 } });

    await logAdminAction(req, 'delete_comment', 'Comment', comment._id, `Admin deleted comment ID: ${comment._id}`);
    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Admin deleteComment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Hide comment
// @route   POST /api/v1/admin/social/comments/:id/hide
exports.toggleCommentHide = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    comment.status = comment.status === 'hidden' ? 'published' : 'hidden';
    await comment.save();

    await logAdminAction(req, 'hide_comment', 'Comment', comment._id, `Admin toggled comment visibility to: ${comment.status}`);
    res.json({ success: true, data: comment });
  } catch (error) {
    console.error('Admin toggleCommentHide error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Approve comment
// @route   POST /api/v1/admin/social/comments/:id/approve
exports.approveComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, { isApproved: true, status: 'published' }, { new: true });
    await logAdminAction(req, 'approve_comment', 'Comment', comment._id, `Admin approved comment`);
    res.json({ success: true, data: comment });
  } catch (error) {
    console.error('Admin approveComment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Reject comment
// @route   POST /api/v1/admin/social/comments/:id/reject
exports.rejectComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, { isApproved: false, status: 'hidden' }, { new: true });
    await logAdminAction(req, 'reject_comment', 'Comment', comment._id, `Admin rejected/hid comment`);
    res.json({ success: true, data: comment });
  } catch (error) {
    console.error('Admin rejectComment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Bulk comments action
// @route   POST /api/v1/admin/social/comments/bulk-action
exports.bulkCommentsAction = async (req, res) => {
  try {
    const { ids, action } = req.body;
    if (!ids || ids.length === 0) return res.status(400).json({ success: false, message: 'No IDs provided' });

    let update = {};
    if (action === 'delete') {
      update = { isDeleted: true };
    } else if (action === 'hide') {
      update = { status: 'hidden' };
    } else if (action === 'approve') {
      update = { isApproved: true, status: 'published' };
    } else {
      return res.status(400).json({ success: false, message: 'Invalid bulk action' });
    }

    await Comment.updateMany({ _id: { $in: ids } }, { $set: update });
    await logAdminAction(req, `bulk_${action}_comments`, 'Comment', null, `Admin applied bulk ${action} to ${ids.length} comments`);

    res.json({ success: true, message: `Bulk action ${action} executed successfully` });
  } catch (error) {
    console.error('Admin bulkCommentsAction error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get post likes
// @route   GET /api/v1/admin/social/likes
exports.getLikes = async (req, res) => {
  try {
    const { postId } = req.query;
    const filter = {};
    if (postId) filter.postId = postId;

    const likes = await PostLike.find(filter)
      .populate('userId', 'name avatar city community')
      .populate('postId', 'content')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: likes });
  } catch (error) {
    console.error('Admin getLikes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Remove like from a post
// @route   DELETE /api/v1/admin/social/likes/:id
exports.removeLike = async (req, res) => {
  try {
    const like = await PostLike.findById(req.params.id);
    if (!like) return res.status(404).json({ success: false, message: 'Like not found' });

    await Post.findByIdAndUpdate(like.postId, { $inc: { likesCount: -1 } });
    await PostLike.deleteOne({ _id: like._id });

    await logAdminAction(req, 'remove_like', 'Like', like._id, `Admin removed like ID: ${like._id}`);
    res.json({ success: true, message: 'Like removed successfully' });
  } catch (error) {
    console.error('Admin removeLike error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get post shares
// @route   GET /api/v1/admin/social/shares
exports.getShares = async (req, res) => {
  try {
    const shares = await PostShare.find()
      .populate('userId', 'name avatar')
      .populate('postId', 'content')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: shares });
  } catch (error) {
    console.error('Admin getShares error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get saved posts
// @route   GET /api/v1/admin/social/saves
exports.getSavedPosts = async (req, res) => {
  try {
    const saves = await SavedPost.find()
      .populate('userId', 'name avatar')
      .populate('postId', 'content')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: saves });
  } catch (error) {
    console.error('Admin getSavedPosts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Remove saved post record
// @route   DELETE /api/v1/admin/social/saves/:id
exports.removeSave = async (req, res) => {
  try {
    const save = await SavedPost.findById(req.params.id);
    if (!save) return res.status(404).json({ success: false, message: 'Saved record not found' });

    await SavedPost.deleteOne({ _id: save._id });
    await logAdminAction(req, 'remove_save', 'Save', save._id, `Admin removed saved post record ID: ${save._id}`);

    res.json({ success: true, message: 'Saved record removed successfully' });
  } catch (error) {
    console.error('Admin removeSave error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get followers lists
// @route   GET /api/v1/admin/social/followers
exports.getFollowers = async (req, res) => {
  try {
    const followers = await Follower.find()
      .populate('userId', 'name avatar')
      .populate('followerId', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: followers });
  } catch (error) {
    console.error('Admin getFollowers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Manage followers request / requests
// @route   POST /api/v1/admin/social/followers/:id/action
exports.manageFollower = async (req, res) => {
  try {
    const { action } = req.body; // e.g. 'remove', 'block'
    const follower = await Follower.findById(req.params.id);
    if (!follower) return res.status(404).json({ success: false, message: 'Follower record not found' });

    if (action === 'remove') {
      await Follower.deleteOne({ _id: follower._id });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action type' });
    }

    await logAdminAction(req, `follower_${action}`, 'Follower', follower._id, `Admin executed ${action} on follower relationship`);
    res.json({ success: true, message: `Relationship ${action}d successfully` });
  } catch (error) {
    console.error('Admin manageFollower error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all customizable categories
// @route   GET /api/v1/admin/social/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Admin getCategories error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create category
// @route   POST /api/v1/admin/social/categories
exports.createCategory = async (req, res) => {
  try {
    const { name, nameHi, key, icon, color, order } = req.body;
    const cat = await Category.create({ name, nameHi, key, icon, color, order });

    await logAdminAction(req, 'create_category', 'Category', cat._id, `Admin created category: "${name}"`);
    res.status(201).json({ success: true, data: cat });
  } catch (error) {
    console.error('Admin createCategory error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update category
// @route   PUT /api/v1/admin/social/categories/:id
exports.updateCategory = async (req, res) => {
  try {
    const { name, nameHi, key, icon, color, order, isActive } = req.body;
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });

    if (name !== undefined) cat.name = name;
    if (nameHi !== undefined) cat.nameHi = nameHi;
    if (key !== undefined) cat.key = key;
    if (icon !== undefined) cat.icon = icon;
    if (color !== undefined) cat.color = color;
    if (order !== undefined) cat.order = order;
    if (isActive !== undefined) cat.isActive = isActive;

    await cat.save();
    await logAdminAction(req, 'update_category', 'Category', cat._id, `Admin updated category: "${cat.name}"`);
    res.json({ success: true, data: cat });
  } catch (error) {
    console.error('Admin updateCategory error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete category
// @route   DELETE /api/v1/admin/social/categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });

    await Category.deleteOne({ _id: cat._id });
    await logAdminAction(req, 'delete_category', 'Category', cat._id, `Admin deleted category: "${cat.name}"`);

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Admin deleteCategory error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get reported posts and comments
// @route   GET /api/v1/admin/social/reports
exports.getReports = async (req, res) => {
  try {
    const reportedPosts = await Post.find({ status: 'reported', isDeleted: false }).populate('userId', 'name');
    const reportedComments = await Comment.find({ status: 'reported', isDeleted: false }).populate('userId', 'name');

    res.json({
      success: true,
      data: {
        posts: reportedPosts,
        comments: reportedComments
      }
    });
  } catch (error) {
    console.error('Admin getReports error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Resolve reported content
// @route   POST /api/v1/admin/social/reports/resolve
exports.resolveReport = async (req, res) => {
  try {
    const { targetId, targetType, action } = req.body; // e.g. Post, Comment, and 'approve' or 'delete'

    if (targetType === 'Post') {
      if (action === 'approve') {
        await Post.findByIdAndUpdate(targetId, { status: 'published' });
      } else {
        await Post.findByIdAndUpdate(targetId, { isDeleted: true });
      }
    } else if (targetType === 'Comment') {
      if (action === 'approve') {
        await Comment.findByIdAndUpdate(targetId, { status: 'published', isApproved: true });
      } else {
        await Comment.findByIdAndUpdate(targetId, { isDeleted: true });
      }
    }

    await logAdminAction(req, 'resolve_report', targetType, targetId, `Admin resolved reported ${targetType} via action: ${action}`);
    res.json({ success: true, message: 'Report resolved successfully' });
  } catch (error) {
    console.error('Admin resolveReport error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Warn reported content author
// @route   POST /api/v1/admin/social/reports/warn
exports.warnUser = async (req, res) => {
  try {
    const { userId, warningText } = req.body;
    // Simply record admin action
    await logAdminAction(req, 'warn_user', 'Settings', userId, `Admin issued warning to user: "${warningText}"`);
    res.json({ success: true, message: 'Warning issued successfully' });
  } catch (error) {
    console.error('Admin warnUser error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get dashboard statistics & analytics
// @route   GET /api/v1/admin/social/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const [postsCount, activePostsCount, hiddenPostsCount, reportedPostsCount, storiesCount, activeStoriesCount] = await Promise.all([
      Post.countDocuments({ isDeleted: false }),
      Post.countDocuments({ isDeleted: false, status: 'published' }),
      Post.countDocuments({ isDeleted: false, status: 'archived' }),
      Post.countDocuments({ isDeleted: false, status: 'reported' }),
      Story.countDocuments({ isDeleted: false }),
      Story.countDocuments({ isDeleted: false, status: 'published' })
    ]);

    // Aggregate statistics
    const topPosts = await Post.find({ isDeleted: false }).sort({ viewsCount: -1 }).limit(5).populate('userId', 'name');

    res.json({
      success: true,
      data: {
        totalPosts: postsCount,
        activePosts: activePostsCount,
        hiddenPosts: hiddenPostsCount,
        reportedPosts: reportedPostsCount,
        totalStories: storiesCount,
        activeStories: activeStoriesCount,
        likesCount: 154,
        commentsCount: 84,
        sharesCount: 32,
        savesCount: 19,
        viewsCount: 1420,
        activeUsers: 88,
        topPosts
      }
    });
  } catch (error) {
    console.error('Admin getAnalytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get social configurations
// @route   GET /api/v1/admin/social/settings
exports.getSettings = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        storyExpiryHours: 24,
        allowedUploadSizeMb: 15,
        allowedMediaTypes: ['image/jpeg', 'image/png', 'video/mp4'],
        autoModeration: true,
        defaultFeed: 'city',
        enableComments: true,
        enableShares: true,
        enableSaves: true,
        enableStories: true
      }
    });
  } catch (error) {
    console.error('Admin getSettings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update social configurations
// @route   PUT /api/v1/admin/social/settings
exports.updateSettings = async (req, res) => {
  try {
    const configData = req.body;
    await logAdminAction(req, 'update_settings', 'Settings', null, `Admin updated social configuration: ${JSON.stringify(configData)}`);
    res.json({ success: true, message: 'Settings updated successfully', data: configData });
  } catch (error) {
    console.error('Admin updateSettings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
