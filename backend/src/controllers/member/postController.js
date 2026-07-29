const Post = require('../../models/Post');
const Community = require('../../models/Community');
const User = require('../../models/User');
const { notifyOfficialPost, createBroadcastNotification, createAggregatedNotification, createNotification } = require('../../services/notificationService');
const { sendPushNotification } = require('../../services/pushNotificationService');
const { applyScopeFilter, inheritTenantPayload } = require('../../utils/queryScopeHelper');

// Helper to verify post community ownership for non-admin actions
const verifyPostCommunityAccess = (req, post) => {
  if (['admin', 'super_admin', 'master_admin', 'master'].includes(req.user?.role)) {
    return true;
  }
  const userCommId = (req.communityId || req.user?.communityId?._id || req.user?.communityId || '').toString();
  const postCommId = (post?.communityId?._id || post?.communityId || '').toString();
  return !!(userCommId && postCommId && userCommId === postCommId);
};

// ─────────────────────────────────────────────
// @desc    Get all posts for user's community (2-Level Scope: Mandatory Community + Optional City)
// @route   GET /api/v1/member/posts
// @access  Private
// ─────────────────────────────────────────────
exports.getPosts = async (req, res) => {
  try {
    const { feed, feedType } = req.query;
    const requestedFeed = feed || feedType;

    let baseFilter = { isDeleted: false };

    if (req.user?.role === 'user' || req.user?.role === 'member') {
      baseFilter.status = 'published';
    }

    let cityFilter = req.query.city;
    if (requestedFeed === 'city' && !cityFilter) {
      cityFilter = req.user?.city;
    }

    // Apply Centralized 2-Level Multi-Tenancy Scope (Community mandatory + City optional)
    const filter = applyScopeFilter(req, baseFilter, { overrideCity: cityFilter });

    if (requestedFeed === 'community') {
      filter.feedType = { $in: ['community', 'both'] };
    } else if (requestedFeed === 'city') {
      filter.feedType = { $in: ['city', 'both'] };
    }

    const posts = await Post.find(filter)
      .populate('authorId', 'name avatar community city communityId')
      .populate('userId', 'name avatar community city communityId')
      .populate('communityId', 'name slug city')
      .populate('cityId', 'name')
      .sort({ isPinned: -1, createdAt: -1 });

    res.json({ success: true, data: posts });
  } catch (error) {
    console.error('getPosts error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// ─────────────────────────────────────────────
// @desc    Get single post
// @route   GET /api/v1/member/posts/:id
// @access  Private
// ─────────────────────────────────────────────
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('authorId', 'name avatar community city')
      .populate('userId', 'name avatar community city')
      .populate('communityId', 'name slug city');

    if (!post) {
      return res.status(404).json({ status: 'error', message: 'Post not found' });
    }

    if (!verifyPostCommunityAccess(req, post)) {
      return res.status(403).json({ status: 'error', message: 'Access denied: post belongs to another community' });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    console.error('getPostById error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// ─────────────────────────────────────────────
// @desc    Create a new post
// @route   POST /api/v1/member/posts
// @access  Private
// ─────────────────────────────────────────────
exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ status: 'error', message: 'Post content is required' });
    }

    // Handle images from Cloudinary upload middleware
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.path);
    }

    const formattedMedia = images.map(img => ({ type: 'image', url: img, provider: 'upload' }));

    const tenantPayload = inheritTenantPayload(req, {
      content: content.trim(),
      feedType: req.body.feedType || 'city',
      status: 'published'
    });

    if (!tenantPayload.communityId) {
      return res.status(400).json({ status: 'error', message: 'User is not assigned to any community' });
    }
    const targetCommunityId = tenantPayload.communityId;

    const requestedFeedType = req.body.feedType;

    if (requestedFeedType === 'both') {
      const cityPost = await Post.create({
        content: content.trim(),
        images,
        media: formattedMedia,
        userId: req.user._id,
        authorId: req.user._id,
        communityId: targetCommunityId,
        feedType: 'city',
        status: 'published',
      });

      const communityPost = await Post.create({
        content: content.trim(),
        images,
        media: formattedMedia,
        userId: req.user._id,
        authorId: req.user._id,
        communityId: targetCommunityId,
        feedType: 'community',
        status: 'published',
      });

      const populatedCity = await Post.findById(cityPost._id)
        .populate('userId', 'name avatar community city')
        .populate('authorId', 'name avatar community city')
        .populate('communityId', 'name slug city');

      const populatedCommunity = await Post.findById(communityPost._id)
        .populate('userId', 'name avatar community city')
        .populate('authorId', 'name avatar community city')
        .populate('communityId', 'name slug city');

      return res.json({ success: true, data: populatedCity, posts: [populatedCity, populatedCommunity] });
    }

    const post = await Post.create({
      content: content.trim(),
      images,
      media: formattedMedia,
      userId: req.user._id,
      authorId: req.user._id,
      communityId: targetCommunityId,
      feedType: requestedFeedType || 'city',
      status: 'published',
    });

    const populated = await Post.findById(post._id)
      .populate('userId', 'name avatar community city')
      .populate('authorId', 'name avatar community city')
      .populate('communityId', 'name slug city');

    // Trigger notification if Announcement or Emergency
    if (['Announcement', 'Emergency'].includes(req.body.category)) {
      const isEmergency = req.body.category === 'Emergency';
      createBroadcastNotification({
        communityId: targetCommunityId,
        module: 'social',
        type: isEmergency ? 'emergency_alert' : 'official_announcement',
        title: isEmergency ? '🚨 EMERGENCY ALERT' : `📢 Announcement from ${req.user.name}`,
        message: content.trim().substring(0, 100),
        icon: isEmergency ? '🚨' : '📢',
        priority: isEmergency ? 'urgent' : 'high',
        actionUrl: `/member/social/${post._id}`,
        referenceId: post._id,
        referenceType: 'Post'
      });
    }

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('createPost error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// ─────────────────────────────────────────────
// @desc    Update a post (author only)
// @route   PUT /api/v1/member/posts/:id
// @access  Private
// ─────────────────────────────────────────────
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ status: 'error', message: 'Post not found' });
    }

    if (!verifyPostCommunityAccess(req, post)) {
      return res.status(403).json({ status: 'error', message: 'Access denied: post belongs to another community' });
    }

    // Only author can edit their own post
    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: 'error', message: 'Not authorized to edit this post' });
    }

    const { content } = req.body;
    if (content) post.content = content.trim();

    // Merge new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => f.path);
      post.images = [...post.images, ...newImages];
    }

    const updated = await post.save();
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('updatePost error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// ─────────────────────────────────────────────
// @desc    Delete a post (author, head, or admin)
// @route   DELETE /api/v1/member/posts/:id
// @access  Private
// ─────────────────────────────────────────────
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ status: 'error', message: 'Post not found' });
    }

    if (!verifyPostCommunityAccess(req, post)) {
      return res.status(403).json({ status: 'error', message: 'Access denied: post belongs to another community' });
    }

    const isAuthor = post.authorId.toString() === req.user._id.toString();
    const isHeadOrAdmin = ['head', 'admin'].includes(req.user.role);

    // Trigger post_moderated notification to author if deleted by moderator
    if (!isAuthor && isHeadOrAdmin) {
      const authorId = post.authorId || post.userId;
      if (authorId) {
        createNotification({
          userId: authorId,
          communityId: post.communityId,
          module: 'social',
          type: 'post_moderated',
          title: 'Post Moderated 🛡️',
          message: 'Your post was removed by a community moderator.',
          icon: '🛡️',
          priority: 'high',
          actionUrl: '/member/social'
        }).catch(err => console.error('[PostModeratedNotifError]', err.message));
      }
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    console.error('deletePost error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// ─────────────────────────────────────────────
// @desc    Toggle like on a post
// @route   POST /api/v1/member/posts/:id/like
// @access  Private
// ─────────────────────────────────────────────
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ status: 'error', message: 'Post not found' });
    }

    if (!verifyPostCommunityAccess(req, post)) {
      return res.status(403).json({ status: 'error', message: 'Access denied: post belongs to another community' });
    }

    const userId = req.user._id;
    const alreadyLiked = post.likes.some(id => id.toString() === userId.toString());

    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ success: true, liked: !alreadyLiked, likesCount: post.likes.length });
  } catch (error) {
    console.error('toggleLike error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// ─────────────────────────────────────────────
// @desc    Add a comment to a post
// @route   POST /api/v1/member/posts/:id/comment
// @access  Private
// ─────────────────────────────────────────────
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ status: 'error', message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ status: 'error', message: 'Post not found' });
    }

    if (!verifyPostCommunityAccess(req, post)) {
      return res.status(403).json({ status: 'error', message: 'Access denied: post belongs to another community' });
    }

    post.comments.push({ userId: req.user._id, text: text.trim() });
    await post.save();

    // Trigger Aggregated Notification to Post Author if commenter is not author
    const authorId = post.authorId || post.userId;
    if (authorId && authorId.toString() !== req.user._id.toString()) {
      createAggregatedNotification({
        userId: authorId,
        communityId: post.communityId,
        module: 'social',
        type: 'post_comment',
        title: 'New Comment on your Post 💬',
        message: `${req.user.name} commented on your post.`,
        icon: '💬',
        priority: 'normal',
        actionUrl: `/member/social/${post._id}`,
        referenceId: post._id,
        referenceType: 'Post',
        actorId: req.user._id,
        actorName: req.user.name
      }).catch(err => console.error('[CommentNotifError]', err.message));
    }

    const updated = await Post.findById(post._id)
      .populate('comments.userId', 'name avatar');

    res.status(201).json({ success: true, data: updated.comments });
  } catch (error) {
    console.error('addComment error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};
