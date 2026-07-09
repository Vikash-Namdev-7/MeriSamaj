import { professionalDirectoryService } from './professionalDirectoryService';

class ProfessionalComplianceService {
  async checkCompliance(profId) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const list = professionalDirectoryService._getRawProfessionals();
    const professional = list.find(p => p.id === profId);
    if (!professional) return { status: 'Non-Compliant', issues: ['Listing not found'] };

    const issues = [];
    const docs = professional.documents || [];
    const now = new Date();

    // Check mandatory documents (GST, Trade License, Shop Registration)
    const requiredTypes = ['GST Certificate', 'Trade License', 'Shop Registration'];
    requiredTypes.forEach(type => {
      const doc = docs.find(d => d.type === type);
      if (!doc) {
        issues.push(`Missing Mandatory Document: ${type}`);
      } else if (doc.status === 'Rejected') {
        issues.push(`Rejected Document: ${type} - ${doc.notes || ''}`);
      } else if (doc.status === 'Re-upload Required') {
        issues.push(`Re-upload Required: ${type}`);
      } else if (doc.expiryDate && new Date(doc.expiryDate) < now) {
        issues.push(`Expired Document: ${type} (Expired on ${doc.expiryDate})`);
      }
    });

    // Check for active high-priority complaints
    const activeComplaints = (professional.complaints || []).filter(c => c.status === 'Pending');
    if (activeComplaints.length > 0) {
      issues.push(`Pending Complaints: ${activeComplaints.length} active grievance report(s)`);
    }

    // Determine Status
    let status = 'Compliant';
    if (issues.length > 0) {
      const hasSevere = issues.some(i => i.includes('Missing') || i.includes('Expired') || i.includes('Rejected'));
      status = hasSevere ? 'Non-Compliant' : 'Action Required';
    }

    return {
      status,
      issues
    };
  }

  async getComplianceAlerts() {
    await new Promise(resolve => setTimeout(resolve, 200));
    const list = professionalDirectoryService._getRawProfessionals().filter(p => !p.isDeleted);
    const alerts = [];

    for (const p of list) {
      const report = await this.checkCompliance(p.id);
      if (report.status !== 'Compliant') {
        alerts.push({
          professionalId: p.id,
          businessId: p.businessId,
          businessName: p.title,
          ownerName: p.ownerName,
          communityId: p.communityId,
          city: p.city,
          complianceStatus: report.status,
          issues: report.issues,
          updatedAt: p.updatedAt
        });
      }
    }

    return alerts;
  }

  async getExpiredVerifications() {
    await new Promise(resolve => setTimeout(resolve, 150));
    const list = professionalDirectoryService._getRawProfessionals().filter(p => !p.isDeleted);
    const expiredList = [];
    const now = new Date();

    list.forEach(p => {
      // If verification badge exists, simulate checking if it needs re-verification (e.g. 1 year after updatedAt)
      const verDate = new Date(p.updatedAt);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);

      if (p.status === 'Verified' && verDate < oneYearAgo) {
        expiredList.push({
          id: p.id,
          businessId: p.businessId,
          title: p.title,
          ownerName: p.ownerName,
          verificationDate: p.updatedAt,
          daysExpired: Math.floor((now - verDate) / (1000 * 60 * 60 * 24)) - 365
        });
      }
    });

    return expiredList;
  }
}

export const professionalComplianceService = new ProfessionalComplianceService();
export default professionalComplianceService;
