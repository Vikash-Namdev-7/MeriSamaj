// Communication Audit Service

const STORAGE_KEY = 'merisamaj_v6_announcement_audits';

const seedAudits = [
  {
    id: 'aud-2001',
    timestamp: '2026-07-01T08:00:00Z',
    action: 'Announcement Created',
    operator: 'Vikash Namdev',
    role: 'Master Admin',
    ip: '192.168.1.110',
    browser: 'Chrome 126.0 / Windows 11',
    announcementId: 'a-1',
    announcementTitle: 'New Executive Committee Election Results',
    community: 'Agrawal Samaj',
    targetAudience: 'All Platform',
    prevValue: null,
    newValue: 'Draft',
    reason: 'Initial creation of election results notice.'
  },
  {
    id: 'aud-2002',
    timestamp: '2026-07-01T08:05:00Z',
    action: 'Published',
    operator: 'Vikash Namdev',
    role: 'Master Admin',
    ip: '192.168.1.110',
    browser: 'Chrome 126.0 / Windows 11',
    announcementId: 'a-1',
    announcementTitle: 'New Executive Committee Election Results',
    community: 'Agrawal Samaj',
    targetAudience: 'All Platform',
    prevValue: 'Draft',
    newValue: 'Published',
    reason: 'Official publication after approval from committee.'
  },
  {
    id: 'aud-2003',
    timestamp: '2026-07-07T14:00:00Z',
    action: 'Scheduled',
    operator: 'Vikash Namdev',
    role: 'Master Admin',
    ip: '192.168.1.110',
    browser: 'Chrome 126.0 / Windows 11',
    announcementId: 'a-2',
    announcementTitle: 'Scheduled System Maintenance: July 15',
    community: 'Platform Global',
    targetAudience: 'Members',
    prevValue: null,
    newValue: 'Scheduled',
    reason: 'Maintenance set for early hours on July 15th.'
  }
];

class CommunicationAuditService {
  constructor() {
    this.initStore();
  }

  initStore() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seedAudits));
      }
    } catch (e) {
      console.error('Failed to initialize announcement audits store:', e);
    }
  }

  async getLogs(filters = {}) {
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      let logs = data ? JSON.parse(data) : [];

      // Apply filtering
      if (filters.action && filters.action !== 'All') {
        logs = logs.filter(l => l.action.toLowerCase().includes(filters.action.toLowerCase()));
      }
      if (filters.operator && filters.operator !== 'All') {
        logs = logs.filter(l => l.operator.toLowerCase().includes(filters.operator.toLowerCase()));
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        logs = logs.filter(l => 
          l.announcementTitle?.toLowerCase().includes(query) ||
          l.operator.toLowerCase().includes(query) ||
          l.action.toLowerCase().includes(query) ||
          l.reason?.toLowerCase().includes(query) ||
          l.id.toLowerCase().includes(query)
        );
      }

      // Sort newest first
      return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async logAction({ action, announcementId, announcementTitle, prevValue, newValue, reason, audience, community, operator = 'Vikash Namdev' }) {
    await new Promise(resolve => setTimeout(resolve, 150));
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const logs = data ? JSON.parse(data) : [];

      const newLog = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action,
        operator,
        role: 'Master Admin',
        ip: '192.168.1.' + Math.floor(Math.random() * 254 + 1), // Mock IP
        browser: navigator.userAgent || 'Chrome 126.0 / Windows 11',
        announcementId,
        announcementTitle,
        community: community || 'Platform Global',
        targetAudience: audience || 'Entire Platform',
        prevValue: prevValue === undefined ? null : prevValue,
        newValue: newValue === undefined ? null : newValue,
        reason: reason || 'N/A'
      };

      logs.push(newLog);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
      return newLog;
    } catch (e) {
      console.error('Failed to log action:', e);
      return null;
    }
  }

  async clearLogs() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return true;
  }
}

export const communicationAuditService = new CommunicationAuditService();
