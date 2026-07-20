const Post = require('../../models/Post');

// ─────────────────────────────────────────────
// @desc    Get all posts for user's community
// @route   GET /api/v1/member/posts
// @access  Private
// ─────────────────────────────────────────────
exports.getPosts = async (req, res) => {
  try {
    /**
     * Community-scoped query.
     * req.communityId is set by authMiddleware as a plain ObjectId.
     * Members only see their own community's posts.
     */
    const filter = {};
    if (req.communityId) {
      filter.communityId = req.communityId;
    }
    // Only show approved posts (+ user's own pending posts)
    if (req.user.role === 'user') {
      filter.$or = [
        { status: 'Approved' },
        { authorId: req.user._id }
      ];
    }

    const posts = await Post.find(filter)
      .populate('authorId', 'name avatar community')
      .populate('comments.userId', 'name avatar')
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
      .populate('authorId', 'name avatar community')
      .populate('comments.userId', 'name avatar')
      .populate('likes', 'name avatar');

    if (!post) {
      return res.status(404).json({ status: 'error', message: 'Post not found' });
    }

    // Community access check (non-admin)
    if (req.communityId && post.communityId) {
      const postCommunityId = post.communityId._id ?? post.communityId;
      if (!postCommunityId.equals(req.communityId)) {
        return res.status(403).json({ status: 'error', message: 'Access denied. Post belongs to a different community.' });
      }
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

    const post = await Post.create({
      content: content.trim(),
      images,
      authorId: req.user._id,
      /**
       * communityId is ALWAYS set server-side from the authenticated user.
       * Client body.communityId is intentionally ignored — security measure.
       */
      communityId: req.communityId,
      status: 'Approved',
    });

    const populated = await Post.findById(post._id)
      .populate('authorId', 'name avatar community');

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
