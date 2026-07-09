import { approvalQueueService } from './approvalQueueService';
import { approvalAuditService } from './approvalAuditService';
import { approvalNotificationService } from './approvalNotificationService';

class ApprovalWorkflowService {
  async _transition(id, newStatus, actionName, adminName = 'Master Admin', extraFields = {}, reason = '') {
    const item = await approvalQueueService.getApproval(id);
    if (!item) throw new Error(`Approval record ${id} not found.`);

    // Conflict protection: prevent transitions on completed items unless reopening/restoring
    if (['Completed', 'Approved', 'Rejected', 'Archived'].includes(item.status) && 
        !['Reopen Request', 'Restore Request', 'Archive Request'].includes(actionName)) {
      throw new Error(`Cannot transition record ${id} from terminal status ${item.status}.`);
    }

    const oldStatus = item.status;
    const now = new Date().toISOString();
    
    // Timeline entry
    const timelineEntry = {
      id: `t-${id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: actionName,
      performedBy: adminName,
      role: 'Master Admin',
      timestamp: now,
      notes: reason || `${actionName} executed successfully.`
    };

    // Audit Entry
    const auditEntry = {
      id: `aud-${id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: now,
      admin: adminName,
      actionType: actionName,
      oldValue: oldStatus,
      newValue: newStatus,
      details: `${adminName} executed ${actionName} transition.`,
      reason: reason || 'N/A'
    };

    const updatedTimeline = [...(item.timeline || []), timelineEntry];
    const updatedAudits = [...(item.auditHistory || []), auditEntry];

    // Build update object
    const updateData = {
      status: newStatus,
      timeline: updatedTimeline,
      auditHistory: updatedAudits,
      updatedAt: now,
      lastReviewedBy: adminName,
      ...extraFields
    };

    // 1. Commit to DB Queue
    const updatedItem = await approvalQueueService.updateApproval(id, updateData);

    // 2. Commit to Global Audits
    await approvalAuditService.logAction({
      requestId: id,
      actionType: actionName,
      admin: adminName,
      oldValue: oldStatus,
      newValue: newStatus,
      module: item.module,
      community: item.community,
      reason: reason || 'Executed state transition'
    });

    // 3. Trigger Notification
    const notifMsg = `Approval request ${id} (${item.module}) has been updated to ${newStatus} by ${adminName}.`;
    await approvalNotificationService.sendNotification(item.submittedBy?.email || 'member@example.com', 'Member', actionName, notifMsg);

    if (item.assignedHead) {
      const headMsg = `Workflow assignment update on ticket ${id}: Status moved to ${newStatus}.`;
      await approvalNotificationService.sendNotification(item.assignedHead.email, 'Community Head', 'Assignment Status Update', headMsg);
    }

    return updatedItem;
  }

  // --- Core Single Actions ---

  async approve(id, notes = '', adminName = 'Master Admin') {
    return this._transition(id, 'Approved', 'Approve Request', adminName, { approvalStage: 'Completed' }, notes || 'Request satisfied audit conditions.');
  }

  async reject(id, reason = '', adminName = 'Master Admin') {
    return this._transition(id, 'Rejected', 'Reject Request', adminName, { approvalStage: 'Completed' }, reason || 'Criteria not met during verification review.');
  }

  async requestModification(id, notes = '', adminName = 'Master Admin') {
    return this._transition(id, 'Returned', 'Request Modification', adminName, { approvalStage: 'Initial Stage' }, notes || 'Request sent back for editing or detail supplement.');
  }

  async escalate(id, notes = '', adminName = 'Master Admin') {
    return this._transition(id, 'Escalated', 'Escalate Request', adminName, { priority: 'Critical' }, notes || 'Escalated to Master Admin Panel for immediate resolution.');
  }

  async assignReviewer(id, reviewerName, reviewerId, adminName = 'Master Admin') {
    const extra = {
      assignedHead: { name: reviewerName, id: reviewerId, email: `${reviewerName.toLowerCase().replace(' ', '')}@example.com` },
      approvalStage: 'Document Check'
    };
    return this._transition(id, 'Assigned Reviewer', 'Assign Reviewer', adminName, extra, `Assigned review responsibility to ${reviewerName}.`);
  }

  async reassignReviewer(id, reviewerName, reviewerId, adminName = 'Master Admin') {
    const extra = {
      assignedHead: { name: reviewerName, id: reviewerId, email: `${reviewerName.toLowerCase().replace(' ', '')}@example.com` }
    };
    return this._transition(id, 'Assigned Reviewer', 'Reassign Reviewer', adminName, extra, `Reassigned review responsibility to ${reviewerName}.`);
  }

  async overrideDecision(id, newStatus, reason = '', adminName = 'Master Admin') {
    if (!reason || reason.trim() === '') {
      throw new Error('Override action requires a mandatory reason.');
    }
    const item = await approvalQueueService.getApproval(id);
    if (!item) throw new Error(`Approval record ${id} not found.`);

    const overrideDetails = {
      headDecision: item.status,
      overriddenBy: adminName,
      overrideReason: reason,
      date: new Date().toISOString()
    };

    return this._transition(id, newStatus, 'Override Decision', adminName, { overrideDetails, approvalStage: 'Final Override' }, reason);
  }

  async suspendApproval(id, reason = '', adminName = 'Master Admin') {
    return this._transition(id, 'Waiting Documents', 'Suspend Approval', adminName, {}, reason || 'Approval suspended pending document verification.');
  }

  async archiveApproval(id, adminName = 'Master Admin') {
    return this._transition(id, 'Archived', 'Archive Request', adminName, {}, 'Request archived.');
  }

  async restoreApproval(id, adminName = 'Master Admin') {
    return this._transition(id, 'Pending', 'Restore Request', adminName, {}, 'Restored request from archive.');
  }

  async reopenApproval(id, adminName = 'Master Admin') {
    return this._transition(id, 'Under Review', 'Reopen Request', adminName, { approvalStage: 'Initial Stage' }, 'Reopened completed request for re-audit.');
  }

  // --- Bulk Operations ---

  async bulkApprove(ids = [], adminName = 'Master Admin') {
    const results = [];
    for (const id of ids) {
      try {
        const res = await this.approve(id, 'Approved via Bulk Action.', adminName);
        results.push(res);
      } catch (err) {
        console.error(`Bulk Approve failed for ${id}:`, err.message);
      }
    }
    return results;
  }

  async bulkReject(ids = [], reason = '', adminName = 'Master Admin') {
    const results = [];
    for (const id of ids) {
      try {
        const res = await this.reject(id, reason || 'Rejected via Bulk Action.', adminName);
        results.push(res);
      } catch (err) {
        console.error(`Bulk Reject failed for ${id}:`, err.message);
      }
    }
    return results;
  }

  async bulkAssign(ids = [], reviewerName, reviewerId, adminName = 'Master Admin') {
    const results = [];
    for (const id of ids) {
      try {
        const res = await this.assignReviewer(id, reviewerName, reviewerId, adminName);
        results.push(res);
      } catch (err) {
        console.error(`Bulk Assign failed for ${id}:`, err.message);
      }
    }
    return results;
  }

  async bulkArchive(ids = [], adminName = 'Master Admin') {
    const results = [];
    for (const id of ids) {
      try {
        const res = await this.archiveApproval(id, adminName);
        results.push(res);
      } catch (err) {
        console.error(`Bulk Archive failed for ${id}:`, err.message);
      }
    }
    return results;
  }

  async bulkStatusUpdate(ids = [], status, adminName = 'Master Admin') {
    const results = [];
    for (const id of ids) {
      try {
        const res = await this._transition(id, status, 'Bulk Status Update', adminName, {}, `Status updated in bulk to ${status}`);
        results.push(res);
      } catch (err) {
        console.error(`Bulk Status Update failed for ${id}:`, err.message);
      }
    }
    return results;
  }
}

export const approvalWorkflowService = new ApprovalWorkflowService();
export default approvalWorkflowService;
