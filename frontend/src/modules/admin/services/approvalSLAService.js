class ApprovalSLAService {
  getSLARemainingTime(slaDeadline, status) {
    if (['Approved', 'Rejected', 'Completed', 'Archived'].includes(status)) {
      return 'Completed';
    }

    const diff = new Date(slaDeadline).getTime() - Date.now();
    const hours = Math.round(diff / (1000 * 60 * 60));

    if (hours < 0) {
      return `Overdue by ${Math.abs(hours)}h`;
    } else if (hours === 0) {
      const minutes = Math.round(diff / (1000 * 60));
      return `${minutes}m remaining`;
    }
    return `${hours}h remaining`;
  }

  isOverdue(slaDeadline, status) {
    if (['Approved', 'Rejected', 'Completed', 'Archived'].includes(status)) {
      return false;
    }
    return new Date(slaDeadline).getTime() < Date.now();
  }

  getSLAColor(slaDeadline, status) {
    if (['Approved', 'Rejected', 'Completed', 'Archived'].includes(status)) {
      return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }

    const diff = new Date(slaDeadline).getTime() - Date.now();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 0) {
      return 'text-rose-500 bg-rose-500/10 border-rose-500/20 animate-pulse';
    } else if (hours <= 24) {
      return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    }
    return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
  }

  getEscalationSuggestion(item) {
    if (this.isOverdue(item.slaDeadline, item.status)) {
      return 'Suggested Action: Auto-escalate to Master Board due to SLA breach.';
    }

    const diff = new Date(item.slaDeadline).getTime() - Date.now();
    const hours = diff / (1000 * 60 * 60);

    if (hours > 0 && hours < 12 && ['High', 'Critical'].includes(item.priority)) {
      return 'Suggested Action: Reassign or escalate immediately. Less than 12 hours remaining for critical ticket.';
    }

    return null;
  }

  calculateSLAStats(approvals = []) {
    const activeApprovals = approvals.filter(
      item => !['Approved', 'Rejected', 'Completed', 'Archived'].includes(item.status)
    );

    const overdueCount = activeApprovals.filter(item => this.isOverdue(item.slaDeadline, item.status)).length;
    const nearBreachCount = activeApprovals.filter(item => {
      const diff = new Date(item.slaDeadline).getTime() - Date.now();
      const hours = diff / (1000 * 60 * 60);
      return hours > 0 && hours <= 24;
    }).length;

    return {
      totalActive: activeApprovals.length,
      overdueCount,
      nearBreachCount,
      complianceRate: approvals.length > 0 
        ? Math.round(((approvals.length - overdueCount) / approvals.length) * 100) 
        : 100
    };
  }
}

export const approvalSLAService = new ApprovalSLAService();
export default approvalSLAService;
