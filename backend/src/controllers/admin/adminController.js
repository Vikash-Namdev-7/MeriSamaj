const User = require('../../models/User');
const Community = require('../../models/Community');
const Campaign = require('../../models/Campaign');
const Donation = require('../../models/Donation');
const Expense = require('../../models/Expense');
const Post = require('../../models/Post');
const Voting = require('../../models/Voting');

exports.getDashboardOverview = async (req, res) => {
  try {
    // 1. Members
    const totalMembers = await User.countDocuments({ role: 'user' });
    const verifiedMembers = await User.countDocuments({ role: 'user', verificationStatus: 'verified' });
    
    // 2. Communities
    let totalCommunities = await Community.countDocuments();
    let activeCommunities = await Community.countDocuments({ isActive: true });
    
    if (totalCommunities === 0) {
      const distinctComms = await User.distinct('community');
      totalCommunities = distinctComms.filter(c => c && c.trim()).length;
      activeCommunities = totalCommunities;
    }
    
    // 3. Cities (Distinct cities among users)
    const cities = await User.distinct('city');
    const totalCities = cities.filter(c => c && c.trim()).length;
    
    // 4. Community Heads
    const totalHeads = await User.countDocuments({ role: { $in: ['head', 'admin'] } });
    
    // 5. Matrimonial Statistics
    const singleUsers = await User.countDocuments({ maritalStatus: { $regex: /single|unmarried|divorced|widow/i } });
    const marriedUsers = await User.countDocuments({ maritalStatus: { $regex: /married/i } });
    const matrimonialProfiles = await User.find({ maritalStatus: { $exists: true, $ne: '' } }).select('maritalStatus');
    
    // 6. Event/Campaign Statistics
    const totalCampaigns = await Campaign.countDocuments();
    const activeCampaigns = await Campaign.countDocuments({ status: { $in: ['Active', 'Published'] } });
    const completedCampaigns = await Campaign.countDocuments({ status: 'Completed' });
    
    // 7. Professional Directory Statistics
    const professionals = await User.find({ profession: { $exists: true, $ne: '' } }).select('profession');
    const totalProfessionals = professionals.length;
    
    // 8. Engagement Overview
    const totalPosts = await Post.countDocuments();
    const totalElections = await Voting.countDocuments();
    
    // 9. Revenue Overview
    const donationAgg = await Donation.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$raisedAmount', '$amount'] } } } }
    ]);
    const totalRevenue = donationAgg.length > 0 ? donationAgg[0].total : 0;
    
    const expenseAgg = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalExpenses = expenseAgg.length > 0 ? expenseAgg[0].total : 0;

    res.status(200).json({
      status: 'success',
      data: {
        members: {
          total: totalMembers,
          verified: verifiedMembers
        },
        communities: {
          total: totalCommunities,
          active: activeCommunities
        },
        cities: {
          total: totalCities
        },
        heads: {
          active: totalHeads
        },
        matrimonial: {
          total: matrimonialProfiles.length,
          single: singleUsers,
          married: marriedUsers
        },
        events: {
          total: totalCampaigns,
          active: activeCampaigns,
          completed: completedCampaigns
        },
        professionals: {
          total: totalProfessionals
        },
        engagement: {
          posts: totalPosts,
          elections: totalElections
        },
        revenue: {
          total: totalRevenue,
          expenses: totalExpenses,
          available: totalRevenue - totalExpenses
        }
      }
    });
  } catch (error) {
    console.error('Admin Dashboard Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch dashboard overview' });
  }
};
