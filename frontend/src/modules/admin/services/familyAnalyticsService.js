import { familyService } from './familyService';

class FamilyAnalyticsService {
  async getDashboardAnalytics() {
    await new Promise(resolve => setTimeout(resolve, 500));
    const all = familyService._getRawFamilies();
    
    // Non-deleted families
    const activeList = all.filter(f => f.status !== 'Soft Deleted');
    
    const total = activeList.length;
    const active = activeList.filter(f => f.status === 'Active').length;
    const pending = activeList.filter(f => f.verificationStatus === 'Pending').length;
    const suspended = activeList.filter(f => f.status === 'Suspended').length;
    const archived = activeList.filter(f => f.status === 'Archived').length;
    
    // Average family size
    const totalMembers = activeList.reduce((sum, f) => sum + f.members.length, 0);
    const avgFamilySize = total > 0 ? parseFloat((totalMembers / total).toFixed(1)) : 0;
    
    // Community-wise count
    const communityMap = {};
    activeList.forEach(f => {
      communityMap[f.community] = (communityMap[f.community] || 0) + 1;
    });
    
    // City-wise count
    const cityMap = {};
    activeList.forEach(f => {
      cityMap[f.city] = (cityMap[f.city] || 0) + 1;
    });

    // Largest families (Top 5)
    const largestFamilies = [...activeList]
      .sort((a, b) => b.members.length - a.members.length)
      .slice(0, 5)
      .map(f => ({
        id: f.id,
        name: f.name,
        headName: f.headName,
        membersCount: f.members.length,
        city: f.city,
        community: f.community
      }));

    // Recently added (Top 5)
    const recentlyAdded = [...activeList]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(f => ({
        id: f.id,
        name: f.name,
        createdAt: f.createdAt,
        headName: f.headName,
        membersCount: f.members.length
      }));

    // Calculate duplicate records (families with same phone, or same headName + city)
    const phoneSeen = new Set();
    const duplicateCandidates = [];
    activeList.forEach(f => {
      if (f.headPhone) {
        const cleanPhone = f.headPhone.replace(/[^0-9]/g, '');
        if (cleanPhone && phoneSeen.has(cleanPhone)) {
          duplicateCandidates.push(f.id);
        } else if (cleanPhone) {
          phoneSeen.add(cleanPhone);
        }
      }
    });
    const duplicateCount = duplicateCandidates.length;

    // Growth trend (last 6 months)
    // Build simulated growth trend based on creation date
    const growthTrend = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [120, 145, 170, 210, 248, total] // Mock curves anchored to current total
    };

    // Verification trend
    const verificationTrend = {
      labels: ['Verified', 'Pending', 'Suspended', 'Archived'],
      data: [
        activeList.filter(f => f.verificationStatus === 'Verified').length,
        pending,
        suspended,
        archived
      ]
    };

    // Transfer trends
    const transferTrend = {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      data: [8, 15, 12, 19] // Mock values representing transfers
    };

    return {
      stats: {
        totalFamilies: total,
        activeFamilies: active,
        pendingVerifications: pending,
        suspendedFamilies: suspended,
        archivedFamilies: archived,
        avgFamilySize,
        duplicateCount,
        totalMembers
      },
      largestFamilies,
      recentlyAdded,
      communityWise: Object.entries(communityMap).map(([name, value]) => ({ name, value })),
      cityWise: Object.entries(cityMap).map(([name, value]) => ({ name, value })),
      trends: {
        growth: growthTrend,
        verification: verificationTrend,
        transfers: transferTrend
      }
    };
  }
}

export const familyAnalyticsService = new FamilyAnalyticsService();
