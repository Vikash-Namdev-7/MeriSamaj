import { donationService } from './donationService';
import { campaignService } from './campaignService';

class FinancialAnalyticsService {
  async getDashboardAnalytics() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const txnsRes = await donationService.getTransactions({ sort: 'newest' });
    const campaignsRes = await campaignService.getCampaigns();
    
    const txns = txnsRes.data;
    const campaigns = campaignsRes.data;
    
    // Approved transactions
    const approvedTxns = txns.filter(t => t.paymentStatus === 'Approved');
    const pendingTxns = txns.filter(t => t.paymentStatus === 'Pending Verification');
    
    // KPIs Calculations
    const totalCollection = approvedTxns.reduce((sum, t) => sum + t.amount, 0);
    const totalDonationsCount = approvedTxns.length;
    const pendingCollection = pendingTxns.reduce((sum, t) => sum + t.amount, 0);
    
    const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
    const completedCampaigns = campaigns.filter(c => c.status === 'Completed').length;
    
    // Calculate unique donors
    const uniqueDonorsSet = new Set(approvedTxns.map(t => t.memberId).filter(Boolean));
    const totalDonors = uniqueDonorsSet.size || 8; // fallback to minimum seed count if set is empty
    
    const averageDonation = totalDonationsCount > 0 ? Math.round(totalCollection / totalDonationsCount) : 0;
    
    // Group approved donations by community
    const communityMap = {};
    approvedTxns.forEach(t => {
      communityMap[t.community] = (communityMap[t.community] || 0) + t.amount;
    });
    
    let highestContributingCommunity = 'None';
    let maxCommunityContribution = 0;
    Object.entries(communityMap).forEach(([comm, amt]) => {
      if (amt > maxCommunityContribution) {
        maxCommunityContribution = amt;
        highestContributingCommunity = comm;
      }
    });
    if (highestContributingCommunity === 'None' && campaigns.length > 0) {
      highestContributingCommunity = campaigns[0].community;
    }
    
    // Group monthly collections (Last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = {};
    
    // Initialize last 6 months with 0
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substr(-2)}`;
      monthlyMap[label] = 0;
    }
    
    approvedTxns.forEach(t => {
      const d = new Date(t.date);
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substr(-2)}`;
      if (monthlyMap[label] !== undefined) {
        monthlyMap[label] += t.amount;
      }
    });

    const monthlyCollectionTrend = {
      labels: Object.keys(monthlyMap),
      data: Object.values(monthlyMap)
    };

    // Annual Collection (Yearly Collection)
    const currentYear = new Date().getFullYear();
    const annualCollection = approvedTxns
      .filter(t => new Date(t.date).getFullYear() === currentYear)
      .reduce((sum, t) => sum + t.amount, 0);

    const yearlyMap = {
      [currentYear - 2]: 1500000,
      [currentYear - 1]: 4200000,
      [currentYear]: totalCollection
    };

    // Campaign Performance (Target vs Collection)
    const campaignPerformance = campaigns.map(c => ({
      name: c.name.split(' ').slice(0, 2).join(' '), // truncate to fits well in SVGs
      target: c.targetAmount,
      collected: c.collectedAmount,
      percentage: c.targetAmount > 0 ? Math.round((c.collectedAmount / c.targetAmount) * 100) : 0
    })).slice(0, 5);

    // Top Donors (Unique members by approved sum)
    const donorLeaderboardMap = {};
    approvedTxns.forEach(t => {
      if (t.memberName) {
        if (!donorLeaderboardMap[t.memberName]) {
          donorLeaderboardMap[t.memberName] = {
            name: t.memberName,
            initials: t.memberInitials || 'DN',
            amount: 0,
            community: t.community
          };
        }
        donorLeaderboardMap[t.memberName].amount += t.amount;
      }
    });
    
    const topDonors = Object.values(donorLeaderboardMap)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Contribution Frequency Distribution
    const ranges = {
      'Under ₹1K': 0,
      '₹1K - ₹5K': 0,
      '₹5K - ₹25K': 0,
      '₹25K - ₹1L': 0,
      'Over ₹1L': 0
    };
    approvedTxns.forEach(t => {
      if (t.amount < 1000) ranges['Under ₹1K']++;
      else if (t.amount <= 5000) ranges['₹1K - ₹5K']++;
      else if (t.amount <= 25000) ranges['₹5K - ₹25K']++;
      else if (t.amount <= 100000) ranges['₹25K - ₹1L']++;
      else ranges['Over ₹1L']++;
    });

    const contributionFrequency = Object.entries(ranges).map(([range, count]) => ({
      name: range,
      value: count
    }));

    // Community-wise collections data list
    const communityWiseCollection = Object.entries(communityMap).map(([name, value]) => ({
      name,
      value
    }));

    // Community Comparison Matrix
    // Seed comparison with other mock calculations
    const communityComparison = [
      {
        community: 'Agrawal Samaj',
        collectionAmount: communityMap['Agrawal Samaj'] || 10900000,
        donationGrowth: 28.5,
        campaignSuccessRate: 85,
        averageContribution: 12500,
        pendingPayments: 25000,
        communityParticipation: 78
      },
      {
        community: 'Brahmin Samaj',
        collectionAmount: communityMap['Brahmin Samaj'] || 1115500,
        donationGrowth: 15.2,
        campaignSuccessRate: 90,
        averageContribution: 8400,
        pendingPayments: 0,
        communityParticipation: 62
      },
      {
        community: 'Patidar Samaj',
        collectionAmount: communityMap['Patidar Samaj'] || 145000,
        donationGrowth: 8.9,
        campaignSuccessRate: 100,
        averageContribution: 5100,
        pendingPayments: 0,
        communityParticipation: 45
      },
      {
        community: 'Rajput Samaj',
        collectionAmount: communityMap['Rajput Samaj'] || 210000,
        donationGrowth: -4.5,
        campaignSuccessRate: 30,
        averageContribution: 11000,
        pendingPayments: 15000,
        communityParticipation: 35
      },
      {
        community: 'Maheshwari Samaj',
        collectionAmount: communityMap['Maheshwari Samaj'] || 150000,
        donationGrowth: 12.0,
        campaignSuccessRate: 50,
        averageContribution: 7500,
        pendingPayments: 0,
        communityParticipation: 40
      }
    ];

    return {
      stats: {
        totalDonations: totalCollection, // Sum of approved amounts
        totalCollection: totalCollection, // Sum of approved amounts
        pendingContributions: pendingCollection, // Sum of pending verification
        activeCampaigns,
        completedCampaigns,
        monthlyCollection: Object.values(monthlyMap).slice(-1)[0] || 0, // current month collection
        annualCollection,
        highestContributingCommunity,
        totalDonors,
        averageDonation
      },
      monthlyCollectionTrend,
      yearlyCollection: {
        labels: Object.keys(yearlyMap),
        data: Object.values(yearlyMap)
      },
      communityWiseCollection,
      campaignPerformance,
      topDonors,
      contributionFrequency,
      communityComparison
    };
  }
}

export const financialAnalyticsService = new FinancialAnalyticsService();
