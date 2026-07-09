import { familyService } from './familyService';

class FamilyAuditService {
  async getAuditLogs(filters = {}) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const allFamilies = familyService._getRawFamilies();
    
    let logs = [];
    
    // Dynamically compile audit logs from all family audit histories
    allFamilies.forEach(f => {
      if (f.auditHistory) {
        f.auditHistory.forEach((log, idx) => {
          logs.push({
            id: `${f.id}-audit-${idx}`,
            familyId: f.id,
            familyName: f.name,
            community: f.community,
            city: f.city,
            action: log.action,
            operator: log.operator || 'Master Admin',
            date: log.date || log.timestamp || f.createdAt,
            details: log.details || ''
          });
        });
      }
    });

    // Sort by date descending
    logs.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Apply filters
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      logs = logs.filter(l => 
        l.familyName.toLowerCase().includes(q) ||
        l.familyId.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.operator.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q)
      );
    }

    if (filters.action && filters.action !== 'All') {
      logs = logs.filter(l => l.action.toLowerCase().includes(filters.action.toLowerCase()));
    }

    if (filters.community && filters.community !== 'All') {
      logs = logs.filter(l => l.community.toLowerCase() === filters.community.toLowerCase());
    }

    return {
      data: logs,
      totalCount: logs.length
    };
  }

  async logEvent(familyId, action, details, operator = 'Master Admin') {
    const family = await familyService.getFamilyById(familyId);
    if (!family) return;

    const now = new Date().toISOString();
    const newLog = {
      date: now,
      action,
      operator,
      details
    };

    const auditHistory = [newLog, ...(family.auditHistory || [])];
    await familyService.updateFamily(familyId, { auditHistory });
  }
}

export const familyAuditService = new FamilyAuditService();
