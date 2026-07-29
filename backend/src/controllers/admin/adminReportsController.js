const Donation = require('../../models/Donation');
const Contribution = require('../../models/Contribution');
const DharmashalaBooking = require('../../models/DharmashalaBooking');
const Community = require('../../models/Community');
const User = require('../../models/User');
const MatrimonialProfile = require('../../models/MatrimonialProfile');
const UserSubscription = require('../../models/UserSubscription');
const SubscriptionPlan = require('../../models/SubscriptionPlan');

// Helper to parse date range or default to 12 months
const parseDateRange = (startDateStr, endDateStr) => {
  const endDate = endDateStr ? new Date(endDateStr) : new Date();
  let startDate = startDateStr ? new Date(startDateStr) : new Date();
  
  if (!startDateStr) {
    startDate.setFullYear(startDate.getFullYear() - 1); // 12 months ago
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
  }
  
  return { startDate, endDate };
};

// ─── 1. Revenue Report ────────────────────────────────────────────────────────
exports.getRevenueReport = async (req, res) => {
  try {
    const { startDate: startDateParam, endDate: endDateParam } = req.query;
    const { startDate, endDate } = parseDateRange(startDateParam, endDateParam);

    const dateMatch = { createdAt: { $gte: startDate, $lte: endDate } };

    const [donationAgg, contribAgg, dharmashalaAgg, totalDonation, totalContrib, totalDharmashala] = await Promise.all([
      // Donations Monthly Trend
      Donation.aggregate([
        { $match: { isDeleted: { $ne: true }, ...dateMatch } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            total: { $sum: { $ifNull: ['$raisedAmount', '$amount'] } },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),

      // Contributions Monthly Trend
      Contribution.aggregate([
        { $match: { status: { $ne: 'Failed' }, ...dateMatch } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            total: { $sum: '$paidAmount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),

      // Dharmashala Bookings Monthly Trend
      DharmashalaBooking.aggregate([
        { $match: { status: { $in: ['paid', 'confirmed', 'completed', 'checked_in', 'checked_out'] }, ...dateMatch } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            total: { $sum: '$totalAmount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),

      // Overall Totals
      Donation.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: null, total: { $sum: { $ifNull: ['$raisedAmount', '$amount'] } }, count: { $sum: 1 } } }
      ]),

      Contribution.aggregate([
        { $match: { status: { $ne: 'Failed' } } },
        { $group: { _id: null, total: { $sum: '$paidAmount' }, count: { $sum: 1 } } }
      ]),

      DharmashalaBooking.aggregate([
        { $match: { status: { $in: ['paid', 'confirmed', 'completed', 'checked_in', 'checked_out'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
      ])
    ]);

    const donationTotal = totalDonation[0]?.total || 0;
    const contribTotal = totalContrib[0]?.total || 0;
    const dharmashalaTotal = totalDharmashala[0]?.total || 0;
    const grandTotalRevenue = donationTotal + contribTotal + dharmashalaTotal;

    // Merge monthly trends
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrendMap = new Map();

    const getKey = (year, month) => `${year}-${String(month).padStart(2, '0')}`;

    donationAgg.forEach(item => {
      const key = getKey(item._id.year, item._id.month);
      monthlyTrendMap.set(key, {
        key,
        year: item._id.year,
        month: monthNames[item._id.month - 1],
        donations: item.total || 0,
        contributions: 0,
        dharmashala: 0,
        total: item.total || 0
      });
    });

    contribAgg.forEach(item => {
      const key = getKey(item._id.year, item._id.month);
      const existing = monthlyTrendMap.get(key) || {
        key,
        year: item._id.year,
        month: monthNames[item._id.month - 1],
        donations: 0,
        contributions: 0,
        dharmashala: 0,
        total: 0
      };
      existing.contributions = item.total || 0;
      existing.total += item.total || 0;
      monthlyTrendMap.set(key, existing);
    });

    dharmashalaAgg.forEach(item => {
      const key = getKey(item._id.year, item._id.month);
      const existing = monthlyTrendMap.get(key) || {
        key,
        year: item._id.year,
        month: monthNames[item._id.month - 1],
        donations: 0,
        contributions: 0,
        dharmashala: 0,
        total: 0
      };
      existing.dharmashala = item.total || 0;
      existing.total += item.total || 0;
      monthlyTrendMap.set(key, existing);
    });

    const monthlyTrend = Array.from(monthlyTrendMap.values()).sort((a, b) => a.key.localeCompare(b.key));

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          grandTotalRevenue,
          donationTotal,
          contribTotal,
          dharmashalaTotal,
          donationCount: totalDonation[0]?.count || 0,
          contribCount: totalContrib[0]?.count || 0,
          dharmashalaCount: totalDharmashala[0]?.count || 0
        },
        dateRange: { startDate, endDate },
        monthlyTrend
      }
    });
  } catch (error) {
    console.error('Revenue Report Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ─── 2. Community Report ──────────────────────────────────────────────────────
exports.getCommunityReport = async (req, res) => {
  try {
    const { startDate: startDateParam, endDate: endDateParam } = req.query;
    const { startDate, endDate } = parseDateRange(startDateParam, endDateParam);

    const [
      totalCommunities,
      activeCommunities,
      inactiveCommunities,
      communityGrowthRaw,
      topCommunitiesMemberCount,
      cityDistribution
    ] = await Promise.all([
      Community.countDocuments(),
      Community.countDocuments({ isActive: true }),
      Community.countDocuments({ isActive: false }),

      // Monthly community growth
      Community.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),

      // Member distribution by community (Top 10)
      User.aggregate([
        { $match: { communityId: { $ne: null } } },
        { $group: { _id: '$communityId', memberCount: { $sum: 1 } } },
        { $sort: { memberCount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'communities',
            localField: '_id',
            foreignField: '_id',
            as: 'communityInfo'
          }
        },
        { $unwind: '$communityInfo' },
        {
          $project: {
            id: '$_id',
            name: '$communityInfo.name',
            city: '$communityInfo.city',
            state: '$communityInfo.state',
            memberCount: 1
          }
        }
      ]),

      // Member distribution by City
      User.aggregate([
        { $match: { city: { $ne: null, $ne: '' } } },
        { $group: { _id: '$city', memberCount: { $sum: 1 } } },
        { $sort: { memberCount: -1 } },
        { $limit: 10 }
      ])
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const growthTrend = communityGrowthRaw.map(g => ({
      year: g._id.year,
      month: monthNames[g._id.month - 1],
      newCommunities: g.count
    }));

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          totalCommunities,
          activeCommunities,
          inactiveCommunities,
          activePercentage: totalCommunities > 0 ? Math.round((activeCommunities / totalCommunities) * 100) : 0
        },
        growthTrend,
        topCommunities: topCommunitiesMemberCount,
        cityDistribution: cityDistribution.map(c => ({ city: c._id, count: c.memberCount }))
      }
    });
  } catch (error) {
    console.error('Community Report Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ─── 3. User Report ───────────────────────────────────────────────────────────
exports.getUserReport = async (req, res) => {
  try {
    const { startDate: startDateParam, endDate: endDateParam } = req.query;
    const { startDate, endDate } = parseDateRange(startDateParam, endDateParam);

    const baseUserFilter = { role: { $in: ['user', 'member'] } };

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      blockedUsers,
      verifiedUsers,
      pendingVerificationUsers,
      rejectedVerificationUsers,
      userRegistrationTrendRaw
    ] = await Promise.all([
      User.countDocuments(baseUserFilter),
      User.countDocuments({ ...baseUserFilter, accountStatus: 'active' }),
      User.countDocuments({ ...baseUserFilter, accountStatus: 'inactive' }),
      User.countDocuments({ ...baseUserFilter, accountStatus: 'blocked' }),

      User.countDocuments({ ...baseUserFilter, verificationStatus: 'verified' }),
      User.countDocuments({ ...baseUserFilter, verificationStatus: 'pending' }),
      User.countDocuments({ ...baseUserFilter, verificationStatus: 'rejected' }),

      User.aggregate([
        { $match: { ...baseUserFilter, createdAt: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const registrationTrend = userRegistrationTrendRaw.map(u => ({
      year: u._id.year,
      month: monthNames[u._id.month - 1],
      registrations: u.count
    }));

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          blockedUsers,
          verifiedUsers,
          pendingVerificationUsers,
          rejectedVerificationUsers,
          verificationRate: totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0
        },
        verificationFunnel: {
          verified: verifiedUsers,
          pending: pendingVerificationUsers,
          rejected: rejectedVerificationUsers
        },
        accountStatusBreakdown: {
          active: activeUsers,
          inactive: inactiveUsers,
          blocked: blockedUsers
        },
        registrationTrend
      }
    });
  } catch (error) {
    console.error('User Report Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ─── 4. Matrimonial Report ────────────────────────────────────────────────────
exports.getMatrimonialReport = async (req, res) => {
  try {
    const { startDate: startDateParam, endDate: endDateParam } = req.query;
    const { startDate, endDate } = parseDateRange(startDateParam, endDateParam);

    const [
      totalProfiles,
      verifiedProfiles,
      pendingProfiles,
      rejectedProfiles,
      singleProfiles,
      marriedProfiles,
      creationTrendRaw,
      genderBreakdownRaw
    ] = await Promise.all([
      MatrimonialProfile.countDocuments({ status: { $ne: 'deleted' } }),
      MatrimonialProfile.countDocuments({ verificationStatus: 'verified', status: { $ne: 'deleted' } }),
      MatrimonialProfile.countDocuments({ verificationStatus: 'pending', status: { $ne: 'deleted' } }),
      MatrimonialProfile.countDocuments({ verificationStatus: 'rejected', status: { $ne: 'deleted' } }),

      MatrimonialProfile.countDocuments({ status: { $in: ['active', 'pending'] } }),
      MatrimonialProfile.countDocuments({ status: 'married' }),

      MatrimonialProfile.aggregate([
        { $match: { status: { $ne: 'deleted' }, createdAt: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),

      MatrimonialProfile.aggregate([
        { $match: { status: { $ne: 'deleted' } } },
        { $group: { _id: '$gender', count: { $sum: 1 } } }
      ])
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const creationTrend = creationTrendRaw.map(m => ({
      year: m._id.year,
      month: monthNames[m._id.month - 1],
      profilesCreated: m.count
    }));

    const genderBreakdown = {};
    genderBreakdownRaw.forEach(g => {
      if (g._id) genderBreakdown[g._id.toLowerCase()] = g.count;
    });

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          totalProfiles,
          verifiedProfiles,
          pendingProfiles,
          rejectedProfiles,
          singleProfiles,
          marriedProfiles,
          marriageConversionRate: totalProfiles > 0 ? Math.round((marriedProfiles / totalProfiles) * 100) : 0
        },
        verificationBreakdown: {
          verified: verifiedProfiles,
          pending: pendingProfiles,
          rejected: rejectedProfiles
        },
        statusBreakdown: {
          single: singleProfiles,
          married: marriedProfiles
        },
        genderBreakdown,
        creationTrend
      }
    });
  } catch (error) {
    console.error('Matrimonial Report Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ─── 5. Subscription Report ───────────────────────────────────────────────────
exports.getSubscriptionReport = async (req, res) => {
  try {
    const { startDate: startDateParam, endDate: endDateParam } = req.query;
    const { startDate, endDate } = parseDateRange(startDateParam, endDateParam);

    const [
      totalSubscriptions,
      activeSubscriptions,
      expiredSubscriptions,
      cancelledSubscriptions,
      graceSubscriptions,
      revenueByPlanRaw,
      monthlyRevenueTrendRaw,
      totalSubscriptionRevenueAgg
    ] = await Promise.all([
      UserSubscription.countDocuments(),
      UserSubscription.countDocuments({ status: 'active' }),
      UserSubscription.countDocuments({ status: 'expired' }),
      UserSubscription.countDocuments({ status: 'cancelled' }),
      UserSubscription.countDocuments({ status: 'grace' }),

      // Revenue breakdown by Subscription Plan Name
      UserSubscription.aggregate([
        { $match: { paymentStatus: 'success' } },
        {
          $group: {
            _id: '$planName',
            totalRevenue: { $sum: '$pricePaid' },
            count: { $sum: 1 }
          }
        },
        { $sort: { totalRevenue: -1 } }
      ]),

      // Monthly subscription revenue trend
      UserSubscription.aggregate([
        { $match: { paymentStatus: 'success', createdAt: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            revenue: { $sum: '$pricePaid' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),

      // Total Subscription Revenue
      UserSubscription.aggregate([
        { $match: { paymentStatus: 'success' } },
        { $group: { _id: null, total: { $sum: '$pricePaid' } } }
      ])
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenueTrend = monthlyRevenueTrendRaw.map(s => ({
      year: s._id.year,
      month: monthNames[s._id.month - 1],
      revenue: s.revenue,
      subscriptions: s.count
    }));

    const totalRevenue = totalSubscriptionRevenueAgg[0]?.total || 0;
    const churnRate = totalSubscriptions > 0 ? Math.round((cancelledSubscriptions / totalSubscriptions) * 100) : 0;
    const activeRate = totalSubscriptions > 0 ? Math.round((activeSubscriptions / totalSubscriptions) * 100) : 0;

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          totalSubscriptions,
          activeSubscriptions,
          expiredSubscriptions,
          cancelledSubscriptions,
          graceSubscriptions,
          totalRevenue,
          activeRate,
          churnRate
        },
        planBreakdown: revenueByPlanRaw.map(p => ({
          planName: p._id || 'Standard',
          revenue: p.totalRevenue,
          subscriptionsCount: p.count
        })),
        monthlyRevenueTrend
      }
    });
  } catch (error) {
    console.error('Subscription Report Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
