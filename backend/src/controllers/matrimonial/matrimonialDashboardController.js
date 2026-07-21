/**
 * matrimonialDashboardController.js
 * Returns all dashboard stats in a single API call + recommendation engine.
 */
const MatrimonialProfile  = require('../../models/MatrimonialProfile');
const InterestRequest     = require('../../models/InterestRequest');
const Shortlist           = require('../../models/Shortlist');
const ProfileVisitor      = require('../../models/ProfileVisitor');
const Conversation        = require('../../models/Conversation');
const MatrimonialSettings = require('../../models/MatrimonialSettings');
const UserSubscription    = require('../../models/UserSubscription');
const UserBlock           = require('../../models/UserBlock');
const { calculateMatchPercentage }          = require('../../services/matchService');
const { buildRestrictedProfile, buildFullProfile } = require('../../middleware/matrimonialPrivacy');

// ─── Dashboard ────────────────────────────────────────────────────────────────
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const now    = new Date();

    // Run all in parallel for performance
    const [
      myProfile,
      subscription,
      interestStats,
      shortlistCount,
      recentChatsCount,
      myProfile_visitors
    ] = await Promise.all([
      MatrimonialProfile.findOne({ userId, isDeleted: false }),
      UserSubscription.findOne({ userId, status: { $in: ['active', 'grace'] }, endDate: { $gte: now } }).sort({ endDate: -1 }),
      InterestRequest.aggregate([
        { $match: { $or: [{ senderId: userId }, { receiverId: userId }] } },
        {
          $group: {
            _id: null,
            sent:     { $sum: { $cond: [{ $eq: ['$senderId', userId] }, 1, 0] } },
            received: { $sum: { $cond: [{ $eq: ['$receiverId', userId] }, 1, 0] } },
            accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
            pending:  { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
          }
        }
      ]),
      Shortlist.countDocuments({ userId }),
      Conversation.countDocuments({ participants: userId, type: 'matrimonial', isActive: true, isDeleted: false }),
      MatrimonialProfile.findOne({ userId, isDeleted: false }).select('totalProfileViews monthlyProfileViews weeklyProfileViews')
    ]);

    const interests = interestStats[0] || { sent: 0, received: 0, accepted: 0, pending: 0, rejected: 0 };

    // ─── Build Response ────────────────────────────────────────────────────────
    const dashboard = {
      profileCompletion: myProfile?.profileCompletion || { percentage: 0, completedSections: [] },
      profileStatus:     myProfile?.status || null,
      maritalLifecycle:  myProfile?.maritalLifecycle || 'single',
      subscription: {
        isPremium:  !!subscription,
        plan:       subscription?.planName || 'Free',
        expiresOn:  subscription?.endDate || null,
        status:     subscription?.status  || 'free',
        daysLeft:   subscription ? Math.ceil((subscription.endDate - now) / (1000 * 60 * 60 * 24)) : 0
      },
      interests: {
        sent:     interests.sent,
        received: interests.received,
        accepted: interests.accepted,
        pending:  interests.pending,
        rejected: interests.rejected
      },
      visitors: {
        total:   myProfile_visitors?.totalProfileViews  || 0,
        monthly: myProfile_visitors?.monthlyProfileViews || 0,
        weekly:  myProfile_visitors?.weeklyProfileViews  || 0
      },
      shortlist:    shortlistCount,
      recentChats:  recentChatsCount
    };

    // ─── Recommendations (categorized) ────────────────────────────────────────
    const recommendations = await getRecommendations(userId, myProfile, subscription);
    dashboard.recommendations = recommendations;

    res.json({ status: 'success', data: { dashboard } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Recommendation Engine ────────────────────────────────────────────────────
const getRecommendations = async (userId, myProfile, subscription) => {
  const settings = await MatrimonialSettings.findOne().lean();
  const limit    = settings?.maxRecommendationsPerCategory || 10;

  // ─── Completion threshold (env-driven) ───────────────────────────────────
  const completionRequired = parseInt(process.env.MATRIMONIAL_MIN_COMPLETION) ||
    (settings?.profileCompletionRequired ?? 50);

  // ─── Block filter ─────────────────────────────────────────────────────────
  const blockedByMe  = await UserBlock.find({ userId }).distinct('blockedUserId');
  const whoBlockedMe = await UserBlock.find({ blockedUserId: userId }).distinct('userId');
  const excludeUsers = [...blockedByMe, ...whoBlockedMe];

  const userExclusion = excludeUsers.length > 0
    ? { $ne: userId, $nin: excludeUsers }
    : { $ne: userId };

  const baseQuery = {
    userId:   userExclusion,
    status:   'active',
    isDeleted: false,
    'profileCompletion.percentage': { $gte: completionRequired }
  };

  // Apply opposite gender filter if available
  if (myProfile?.personal?.gender) {
    const oppositeGender = myProfile.personal.gender === 'male' ? 'female' : 'male';
    baseQuery['personal.gender'] = oppositeGender;
  }

  const [recommendedMatches, newMembers, recentlyActive, premiumMembers, nearYou] = await Promise.all([
    // Recommended Matches (by community/preferences)
    MatrimonialProfile.find({
      ...baseQuery,
      'personal.community': myProfile?.personal?.community || { $exists: true }
    }).sort({ createdAt: -1 }).limit(limit).lean({ virtuals: true }),

    // New Members
    MatrimonialProfile.find(baseQuery).sort({ createdAt: -1 }).limit(limit).lean({ virtuals: true }),

    // Recently Active
    MatrimonialProfile.find(baseQuery).sort({ lastActiveAt: -1 }).limit(limit).lean({ virtuals: true }),

    // Verified Members first
    MatrimonialProfile.find({ ...baseQuery, verificationStatus: 'verified' })
      .sort({ createdAt: -1 }).limit(limit).lean({ virtuals: true }),

    // Near You (same city or state)
    MatrimonialProfile.find({
      ...baseQuery,
      $or: [
        { 'location.city':  myProfile?.location?.city  || '__none__' },
        { 'location.state': myProfile?.location?.state || '__none__' }
      ]
    }).limit(limit).lean({ virtuals: true })
  ]);

  // Enrich recommended matches with match %
  const enriched = await Promise.all(
    recommendedMatches.map(async (profile) => {
      const result = myProfile
        ? await calculateMatchPercentage(myProfile, profile)
        : { matchPercentage: 0, matchedCriteria: [] };
      return { ...buildRestrictedProfile(profile), ...result };
    })
  );

  return {
    recommendedMatches: enriched,
    newMembers:    newMembers.map(buildRestrictedProfile),
    recentlyActive:recentlyActive.map(buildRestrictedProfile),
    premiumMembers:premiumMembers.map(buildRestrictedProfile),
    nearYou:       nearYou.map(buildRestrictedProfile)
  };
};
