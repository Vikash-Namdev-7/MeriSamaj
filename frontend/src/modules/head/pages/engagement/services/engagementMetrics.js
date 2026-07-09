// Mock Service to fetch engagement metrics
export const engagementMetricsService = {
  getDashboardMetrics: async (communityId) => {
    // API-ready: In the future, this will be an actual fetch call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          activeMembersToday: 145,
          activeMembersGrowth: 12.5,
          newMembersToday: 12,
          newMembersGrowth: 5.2,
          totalPosts: 84,
          postsGrowth: -2.4,
          totalComments: 342,
          commentsGrowth: 18.1,
          eventsHosted: 4,
          donationsReceived: 25000,
          volunteerHours: 120,
          communityHealthScore: 88
        });
      }, 500);
    });
  },

  getAnalyticsCharts: async (communityId, dateRange) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          dailyActivity: [
            { name: 'Mon', active: 120, new: 5 },
            { name: 'Tue', active: 132, new: 8 },
            { name: 'Wed', active: 101, new: 12 },
            { name: 'Thu', active: 145, new: 6 },
            { name: 'Fri', active: 190, new: 15 },
            { name: 'Sat', active: 210, new: 20 },
            { name: 'Sun', active: 180, new: 10 }
          ],
          participationBreakdown: [
            { name: 'Events', value: 400, color: '#8b5cf6' },
            { name: 'Discussions', value: 300, color: '#ec4899' },
            { name: 'Volunteering', value: 200, color: '#f59e0b' },
            { name: 'Donations', value: 100, color: '#10b981' }
          ]
        });
      }, 500);
    });
  }
};
