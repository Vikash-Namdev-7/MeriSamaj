// Communication Analytics Service

const ANNOUNCEMENTS_KEY = 'merisamaj_v6_announcements';

class CommunicationAnalyticsService {
  async getDashboardAnalytics() {
    await new Promise(resolve => setTimeout(resolve, 400));
    try {
      const raw = localStorage.getItem(ANNOUNCEMENTS_KEY);
      const list = raw ? JSON.parse(raw).filter(a => !a.isDeleted) : [];

      // Counters
      const total = list.length;
      const published = list.filter(a => a.status === 'Published').length;
      const scheduled = list.filter(a => a.status === 'Scheduled').length;
      const draft = list.filter(a => a.status === 'Draft').length;
      const archived = list.filter(a => a.status === 'Archived').length;
      const expired = list.filter(a => a.status === 'Expired').length;

      // Filter published only for rates calculations
      const publishedItems = list.filter(a => a.status === 'Published');
      const totalReach = publishedItems.reduce((acc, curr) => acc + (curr.reach || 0), 0);
      
      const avgDeliveryRate = publishedItems.length > 0
        ? parseFloat((publishedItems.reduce((acc, curr) => acc + (curr.deliveryRate || 0), 0) / publishedItems.length).toFixed(1))
        : 0;

      const avgReadRate = publishedItems.length > 0
        ? parseFloat((publishedItems.reduce((acc, curr) => acc + (curr.readRate || 0), 0) / publishedItems.length).toFixed(1))
        : 0;

      const avgClickRate = publishedItems.length > 0
        ? parseFloat((publishedItems.reduce((acc, curr) => acc + (curr.clickRate || 0), 0) / publishedItems.length).toFixed(1))
        : 0;

      const avgEngagementRate = publishedItems.length > 0
        ? parseFloat((publishedItems.reduce((acc, curr) => acc + (curr.engagementRate || 0), 0) / publishedItems.length).toFixed(1))
        : 0;

      const avgReadTime = publishedItems.length > 0
        ? Math.floor(publishedItems.reduce((acc, curr) => acc + (curr.avgReadTime || 0), 0) / publishedItems.length)
        : 0;

      // Emergency alerts
      const emergencyAlerts = list.filter(a => a.category === 'Emergency Alerts').length;
      const publishedToday = publishedItems.filter(a => {
        const today = new Date().toISOString().split('T')[0];
        const createdDate = new Date(a.createdAt).toISOString().split('T')[0];
        return today === createdDate;
      }).length;

      // Sparklines Mock Data (array of 8 numbers for mini-charts)
      const sparklines = {
        reach: [3000, 5200, 4800, 6100, 7200, 9500, 11000, totalReach],
        delivery: [95, 96, 97, 98, 99, 98.5, 99.2, avgDeliveryRate || 98],
        read: [40, 45, 52, 48, 55, 62, 69, avgReadRate || 50],
        click: [10, 12, 18, 15, 22, 28, 30, avgClickRate || 15]
      };

      // Category Distribution (Donut Chart)
      const categoriesCount = {};
      list.forEach(a => {
        categoriesCount[a.category] = (categoriesCount[a.category] || 0) + 1;
      });
      const categoryDistribution = Object.keys(categoriesCount).map((cat, idx) => ({
        label: cat,
        value: categoriesCount[cat],
        percentage: parseFloat(((categoriesCount[cat] / (total || 1)) * 100).toFixed(1))
      }));

      // Community Comparison (Bar Chart)
      // Agrawal Samaj, Brahmin Samaj, Maheshwari Samaj, Rajput Samaj, Jain Samaj
      const communities = ['Agrawal Samaj', 'Brahmin Samaj', 'Maheshwari Samaj', 'Rajput Samaj', 'Jain Samaj', 'Khandelwal Samaj', 'All Communities', 'Platform Global'];
      const communityData = communities.map(c => {
        const items = list.filter(a => a.community === c);
        const reach = items.reduce((acc, curr) => acc + (curr.reach || 0), 0);
        return { community: c.replace(' Samaj', ''), reach: reach || Math.floor(Math.random() * 4000 + 1000) };
      });

      // City Comparison (Bar Chart)
      const cities = ['Indore', 'Mumbai', 'Pune', 'Jaipur', 'Ahmedabad', 'Varanasi', 'All Cities'];
      const cityData = cities.map(city => {
        const items = list.filter(a => a.city === city);
        const reach = items.reduce((acc, curr) => acc + (curr.reach || 0), 0);
        return { city, reach: reach || Math.floor(Math.random() * 3000 + 500) };
      });

      // Timeline / Date Analytics (Line/Area Chart)
      // Mocking past 7 days data
      const engagementTimeline = {
        labels: ['07/03', '07/04', '07/05', '07/06', '07/07', '07/08', '07/09'],
        reachData: [8500, 9200, 10400, 9800, 12000, 14500, totalReach || 18500],
        engagementData: [42, 48, 55, 50, 58, 62, avgEngagementRate || 65]
      };

      // Top / Low performing
      const sortedByPerf = [...publishedItems].sort((a, b) => (b.engagementRate || 0) - (a.engagementRate || 0));
      const topPerforming = sortedByPerf.slice(0, 3);
      const lowPerforming = [...sortedByPerf].reverse().slice(0, 3);

      return {
        kpis: {
          total,
          published,
          scheduled,
          draft,
          archived,
          expired,
          publishedToday,
          emergencyAlerts,
          totalReach,
          avgDeliveryRate,
          avgReadRate,
          avgClickRate,
          avgEngagementRate,
          avgReadTime
        },
        sparklines,
        categoryDistribution,
        communityData,
        cityData,
        engagementTimeline,
        topPerforming,
        lowPerforming
      };
    } catch (e) {
      console.error('Analytics computation failed:', e);
      return null;
    }
  }

  async getCampaignPerformance(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const raw = localStorage.getItem(ANNOUNCEMENTS_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const item = list.find(a => a.id === id);
      if (!item) throw new Error('Announcement not found');

      return {
        success: true,
        announcementId: id,
        title: item.title,
        status: item.status,
        metrics: {
          reach: item.reach || 0,
          delivered: Math.floor((item.reach || 0) * ((item.deliveryRate || 100) / 100)),
          opened: Math.floor((item.reach || 0) * ((item.readRate || 0) / 100)),
          clicked: Math.floor((item.reach || 0) * ((item.clickRate || 0) / 100)),
          avgReadTime: item.avgReadTime || 0
        },
        channelPerformance: [
          { channel: 'Push Notification', sent: item.reach ? Math.floor(item.reach * 0.75) : 0, delivered: item.reach ? Math.floor(item.reach * 0.73) : 0, read: item.reach ? Math.floor(item.reach * 0.45) : 0 },
          { channel: 'Email', sent: item.reach ? Math.floor(item.reach * 0.90) : 0, delivered: item.reach ? Math.floor(item.reach * 0.88) : 0, read: item.reach ? Math.floor(item.reach * 0.50) : 0 },
          { channel: 'SMS', sent: item.reach ? Math.floor(item.reach * 0.95) : 0, delivered: item.reach ? Math.floor(item.reach * 0.94) : 0, read: item.reach ? Math.floor(item.reach * 0.85) : 0 },
          { channel: 'In-App Notice', sent: item.reach || 0, delivered: item.reach || 0, read: item.reach ? Math.floor(item.reach * 0.65) : 0 }
        ]
      };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}

export const communicationAnalyticsService = new CommunicationAnalyticsService();
