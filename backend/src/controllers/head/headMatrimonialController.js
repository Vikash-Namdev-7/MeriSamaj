/**
 * headMatrimonialController.js
 * Head panel: community-specific matrimonial management.
 */
const MatrimonialProfile = require('../../models/MatrimonialProfile');
const ProfileReport      = require('../../models/ProfileReport');
const InterestRequest    = require('../../models/InterestRequest');
const UserSubscription   = require('../../models/UserSubscription');
const { createNotification } = require('../../services/notificationService');

// ─── Community Dashboard ──────────────────────────────────────────────────────
exports.getCommunityStats = async (req, res) => {
  try {
    const communityId = req.communityId;
    if (!communityId) return res.status(400).json({ status: 'error', message: 'Community ID required.' });

    // Get all user IDs in this community
    const User = require('../../models/User');
    const communityUserIds = await User.find({ communityId }).distinct('_id');

    const [totalProfiles, activeProfiles, pendingVerification, recentInterests] = await Promise.all([
      MatrimonialProfile.countDocuments({ communityId, isDeleted: false }),
      MatrimonialProfile.countDocuments({ communityId, isDeleted: false, status: 'active' }),
      MatrimonialProfile.countDocuments({ communityId, isDeleted: false, verificationStatus: 'pending', status: 'active' }),
      InterestRequest.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        $or: [
          { senderId: { $in: communityUserIds } },
          { receiverId: { $in: communityUserIds } }
        ]
      })
    ]);


    res.json({ status: 'success', data: { totalProfiles, activeProfiles, pendingVerification, recentInterests } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── List Community Profiles ──────────────────────────────────────────────────
exports.listCommunityProfiles = async (req, res) => {
  try {
    const { page = 1, limit = 20, verificationStatus, status } = req.query;
    const query = { communityId: req.communityId, isDeleted: false };
    if (verificationStatus) query.verificationStatus = verificationStatus;
    if (status) query.status = status;

    const total = await MatrimonialProfile.countDocuments(query);
    const profiles = await MatrimonialProfile.find(query)
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean({ virtuals: true });

    res.json({ status: 'success', data: { profiles, total, page: Number(page) } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Verify Profile (Community-scoped) ───────────────────────────────────────
exports.verifyProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Status must be verified or rejected.' });
    }

    const profile = await MatrimonialProfile.findOne({ _id: id, communityId: req.communityId });
    if (!profile) return res.status(404).json({ status: 'error', message: 'Profile not found in your community.' });

    profile.verificationStatus = status;
    if (status === 'verified') profile.status = 'active';
    profile.verifiedBy = req.user._id;
    profile.verifiedAt = new Date();
    await profile.save();

    await createNotification({
      userId:   profile.userId,
      module:   'matrimonial',
      type:     `matrimonial_profile_${status}`,
      title:    status === 'verified' ? 'Profile Verified! ✅' : 'Verification Rejected',
      message:  status === 'verified'
        ? 'Your matrimonial profile has been verified by your community head.'
        : `Your profile verification was rejected. ${adminNote || ''}`,
      icon:     status === 'verified' ? '✅' : '❌',
      priority: 'high',
      actionUrl:'/member/matrimonial/profile'
    });

    res.json({ status: 'success', message: `Profile ${status}.` });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Community Reports ────────────────────────────────────────────────────────
exports.listCommunityReports = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;

    // Get community user IDs first
    const User = require('../../models/User');
    const communityUsers = await User.find({ communityId: req.communityId }).distinct('_id');
    query.reportedUserId = { $in: communityUsers };

    const total = await ProfileReport.countDocuments(query);
    const reports = await ProfileReport.find(query)
      .populate('reporterId', 'name')
      .populate('reportedUserId', 'name')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ status: 'success', data: { reports, total, page: Number(page) } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Update Profile Status (Community-scoped) ─────────────────────────────────
exports.updateProfileStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active' | 'hidden' | 'suspended'

    const allowedStatuses = ['active', 'hidden', 'suspended'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ status: 'error', message: `Status must be one of: ${allowedStatuses.join(', ')}` });
    }

    const profile = await MatrimonialProfile.findOne({ _id: id, communityId: req.communityId });
    if (!profile) return res.status(404).json({ status: 'error', message: 'Profile not found in your community.' });

    profile.status = status;
    await profile.save();

    res.json({ status: 'success', message: `Profile status updated to ${status}.` });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Resolve Report (Community-scoped) ───────────────────────────────────────
exports.resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, adminNotes } = req.body; // 'actioned' | 'dismissed'

    const User = require('../../models/User');
    const communityUsers = await User.find({ communityId: req.communityId }).distinct('_id');

    const report = await ProfileReport.findOne({ _id: id, reportedUserId: { $in: communityUsers } });
    if (!report) return res.status(404).json({ status: 'error', message: 'Report not found in your community.' });

    const allowedActions = ['actioned', 'dismissed'];
    if (!allowedActions.includes(action)) {
      return res.status(400).json({ status: 'error', message: 'Action must be actioned or dismissed.' });
    }

    report.status     = action;
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();
    if (adminNotes) report.adminNotes = adminNotes;
    await report.save();

    res.json({ status: 'success', message: `Report ${action} successfully.` });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
