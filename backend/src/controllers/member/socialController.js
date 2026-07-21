const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const PostLike = require('../../models/PostLike');
const SavedPost = require('../../models/SavedPost');
const PostView = require('../../models/PostView');
const PostShare = require('../../models/PostShare');
const Notification = require('../../models/Notification');
const City = require('../../models/City');
const User = require('../../models/User');
const Community = require('../../models/Community');

// Helper to resolve user city string to cityId (find or create)
const getCityId = async (cityName) => {
  if (!cityName) return null;
  const trimmed = cityName.trim();
  let cityDoc = await City.findOne({ name: new RegExp('^' + trimmed + '$', 'i') });
  if (!cityDoc) {
    try {
      cityDoc = await City.create({ name: trimmed });
    } catch (e) {
      cityDoc = await City.findOne({ name: new RegExp('^' + trimmed + '$', 'i') });
    }
  }
  return cityDoc ? cityDoc._id : null;
};

// Helper to extract raw ObjectIds for communityIds
const getCommunityIds = async (req) => {
  const ids = [];

  let primaryId = req.communityId || req.user?.communityId;
  if (primaryId && primaryId._id) primaryId = primaryId._id;
  if (primaryId) ids.push(primaryId);

  if (req.user?.assignedCommunityIds && Array.isArray(req.user.assignedCommunityIds)) {
    req.user.assignedCommunityIds.forEach(item => {
      const id = item._id ? item._id : item;
      if (id && !ids.some(existing => existing.toString() === id.toString())) {
        ids.push(id);
      }
    });
  }

  // Fallback: if user.communityId is missing, resolve by user.community string name
  if (ids.length === 0 && req.user?.community) {
    const commDoc = await Community.findOne({ name: new RegExp('^' + req.user.community.trim() + '$', 'i') });
    if (commDoc) ids.push(commDoc._id);
  }

  // Final fallback to default community if still empty
  if (ids.length === 0) {
    const defaultComm = await Community.findOne({});
    if (defaultComm) ids.push(defaultComm._id);
  }

  return ids;
};

// Legacy single community ID helper for backwards compatibility
const getCommunityId = (req) => {
  if (req.communityId) return req.communityId;
  if (req.user?.communityId) {
    return req.user.communityId._id ? req.user.communityId._id : req.user.communityId;
  }
  return null;
};

// @desc    Get Feed posts dynamically
// @route   GET /api/v1/member/social/posts
// @access  Private
exports.getPosts = async (req, res) => {
  try {
    const { feed, category, limit = 10, cursor } = req.query;
    // Resolve user community ObjectIds (supports single communityId, assignedCommunityIds, or string lookup)
    const userCommIds = await getCommunityIds(req);

    // Base filter
    const filter = {
      status: 'published',
      isDeleted: false
    };

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Dynamic feed filter resolving
    if (feed === 'city') {
      if (req.user?.city) {
        const cityId = await getCityId(req.user.city);
        if (cityId) {
          filter.cityId = cityId;
        }
      }
      // City Feed: visible to members in the same city.
      // Shows city posts (feedType !== 'community'), plus community posts if user belongs to that community.
      filter.$or = [
        { feedType: { $ne: 'community' } },
        { communityId: userCommIds.length === 1 ? userCommIds[0] : { $in: userCommIds } }
      ];
    } else if (feed === 'community') {
      if (userCommIds.length > 0) {
        const commFilter = userCommIds.length === 1 ? userCommIds[0] : { $in: userCommIds };
        filter.$or = [
          { communityId: commFilter },
          { feedType: 'community' }
        ];
      } else {
        filter.feedType = 'community';
      }
    } else {
      if (userCommIds.length > 0) {
        filter.communityId = userCommIds.length === 1 ? userCommIds[0] : { $in: userCommIds };
      }
    }

    // Cursor Pagination (O(1) database keyset scans)
    if (cursor) {
      filter.createdAt = { $lt: new Date(cursor) };
    }

    const posts = await Post.find(filter)
      .populate('userId', 'name avatar role city community communityId')
      .populate('authorId', 'name avatar role city community communityId')
      .populate('communityId', 'name slug city')
      .populate('cityId', 'name')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(Number(limit) + 1); // Get extra one to check hasMore

    const hasMore = posts.length > Number(limit);
    if (hasMore) {
      posts.pop();
    }

    // Look up whether the logged-in user liked or saved these posts
    const postIds = posts.map(p => p._id);
    const [likes, saves] = await Promise.all([
      PostLike.find({ postId: { $in: postIds }, userId: req.user._id }),
      SavedPost.find({ postId: { $in: postIds }, userId: req.user._id })
    ]);

    const likedPostIds = new Set(likes.map(l => l.postId.toString()));
    const savedPostIds = new Set(saves.map(s => s.postId.toString()));

    const formattedPosts = posts.map(p => ({
      ...p.toObject(),
      isLiked: likedPostIds.has(p._id.toString()),
      isSaved: savedPostIds.has(p._id.toString())
    }));

    res.json({
      success: true,
      data: formattedPosts,
      hasMore,
      nextCursor: hasMore && posts.length > 0 ? posts[posts.length - 1].createdAt : null
    });
  } catch (error) {
    console.error('getPosts error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single post by ID
// @route   GET /api/v1/member/social/posts/:id
// @access  Private
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false })
      .populate('userId', 'name avatar role');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Verify community matches
    const userCommunityId = getCommunityId(req);
    if (userCommunityId && post.communityId && post.communityId.toString() !== userCommunityId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [likeDoc, saveDoc] = await Promise.all([
      PostLike.findOne({ postId: post._id, userId: req.user._id }),
      SavedPost.findOne({ postId: post._id, userId: req.user._id })
    ]);

    res.json({
      success: true,
      data: {
        ...post.toObject(),
        isLiked: !!likeDoc,
        isSaved: !!saveDoc
      }
    });
  } catch (error) {
    console.error('getPostById error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const cloudinary = require('cloudinary').v2;
const config = require('../../config/config');

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret
});

// @desc    Create proper social post
// @route   POST /api/v1/member/social/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const { content, category, media = [], location } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    // Resolve location
    const locationCity = location || req.user.city || 'Indore';
    const cityId = await getCityId(locationCity);
    const communityId = getCommunityId(req);

    // Format Media structures & upload base64/data URLs to Cloudinary
    const formattedMedia = await Promise.all(media.map(async (m) => {
      let type = m.type || 'image';
      let provider = m.provider || 'external';
      let url = m.url;

      if (url && (url.startsWith('data:') || url.startsWith('blob:'))) {
        try {
          const uploadRes = await cloudinary.uploader.upload(url, {
            folder: 'merisamaj_social',
            resource_type: type === 'video' ? 'video' : 'auto'
          });
          url = uploadRes.secure_url;
          provider = 'upload';
        } catch (err) {
          console.error('Cloudinary upload error in createPost:', err.message);
        }
      }

      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        type = 'youtube';
        provider = 'youtube';
      } else if (url.includes('instagram.com/')) {
        type = 'instagram';
        provider = 'instagram';
      } else if (url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes('video') || (url.includes('res.cloudinary.com') && url.includes('/video/'))) {
        type = 'video';
        provider = url.includes('cloudinary') ? 'upload' : 'external';
      } else if (url.includes('cloudinary')) {
        provider = 'upload';
      }

      return {
        type,
        url,
        thumbnail: m.thumbnail,
        duration: m.duration,
        width: m.width,
        height: m.height,
        provider
      };
    }));

    let targetCommunityId = communityId;
    if (!targetCommunityId) {
      const Community = require('../../models/Community');
      const defaultComm = await Community.findOne({});
      if (defaultComm) targetCommunityId = defaultComm._id;
    }

    const post = await Post.create({
      userId: req.user._id,
      authorId: req.user._id,
      communityId: targetCommunityId,
      cityId,
      content: content.trim(),
      category: category || 'Notice',
      media: formattedMedia,
      images: formattedMedia.map(m => m.url),
      feedType: req.body.feedType || 'city',
      status: 'published'
    });

    const populated = await Post.findById(post._id)
      .populate('userId', 'name avatar role')
      .populate('authorId', 'name avatar role');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('createPost error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Toggle unique like on a post
// @route   POST /api/v1/member/social/posts/:id/like
// @access  Private
exports.toggleLike = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const alreadyLiked = await PostLike.findOne({ postId, userId });

    if (alreadyLiked) {
      await PostLike.deleteOne({ _id: alreadyLiked._id });
      await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });
      res.json({ success: true, liked: false });
    } else {
      await PostLike.create({ postId, userId });
      await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });

      // Create notification for author
      if (post.userId.toString() !== userId.toString()) {
        await Notification.create({
          recipientId: post.userId,
          senderId: userId,
          type: 'like',
          entityType: 'Post',
          entityId: postId
        });
      }

      res.json({ success: true, liked: true });
    }
  } catch (error) {
    console.error('toggleLike error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get comments for a post
// @route   GET /api/v1/member/social/posts/:id/comments
// @access  Private
exports.getComments = async (req, res) => {
  try {
    const { parentCommentId } = req.query;

    const filter = {
      postId: req.params.id
    };

    if (parentCommentId !== undefined) {
      filter.parentCommentId = parentCommentId || null;
    }

    const comments = await Comment.find(filter)
      .populate('userId', 'name avatar')
      .sort({ createdAt: 1 });

    res.json({ success: true, data: comments });
  } catch (error) {
    console.error('getComments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add comment to a post
// @route   POST /api/v1/member/social/posts/:id/comment
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const { text, parentCommentId } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = await Comment.create({
      postId,
      userId: req.user._id,
      parentCommentId: parentCommentId || null,
      text: text.trim()
    });

    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    const populated = await Comment.findById(comment._id).populate('userId', 'name avatar');

    // Create Notification
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (parentComment && parentComment.userId.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipientId: parentComment.userId,
          senderId: req.user._id,
          type: 'reply',
          entityType: 'Comment',
          entityId: comment._id
        });
      }
    } else if (post.userId.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipientId: post.userId,
        senderId: req.user._id,
        type: 'comment',
        entityType: 'Post',
        entityId: postId
      });
    }

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('addComment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Toggle save post
// @route   POST /api/v1/member/social/posts/:id/save
// @access  Private
exports.toggleSave = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const alreadySaved = await SavedPost.findOne({ postId, userId });

    if (alreadySaved) {
      await SavedPost.deleteOne({ _id: alreadySaved._id });
      res.json({ success: true, saved: false });
    } else {
      await SavedPost.create({ postId, userId });
      res.json({ success: true, saved: true });
    }
  } catch (error) {
    console.error('toggleSave error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Record unique view metrics on a post
// @route   POST /api/v1/member/social/posts/:id/view
// @access  Private
exports.recordView = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const { duration } = req.body;

    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const viewLogged = await PostView.findOne({ postId, userId });
    if (!viewLogged) {
      await PostView.create({ postId, userId, duration });
      await Post.findByIdAndUpdate(postId, { $inc: { viewsCount: 1 } });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('recordView error:', error);
    res.status(500).json({ success: false });
  }
};

// @desc    Track post share counts
// @route   POST /api/v1/member/social/posts/:id/share
// @access  Private
exports.recordShare = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const { platform } = req.body;

    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    await PostShare.create({ postId, userId, platform: platform || 'copy_link' });
    await Post.findByIdAndUpdate(postId, { $inc: { sharesCount: 1 } });

    res.json({ success: true });
  } catch (error) {
    console.error('recordShare error:', error);
    res.status(500).json({ success: false });
  }
};

// @desc    Search social posts / tags
// @route   GET /api/v1/member/social/search
// @access  Private
exports.searchSocial = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Query parameter is required' });
    }

    const posts = await Post.find({
      communityId: req.user.communityId,
      status: 'published',
      isDeleted: false,
      $text: { $search: query } // leverage mongodb text indexes for fast search
    })
    .populate('userId', 'name avatar role')
    .limit(30);

    res.json({ success: true, data: posts });
  } catch (error) {
    // Fallback if text index not set up in dev yet
    try {
      const posts = await Post.find({
        communityId: req.user.communityId,
        status: 'published',
        isDeleted: false,
        content: new RegExp(query, 'i')
      })
      .populate('userId', 'name avatar role')
      .limit(30);
      return res.json({ success: true, data: posts });
    } catch (e) {
      console.error('searchSocial error:', e);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};
