const Post = require('../../models/Post');
const Community = require('../../models/Community');
const User = require('../../models/User');
const { notifyOfficialPost } = require('../../services/notificationService');

// ─────────────────────────────────────────────
// @desc    Get all posts for user's community
// @route   GET /api/v1/member/posts
// @access  Private
// ─────────────────────────────────────────────
exports.getPosts = async (req, res) => {
  try {
    const { feed, feedType } = req.query;
    const requestedFeed = feed || feedType;

    const filter = { isDeleted: false };
    
    // Resolve user community IDs
    const commIds = [];
    let primaryId = req.communityId || req.user?.communityId?._id || req.user?.communityId;
    if (primaryId) commIds.push(primaryId);

    if (req.user?.assignedCommunityIds && Array.isArray(req.user.assignedCommunityIds)) {
      req.user.assignedCommunityIds.forEach(item => {
        const id = item._id ? item._id : item;
        if (id && !commIds.some(existing => existing.toString() === id.toString())) {
          commIds.push(id);
        }
      });
    }

    if (commIds.length === 0 && req.user?.community) {
      const commDoc = await Community.findOne({ name: new RegExp('^' + req.user.community.trim() + '$', 'i') });
      if (commDoc) commIds.push(commDoc._id);
    }

    if (requestedFeed === 'community') {
      filter.feedType = 'community';
      if (commIds.length > 0) {
        filter.communityId = commIds.length === 1 ? commIds[0] : { $in: commIds };
      }
    } else if (requestedFeed === 'city') {
      filter.feedType = { $ne: 'community' };
      if (commIds.length > 0) {
        filter.$or = [
          { feedType: { $ne: 'community' } },
          { communityId: commIds.length === 1 ? commIds[0] : { $in: commIds } }
        ];
      }
    } else if (commIds.length > 0) {
      filter.communityId = commIds.length === 1 ? commIds[0] : { $in: commIds };
    }

    if (req.user?.role === 'user' || req.user?.role === 'member') {
      filter.status = 'published';
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

    let targetCommunityId = req.communityId || req.user?.communityId?._id || req.user?.communityId;
    if (!targetCommunityId) {
      const Community = require('../../models/Community');
      const defaultComm = await Community.findOne({});
      if (defaultComm) targetCommunityId = defaultComm._id;
    }

    const post = await Post.create({
      content: content.trim(),
      images,
      media: formattedMedia,
      userId: req.user._id,
      authorId: req.user._id,
      communityId: targetCommunityId,
      feedType: req.body.feedType || 'city',
      status: 'published',
    });

    const populated = await Post.findById(post._id)
      .populate('userId', 'name avatar community city')
      .populate('authorId', 'name avatar community city')
      .populate('communityId', 'name slug city');

    // Trigger notification if Announcement or Emergency
    if (['Announcement', 'Emergency'].includes(req.body.category)) {
      // Find all users in this community/city context to notify
      const usersToNotify = await User.find({ communityId: targetCommunityId }).select('_id');
      const memberIds = usersToNotify.map(u => u._id).filter(id => id.toString() !== req.user._id.toString());
      
      notifyOfficialPost(
        memberIds,
        req.body.category,
        req.user.name,
        content.trim(),
        post._id.toString()
      );
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

    const isAuthor = post.authorId.toString() === req.user._id.toString();
    const isHeadOrAdmin = ['head', 'admin'].includes(req.user.role);

    if (!isAuthor && !isHeadOrAdmin) {
      return res.status(403).json({ status: 'error', message: 'Not authorized to delete this post' });
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

    post.comments.push({ userId: req.user._id, text: text.trim() });
    await post.save();

    const updated = await Post.findById(post._id)
      .populate('comments.userId', 'name avatar');

    res.status(201).json({ success: true, data: updated.comments });
  } catch (error) {
    console.error('addComment error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};
