const User = require('../../models/User');
const { notifyUserBlocked, notifyUserActivated } = require('../../services/notificationService');
const Community = require('../../models/Community');
const Post = require('../../models/Post');
const Donation = require('../../models/Donation');

// ─── Helper: normalize filter value to lowercase for DB match ───
const statusMap = {
  'active': 'active',
  'inactive': 'inactive',
  'blocked': 'blocked',
  'deleted': 'deleted',
  'pending verification': 'pending verification',
};

// ─── Helper: map DB user to a consistent frontend-friendly shape ───
const formatUser = (user) => ({
  id: user._id,
  name: user.name || 'N/A',
  email: user.email || null,
  phone: user.phone || 'N/A',
  avatar: user.avatar || null,
  gender: user.gender || null,
  dob: user.dob || null,
  city: user.city || null,
  state: user.state || null,
  district: user.district || null,
  community: user.communityId?.name || user.community || null,
  communityId: user.communityId?._id || user.communityId || null,
  subCommunity: user.subCommunity || null,
  role: user.role,
  accountStatus: user.accountStatus,
  verificationStatus: user.verificationStatus,
  isVerified: user.verificationStatus === 'verified',
  registrationSource: user.registrationSource,
  profession: user.profession || null,
  qualification: user.qualification || null,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  familyMembers: user.familyMembers || [],
});

// @desc    Get paginated + filtered list of users
// @route   GET /api/v1/admin/users
// @access  Admin
exports.getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = '',
      verificationStatus = '',
      communityId = '',
      city = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    // Build query — only regular users (not admin/head)
    const query = { role: { $in: ['user', 'member'] } };

    // Search
    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
        { phone: { $regex: s, $options: 'i' } },
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      query.accountStatus = status.toLowerCase();
    }

    // Verification filter
    if (verificationStatus && verificationStatus !== 'all') {
      query.verificationStatus = verificationStatus.toLowerCase();
    }

    // Community filter
    if (communityId && communityId !== 'all') {
      query.communityId = communityId;
    }

    // City filter
    if (city && city !== 'all') {
      query.city = { $regex: city, $options: 'i' };
    }

    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [users, totalCount] = await Promise.all([
      User.find(query)
        .select('-password -plainPassword -deviceTokens')
        .populate('communityId', 'name _id')
        .sort(sortObj)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      status: 'success',
      data: users.map(formatUser),
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch users' });
  }
};

// @desc    Get user management dashboard stats
// @route   GET /api/v1/admin/users/stats
// @access  Admin
exports.getUserStats = async (req, res) => {
  try {
    const memberQuery = { role: { $in: ['user', 'member'] } };

    const [
      totalUsers,
      activeUsers,
      pendingVerification,
      suspendedUsers,
      blockedUsers,
      newUsersThisMonth,
    ] = await Promise.all([
      User.countDocuments(memberQuery),
      User.countDocuments({ ...memberQuery, accountStatus: 'active' }),
      User.countDocuments({ ...memberQuery, verificationStatus: 'pending' }),
      User.countDocuments({ ...memberQuery, accountStatus: 'inactive' }),
      User.countDocuments({ ...memberQuery, accountStatus: 'blocked' }),
      User.countDocuments({
        ...memberQuery,
        createdAt: { $gte: new Date(new Date().setDate(1)) }, // from 1st of current month
      }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        activeUsers,
        pendingVerification,
        suspendedUsers,
        blockedUsers,
        newUsersThisMonth,
        pendingComplaints: 0,      // stub — no Complaint model yet
        pendingTransfers: 0,       // stub — no TransferRequest model yet
      },
    });
  } catch (error) {
    console.error('User Stats Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch user stats' });
  }
};

// @desc    Get single user details with activity
// @route   GET /api/v1/admin/users/:id
// @access  Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -plainPassword -deviceTokens')
      .populate('communityId', 'name _id city isActive')
      .lean();

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    // Fetch recent activity from available models
    const [recentPosts, recentDonations] = await Promise.all([
      Post.find({ authorId: user._id }).sort({ createdAt: -1 }).limit(5).select('content createdAt').lean(),
      Donation.find({ user: user._id }).sort({ createdAt: -1 }).limit(5).select('amount status createdAt').lean(),
    ]);

    const activityFeed = [
      ...recentPosts.map(p => ({ type: 'Post', description: (p.content || '').substring(0, 80) + (p.content?.length > 80 ? '...' : ''), date: p.createdAt, module: 'Social' })),
      ...recentDonations.map(d => ({ type: 'Donation', description: `₹${d.amount} donation — ${d.status}`, date: d.createdAt, module: 'Donations' })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 15);

    res.status(200).json({
      status: 'success',
      data: {
        ...formatUser(user),
        // Extra detail fields not in list view
        bloodGroup: user.bloodGroup,
        maritalStatus: user.maritalStatus,
        gotra: user.gotra,
        houseNumber: user.houseNumber,
        streetAddress: user.streetAddress,
        landmark: user.landmark,
        areaAddress: user.areaAddress,
        pincode: user.pincode,
        alternatePhone: user.alternatePhone,
        alternateEmail: user.alternateEmail,
        qualification: user.qualification,
        school: user.school,
        passingYear: user.passingYear,
        profession: user.profession,
        company: user.company,
        annualIncome: user.annualIncome,
        workCity: user.workCity,
        notificationPreferences: user.notificationPreferences,
        activityFeed,
        stats: {
          posts: await Post.countDocuments({ authorId: user._id }),
          donations: await Donation.countDocuments({ user: user._id }),
          invitations: 0,
        },
      },
    });
  } catch (error) {
    console.error('Get User By ID Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch user details' });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/admin/users/:id
// @access  Admin
exports.updateUser = async (req, res) => {
  try {
    const allowedFields = [
      'name', 'email', 'phone', 'gender', 'dob', 'city', 'state', 'district',
      'community', 'subCommunity', 'qualification', 'profession', 'company',
      'communityId', 'verificationStatus',
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .select('-password -plainPassword -deviceTokens')
      .populate('communityId', 'name _id');

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    res.status(200).json({ status: 'success', data: formatUser(user) });
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update user' });
  }
};

// @desc    Verify user account
// @route   PATCH /api/v1/admin/users/:id/verify
// @access  Admin
exports.verifyUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          verificationStatus: 'verified',
          accountStatus: 'active',
        },
      },
      { new: true }
    ).select('-password -plainPassword').populate('communityId', 'name _id');

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    res.status(200).json({ status: 'success', data: formatUser(user), message: 'User verified successfully' });
  } catch (error) {
    console.error('Verify User Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to verify user' });
  }
};

// @desc    Suspend user (set to inactive)
// @route   PATCH /api/v1/admin/users/:id/suspend
// @access  Admin
exports.suspendUser = async (req, res) => {
  try {
    const { reason } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          accountStatus: 'inactive',
          suspensionReason: reason || 'Suspended by Admin',
          suspendedBy: req.user._id,
          suspendedAt: new Date(),
        },
      },
      { new: true }
    ).select('-password -plainPassword').populate('communityId', 'name _id');

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    res.status(200).json({ status: 'success', data: formatUser(user), message: 'User suspended successfully' });
  } catch (error) {
    console.error('Suspend User Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to suspend user' });
  }
};

// @desc    Block user
// @route   PATCH /api/v1/admin/users/:id/block
// @access  Admin
exports.blockUser = async (req, res) => {
  try {
    const { reason } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          accountStatus: 'blocked',
          blockReason: reason || 'Blocked by Admin',
          blockedBy: req.user._id,
          blockedAt: new Date(),
        },
      },
      { new: true }
    ).select('-password -plainPassword').populate('communityId', 'name _id');

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    // ── Notification: notify blocked user ────────────────────────────────────────
    try {
      notifyUserBlocked(user._id, reason);
    } catch (notifErr) {
      console.warn('[Notify] blockUser account_blocked failed:', notifErr.message);
    }

    res.status(200).json({ status: 'success', data: formatUser(user), message: 'User blocked successfully' });
  } catch (error) {
    console.error('Block User Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to block user' });
  }
};

// @desc    Activate user account
// @route   PATCH /api/v1/admin/users/:id/activate
// @access  Admin
exports.activateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          accountStatus: 'active',
          $unset: {
            suspensionReason: '',
            blockReason: '',
            suspendedBy: '',
            suspendedAt: '',
            blockedBy: '',
            blockedAt: '',
          },
        },
      },
      { new: true }
    ).select('-password -plainPassword').populate('communityId', 'name _id');

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    // ── Notification: notify activated user ───────────────────────────────────────
    try {
      notifyUserActivated(user._id);
    } catch (notifErr) {
      console.warn('[Notify] activateUser account_activated failed:', notifErr.message);
    }

    res.status(200).json({ status: 'success', data: formatUser(user), message: 'User activated successfully' });
  } catch (error) {
    console.error('Activate User Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to activate user' });
  }
};

// @desc    Soft-delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { accountStatus: 'deleted' } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    res.status(200).json({ status: 'success', message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete user' });
  }
};
