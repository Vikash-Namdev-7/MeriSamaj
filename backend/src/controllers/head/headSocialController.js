const Post = require('../../models/Post');
const PostLike = require('../../models/PostLike');
const Comment = require('../../models/Comment');
const Community = require('../../models/Community');
const City = require('../../models/City');
const User = require('../../models/User');

/**
 * Helper to resolve the assigned Community and associated Cities for the logged-in Head.
 */
const getHeadJurisdiction = async (req) => {
  let communityId = req.communityId || req.user?.communityId;
  if (communityId && communityId._id) communityId = communityId._id;

  if (!communityId && req.user?.assignedCommunityIds && req.user.assignedCommunityIds.length > 0) {
    const first = req.user.assignedCommunityIds[0];
    communityId = first._id ? first._id : first;
  }

  if (!communityId && req.user?.community) {
    const commDoc = await Community.findOne({ name: req.user.community });
    if (commDoc) communityId = commDoc._id;
  }

  if (!communityId) {
    const defaultComm = await Community.findOne({});
    if (defaultComm) communityId = defaultComm._id;
  }

  const communityIds = [];
  if (communityId) communityIds.push(communityId);
  if (req.user?.assignedCommunityIds && Array.isArray(req.user.assignedCommunityIds)) {
    req.user.assignedCommunityIds.forEach(item => {
      const id = item._id ? item._id : item;
      if (id && !communityIds.some(existing => existing.toString() === id.toString())) {
        communityIds.push(id);
      }
    });
  }

  let communityDoc = null;
  let cityIds = [];

  if (communityId) {
    communityDoc = await Community.findById(communityId);
    if (communityDoc) {
      if (communityDoc.cityIds && communityDoc.cityIds.length > 0) {
        cityIds = communityDoc.cityIds;
      }
      if (communityDoc.city) {
        const cityMatch = await City.findOne({ name: new RegExp('^' + communityDoc.city.trim() + '$', 'i') });
        if (cityMatch && !cityIds.some(id => id.toString() === cityMatch._id.toString())) {
          cityIds.push(cityMatch._id);
        }
      }
    }
  }

  // Fallback: search city matching user's profile city
  if (cityIds.length === 0 && req.user?.city) {
    const userCityMatch = await City.findOne({ name: new RegExp('^' + req.user.city.trim() + '$', 'i') });
    if (userCityMatch) cityIds.push(userCityMatch._id);
  }

  return { communityId, communityIds, communityDoc, cityIds };
};

/**
 * Build base query filter from search, date range, and status
 */
const buildBaseFilter = async (query) => {
  const { search, status } = query;
  const filter = {};

  // 1. Status Filter
  if (status === 'deleted') {
    filter.isDeleted = true;
  } else if (status === 'all') {
    // No isDeleted restriction
  } else {
    // Default: 'active' (non-deleted posts)
    filter.isDeleted = { $ne: true };
  }

  // 2. Search Filter (User Name / Content)
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

  return filter;
};

// @desc    Get City Feed posts for Community Head's assigned community/city
// @route   GET /api/v1/head/social/city-feed
// @access  Private (Head, Admin)
exports.getCityFeed = async (req, res) => {
  try {
    const { communityId, communityIds, communityDoc, cityIds } = await getHeadJurisdiction(req);
    const filter = await buildBaseFilter(req.query);

    // Enforce feedType = "city"
    filter.feedType = { $ne: 'community' };

    // Scope to Head's assigned community or city (if not master admin)
    if (req.user.role !== 'admin') {
      const scopeConditions = [];
      if (communityIds && communityIds.length > 0) {
        scopeConditions.push({ communityId: { $in: communityIds } });
      } else if (communityId) {
        scopeConditions.push({ communityId });
      }
      if (cityIds.length > 0) {
        scopeConditions.push({ cityId: { $in: cityIds } });
      }

      if (scopeConditions.length > 0) {
        if (filter.$or) {
          filter.$and = [
            { $or: filter.$or },
            { $or: scopeConditions }
          ];
          delete filter.$or;
        } else {
          filter.$or = scopeConditions;
        }
      }
    } else if (req.query.communityId || req.query.cityId) {
      if (req.query.communityId) filter.communityId = req.query.communityId;
      if (req.query.cityId) filter.cityId = req.query.cityId;
    }

    // Apply specific city filter if requested
    if (req.query.cityId && req.query.cityId !== 'all') {
      filter.cityId = req.query.cityId;
    }

    const pageNum = parseInt(req.query.page, 10) || 1;
    const limitNum = parseInt(req.query.limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Retrieve list of available cities for filter dropdown
    let availableCities = [];
    if (cityIds && cityIds.length > 0) {
      availableCities = await City.find({ _id: { $in: cityIds } }).select('_id name').sort({ name: 1 });
    }
    if (availableCities.length === 0) {
      availableCities = await City.find({}).select('_id name').sort({ name: 1 }).limit(100);
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate('userId', 'name avatar role email phone city')
        .populate('authorId', 'name avatar role email phone city')
        .populate('communityId', 'name slug city')
        .populate('cityId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Post.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: posts,
      jurisdiction: {
        communityName: communityDoc ? communityDoc.name : 'All Communities',
        cityCount: cityIds.length,
        cities: availableCities
      },
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    console.error('Head getCityFeed error:', error);
    res.status(500).json({ success: false, message: 'Server error loading City Feed' });
  }
};

// @desc    Get Community Feed posts strictly for Community Head's assigned community
// @route   GET /api/v1/head/social/community-feed
// @access  Private (Head, Admin)
exports.getCommunityFeed = async (req, res) => {
  try {
    const { communityId, communityIds, communityDoc } = await getHeadJurisdiction(req);
    const filter = await buildBaseFilter(req.query);

    const commIdsArray = communityIds && communityIds.length > 0
      ? communityIds
      : (communityId ? [communityId] : []);

    if (req.user.role === 'admin') {
      const targetCommunity = req.query.communityId || communityId;
      if (targetCommunity && targetCommunity !== 'undefined' && targetCommunity !== 'all') {
        filter.communityId = targetCommunity;
      }
    } else if (commIdsArray.length > 0) {
      // Find all member user IDs belonging to Head's assigned community(ies)
      const memberUsers = await User.find({
        $or: [
          { communityId: { $in: commIdsArray } },
          { assignedCommunityIds: { $in: commIdsArray } }
        ]
      }).select('_id');
      const memberUserIds = memberUsers.map(u => u._id);

      const communityScope = [
        { communityId: { $in: commIdsArray } },
        { feedType: 'community' }
      ];

      if (memberUserIds.length > 0) {
        communityScope.push({ userId: { $in: memberUserIds } });
        communityScope.push({ authorId: { $in: memberUserIds } });
      }

      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or },
          { $or: communityScope }
        ];
        delete filter.$or;
      } else {
        filter.$or = communityScope;
      }
    }

    const pageNum = parseInt(req.query.page, 10) || 1;
    const limitNum = parseInt(req.query.limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate('userId', 'name avatar role email phone city community communityId')
        .populate('authorId', 'name avatar role email phone city community communityId')
        .populate('communityId', 'name slug city')
        .populate('cityId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Post.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: posts,
      jurisdiction: {
        communityName: communityDoc ? communityDoc.name : 'All Communities'
      },
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    console.error('Head getCommunityFeed error:', error);
    res.status(500).json({ success: false, message: 'Server error loading Community Feed' });
  }
};

// @desc    Get single post details with complete Likes and Comments lists
// @route   GET /api/v1/head/social/posts/:id
// @access  Private (Head, Admin)
exports.getPostDetails = async (req, res) => {
  try {
    const { communityId, cityIds } = await getHeadJurisdiction(req);
    const post = await Post.findById(req.params.id)
      .populate('userId', 'name avatar role email phone city')
      .populate('authorId', 'name avatar role email phone city')
      .populate('communityId', 'name')
      .populate('cityId', 'name');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Jurisdiction Security Check for Head role (Admin bypasses)
    if (req.user.role !== 'admin') {
      const postCommunityId = post.communityId?._id ? post.communityId._id.toString() : (post.communityId ? post.communityId.toString() : null);
      const postCityId = post.cityId?._id ? post.cityId._id.toString() : (post.cityId ? post.cityId.toString() : null);

      const matchesCommunity = communityId && postCommunityId === communityId.toString();
      const matchesCity = postCityId && cityIds.some(id => id.toString() === postCityId);

      if (!matchesCommunity && !matchesCity) {
        return res.status(403).json({ success: false, message: 'Access denied. Post is outside your assigned jurisdiction.' });
      }
    }

    // Fetch full likes list with user profiles
    const likes = await PostLike.find({ postId: post._id })
      .populate('userId', 'name avatar city community role phone')
      .sort({ createdAt: -1 });

    // Fetch full comments list with user profiles
    const comments = await Comment.find({ postId: post._id, isDeleted: false })
      .populate('userId', 'name avatar role city')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        post,
        likes,
        comments,
        likesCount: likes.length,
        commentsCount: comments.length
      }
    });
  } catch (error) {
    console.error('Head getPostDetails error:', error);
    res.status(500).json({ success: false, message: 'Server error loading post details' });
  }
};

// @desc    Soft Delete a post
// @route   DELETE /api/v1/head/social/posts/:id
// @access  Private (Head, Admin)
exports.softDeletePost = async (req, res) => {
  try {
    const { communityId, cityIds } = await getHeadJurisdiction(req);
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Jurisdiction Security Check for Head role
    if (req.user.role !== 'admin') {
      const postCommunityId = post.communityId ? post.communityId.toString() : null;
      const postCityId = post.cityId ? post.cityId.toString() : null;

      const matchesCommunity = communityId && postCommunityId === communityId.toString();
      const matchesCity = postCityId && cityIds.some(id => id.toString() === postCityId);

      if (!matchesCommunity && !matchesCity) {
        return res.status(403).json({ success: false, message: 'Access denied. You cannot delete posts outside your assigned jurisdiction.' });
      }
    }

    post.isDeleted = true;
    post.deletedAt = new Date();
    await post.save();

    res.json({ success: true, message: 'Post soft-deleted successfully', data: post });
  } catch (error) {
    console.error('Head softDeletePost error:', error);
    res.status(500).json({ success: false, message: 'Server error soft-deleting post' });
  }
};

// @desc    Restore a soft-deleted post
// @route   POST /api/v1/head/social/posts/:id/restore
// @access  Private (Head, Admin)
exports.restorePost = async (req, res) => {
  try {
    const { communityId, cityIds } = await getHeadJurisdiction(req);
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Jurisdiction Security Check for Head role
    if (req.user.role !== 'admin') {
      const postCommunityId = post.communityId ? post.communityId.toString() : null;
      const postCityId = post.cityId ? post.cityId.toString() : null;

      const matchesCommunity = communityId && postCommunityId === communityId.toString();
      const matchesCity = postCityId && cityIds.some(id => id.toString() === postCityId);

      if (!matchesCommunity && !matchesCity) {
        return res.status(403).json({ success: false, message: 'Access denied. You cannot restore posts outside your assigned jurisdiction.' });
      }
    }

    post.isDeleted = false;
    post.deletedAt = null;
    await post.save();

    res.json({ success: true, message: 'Post restored successfully', data: post });
  } catch (error) {
    console.error('Head restorePost error:', error);
    res.status(500).json({ success: false, message: 'Server error restoring post' });
  }
};
