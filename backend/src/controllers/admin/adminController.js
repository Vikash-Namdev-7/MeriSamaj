const User = require('../../models/User');
const Community = require('../../models/Community');
const MatrimonialProfile = require('../../models/MatrimonialProfile');
const Event = require('../../models/Event');
const Professional = require('../../models/Professional');
const Obituary = require('../../models/Obituary');
const Post = require('../../models/Post');
const PostLike = require('../../models/PostLike');
const Comment = require('../../models/Comment');
const EventResponse = require('../../models/EventResponse');
const Voting = require('../../models/Voting');
const Donation = require('../../models/Donation');
const Contribution = require('../../models/Contribution');
const DharmashalaBooking = require('../../models/DharmashalaBooking');
const Expense = require('../../models/Expense');

/**
 * @desc    Get consolidated platform-wide analytics for Admin Dashboard Overview
 * @route   GET /api/v1/admin/dashboard/overview
 * @access  Private (Admin / Master Admin)
 */
exports.getDashboardOverview = async (req, res) => {
  try {
    const [
      // 1. Members
      totalMembers,
      verifiedMembers,
      activeMembers,
      pendingMembers,
      inactiveMembers,

      // 2. Communities
      totalCommunities,
      activeCommunities,

      // 3. Cities
      distinctCities,

      // 4. Community Heads
      activeHeads,

      // 5. Matrimonial Statistics (Real MatrimonialProfile collection)
      totalMatrimonialProfiles,
      verifiedMatrimonialProfiles,
      marriedMatrimonialProfiles,

      // 6. Event Statistics (Real Event collection)
      totalEvents,
      activeEvents,
      completedEvents,

      // 7. Professional Directory Statistics (Real Professional collection)
      totalProfessionals,
      approvedProfessionals,

      // 8. Community Engagement Overview
      totalPosts,
      totalPostLikes,
      totalComments,
      totalEventRSVPs,
      totalElections,

      // 9. Obituaries Metric (Real Obituary collection)
      totalObituaries,

      // 10. Financial Aggregates (Donations, Contributions, Dharmashala Bookings, Expenses)
      donationRevenueAgg,
      contributionRevenueAgg,
      dharmashalaRevenueAgg,
      expenseAgg
    ] = await Promise.all([
      // 1. Members Breakdown
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', verificationStatus: 'verified' }),
      User.countDocuments({ role: 'user', accountStatus: 'active' }),
      User.countDocuments({ role: 'user', accountStatus: { $in: ['pending verification', 'inactive'] } }),
      User.countDocuments({ role: 'user', accountStatus: { $in: ['blocked', 'deleted'] } }),

      // 2. Communities
      Community.countDocuments(),
      Community.countDocuments({ isActive: true }),

      // 3. Cities
      User.distinct('city'),

      // 4. Active Heads (roles 'head' and 'sub_head' only, excluding platform 'admin')
      User.countDocuments({ role: { $in: ['head', 'sub_head'] }, accountStatus: 'active' }),

      // 5. Matrimonial Statistics (Real MatrimonialProfile collection)
      MatrimonialProfile.countDocuments({ status: { $ne: 'deleted' } }),
      MatrimonialProfile.countDocuments({ verificationStatus: 'verified', status: { $ne: 'deleted' } }),
      MatrimonialProfile.countDocuments({ status: 'married' }),

      // 6. Event Statistics (Real Event collection)
      Event.countDocuments({ status: { $ne: 'Deleted' }, isDeleted: { $ne: true } }),
      Event.countDocuments({ status: { $in: ['Published', 'Upcoming', 'Ongoing'] }, isDeleted: { $ne: true } }),
      Event.countDocuments({ status: 'Completed', isDeleted: { $ne: true } }),

      // 7. Professional Directory Statistics (Real Professional collection)
      Professional.countDocuments(),
      Professional.countDocuments({ status: 'Approved' }),

      // 8. Engagement Overview
      Post.countDocuments({ isDeleted: { $ne: true } }),
      PostLike.countDocuments(),
      Comment.countDocuments(),
      EventResponse.countDocuments({ $or: [{ isGoing: true }, { registered: true }, { response: 'Going' }] }),
      Voting.countDocuments(),

      // 9. Obituaries Metric (Real Obituary collection)
      Obituary.countDocuments({ isDeleted: { $ne: true } }),

      // 10. Financial Aggregates
      Donation.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: null, total: { $sum: { $ifNull: ['$raisedAmount', '$amount'] } } } }
      ]),
      Contribution.aggregate([
        { $match: { status: { $ne: 'Failed' } } },
        { $group: { _id: null, total: { $sum: '$paidAmount' } } }
      ]),
      DharmashalaBooking.aggregate([
        { $match: { status: { $in: ['paid', 'confirmed', 'completed', 'checked_in', 'checked_out'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Expense.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const donationRev = donationRevenueAgg.length > 0 ? donationRevenueAgg[0].total : 0;
    const contribRev = contributionRevenueAgg.length > 0 ? contributionRevenueAgg[0].total : 0;
    const dharmashalaRev = dharmashalaRevenueAgg.length > 0 ? dharmashalaRevenueAgg[0].total : 0;
    const totalRevenue = donationRev + contribRev + dharmashalaRev;

    const totalExpenses = expenseAgg.length > 0 ? expenseAgg[0].total : 0;
    const availableBalance = totalRevenue - totalExpenses;

    const totalCitiesCount = distinctCities.filter(c => c && c.trim()).length;
    const singleMatrimonialProfiles = Math.max(0, totalMatrimonialProfiles - marriedMatrimonialProfiles);

    res.status(200).json({
      status: 'success',
      data: {
        members: {
          total: totalMembers,
          verified: verifiedMembers,
          active: activeMembers,
          pending: pendingMembers,
          inactive: inactiveMembers
        },
        communities: {
          total: totalCommunities,
          active: activeCommunities
        },
        cities: {
          total: totalCitiesCount
        },
        heads: {
          active: activeHeads
        },
        matrimonial: {
          total: totalMatrimonialProfiles,
          verified: verifiedMatrimonialProfiles,
          single: singleMatrimonialProfiles,
          married: marriedMatrimonialProfiles
        },
        events: {
          total: totalEvents,
          active: activeEvents,
          completed: completedEvents
        },
        professionals: {
          total: totalProfessionals,
          approved: approvedProfessionals
        },
        engagement: {
          posts: totalPosts,
          likes: totalPostLikes,
          comments: totalComments,
          rsvps: totalEventRSVPs,
          elections: totalElections
        },
        obituaries: {
          total: totalObituaries
        },
        revenue: {
          total: totalRevenue,
          donations: donationRev,
          contributions: contribRev,
          dharmashala: dharmashalaRev,
          expenses: totalExpenses,
          available: availableBalance
        }
      }
    });
  } catch (error) {
    console.error('Admin Dashboard Overview Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch dashboard overview' });
  }
};
