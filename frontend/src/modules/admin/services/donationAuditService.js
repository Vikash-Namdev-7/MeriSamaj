import { campaignService } from './campaignService';

class DonationAuditService {
  constructor() {
    this.storageKey = 'merisamaj_v6_donation_audits';
    this.initStore();
  }

  initStore() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) {
        // Initialize with default seed logs
        const initialLogs = [
          {
            id: 'AUD-901',
            campaignId: 'CMP-101',
            campaignName: 'Indore Samaj Bhavan Construction',
            action: 'Campaign Created',
            operator: 'Pt. Ramesh Chand',
            date: '2026-01-01T10:00:00Z',
            details: 'Initialized from Indore Community Head desk. Target goal ₹15,000,000.'
          },
          {
            id: 'AUD-902',
            campaignId: 'CMP-101',
            campaignName: 'Indore Samaj Bhavan Construction',
            action: 'Documents Verified',
            operator: 'Master Admin',
            date: '2026-01-05T12:00:00Z',
            details: 'Municipal NOC and Land Deeds audited and verified by Master Admin.'
          },
          {
            id: 'AUD-903',
            campaignId: 'CMP-104',
            campaignName: 'Jaipur Poor Girls Marriage Support',
            action: 'Campaign Suspended',
            operator: 'Master Admin',
            date: '2026-05-02T10:00:00Z',
            details: 'Override Action: Suspended due to incomplete beneficiary documents.'
          },
          {
            id: 'AUD-904',
            campaignId: 'CMP-102',
            campaignName: 'Mumbai Education Scholarship 2026',
            action: 'Payment Approved',
            operator: 'Master Admin',
            date: '2026-06-25T11:45:00Z',
            details: 'Manual NEFT Payment of ₹25,000 from Rajesh Sharma approved.'
          }
        ];
        localStorage.setItem(this.storageKey, JSON.stringify(initialLogs));
      }
    } catch (e) {
      console.error('Failed to initialize audits store:', e);
    }
  }

  _getRawAudits() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  _saveRawAudits(audits) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(audits));
    } catch (e) {
      console.error('Failed to save audits store:', e);
    }
  }

  async getAuditLogs(filters = {}) {
    await new Promise(resolve => setTimeout(resolve, 300));
    let logs = this._getRawAudits();

    // Sort by date descending
    logs.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Search query
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      logs = logs.filter(l => 
        (l.campaignName && l.campaignName.toLowerCase().includes(q)) ||
        l.action.toLowerCase().includes(q) ||
        l.operator.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.campaignId.toLowerCase().includes(q)
      );
    }

    if (filters.action && filters.action !== 'All') {
      logs = logs.filter(l => l.action.toLowerCase().includes(filters.action.toLowerCase()));
    }

    if (filters.operator && filters.operator !== 'All') {
      logs = logs.filter(l => l.operator.toLowerCase() === filters.operator.toLowerCase());
    }

    return {
      data: logs,
      totalCount: logs.length
    };
  }

  async logEvent(campaignId, action, details, operator = 'Master Admin') {
    const logs = this._getRawAudits();
    
    let campaignName = 'General Admin Action';
    try {
      // Avoid circular dependency by fetching raw localstorage list if campaignService is in progress
      const data = localStorage.getItem('merisamaj_v6_donation_campaigns');
      if (data) {
        const campaign = JSON.parse(data).find(c => c.id === campaignId);
        if (campaign) {
          campaignName = campaign.name;
        }
      }
    } catch (e) {
      console.warn('Could not load campaign name for audit log:', e);
    }

    const newLog = {
      id: `AUD-${Date.now()}`,
      campaignId,
      campaignName,
      action,
      operator,
      date: new Date().toISOString(),
      details
    };

    logs.push(newLog);
    this._saveRawAudits(logs);
  }
}

export const donationAuditService = new DonationAuditService();
