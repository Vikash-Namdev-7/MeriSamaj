import { professionalDirectoryService } from './professionalDirectoryService';

class ProfessionalAuditService {
  async getAuditLogs(filters = {}) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const all = professionalDirectoryService._getRawProfessionals();
    let logs = [];

    all.forEach(p => {
      if (p.auditLogs) {
        p.auditLogs.forEach((log, idx) => {
          logs.push({
            id: `${p.id}-audit-${idx}-${log.timestamp || log.date || Date.now()}`,
            professionalId: p.id,
            businessName: p.title,
            communityId: p.communityId,
            city: p.city,
            action: log.action,
            oldValue: log.oldValue || 'N/A',
            newValue: log.newValue || 'N/A',
            performedBy: log.performedBy || 'System',
            timestamp: log.timestamp || log.date || p.createdAt,
            reason: log.reason || ''
          });
        });
      }
    });

    // Sort by timestamp descending
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Search query
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      logs = logs.filter(l => 
        l.businessName.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.performedBy.toLowerCase().includes(q) ||
        l.newValue.toLowerCase().includes(q) ||
        l.oldValue.toLowerCase().includes(q)
      );
    }

    if (filters.action && filters.action !== 'All') {
      logs = logs.filter(l => l.action.toLowerCase().includes(filters.action.toLowerCase()));
    }

    if (filters.community && filters.community !== 'All') {
      logs = logs.filter(l => l.communityId === filters.community);
    }

    return {
      data: logs,
      totalCount: logs.length
    };
  }

  async logEvent(profId, action, oldValue, newValue, details = '', reason = '') {
    const list = professionalDirectoryService._getRawProfessionals();
    const index = list.findIndex(p => p.id === profId);
    if (index === -1) return;

    const professional = list[index];
    const now = new Date().toISOString();
    const newLog = {
      id: `log-${Date.now()}`,
      action,
      oldValue,
      newValue,
      performedBy: 'Master Admin',
      timestamp: now,
      reason,
      details
    };

    professional.auditLogs = [newLog, ...(professional.auditLogs || [])];
    professional.updatedAt = now;
    list[index] = professional;
    professionalDirectoryService._saveRawProfessionals(list);
  }
}

export const professionalAuditService = new ProfessionalAuditService();
export default professionalAuditService;
