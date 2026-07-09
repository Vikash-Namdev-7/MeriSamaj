class ApprovalAuditService {
  constructor() {
    this.storageKey = 'merisamaj_v6_approval_audits';
    this.initStore();
  }

  initStore() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) {
        // Seed initial mock audit log entries
        const initialAudits = [
          {
            id: `aud-log-101`,
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            admin: 'Vikash Namdev',
            actionType: 'Review Progress',
            oldValue: 'Pending',
            newValue: 'Under Review',
            module: 'Matrimonial Profile',
            community: 'Agrawal Samaj',
            browserSession: 'Chrome 124.0.0.0 - Windows 11',
            reason: 'Initiated documentation review'
          },
          {
            id: `aud-log-102`,
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            admin: 'Master Admin',
            actionType: 'Override Decision',
            oldValue: 'Rejected',
            newValue: 'Approved',
            module: 'Community Fund Request',
            community: 'Brahmin Samaj',
            browserSession: 'Firefox 125.0.0.0 - macOS 14',
            reason: 'Approved per community board resolution 12B.'
          }
        ];
        localStorage.setItem(this.storageKey, JSON.stringify(initialAudits));
      }
    } catch (e) {
      console.error(e);
    }
  }

  _getAudits() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  _saveAudits(audits) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(audits));
    } catch (e) {
      console.error(e);
    }
  }

  async logAction({ requestId, actionType, admin, oldValue, newValue, module, community, reason = '' }) {
    const audits = this._getAudits();
    
    // Auto-detect browser/session signature in mock mode
    const browserSession = typeof window !== 'undefined' ? window.navigator.userAgent.slice(0, 50) : 'NodeJS Environment';

    const newLog = {
      id: `aud-log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      requestId,
      admin: admin || 'Master Admin',
      actionType,
      oldValue: oldValue || 'N/A',
      newValue: newValue || 'N/A',
      module: module || 'Global approvals',
      community: community || 'General',
      browserSession,
      reason: reason || 'Routine administration'
    };

    audits.push(newLog);
    this._saveAudits(audits);
    return newLog;
  }

  async getLogs(filters = {}) {
    await new Promise(resolve => setTimeout(resolve, 200));
    let list = this._getAudits();

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      list = list.filter(l => 
        l.admin.toLowerCase().includes(q) ||
        (l.reason && l.reason.toLowerCase().includes(q)) ||
        l.actionType.toLowerCase().includes(q) ||
        (l.requestId && l.requestId.toLowerCase().includes(q)) ||
        l.module.toLowerCase().includes(q) ||
        l.community.toLowerCase().includes(q)
      );
    }

    if (filters.actionType && filters.actionType !== 'All') {
      list = list.filter(l => l.actionType === filters.actionType);
    }

    if (filters.module && filters.module !== 'All') {
      list = list.filter(l => l.module === filters.module);
    }

    // Sort by newest log first
    list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      data: list,
      totalCount: list.length
    };
  }

  async exportLogs(format, filters = {}) {
    const { data } = await this.getLogs(filters);
    return JSON.stringify(data, null, 2);
  }
}

export const approvalAuditService = new ApprovalAuditService();
export default approvalAuditService;
