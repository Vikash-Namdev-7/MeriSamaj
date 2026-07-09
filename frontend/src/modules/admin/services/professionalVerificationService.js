import { professionalDirectoryService } from './professionalDirectoryService';

class ProfessionalVerificationService {
  async reviewDocument(profId, docId, status, notes = '') {
    await new Promise(resolve => setTimeout(resolve, 200));
    const list = professionalDirectoryService._getRawProfessionals();
    const index = list.findIndex(p => p.id === profId);
    if (index === -1) throw new Error('Professional listing not found');

    const professional = list[index];
    const updatedDocs = (professional.documents || []).map(d => {
      if (d.id === docId) {
        return { ...d, status, notes: notes || d.notes };
      }
      return d;
    });

    const now = new Date().toISOString();
    const auditLog = {
      id: `log-${Date.now()}`,
      action: 'Document Verification',
      oldValue: `Document ${docId} Status`,
      newValue: `Status: ${status}, Notes: ${notes || 'N/A'}`,
      performedBy: 'Master Admin',
      timestamp: now
    };

    professional.documents = updatedDocs;
    professional.updatedAt = now;
    professional.auditLogs = [auditLog, ...(professional.auditLogs || [])];

    // Auto move pipeline stage based on docs review status
    const allVerified = updatedDocs.every(d => d.status === 'Verified');
    const hasRejected = updatedDocs.some(d => d.status === 'Rejected');
    const hasReupload = updatedDocs.some(d => d.status === 'Re-upload Required');

    if (hasRejected) {
      professional.pipelineStage = 'Rejected';
    } else if (hasReupload) {
      professional.pipelineStage = 'Re-upload Required';
    } else if (allVerified && professional.pipelineStage === 'Document Review') {
      professional.pipelineStage = 'Compliance Review';
    }

    list[index] = professional;
    professionalDirectoryService._saveRawProfessionals(list);
    return professional;
  }

  async updatePipelineStage(profId, stage) {
    await new Promise(resolve => setTimeout(resolve, 150));
    const list = professionalDirectoryService._getRawProfessionals();
    const index = list.findIndex(p => p.id === profId);
    if (index === -1) throw new Error('Professional listing not found');

    const professional = list[index];
    const oldStage = professional.pipelineStage || 'Pending';
    
    professional.pipelineStage = stage;
    professional.updatedAt = new Date().toISOString();

    const auditLog = {
      id: `log-${Date.now()}`,
      action: 'Pipeline Stage Transition',
      oldValue: oldStage,
      newValue: stage,
      performedBy: 'Master Admin',
      timestamp: new Date().toISOString()
    };
    professional.auditLogs = [auditLog, ...(professional.auditLogs || [])];

    list[index] = professional;
    professionalDirectoryService._saveRawProfessionals(list);
    return professional;
  }

  async overrideVerification(profId, status, overrideNotes = '') {
    await new Promise(resolve => setTimeout(resolve, 200));
    const list = professionalDirectoryService._getRawProfessionals();
    const index = list.findIndex(p => p.id === profId);
    if (index === -1) throw new Error('Professional listing not found');

    const professional = list[index];
    const oldBadge = professional.verificationBadge;
    const now = new Date().toISOString();

    const auditLog = {
      id: `log-${Date.now()}`,
      action: 'Verification Override',
      oldValue: `Badge: ${oldBadge || 'None'}, Status: ${professional.status}`,
      newValue: `Badge: ${status}, Status: Verified (Override)`,
      performedBy: 'Master Admin',
      timestamp: now,
      reason: overrideNotes || 'Master Admin Override Authority'
    };

    professional.verificationBadge = status; // e.g. Gold, Silver, Bronze
    professional.status = 'Verified';
    professional.pipelineStage = 'Final Approval';
    // Set all documents to Verified when Master Admin overrides
    professional.documents = (professional.documents || []).map(d => ({
      ...d,
      status: 'Verified',
      notes: `Override approval: ${overrideNotes || 'Approved by Master Admin'}`
    }));
    professional.updatedAt = now;
    professional.auditLogs = [auditLog, ...(professional.auditLogs || [])];

    list[index] = professional;
    professionalDirectoryService._saveRawProfessionals(list);
    return professional;
  }
}

export const professionalVerificationService = new ProfessionalVerificationService();
export default professionalVerificationService;
