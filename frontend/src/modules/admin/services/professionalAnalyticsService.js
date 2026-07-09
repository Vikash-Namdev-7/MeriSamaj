import { professionalDirectoryService } from './professionalDirectoryService';
import { professionalComplianceService } from './professionalComplianceService';

class ProfessionalAnalyticsService {
  // Method to calculate business health score dynamically (0-100)
  calculateHealthScore(prof) {
    let score = 70; // baseline

    // Profile Completion check
    let completionPoints = 0;
    if (prof.ownerName) completionPoints += 2;
    if (prof.ownerPhoto) completionPoints += 2;
    if (prof.ownerEmail) completionPoints += 2;
    if (prof.phone) completionPoints += 2;
    if (prof.description) completionPoints += 2;
    if (prof.website) completionPoints += 2;
    if (prof.address) completionPoints += 2;
    if (prof.pinCode) completionPoints += 2;
    if (prof.gstNumber) completionPoints += 2;
    if (prof.gallery && prof.gallery.length > 0) completionPoints += 4;
    score += completionPoints;

    // Document review check
    const docs = prof.documents || [];
    if (docs.length > 0) {
      const allVerified = docs.every(d => d.status === 'Verified');
      const hasRejected = docs.some(d => d.status === 'Rejected');
      if (allVerified) score += 10;
      else if (hasRejected) score -= 15;
    } else {
      score -= 10;
    }

    // Rating check
    if (prof.rating) {
      if (prof.rating >= 4.5) score += 10;
      else if (prof.rating >= 4.0) score += 5;
      else if (prof.rating < 3.0) score -= 10;
    }

    // Active complaints check
    const pendingComplaints = (prof.complaints || []).filter(c => c.status === 'Pending').length;
    if (pendingComplaints > 0) {
      score -= (pendingComplaints * 15);
    }

    // Suspended state check
    if (prof.status === 'Suspended' || prof.status === 'Blacklisted') {
      score = 25; // minimum floor
    }

    // Bound limits
    score = Math.max(0, Math.min(100, score));

    // Map to grades
    let grade = 'B';
    if (score >= 95) grade = 'A+';
    else if (score >= 80) grade = 'A';
    else if (score >= 60) grade = 'B';
    else if (score >= 40) grade = 'C';
    else grade = 'D';

    return { score, grade };
  }

  async getDashboardAnalytics() {
    await new Promise(resolve => setTimeout(resolve, 300));
    const list = professionalDirectoryService._getRawProfessionals().filter(p => !p.isDeleted);
    
    const total = list.length;
    const verified = list.filter(p => p.status === 'Verified' || p.status === 'Featured').length;
    const pending = list.filter(p => p.status === 'Submitted' || p.status === 'Under Review').length;
    const rejected = list.filter(p => p.status === 'Removed' || p.status === 'Rejected').length;
    const suspended = list.filter(p => p.status === 'Suspended' || p.status === 'Blacklisted').length;
    const featured = list.filter(p => p.status === 'Featured').length;
    
    // Growth rates, verification speed (simulated static metrics based on data details)
    const newToday = list.filter(p => {
      const reg = new Date(p.createdAt);
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      return reg >= startOfDay;
    }).length;

    // Complaints counts
    let activeComplaints = 0;
    list.forEach(p => {
      activeComplaints += (p.complaints || []).filter(c => c.status === 'Pending').length;
    });

    // Compliance statuses check
    let nonCompliantCount = 0;
    const scores = list.map(p => {
      const hs = this.calculateHealthScore(p);
      if (hs.grade === 'D' || hs.grade === 'C') nonCompliantCount++;
      return hs.score;
    });

    const avgHealthScoreVal = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 80;

    // Build expired licenses
    const expiredList = await professionalComplianceService.getExpiredVerifications();
    const expiredCount = expiredList.length;

    // Category Coverage
    const uniqueCats = [...new Set(list.map(p => p.category))].length;

    // Duplicate detection count (simple mock calculation check)
    const gstSeen = {};
    let duplicatesAlerts = 0;
    list.forEach(p => {
      if (p.gstNumber) {
        gstSeen[p.gstNumber] = (gstSeen[p.gstNumber] || 0) + 1;
      }
    });
    Object.values(gstSeen).forEach(count => {
      if (count > 1) duplicatesAlerts += (count - 1);
    });

    return {
      stats: {
        totalBusinesses: total,
        verifiedBusinesses: verified,
        pendingVerification: pending,
        rejectedBusinesses: rejected,
        suspendedBusinesses: suspended,
        featuredBusinesses: featured,
        newRegistrationsToday: newToday || 1, // fallback
        expiredVerifications: expiredCount || 2, // fallback
        avgHealthScore: avgHealthScoreVal,
        duplicateAlerts: duplicatesAlerts || 1, // fallback
        complaintsPending: activeComplaints,
        avgVerificationTime: '1.8 Days',
        growthRate: '+14.2%',
        categoryCoverage: uniqueCats
      }
    };
  }

  async getAnalyticsCharts() {
    await new Promise(resolve => setTimeout(resolve, 300));
    const list = professionalDirectoryService._getRawProfessionals().filter(p => !p.isDeleted);

    // 1. Business Growth Trend (cumulative last 6 months)
    const growthTrend = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [3, 4, 5, 5, 6, list.length]
    };

    // 2. Verification Trend
    const verCounts = { Verified: 0, Pending: 0, Suspended: 0, Rejected: 0 };
    list.forEach(p => {
      if (p.status === 'Verified' || p.status === 'Featured') verCounts.Verified++;
      else if (p.status === 'Submitted' || p.status === 'Under Review') verCounts.Pending++;
      else if (p.status === 'Suspended' || p.status === 'Blacklisted') verCounts.Suspended++;
      else if (p.status === 'Removed' || p.status === 'Rejected') verCounts.Rejected++;
    });
    const verificationTrend = {
      labels: Object.keys(verCounts),
      data: Object.values(verCounts)
    };

    // 3. Category Distribution
    const catCounts = {};
    list.forEach(p => {
      catCounts[p.category] = (catCounts[p.category] || 0) + 1;
    });
    const categoryDistribution = Object.entries(catCounts).map(([name, value]) => ({ name, value }));

    // 4. Community Distribution
    const commCounts = {};
    list.forEach(p => {
      commCounts[p.communityId] = (commCounts[p.communityId] || 0) + 1;
    });
    const communityDistribution = Object.entries(commCounts).map(([name, value]) => ({ name: `Samaj ${name.toUpperCase()}`, value }));

    // 5. City Distribution
    const cityCounts = {};
    list.forEach(p => {
      cityCounts[p.city] = (cityCounts[p.city] || 0) + 1;
    });
    const cityDistribution = Object.entries(cityCounts).map(([name, value]) => ({ name, value }));

    // 6. Featured Status
    const featuredCounts = { Featured: list.filter(p => p.status === 'Featured').length, Standard: list.filter(p => p.status !== 'Featured').length };
    const featuredBusinesses = {
      labels: Object.keys(featuredCounts),
      data: Object.values(featuredCounts)
    };

    // 7. Health Score Distribution
    const healthGrades = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0 };
    list.forEach(p => {
      const hs = this.calculateHealthScore(p);
      healthGrades[hs.grade]++;
    });
    const healthScoreDistribution = Object.entries(healthGrades).map(([name, value]) => ({ name, value }));

    // 8. Compliance Status Trend
    const compCounts = { Compliant: 0, 'Action Required': 0, 'Non-Compliant': 0 };
    for (const p of list) {
      const res = await professionalComplianceService.checkCompliance(p.id);
      compCounts[res.status]++;
    }
    const complianceTrend = {
      labels: Object.keys(compCounts),
      data: Object.values(compCounts)
    };

    // 9. Complaint Trend (monthly complaints)
    const complaintTrend = {
      labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      data: [0, 1, 0, 2, 1, list.filter(p => (p.complaints || []).length > 0).length]
    };

    // 10. Registration Trend (monthly registrations)
    const registrationTrend = {
      labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      data: [1, 2, 1, 3, 2, list.length]
    };

    return {
      growthTrend,
      verificationTrend,
      categoryDistribution,
      communityDistribution,
      cityDistribution,
      featuredBusinesses,
      healthScoreDistribution,
      complianceTrend,
      complaintTrend,
      registrationTrend
    };
  }

  async getCommunityComparison() {
    await new Promise(resolve => setTimeout(resolve, 300));
    const list = professionalDirectoryService._getRawProfessionals().filter(p => !p.isDeleted);
    
    // Group by community
    const commGroups = {};
    list.forEach(p => {
      if (!commGroups[p.communityId]) {
        commGroups[p.communityId] = [];
      }
      commGroups[p.communityId].push(p);
    });

    const comparisonList = Object.entries(commGroups).map(([commId, items]) => {
      const total = items.length;
      const categories = [...new Set(items.map(i => i.category))].length;
      const verifiedCount = items.filter(i => i.status === 'Verified' || i.status === 'Featured').length;
      const verificationPercent = total > 0 ? parseFloat(((verifiedCount / total) * 100).toFixed(1)) : 0;
      const featured = items.filter(i => i.status === 'Featured').length;
      
      const healthScores = items.map(i => this.calculateHealthScore(i).score);
      const avgHealth = total > 0 ? parseFloat((healthScores.reduce((a, b) => a + b, 0) / total).toFixed(1)) : 0;
      
      let complaints = 0;
      items.forEach(i => {
        complaints += (i.complaints || []).filter(c => c.status === 'Pending').length;
      });

      return {
        communityId: commId,
        communityName: `Samaj Node ${commId.toUpperCase()}`,
        businesses: total,
        categories,
        verificationPercent,
        featuredListings: featured,
        growth: '+12.5%', // simulated
        complaints,
        avgHealthScore: avgHealth
      };
    });

    return comparisonList;
  }
}

export const professionalAnalyticsService = new ProfessionalAnalyticsService();
export default professionalAnalyticsService;
