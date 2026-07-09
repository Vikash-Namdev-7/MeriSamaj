export const dashboardService = {
  getPlatformStats: async () => {
    // Mock API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalMembers: 4520,
          verifiedMembers: 3850,
          totalCommunities: 24,
          totalCities: 12,
          communityHeads: 24,
          activeEvents: 18,
          professionalListings: 1240,
          matrimonialProfiles: 890,
          totalDonations: 154000,
          totalRevenue: 2850000,
          activeSubscriptions: 3100,
          pendingApprovals: 85,
          openComplaints: 12,
          unreadNotifications: 45,
          activeSessions: 320,
          onlineUsers: 145,
          inactiveUsers: 240,
          growth: {
            platform: 12.5,
            revenue: 8.4,
            community: 5.2
          }
        });
      }, 500);
    });
  },

  getCommunities: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, name: 'Mumbai Central Samaj', head: 'Ramesh Patel', city: 'Mumbai', members: 1250, verificationPct: 92, health: 'Excellent' },
          { id: 2, name: 'Pune West Samaj', head: 'Sneha Shah', city: 'Pune', members: 840, verificationPct: 88, health: 'Good' },
          { id: 3, name: 'Surat Diamond Samaj', head: 'Manish Jain', city: 'Surat', members: 2100, verificationPct: 75, health: 'Needs Attention' },
          { id: 4, name: 'Ahmedabad Heritage', head: 'Kiran Desai', city: 'Ahmedabad', members: 1800, verificationPct: 95, health: 'Excellent' },
        ]);
      }, 600);
    });
  },

  getCommunityHeads: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 'h1', name: 'Ramesh Patel', community: 'Mumbai Central Samaj', city: 'Mumbai', status: 'Online', lastLogin: 'Just now', pendingRequests: 12 },
          { id: 'h2', name: 'Sneha Shah', community: 'Pune West Samaj', city: 'Pune', status: 'Offline', lastLogin: '2h ago', pendingRequests: 5 },
          { id: 'h3', name: 'Manish Jain', community: 'Surat Diamond Samaj', city: 'Surat', status: 'Online', lastLogin: '10m ago', pendingRequests: 28 },
        ]);
      }, 500);
    });
  },

  getAuditLogs: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 'a1', user: 'Master Admin', role: 'SuperAdmin', module: 'Settings', action: 'Updated Global Fees', timestamp: '10 mins ago', status: 'Success' },
          { id: 'a2', user: 'Ramesh Patel', role: 'CommunityHead', module: 'Members', action: 'Approved 5 Members', timestamp: '1 hour ago', status: 'Success' },
          { id: 'a3', user: 'System', role: 'Cron', module: 'Subscriptions', action: 'Auto-Renew Processed', timestamp: '2 hours ago', status: 'Success' },
        ]);
      }, 400);
    });
  },
  
  getSystemHealth: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          api: { status: 'Operational', uptime: '99.99%', latency: '45ms' },
          database: { status: 'Operational', load: '32%', connections: 145 },
          redis: { status: 'Operational', hitRate: '98%', memory: '245MB' },
          storage: { status: 'Warning', used: '85%', available: '150GB' }
        });
      }, 300);
    });
  }
};
