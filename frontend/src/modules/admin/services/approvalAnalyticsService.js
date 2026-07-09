import { approvalQueueService } from './approvalQueueService';
import { approvalSLAService } from './approvalSLAService';

class ApprovalAnalyticsService {
  async getDashboardAnalytics() {
    const list = approvalQueueService._getRawApprovals();
    
    // Status counts
    const pendingCount = list.filter(item => ['Pending', 'Under Review', 'Assigned Reviewer', 'Waiting Documents'].includes(item.status)).length;
    const approvedToday = list.filter(item => item.status === 'Approved').length; // Mocked as total approved for dashboard feel
    const rejectedToday = list.filter(item => item.status === 'Rejected').length; // Mocked as total rejected
    const escalated = list.filter(item => item.status === 'Escalated').length;
    const highPriority = list.filter(item => ['High', 'Critical'].includes(item.priority)).length;
    
    // SLA breaches count
    const slaViolations = list.filter(item => approvalSLAService.isOverdue(item.slaDeadline, item.status)).length;

    // Calculate processing times (in hours)
    const resolvedItems = list.filter(item => ['Approved', 'Rejected', 'Completed'].includes(item.status));
    let totalProcessingHours = 0;
    resolvedItems.forEach(item => {
      const start = new Date(item.createdAt).getTime();
      const end = new Date(item.updatedAt).getTime();
      totalProcessingHours += (end - start) / (1000 * 60 * 60);
    });
    const avgProcessingTime = resolvedItems.length > 0 ? Math.round(totalProcessingHours / resolvedItems.length) : 24; // default 24h

    // Calculations for success rates
    const resolvedCount = list.filter(item => ['Approved', 'Rejected'].includes(item.status)).length;
    const approvedCount = list.filter(item => item.status === 'Approved').length;
    const approvalSuccessRate = resolvedCount > 0 ? Math.round((approvedCount / resolvedCount) * 100) : 88; // fallback 88%

    // Module-wise pending counts
    const moduleMap = {};
    list.forEach(item => {
      if (['Pending', 'Under Review', 'Assigned Reviewer', 'Waiting Documents'].includes(item.status)) {
        moduleMap[item.module] = (moduleMap[item.module] || 0) + 1;
      }
    });
    const moduleDistribution = Object.entries(moduleMap).map(([label, value]) => ({ label, value }));

    // Community-wise pending counts
    const communityMap = {};
    list.forEach(item => {
      if (['Pending', 'Under Review', 'Assigned Reviewer', 'Waiting Documents'].includes(item.status)) {
        communityMap[item.community] = (communityMap[item.community] || 0) + 1;
      }
    });
    const communityDistribution = Object.entries(communityMap).map(([label, value]) => ({ label, value }));

    // SLA Compliance rate
    const slaStats = approvalSLAService.calculateSLAStats(list);

    // Chart Datasets
    // 1. Approval Trend (Mock 7-day request volumes)
    const trendLabels = ['Jul 3', 'Jul 4', 'Jul 5', 'Jul 6', 'Jul 7', 'Jul 8', 'Jul 9'];
    const trendData = [8, 12, 10, 15, 20, 18, list.length]; // maps to total items count roughly

    // 2. Status distribution for Donut Chart
    const statusData = [
      { name: 'Pending', value: list.filter(i => i.status === 'Pending').length },
      { name: 'Under Review', value: list.filter(i => i.status === 'Under Review').length },
      { name: 'Approved', value: list.filter(i => i.status === 'Approved').length },
      { name: 'Rejected', value: list.filter(i => i.status === 'Rejected').length },
      { name: 'Escalated', value: list.filter(i => i.status === 'Escalated').length }
    ].filter(s => s.value > 0);

    // 3. Community Comparison Report
    const communityNames = ['Agrawal Samaj', 'Brahmin Samaj', 'Maheshwari Samaj', 'Patidar Samaj', 'Khandelwal Samaj', 'Jain Samaj'];
    const communityComparison = communityNames.map(c => {
      const cItems = list.filter(item => item.community === c);
      const pendingQ = cItems.filter(item => ['Pending', 'Under Review', 'Assigned Reviewer', 'Waiting Documents'].includes(item.status)).length;
      const rejectedC = cItems.filter(item => item.status === 'Rejected').length;
      const completedC = cItems.filter(item => ['Approved', 'Completed'].includes(item.status)).length;
      const escalatedC = cItems.filter(item => item.status === 'Escalated').length;

      // Mock speed: lower pending queue means faster speed
      const avgSpeed = pendingQ > 2 ? 36 : pendingQ > 0 ? 18 : 8;

      return {
        community: c,
        pendingCount: pendingQ,
        avgSpeed,
        rejectedCount: rejectedC,
        completedCount: completedC,
        escalatedCount: escalatedC
      };
    });

    return {
      stats: {
        pendingCount,
        approvedToday,
        rejectedToday,
        escalated,
        highPriority,
        slaViolations,
        avgProcessingTime,
        approvalSuccessRate,
        slaComplianceRate: slaStats.complianceRate
      },
      charts: {
        trendLabels,
        trendData,
        statusData,
        moduleDistribution,
        communityDistribution,
        communityComparison
      }
    };
  }
}

export const approvalAnalyticsService = new ApprovalAnalyticsService();
export default approvalAnalyticsService;
