import { MOCK_PROFILES, MOCK_REPORTS, MOCK_STATS, MOCK_AUDIT_LOGS } from '../repository/mockMatrimonialRepository';

class MatrimonialService {
  async getDashboardStats() {
    return new Promise(resolve => setTimeout(() => resolve({ ...MOCK_STATS }), 800));
  }

  async getProfiles() {
    return new Promise(resolve => setTimeout(() => resolve([...MOCK_PROFILES]), 700));
  }

  async getReports() {
    return new Promise(resolve => setTimeout(() => resolve([...MOCK_REPORTS]), 600));
  }

  async getAuditLogs() {
    return new Promise(resolve => setTimeout(() => resolve([...MOCK_AUDIT_LOGS]), 500));
  }

  // Mutations
  async approveProfile(profileId) {
    return new Promise(resolve => setTimeout(() => resolve({ success: true, profileId }), 500));
  }

  async rejectProfile(profileId) {
    return new Promise(resolve => setTimeout(() => resolve({ success: true, profileId }), 500));
  }
  
  async suspendProfile(profileId) {
    return new Promise(resolve => setTimeout(() => resolve({ success: true, profileId }), 500));
  }

  async resolveReport(reportId) {
    return new Promise(resolve => setTimeout(() => resolve({ success: true, reportId }), 500));
  }
}

export const matrimonialService = new MatrimonialService();
