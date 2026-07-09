const mockHeads = [
  {
    id: 'CH-1001',
    memberId: 'MEM-001',
    name: 'Rahul Sharma',
    email: 'rahul.s@example.com',
    phone: '+91 9876543210',
    avatar: 'https://i.pravatar.cc/150?u=rahul',
    city: 'Mumbai',
    community: 'Mumbai Central Samaj',
    role: 'Full Head',
    status: 'Active',
    assignedDate: '2025-01-15T10:00:00Z',
    lastLogin: '2026-07-08T09:30:00Z',
    performanceScore: 92,
    pendingTasks: 3,
    membersCount: 450,
    eventsCount: 12
  },
  {
    id: 'CH-1002',
    memberId: 'MEM-089',
    name: 'Priya Patel',
    email: 'priya.p@example.com',
    phone: '+91 9876543211',
    avatar: 'https://i.pravatar.cc/150?u=priya',
    city: 'Surat',
    community: 'Surat Diamond Samaj',
    role: 'Limited Head',
    status: 'Suspended',
    assignedDate: '2025-03-20T11:30:00Z',
    lastLogin: '2026-07-01T14:20:00Z',
    performanceScore: 65,
    pendingTasks: 28,
    membersCount: 310,
    eventsCount: 5
  },
  {
    id: 'CH-1003',
    memberId: 'MEM-142',
    name: 'Amit Kumar',
    email: 'amit.k@example.com',
    phone: '+91 9876543212',
    avatar: null,
    city: 'Delhi',
    community: 'Delhi North Samaj',
    role: 'Full Head',
    status: 'Pending Verification',
    assignedDate: '2026-07-07T08:15:00Z',
    lastLogin: null,
    performanceScore: 0,
    pendingTasks: 0,
    membersCount: 120,
    eventsCount: 2
  }
];

const mockAuditLogs = [
  {
    id: 'AL-001',
    action: 'Head Created',
    target: 'Amit Kumar',
    performedBy: 'Master Admin',
    timestamp: '2026-07-07T08:15:00Z',
    details: 'Created new Community Head account.'
  },
  {
    id: 'AL-002',
    action: 'Suspended',
    target: 'Priya Patel',
    performedBy: 'Master Admin',
    timestamp: '2026-07-01T15:00:00Z',
    details: 'Suspended due to prolonged inactivity and pending approvals.'
  }
];

// Simulated delay to mimic API calls
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const communityHeadService = {
  getHeads: async () => {
    await delay(600);
    return [...mockHeads];
  },
  
  getHeadById: async (id) => {
    await delay(300);
    return mockHeads.find(h => h.id === id);
  },

  createHead: async (data) => {
    await delay(800);
    const newHead = {
      ...data,
      id: `CH-${1000 + Math.floor(Math.random() * 900)}`,
      status: 'Pending Verification',
      assignedDate: new Date().toISOString(),
      performanceScore: 0,
      pendingTasks: 0,
      membersCount: 0,
      eventsCount: 0,
      lastLogin: null
    };
    mockHeads.unshift(newHead);
    return newHead;
  },

  updateHead: async (id, data) => {
    await delay(600);
    const index = mockHeads.findIndex(h => h.id === id);
    if (index === -1) throw new Error('Head not found');
    mockHeads[index] = { ...mockHeads[index], ...data };
    return mockHeads[index];
  },

  updateStatus: async (id, status) => {
    await delay(500);
    const index = mockHeads.findIndex(h => h.id === id);
    if (index === -1) throw new Error('Head not found');
    mockHeads[index].status = status;
    return mockHeads[index];
  },

  getAuditLogs: async () => {
    await delay(500);
    return [...mockAuditLogs];
  },

  getStats: async () => {
    await delay(400);
    const total = mockHeads.length;
    const active = mockHeads.filter(h => h.status === 'Active').length;
    const suspended = mockHeads.filter(h => h.status === 'Suspended').length;
    const pending = mockHeads.filter(h => h.status === 'Pending Verification').length;
    
    return {
      totalHeads: total,
      activeHeads: active,
      suspendedHeads: suspended,
      pendingInvitations: pending,
      communitiesAssigned: mockHeads.filter(h => h.community).length,
      communitiesWithoutHead: 3, // Mock value
      averagePerformance: 78 // Mock value
    };
  }
};
