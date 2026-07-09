import { professionalDirectoryService } from './professionalDirectoryService';

class ProfessionalNotificationService {
  async sendSystemNotification(profId, type, title, message) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 1. Add to member inbox notifications (so the business owner sees it)
    try {
      const storedNotifsRaw = localStorage.getItem('merisamaj_v6_notifications');
      const notifications = storedNotifsRaw ? JSON.parse(storedNotifsRaw) : [];
      
      const newTrayNotif = {
        id: `nf_prof_${Date.now()}`,
        type: type || 'professional_update',
        title: title || 'Business Directory Notice',
        message: message,
        time: 'Just now',
        isRead: false,
        professionalId: profId
      };
      
      localStorage.setItem('merisamaj_v6_notifications', JSON.stringify([newTrayNotif, ...notifications]));
    } catch (e) {
      console.error('Failed to append tray notification:', e);
    }

    // 2. Add to Admin sent logs (for tracking in head/admin panels)
    try {
      const storedSentRaw = localStorage.getItem('merisamaj_v6_sentNotifications');
      const sentLogs = storedSentRaw ? JSON.parse(storedSentRaw) : [];
      
      const p = await professionalDirectoryService.getProfessionalById(profId);

      const newLog = {
        id: `nlog-prof-${Date.now()}`,
        communityId: p ? p.communityId : 'all',
        type: 'Professional Update',
        audience: p ? p.ownerName : 'Business Owner',
        title: title,
        subtitle: p ? p.title : 'Directory Update',
        message: message,
        channels: ['Push', 'In-App', 'Email'],
        status: 'Delivered',
        stats: { sentCount: 1, openCount: 1, clickCount: 0 },
        createdBy: 'Master Admin',
        createdTime: new Date().toISOString(),
        isPinned: false
      };

      localStorage.setItem('merisamaj_v6_sentNotifications', JSON.stringify([newLog, ...sentLogs]));
      
      // Dispatch storage events
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Failed to append sent notification log:', e);
    }
  }

  async sendComplianceReminder(profId, documentType) {
    return this.sendSystemNotification(
      profId,
      'compliance_alert',
      'Compliance Action Required',
      `Your business listing document '${documentType}' has expired or is invalid. Please upload a verified copy immediately to prevent business suspension.`
    );
  }

  async sendVerificationRequest(profId) {
    return this.sendSystemNotification(
      profId,
      'verification_request',
      'Business Profile Under Verification',
      `Your business listing is now being processed through the multi-level verification pipeline. We will notify you once verification is completed.`
    );
  }

  async sendReuploadRequest(profId, docName, notes) {
    return this.sendSystemNotification(
      profId,
      'reupload_request',
      'Document Re-upload Requested',
      `Master Admin requested a re-upload of your '${docName}'. Reason: ${notes}`
    );
  }

  async sendApprovalNotification(profId, badge) {
    const p = await professionalDirectoryService.getProfessionalById(profId);
    return this.sendSystemNotification(
      profId,
      'approval_success',
      'Business Listing Approved',
      `Congratulations! Your business '${p.title}' has been approved by the Master Admin and awarded the '${badge || 'Standard'}' Badge.`
    );
  }

  async sendRejectionNotification(profId, reason) {
    const p = await professionalDirectoryService.getProfessionalById(profId);
    return this.sendSystemNotification(
      profId,
      'approval_failure',
      'Business Listing Rejected',
      `Your listing application for '${p?.title || 'Business'}' was not approved. Reason: ${reason || 'Details in workspace.'}`
    );
  }

  async sendSuspensionNotification(profId, reason) {
    const p = await professionalDirectoryService.getProfessionalById(profId);
    return this.sendSystemNotification(
      profId,
      'listing_suspension',
      'Business Listing Suspended',
      `Your professional listing '${p?.title || 'Business'}' has been suspended due to: ${reason || 'Compliance violation.'}`
    );
  }
}

export const professionalNotificationService = new ProfessionalNotificationService();
export default professionalNotificationService;
