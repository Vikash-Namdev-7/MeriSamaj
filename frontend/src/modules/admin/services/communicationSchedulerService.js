// Communication Scheduler Service
import { announcementManagementService } from './announcementManagementService';
import { communicationAuditService } from './communicationAuditService';

const DRAFT_KEY = 'merisamaj_v6_draft_recovery';
const ANNOUNCEMENTS_KEY = 'merisamaj_v6_announcements';

class CommunicationSchedulerService {
  async saveDraft(draftData) {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        data: draftData,
        timestamp: new Date().toISOString()
      }));
      return { success: true };
    } catch (e) {
      console.error('Failed to autosave draft:', e);
      return { success: false, error: e.message };
    }
  }

  async loadDraft() {
    try {
      const data = localStorage.getItem(DRAFT_KEY);
      if (!data) return { success: true, data: null };
      return { success: true, ...JSON.parse(data) };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async clearDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Process scheduled tasks, auto-expiry and auto-archiving.
  // In a mock environment, we execute this when the app loads or refreshes.
  async processSchedulerJobs() {
    try {
      const raw = localStorage.getItem(ANNOUNCEMENTS_KEY);
      if (!raw) return { success: true, processed: 0 };
      
      const list = JSON.parse(raw);
      let updatedCount = 0;
      const now = new Date();
      
      const updatedList = list.map(item => {
        let changed = false;
        let prevStatus = item.status;
        
        // 1. Check Scheduled -> Published
        if (item.status === 'Scheduled' && item.scheduleTime) {
          const scheduleDate = new Date(item.scheduleTime);
          if (now >= scheduleDate) {
            item.status = 'Published';
            item.reach = Math.floor(Math.random() * 8000 + 2000);
            item.deliveryRate = parseFloat((Math.random() * 3 + 97).toFixed(1));
            item.readRate = parseFloat((Math.random() * 30 + 45).toFixed(1));
            item.clickRate = parseFloat((Math.random() * 15 + 8).toFixed(1));
            item.engagementRate = parseFloat((Math.random() * 20 + 35).toFixed(1));
            item.avgReadTime = Math.floor(Math.random() * 60 + 20);
            item.updatedAt = now.toISOString();
            changed = true;
            
            // Log it asynchronously
            communicationAuditService.logAction({
              action: 'Published',
              announcementId: item.id,
              announcementTitle: item.title,
              prevValue: prevStatus,
              newValue: 'Published',
              reason: 'Scheduled publication triggered by background scheduler job.',
              audience: item.targetAudience,
              community: item.community,
              operator: 'System Scheduler'
            });
          }
        }
        
        // 2. Check Published -> Expired
        if (item.status === 'Published' && item.endDate) {
          // Compare only dates or full timestamps depending on detail
          const endDate = new Date(item.endDate + 'T23:59:59Z');
          if (now > endDate) {
            item.status = 'Expired';
            item.updatedAt = now.toISOString();
            changed = true;
            
            communicationAuditService.logAction({
              action: 'Archived',
              announcementId: item.id,
              announcementTitle: item.title,
              prevValue: prevStatus,
              newValue: 'Expired',
              reason: 'Auto-expired: End date exceeded campaign duration.',
              audience: item.targetAudience,
              community: item.community,
              operator: 'System Scheduler'
            });
          }
        }

        if (changed) {
          updatedCount++;
        }
        return item;
      });

      if (updatedCount > 0) {
        localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(updatedList));
      }

      return { success: true, processed: updatedCount };
    } catch (e) {
      console.error('Scheduler processing error:', e);
      return { success: false, error: e.message };
    }
  }
}

export const communicationSchedulerService = new CommunicationSchedulerService();
