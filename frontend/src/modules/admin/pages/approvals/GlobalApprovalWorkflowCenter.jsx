import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Search, Sliders, RefreshCw, Download, Plus, Eye, Edit3, 
  Archive, Trash2, CheckCircle2, XCircle, MapPin, Calendar, ArrowUpRight, 
  Info, FileText, ChevronRight, Phone, Globe, Clock, CheckSquare, ShieldX, 
  TrendingUp, Sparkles, AlertTriangle, Filter, Users, Send, Check, X, Printer,
  User, Award, ShieldCheck, HelpCircle, ChevronDown, ChevronUp, FileSpreadsheet,
  EyeOff, MoreVertical
} from 'lucide-react';
import { Avatar } from '../../../member/components/common/Avatar';

// Import Services
import { approvalQueueService } from '../../services/approvalQueueService';
import { approvalWorkflowService } from '../../services/approvalWorkflowService';
import { approvalAnalyticsService } from '../../services/approvalAnalyticsService';
import { approvalAuditService } from '../../services/approvalAuditService';
import { approvalNotificationService } from '../../services/approvalNotificationService';
import { approvalSLAService } from '../../services/approvalSLAService';

// Import Custom SVG charts
import { LineChart, AreaChart, BarChart, DonutChart, Sparkline } from '../../../head/pages/reports/components/ChartComponents';

export default function GlobalApprovalWorkflowCenter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'queue'; // queue | analytics | audits | notifications

  // Core Data States
  const [approvals, setApprovals] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    module: 'All',
    community: 'All',
    city: 'All',
    priority: 'All',
    status: 'All',
    approvalStage: 'All',
    assignedReviewer: 'All',
    slaStatus: 'All',
    startDate: '',
    endDate: '',
    sort: 'newest'
  });

  // Saved/Preset Filters Mock
  const [savedPresets, setSavedPresets] = useState([
    { name: 'SLA Breached Criticals', filters: { priority: 'Critical', slaStatus: 'Overdue', status: 'All' } },
    { name: 'Pending Registrations', filters: { module: 'Member Registration', status: 'Pending', priority: 'All' } }
  ]);
  const [recentSearches, setRecentSearches] = useState(['APP-2005', 'Matrimonial', 'Indore']);

  // Table Selections
  const [selectedIds, setSelectedIds] = useState([]);

  // Detail Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [drawerTab, setDrawerTab] = useState('details'); // details | applicant | documents | timeline | related | comments | audits

  // Action Modals State
  const [activeModal, setActiveModal] = useState(null); // approve | reject | modify | escalate | assign | override | suspend | bulk_status | bulk_assign | confirm_bulk
  const [modalItem, setModalItem] = useState(null);
  const [notesInput, setNotesInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [selectedReviewer, setSelectedReviewer] = useState({ name: 'Vikash Namdev', id: 'CH-AG-901' });
  const [bulkActionType, setBulkActionType] = useState(''); // approve | reject | archive | status_update
  const [bulkStatusToUpdate, setBulkStatusToUpdate] = useState('Pending');

  // UI Toast State
  const [toast, setToast] = useState(null);
  
  // Available review heads list
  const reviewersList = [
    { name: 'Vikash Namdev', id: 'CH-AG-901', email: 'vikash.head@example.com' },
    { name: 'Amit Sharma', id: 'CH-BR-902', email: 'amit.head@example.com' },
    { name: 'Sanjay Agrawal', id: 'CH-MH-903', email: 'sanjay.head@example.com' },
    { name: 'Preeti Patidar', id: 'CH-PT-904', email: 'preeti.head@example.com' }
  ];

  // Modules list for filters
  const modulesList = [
    'Member Registration', 'Member Verification', 'Family Verification', 'Matrimonial Profile', 
    'Professional Listing', 'Event Creation', 'Event Update', 'Community Fund Request', 
    'Donation Campaign', 'Community Transfer Request', 'Community Head Request', 
    'Featured Listing', 'Featured Event', 'CMS Publishing', 'Banner Publishing', 'Announcement Publishing'
  ];

  const communitiesList = ['Agrawal Samaj', 'Brahmin Samaj', 'Maheshwari Samaj', 'Patidar Samaj', 'Khandelwal Samaj', 'Jain Samaj'];
  const citiesList = ['Indore', 'Mumbai', 'Ahmedabad', 'Jaipur', 'Pune', 'Delhi'];

  // Toast Trigger
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load All System Records
  const loadSystemData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load Approvals
      const approvalsRes = await approvalQueueService.getApprovals({
        searchQuery,
        ...filters
      });
      setApprovals(approvalsRes.data);

      // Load Analytics
      const analyticsRes = await approvalAnalyticsService.getDashboardAnalytics();
      setAnalytics(analyticsRes);

      // Load System Audits
      const auditsRes = await approvalAuditService.getLogs();
      setAuditLogs(auditsRes.data);

      // Load Notifications
      const notifsRes = await approvalNotificationService.notificationHistory();
      setNotifications(notifsRes);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch approval queue datasets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystemData();
  }, [
    activeTab,
    searchQuery,
    filters.module,
    filters.community,
    filters.city,
    filters.priority,
    filters.status,
    filters.approvalStage,
    filters.assignedReviewer,
    filters.slaStatus,
    filters.startDate,
    filters.endDate,
    filters.sort
  ]);

  // Handle preset application
  const applyPreset = (presetFilters) => {
    setFilters(prev => ({
      ...prev,
      ...presetFilters
    }));
    showToast('Applied search preset filters');
  };

  // Reset Filters
  const handleResetFilters = () => {
    setFilters({
      module: 'All',
      community: 'All',
      city: 'All',
      priority: 'All',
      status: 'All',
      approvalStage: 'All',
      assignedReviewer: 'All',
      slaStatus: 'All',
      startDate: '',
      endDate: '',
      sort: 'newest'
    });
    setSearchQuery('');
    showToast('Filters cleared');
  };

  // Single Action Execution wrappers
  const handleActionClick = (action, item) => {
    setModalItem(item);
    setNotesInput('');
    setReasonInput('');
    setActiveModal(action);
  };

  const executeSingleAction = async (e) => {
    e.preventDefault();
    if (!modalItem) return;

    try {
      let updatedRecord = null;
      const adminName = 'Master Admin';

      switch (activeModal) {
        case 'approve':
          updatedRecord = await approvalWorkflowService.approve(modalItem.id, notesInput, adminName);
          showToast(`Request ${modalItem.id} Approved successfully!`);
          break;
        case 'reject':
          updatedRecord = await approvalWorkflowService.reject(modalItem.id, reasonInput, adminName);
          showToast(`Request ${modalItem.id} Rejected.`, 'error');
          break;
        case 'modify':
          updatedRecord = await approvalWorkflowService.requestModification(modalItem.id, notesInput, adminName);
          showToast(`Modification requested for ${modalItem.id}.`, 'warning');
          break;
        case 'escalate':
          updatedRecord = await approvalWorkflowService.escalate(modalItem.id, notesInput, adminName);
          showToast(`Ticket ${modalItem.id} Escalated to Board!`, 'warning');
          break;
        case 'assign':
          updatedRecord = await approvalWorkflowService.assignReviewer(modalItem.id, selectedReviewer.name, selectedReviewer.id, adminName);
          showToast(`Reviewer ${selectedReviewer.name} assigned to ${modalItem.id}.`);
          break;
        case 'override':
          if (!reasonInput || reasonInput.trim() === '') {
            showToast('Override Reason is mandatory!', 'error');
            return;
          }
          // Toggles opposite status for mock demonstration
          const nextStatus = modalItem.status === 'Rejected' ? 'Approved' : 'Rejected';
          updatedRecord = await approvalWorkflowService.overrideDecision(modalItem.id, nextStatus, reasonInput, adminName);
          showToast(`Overrode Decision on ${modalItem.id} to ${nextStatus}!`);
          break;
        case 'suspend':
          updatedRecord = await approvalWorkflowService.suspendApproval(modalItem.id, reasonInput, adminName);
          showToast(`Request ${modalItem.id} Suspended.`, 'warning');
          break;
        case 'archive':
          updatedRecord = await approvalWorkflowService.archiveApproval(modalItem.id, adminName);
          showToast(`Request ${modalItem.id} Archived.`);
          break;
        case 'restore':
          updatedRecord = await approvalWorkflowService.restoreApproval(modalItem.id, adminName);
          showToast(`Request ${modalItem.id} Restored.`);
          break;
        case 'reopen':
          updatedRecord = await approvalWorkflowService.reopenApproval(modalItem.id, adminName);
          showToast(`Request ${modalItem.id} Reopened for audits.`);
          break;
        default:
          break;
      }

      setActiveModal(null);
      setModalItem(null);
      loadSystemData();

      // If drawer is open with this item, refresh drawer view
      if (isDrawerOpen && selectedItem?.id === modalItem.id) {
        const fresh = await approvalQueueService.getApproval(modalItem.id);
        setSelectedItem(fresh);
      }

    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Add Comment on Detail Drawer
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!notesInput || notesInput.trim() === '' || !selectedItem) return;

    try {
      const updatedComments = [
        ...(selectedItem.comments || []),
        {
          id: `comm-new-${Date.now()}`,
          user: 'Master Admin',
          role: 'Platform Owner',
          text: notesInput,
          timestamp: new Date().toISOString()
        }
      ];

      const refreshed = await approvalQueueService.updateApproval(selectedItem.id, { comments: updatedComments });
      
      // Log audit
      await approvalAuditService.logAction({
        requestId: selectedItem.id,
        actionType: 'Comment Added',
        admin: 'Master Admin',
        oldValue: 'N/A',
        newValue: 'Comment Added',
        module: selectedItem.module,
        community: selectedItem.community,
        reason: `Comment text: ${notesInput}`
      });

      setSelectedItem(refreshed);
      setNotesInput('');
      showToast('Comment posted successfully');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Individual Doc verification action inside Drawer
  const handleVerifyDocument = async (docId, verifyStatus, notes = '') => {
    try {
      const updatedDocs = selectedItem.documents.map(d => {
        if (d.id === docId) {
          return { ...d, status: verifyStatus, notes };
        }
        return d;
      });

      const refreshed = await approvalQueueService.updateApproval(selectedItem.id, { documents: updatedDocs });
      
      await approvalAuditService.logAction({
        requestId: selectedItem.id,
        actionType: 'Document Review',
        admin: 'Master Admin',
        oldValue: `Doc ${docId} Pending`,
        newValue: `Doc ${docId} ${verifyStatus}`,
        module: selectedItem.module,
        community: selectedItem.community,
        reason: notes || 'Reviewed via supporting documents panel.'
      });

      setSelectedItem(refreshed);
      showToast(`Document marked as ${verifyStatus}!`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Selection helpers
  const handleRowSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === approvals.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(approvals.map(item => item.id));
    }
  };

  // Bulk Operations execution
  const executeBulkAction = async () => {
    if (selectedIds.length === 0) return;

    try {
      const adminName = 'Master Admin';
      let count = selectedIds.length;

      switch (bulkActionType) {
        case 'approve':
          await approvalWorkflowService.bulkApprove(selectedIds, adminName);
          showToast(`Bulk Approved ${count} requests successfully!`);
          break;
        case 'reject':
          await approvalWorkflowService.bulkReject(selectedIds, reasonInput || 'Rejected via Master Bulk Action.', adminName);
          showToast(`Bulk Rejected ${count} requests.`, 'error');
          break;
        case 'assign':
          await approvalWorkflowService.bulkAssign(selectedIds, selectedReviewer.name, selectedReviewer.id, adminName);
          showToast(`Assigned ${count} requests to ${selectedReviewer.name}.`);
          break;
        case 'archive':
          await approvalWorkflowService.bulkArchive(selectedIds, adminName);
          showToast(`Archived ${count} requests.`);
          break;
        case 'status_update':
          await approvalWorkflowService.bulkStatusUpdate(selectedIds, bulkStatusToUpdate, adminName);
          showToast(`Updated status for ${count} requests to ${bulkStatusToUpdate}.`);
          break;
        default:
          break;
      }

      setSelectedIds([]);
      setActiveModal(null);
      loadSystemData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Export functions
  const triggerExport = (format, type) => {
    let dataset = [];
    if (type === 'selected') {
      dataset = approvals.filter(item => selectedIds.includes(item.id));
    } else if (type === 'filtered') {
      dataset = approvals;
    } else {
      dataset = approvals; // full mock
    }

    if (dataset.length === 0) {
      showToast('No records selected for export.', 'warning');
      return;
    }

    if (format === 'Print') {
      window.print();
      return;
    }

    // Trigger mock file download
    const filename = `approval_workflow_report_${Date.now()}.${format.toLowerCase()}`;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataset, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast(`Exported ${dataset.length} records in ${format} format!`);
  };

  // Row Details View trigger
  const openItemDetails = (item) => {
    setSelectedItem(item);
    setDrawerTab('details');
    setIsDrawerOpen(true);
  };

  // Status visual mapping
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
      case 'Completed':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600';
      case 'Rejected':
        return 'bg-rose-500/10 border-rose-500/20 text-rose-600';
      case 'Pending':
        return 'bg-purple-500/10 border-purple-500/20 text-purple-600';
      case 'Under Review':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-600';
      case 'Assigned Reviewer':
        return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-600';
      case 'Waiting Documents':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-600 animate-pulse';
      case 'Returned':
        return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600';
      case 'Escalated':
        return 'bg-red-500/10 border-red-500/20 text-red-600 font-extrabold animate-pulse';
      default:
        return 'bg-slate-50 border-slate-100 text-slate-500';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-500/10 text-red-600 border border-red-500/20 font-black animate-bounce';
      case 'High':
        return 'bg-orange-500/10 text-orange-600 border border-orange-500/20 font-extrabold';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold';
      default:
        return 'bg-slate-100 text-slate-600 border border-slate-200/50';
    }
  };

  // Chart Rendering data calculation helper
  const chartTrends = useMemo(() => {
    if (!analytics) return { labels: [], dataset: [] };
    return {
      labels: analytics.charts.trendLabels,
      dataset: analytics.charts.trendData
    };
  }, [analytics]);

  const activeTabClass = (tabId) => {
    return activeTab === tabId 
      ? 'border-purple-600 text-purple-600 font-extrabold bg-purple-50/50' 
      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 font-semibold';
  };

  return (
    <div className="space-y-6 relative min-h-screen pb-16">
      
      {/* Background Decorative Auras */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-purple-500/5 filter blur-[100px]" />
        <div className="absolute top-[40%] -right-[10%] w-[600px] h-[600px] rounded-full bg-violet-600/5 filter blur-[120px]" />
      </div>

      {/* ─── TOAST PANEL ─── */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-55 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-md ${
              toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
              toast.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
              toast.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
              'bg-purple-500/10 border-purple-500/20 text-purple-400'
            }`}
          >
            <CheckCircle2 size={18} />
            <span className="text-xs font-black tracking-wide uppercase">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── HEADER SECTION ─── */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-purple-600" />
            Global Approval & Workflow Orchestration Center
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Master workspace to verify registrations, audit listings, assign tasks, and override decision paths across all Platform Chapters.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => loadSystemData()}
            className="p-2.5 rounded-xl bg-white border border-slate-100 hover:bg-slate-50 text-slate-600 transition-all flex items-center gap-1.5 shadow-sm text-xs font-bold"
            title="Reload ledgers"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Ledgers
          </button>
        </div>
      </section>

      {/* ─── NAVIGATION TAB BAR ─── */}
      <div className="border-b border-slate-100 flex items-center gap-1 overflow-x-auto no-scrollbar py-1 relative z-10">
        {[
          { id: 'queue', label: 'Unified Approvals Queue', icon: CheckSquare },
          { id: 'analytics', label: 'Analytics Workspace', icon: TrendingUp },
          { id: 'audits', label: 'Central Audit Center', icon: Clock },
          { id: 'notifications', label: 'Alert Notification Log', icon: ShieldAlert }
        ].map(tabItem => {
          const TabIcon = tabItem.icon;
          return (
            <button
              key={tabItem.id}
              onClick={() => setSearchParams({ tab: tabItem.id })}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs border-b-2 transition-all whitespace-nowrap rounded-t-xl ${activeTabClass(tabItem.id)}`}
            >
              <TabIcon size={14} />
              {tabItem.label}
            </button>
          );
        })}
      </div>

      {loading && approvals.length === 0 ? (
        /* Skeleton Loading UI */
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-white/60 border border-slate-100 animate-pulse" />
            ))}
          </div>
          <div className="h-96 rounded-3xl bg-white/60 border border-slate-100 animate-pulse" />
        </div>
      ) : (
        <div className="space-y-6 relative z-10">

          {/* ────────────────────────────────────────────────────────── */}
          {/* TAB: QUEUE (Unified Workspace)                           */}
          {/* ────────────────────────────────────────────────────────── */}
          {activeTab === 'queue' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Executive Dashboard KPI Cards Grid */}
              {analytics && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { title: 'Pending Queue', value: analytics.stats.pendingCount, subtext: 'Awaiting reviews', color: 'text-purple-600', icon: CheckSquare, filter: 'Pending' },
                    { title: 'Approved Total', value: analytics.stats.approvedToday, subtext: 'Access Granted', color: 'text-emerald-600', icon: CheckCircle2, filter: 'Approved' },
                    { title: 'SLA Breaches', value: analytics.stats.slaViolations, subtext: 'Overdue tickets', color: 'text-rose-600', icon: ShieldX, filter: 'Overdue' },
                    { title: 'Escalated Tasks', value: analytics.stats.escalated, subtext: 'High-risk escalations', color: 'text-red-600', icon: AlertTriangle, filter: 'Escalated' }
                  ].map((kpi, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setFilters(prev => ({ ...prev, status: kpi.filter === 'Overdue' ? 'All' : kpi.filter, slaStatus: kpi.filter === 'Overdue' ? 'Overdue' : 'All' }))}
                      className="card-neo p-5 bg-white/70 border border-slate-100 hover:border-purple-500/20 hover:shadow-xl hover:shadow-purple-500/5 transition-all group cursor-pointer flex flex-col justify-between backdrop-blur-md rounded-2xl relative"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.title}</span>
                          <h4 className={`text-2xl font-black mt-2 tracking-tight transition-colors ${kpi.color}`}>{kpi.value}</h4>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                          <kpi.icon size={18} />
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{kpi.subtext}</span>
                        <span className="text-purple-600 font-extrabold uppercase tracking-widest flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                          Filter <ArrowUpRight size={10} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Advanced Filters Toolbar (Sticky-ready) */}
              <div className="card-neo p-4 bg-white/80 border border-slate-100 rounded-2xl backdrop-blur-md space-y-4">
                
                {/* Search Bar & Preset Quick-Links */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-3 border-b border-slate-100/50">
                  <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
                    <input 
                      type="text"
                      placeholder="Search ID, Member Name, Samaj, City, Phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-xs border border-slate-100 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  {/* Preset Tags */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Presets:</span>
                    {savedPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => applyPreset(preset.filters)}
                        className="px-2.5 py-1 text-[10px] rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100/80 transition-colors font-bold"
                      >
                        {preset.name}
                      </button>
                    ))}
                    <button 
                      onClick={handleResetFilters}
                      className="text-[10px] font-black text-slate-500 hover:text-purple-600 flex items-center gap-1 ml-auto md:ml-2"
                    >
                      <Sliders size={12} /> Reset Filters
                    </button>
                  </div>
                </div>

                {/* Multipurpose Dropdown Filters */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Queue Module</label>
                    <select
                      value={filters.module}
                      onChange={(e) => setFilters(prev => ({ ...prev, module: e.target.value }))}
                      className="w-full text-xs p-2 bg-slate-50/50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500/25"
                    >
                      <option value="All">All Modules</option>
                      {modulesList.map(mod => <option key={mod} value={mod}>{mod}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Samaj Chapter</label>
                    <select
                      value={filters.community}
                      onChange={(e) => setFilters(prev => ({ ...prev, community: e.target.value }))}
                      className="w-full text-xs p-2 bg-slate-50/50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500/25"
                    >
                      <option value="All">All Communities</option>
                      {communitiesList.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Priority</label>
                    <select
                      value={filters.priority}
                      onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full text-xs p-2 bg-slate-50/50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500/25"
                    >
                      <option value="All">All Priorities</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full text-xs p-2 bg-slate-50/50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500/25"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Assigned Reviewer">Assigned Reviewer</option>
                      <option value="Waiting Documents">Waiting Documents</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Returned">Returned</option>
                      <option value="Escalated">Escalated</option>
                      <option value="Completed">Completed</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">SLA Status</label>
                    <select
                      value={filters.slaStatus}
                      onChange={(e) => setFilters(prev => ({ ...prev, slaStatus: e.target.value }))}
                      className="w-full text-xs p-2 bg-slate-50/50 border border-slate-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500/25"
                    >
                      <option value="All">All SLA States</option>
                      <option value="Normal">Normal SLA</option>
                      <option value="Overdue">Overdue Breach</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bulk Action Panel & Selection Controls */}
              {selectedIds.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-purple-900 text-white rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-xl shadow-purple-950/20"
                >
                  <div className="flex items-center gap-2">
                    <CheckSquare size={16} />
                    <span className="text-xs font-black">{selectedIds.length} Requests Selected</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => { setBulkActionType('approve'); executeBulkAction(); }}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-xs font-black transition-colors"
                    >
                      Bulk Approve
                    </button>
                    <button
                      onClick={() => { setBulkActionType('reject'); handleActionClick('bulk_reject', {}); }}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-xs font-black transition-colors"
                    >
                      Bulk Reject
                    </button>
                    <button
                      onClick={() => handleActionClick('bulk_assign', {})}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-xs font-black transition-colors"
                    >
                      Bulk Assign Reviewer
                    </button>
                    <button
                      onClick={() => { setBulkActionType('archive'); executeBulkAction(); }}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-800 text-xs font-black transition-colors border border-slate-600"
                    >
                      Bulk Archive
                    </button>
                    <button
                      onClick={() => handleActionClick('bulk_status', {})}
                      className="px-3.5 py-1.5 rounded-lg bg-purple-800 hover:bg-purple-750 text-xs font-black transition-colors border border-purple-700"
                    >
                      Bulk Status Update
                    </button>
                    
                    <div className="h-6 w-px bg-purple-700/50 mx-2" />

                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => triggerExport('CSV', 'selected')}
                        className="p-1.5 rounded bg-purple-800 hover:bg-purple-750 text-[10px] font-bold"
                        title="Export selected as CSV"
                      >
                        CSV
                      </button>
                      <button 
                        onClick={() => triggerExport('JSON', 'selected')}
                        className="p-1.5 rounded bg-purple-800 hover:bg-purple-750 text-[10px] font-bold"
                        title="Export selected as JSON"
                      >
                        JSON
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Data Table */}
              <div className="card-neo bg-white/70 border border-slate-100 rounded-3xl backdrop-blur-md overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="py-4.5 px-4 w-12 text-center">
                          <input 
                            type="checkbox"
                            checked={selectedIds.length > 0 && selectedIds.length === approvals.length}
                            onChange={handleSelectAll}
                            className="rounded text-purple-600 focus:ring-purple-500"
                          />
                        </th>
                        <th className="py-4.5 px-4">Approval ID</th>
                        <th className="py-4.5 px-4">Module / Queue Type</th>
                        <th className="py-4.5 px-4">Applicant</th>
                        <th className="py-4.5 px-4">Samaj / City</th>
                        <th className="py-4.5 px-4 text-center">Priority</th>
                        <th className="py-4.5 px-4 text-center">SLA Clock</th>
                        <th className="py-4.5 px-4">Reviewer</th>
                        <th className="py-4.5 px-4 text-center">Status</th>
                        <th className="py-4.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50 text-xs text-slate-700">
                      {approvals.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-12 text-center text-slate-400 font-bold">
                            <Sliders size={28} className="mx-auto text-slate-300 mb-2" />
                            No approval requests found matching search criteria.
                          </td>
                        </tr>
                      ) : (
                        approvals.map(item => {
                          const isOverdue = approvalSLAService.isOverdue(item.slaDeadline, item.status);
                          const remainingText = approvalSLAService.getSLARemainingTime(item.slaDeadline, item.status);
                          const isSelected = selectedIds.includes(item.id);

                          return (
                            <tr 
                              key={item.id}
                              className={`hover:bg-purple-50/20 transition-all ${isSelected ? 'bg-purple-50/10' : ''}`}
                            >
                              <td className="py-3 px-4 text-center">
                                <input 
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleRowSelect(item.id)}
                                  className="rounded text-purple-600 focus:ring-purple-500"
                                />
                              </td>
                              <td className="py-3 px-4 font-extrabold text-slate-900">
                                <span className="hover:text-purple-600 cursor-pointer flex items-center gap-1" onClick={() => openItemDetails(item)}>
                                  {item.id} <Eye size={12} className="text-slate-400" />
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-extrabold text-slate-800">{item.title}</div>
                                <div className="text-[10px] text-slate-400 font-bold mt-0.5">{item.module}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-800">{item.applicant.name}</div>
                                <div className="text-[10px] text-slate-400 font-medium">{item.applicant.phone}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-800">{item.community}</div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                  <MapPin size={10} /> {item.city}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${getPriorityBadge(item.priority)}`}>
                                  {item.priority}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-extrabold flex items-center justify-center gap-1 mx-auto max-w-fit ${approvalSLAService.getSLAColor(item.slaDeadline, item.status)}`}>
                                  <Clock size={10} />
                                  {remainingText}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                {item.assignedHead ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-black text-purple-700">
                                      {item.assignedHead.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <span className="font-bold text-slate-800">{item.assignedHead.name}</span>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic">Unassigned</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide uppercase border ${getStatusBadge(item.status)}`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {/* Quick Actions */}
                                  {['Pending', 'Under Review', 'Assigned Reviewer', 'Waiting Documents'].includes(item.status) && (
                                    <>
                                      <button 
                                        onClick={() => handleActionClick('approve', item)}
                                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors"
                                        title="Approve immediately"
                                      >
                                        <Check size={14} />
                                      </button>
                                      <button 
                                        onClick={() => handleActionClick('reject', item)}
                                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors"
                                        title="Reject immediately"
                                      >
                                        <X size={14} />
                                      </button>
                                    </>
                                  )}
                                  
                                  {/* Override centers */}
                                  {['Approved', 'Rejected'].includes(item.status) && (
                                    <button
                                      onClick={() => handleActionClick('override', item)}
                                      className="px-2 py-1 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 hover:bg-amber-500 hover:text-white transition-colors text-[10px] font-black uppercase flex items-center gap-0.5"
                                      title="Override Decision"
                                    >
                                      <ShieldAlert size={11} /> Override
                                    </button>
                                  )}

                                  <button 
                                    onClick={() => openItemDetails(item)}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                                    title="Open Details Drawer"
                                  >
                                    <ChevronRight size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Paginations */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
                  <div className="flex items-center gap-1.5">
                    <span>Export Ledger Data:</span>
                    <button 
                      onClick={() => triggerExport('CSV', 'filtered')}
                      className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-100 font-bold"
                    >
                      CSV
                    </button>
                    <button 
                      onClick={() => triggerExport('JSON', 'filtered')}
                      className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-100 font-bold"
                    >
                      JSON
                    </button>
                    <button 
                      onClick={() => triggerExport('Print', 'filtered')}
                      className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-100 font-bold flex items-center gap-0.5"
                    >
                      <Printer size={10} /> Print
                    </button>
                  </div>
                  <span>Showing {approvals.length} of 25 Platform Approval Records</span>
                </div>
              </div>

            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* TAB: ANALYTICS (Charts & Workspace)                     */}
          {/* ────────────────────────────────────────────────────────── */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* SVG Trend Line Chart */}
                <div className="md:col-span-2 card-neo p-6 bg-white/80 border border-slate-100 rounded-3xl backdrop-blur-md space-y-4">
                  <div>
                    <h4 className="text-sm font-black text-slate-800">Weekly Approval Requests Trend</h4>
                    <p className="text-[10px] text-slate-400">Total volume of requests logged and resolved over last 7 days</p>
                  </div>
                  <div className="h-64 pt-6">
                    <AreaChart 
                      data={chartTrends.dataset} 
                      labels={chartTrends.labels} 
                      color="#8B5CF6" 
                      height={200}
                    />
                  </div>
                </div>

                {/* SVG Status distribution Donut Chart */}
                <div className="card-neo p-6 bg-white/80 border border-slate-100 rounded-3xl backdrop-blur-md flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-black text-slate-800">Current Queue Distribution</h4>
                    <p className="text-[10px] text-slate-400">Percentage distribution based on request status</p>
                  </div>
                  <div className="flex justify-center items-center py-6">
                    <DonutChart 
                      data={analytics.charts.statusData}
                      size={140}
                      colors={['#A855F7', '#3B82F6', '#10B981', '#EF4444', '#F59E0B']}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500 border-t border-slate-50 pt-3">
                    {analytics.charts.statusData.map((s, i) => (
                      <div key={s.name} className="flex items-center gap-1.5">
                        <span 
                          className="w-2 h-2 rounded-full inline-block" 
                          style={{ backgroundColor: ['#A855F7', '#3B82F6', '#10B981', '#EF4444', '#F59E0B'][i % 5] }}
                        />
                        <span>{s.name}: {s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Samaj Comparison report */}
              <div className="card-neo p-6 bg-white/80 border border-slate-100 rounded-3xl backdrop-blur-md space-y-4">
                <div>
                  <h4 className="text-sm font-black text-slate-800">Platform Chapter Comparison Matrix</h4>
                  <p className="text-[10px] text-slate-400">Evaluate queue volumes, SLA response times, rejection ratios, and escalation flags</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                        <th className="py-3 px-4">Samaj Chapter</th>
                        <th className="py-3 px-4 text-center">Pending Queue</th>
                        <th className="py-3 px-4 text-center">Avg Response SLA</th>
                        <th className="py-3 px-4 text-center">Rejection Count</th>
                        <th className="py-3 px-4 text-center">Completed count</th>
                        <th className="py-3 px-4 text-center">Escalated Flag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600 font-bold">
                      {analytics.charts.communityComparison.map((comp, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 text-slate-900 font-extrabold">{comp.community}</td>
                          <td className="py-3 px-4 text-center text-purple-600 font-black">{comp.pendingCount}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-700 text-[10px] font-black">
                              {comp.avgSpeed} Hours
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-rose-500">{comp.rejectedCount}</td>
                          <td className="py-3 px-4 text-center text-emerald-500">{comp.completedCount}</td>
                          <td className="py-3 px-4 text-center text-red-500">{comp.escalatedCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* TAB: AUDITS (Chronological Audit Logs)                   */}
          {/* ────────────────────────────────────────────────────────── */}
          {activeTab === 'audits' && (
            <div className="card-neo p-6 bg-white/80 border border-slate-100 rounded-3xl backdrop-blur-md space-y-4 animate-fade-in">
              <div>
                <h4 className="text-sm font-black text-slate-800">Immutable Audit Center Logs</h4>
                <p className="text-[10px] text-slate-400">Detailed system logging tracking changes, override operations, and bulk actions.</p>
              </div>

              <div className="overflow-x-auto border border-slate-100/50 rounded-2xl bg-slate-50/30">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Ticket</th>
                      <th className="py-3 px-4">Admin/Operator</th>
                      <th className="py-3 px-4">Action Event</th>
                      <th className="py-3 px-4">Old Status</th>
                      <th className="py-3 px-4">New Status</th>
                      <th className="py-3 px-4">Override/Review Reason</th>
                      <th className="py-3 px-4">System Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-bold">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 text-slate-400 text-[10px]">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="py-3 px-4 text-purple-600 font-black">{log.requestId || 'Global'}</td>
                        <td className="py-3 px-4 text-slate-900 font-extrabold">{log.admin}</td>
                        <td className="py-3 px-4 text-slate-800">{log.actionType}</td>
                        <td className="py-3 px-4 text-slate-400 font-medium">{log.oldValue}</td>
                        <td className="py-3 px-4 text-slate-800">{log.newValue}</td>
                        <td className="py-3 px-4 text-slate-500 font-medium italic">{log.reason || 'N/A'}</td>
                        <td className="py-3 px-4 text-slate-400 text-[10px] font-medium">{log.browserSession}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* TAB: NOTIFICATIONS (Simulated log)                       */}
          {/* ────────────────────────────────────────────────────────── */}
          {activeTab === 'notifications' && (
            <div className="card-neo p-6 bg-white/80 border border-slate-100 rounded-3xl backdrop-blur-md space-y-4 animate-fade-in">
              <div>
                <h4 className="text-sm font-black text-slate-800">Alert Dispatcher History</h4>
                <p className="text-[10px] text-slate-400">Verifying automated multi-channel messaging delivery triggers for Applicants & heads.</p>
              </div>

              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className="p-4 bg-slate-50/80 border border-slate-100 rounded-xl flex items-center justify-between gap-4 hover:border-purple-200 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-[9px] font-black uppercase">
                          {notif.eventType}
                        </span>
                        <span className="text-[10px] text-slate-400">{new Date(notif.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-700 font-bold mt-1">{notif.message}</p>
                      <div className="text-[10px] text-slate-400">
                        Recipient: <span className="font-extrabold text-slate-600">{notif.userId} ({notif.role})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {notif.channels.map(ch => (
                          <span key={ch} className="px-1.5 py-0.5 bg-slate-200/50 rounded text-[9px] font-bold text-slate-500">
                            {ch}
                          </span>
                        ))}
                      </div>
                      <span className="text-emerald-500 text-xs font-black flex items-center gap-0.5">
                        <CheckCircle2 size={12} /> {notif.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ─── DETAIL DRAWER (SLIDE OVER) ─── */}
      <AnimatePresence>
        {isDrawerOpen && selectedItem && (
          <>
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40"
            />
            {/* Drawer container */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-3xl bg-white border-l border-slate-100 shadow-2xl z-50 flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-purple-600 uppercase tracking-widest">{selectedItem.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatusBadge(selectedItem.status)}`}>
                      {selectedItem.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getPriorityBadge(selectedItem.priority)}`}>
                      {selectedItem.priority}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-800 mt-2">{selectedItem.title}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Origin module: {selectedItem.module}</p>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-xl bg-white border border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-slate-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Tab Navigation inside Drawer */}
              <div className="px-6 border-b border-slate-100 flex gap-2 overflow-x-auto no-scrollbar py-2.5 bg-slate-50/20">
                {[
                  { id: 'details', label: 'Request Details' },
                  { id: 'applicant', label: 'Applicant Details' },
                  { id: 'documents', label: 'Supporting Documents' },
                  { id: 'timeline', label: 'Approval Timeline' },
                  { id: 'related', label: 'Related Records' },
                  { id: 'comments', label: 'Comments Thread' },
                  { id: 'audits', label: 'Audit History' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setDrawerTab(t.id)}
                    className={`px-3 py-1.5 text-[11px] rounded-lg transition-all font-bold whitespace-nowrap ${
                      drawerTab === t.id 
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/10' 
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* 1. Request Details Tab */}
                {drawerTab === 'details' && (
                  <div className="space-y-4 animate-fade-in text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase">City Declared</span>
                        <div className="font-extrabold text-slate-800 mt-1">{selectedItem.city}</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase">SLA Clock Limit</span>
                        <div className="font-extrabold text-slate-800 mt-1">
                          {new Date(selectedItem.slaDeadline).toLocaleString()}
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Created On</span>
                        <div className="font-bold text-slate-700 mt-1">
                          {new Date(selectedItem.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Last Updated</span>
                        <div className="font-bold text-slate-700 mt-1">
                          {new Date(selectedItem.updatedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Verification Payload / Details</span>
                      <pre className="text-[11px] font-mono text-slate-600 bg-white p-3 rounded-xl border border-slate-100 overflow-x-auto">
                        {JSON.stringify(selectedItem.details, null, 2)}
                      </pre>
                    </div>

                    {selectedItem.overrideDetails && (
                      <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-2xl space-y-2">
                        <span className="text-[10px] font-black text-amber-600 uppercase flex items-center gap-1">
                          <ShieldAlert size={12} /> Master Override Flag Configured
                        </span>
                        <div className="text-[11px] text-amber-800 font-bold">
                          Decision changed from <span className="underline">{selectedItem.overrideDetails.headDecision}</span> to {selectedItem.status}
                        </div>
                        <div className="text-[11px] text-slate-500 italic mt-1 bg-white/50 p-2 rounded-lg">
                          " {selectedItem.overrideDetails.overrideReason} "
                        </div>
                        <div className="text-[9px] text-amber-600 font-medium">
                          Override authorized by: {selectedItem.overrideDetails.overriddenBy} on {new Date(selectedItem.overrideDetails.date).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Applicant Details Tab */}
                {drawerTab === 'applicant' && (
                  <div className="space-y-4 animate-fade-in text-xs">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-700 font-black text-lg">
                        {selectedItem.applicant.name[0]}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-sm">{selectedItem.applicant.name}</h4>
                        <div className="text-[10px] text-slate-400 font-bold">Member ID: {selectedItem.applicant.memberId}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Contact Email</span>
                        <div className="font-extrabold text-slate-800 mt-1">{selectedItem.applicant.email}</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Mobile Number</span>
                        <div className="font-extrabold text-slate-800 mt-1">{selectedItem.applicant.phone}</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Join Date / History Timeline</span>
                        <div className="font-bold text-slate-700 mt-1">
                          Registered member since: {new Date(selectedItem.applicant.joinDate).toDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Supporting Documents Tab */}
                {drawerTab === 'documents' && (
                  <div className="space-y-4 animate-fade-in text-xs">
                    <span className="text-[10px] font-black text-slate-400 uppercase">KYC / Registration Supporting Documents</span>
                    {selectedItem.documents && selectedItem.documents.length > 0 ? (
                      selectedItem.documents.map((doc) => (
                        <div 
                          key={doc.id}
                          className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl flex items-center justify-between hover:border-purple-200 transition-all"
                        >
                          <div className="space-y-1">
                            <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                              <FileText size={14} className="text-purple-500" />
                              {doc.name}
                            </h5>
                            <div className="text-[10px] text-slate-400">File size: {doc.size}</div>
                            {doc.notes && (
                              <div className="text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded max-w-fit">
                                {doc.notes}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                              doc.status === 'Verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              doc.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                              'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                            }`}>
                              {doc.status}
                            </span>
                            
                            <div className="h-6 w-px bg-slate-200" />

                            <div className="flex gap-1">
                              <button
                                onClick={() => handleVerifyDocument(doc.id, 'Verified', 'Identity check positive.')}
                                className="p-1 rounded bg-white border border-slate-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-colors text-slate-600"
                                title="Approve Document"
                              >
                                <Check size={12} />
                              </button>
                              <button
                                onClick={() => handleVerifyDocument(doc.id, 'Rejected', 'Scans unclear.')}
                                className="p-1 rounded bg-white border border-slate-200 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-colors text-slate-600"
                                title="Reject Document"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-slate-400 italic">No files submitted for this request.</div>
                    )}
                  </div>
                )}

                {/* 4. Approval Timeline Tab */}
                {drawerTab === 'timeline' && (
                  <div className="space-y-6 animate-fade-in text-xs relative pl-6 border-l border-purple-100 ml-4 py-2">
                    {selectedItem.timeline && selectedItem.timeline.map((evt, idx) => (
                      <div key={evt.id || idx} className="relative space-y-1">
                        {/* Dot indicator */}
                        <span className="absolute -left-[30px] top-0.5 w-4.5 h-4.5 rounded-full bg-white border-2 border-purple-600 flex items-center justify-center text-[9px] text-purple-600 font-black">
                          {idx + 1}
                        </span>
                        
                        <div className="flex items-center justify-between">
                          <h5 className="font-extrabold text-slate-900">{evt.action}</h5>
                          <span className="text-[10px] text-slate-400">{new Date(evt.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-600 font-medium">{evt.notes}</p>
                        <div className="text-[10px] text-slate-400">
                          Performed by: <span className="font-bold text-slate-600">{evt.performedBy} ({evt.role})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 5. Related Records Tab */}
                {drawerTab === 'related' && (
                  <div className="space-y-4 animate-fade-in text-xs">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Cross-Linked Records</span>
                    {selectedItem.relatedRecords && selectedItem.relatedRecords.map((rec) => (
                      <div key={rec.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                        <div>
                          <h5 className="font-bold text-slate-800">{rec.title}</h5>
                          <div className="text-[10px] text-slate-400">Linked reference ID: {rec.id} | Module type: {rec.type}</div>
                        </div>
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-[9px] font-bold">
                          {rec.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 6. Comments Thread Tab */}
                {drawerTab === 'comments' && (
                  <div className="space-y-4 animate-fade-in text-xs flex flex-col h-full">
                    
                    {/* Chat Comments Stream */}
                    <div className="flex-1 space-y-3">
                      {selectedItem.comments && selectedItem.comments.map((comm) => (
                        <div 
                          key={comm.id}
                          className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-black text-slate-800">{comm.user} ({comm.role})</span>
                            <span className="text-slate-400">{new Date(comm.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-600 font-bold mt-1">"{comm.text}"</p>
                        </div>
                      ))}
                    </div>

                    {/* Chat Text area input */}
                    <form onSubmit={handleAddComment} className="pt-3 border-t border-slate-100 flex gap-2">
                      <input 
                        type="text"
                        placeholder="Type review note comment..."
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        className="flex-1 text-xs border border-slate-200 rounded-xl px-4 py-2 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                      <button 
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-750 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                      >
                        <Send size={12} /> Post
                      </button>
                    </form>

                  </div>
                )}

                {/* 7. Audit History Tab */}
                {drawerTab === 'audits' && (
                  <div className="space-y-4 animate-fade-in text-xs">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Chronological Activity Stream</span>
                    <div className="space-y-3">
                      {selectedItem.auditHistory && selectedItem.auditHistory.map((aud, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-50/60 border border-slate-100 rounded-xl space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>{new Date(aud.timestamp).toLocaleString()}</span>
                            <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded font-black">{aud.actionType}</span>
                          </div>
                          <div className="text-[11px] font-bold text-slate-700">
                            Changed status from <span className="underline text-slate-400">{aud.oldValue}</span> to <span className="text-purple-600 font-black">{aud.newValue}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 italic">"Reason: {aud.reason || 'Not specified'}"</p>
                          <div className="text-[9px] text-slate-400">Logged by: {aud.admin}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Drawer Footer Actions */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-wrap gap-2">
                {['Pending', 'Under Review', 'Assigned Reviewer', 'Waiting Documents', 'Returned', 'Escalated'].includes(selectedItem.status) && (
                  <>
                    <button
                      onClick={() => handleActionClick('approve', selectedItem)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1"
                    >
                      <Check size={14} /> Approve Request
                    </button>
                    <button
                      onClick={() => handleActionClick('reject', selectedItem)}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1"
                    >
                      <X size={14} /> Reject Request
                    </button>
                    <button
                      onClick={() => handleActionClick('modify', selectedItem)}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1"
                    >
                      <Sliders size={14} /> Modification
                    </button>
                    <button
                      onClick={() => handleActionClick('assign', selectedItem)}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1"
                    >
                      <User size={14} /> Assign Reviewer
                    </button>
                  </>
                )}

                {/* If completed, allow Re-opening */}
                {['Approved', 'Rejected', 'Completed'].includes(selectedItem.status) && (
                  <button
                    onClick={() => handleActionClick('reopen', selectedItem)}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1"
                  >
                    <RefreshCw size={14} /> Reopen Ticket
                  </button>
                )}

                {/* Always allow archiving */}
                {selectedItem.status !== 'Archived' ? (
                  <button
                    onClick={() => handleActionClick('archive', selectedItem)}
                    className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1 ml-auto"
                  >
                    <Archive size={14} /> Archive
                  </button>
                ) : (
                  <button
                    onClick={() => handleActionClick('restore', selectedItem)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1 ml-auto"
                  >
                    <RefreshCw size={14} /> Restore
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── ACTION CONFIRMATION MODALS ─── */}
      <AnimatePresence>
        {activeModal && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-55 flex items-center justify-center p-4"
            >
              {/* Modal Container */}
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl max-w-md w-full border border-slate-100 p-6 shadow-2xl relative overflow-hidden"
              >
                {/* Header */}
                <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="text-purple-600" />
                  Confirm Action: {activeModal.toUpperCase().replace('_', ' ')}
                </h4>
                <p className="text-xs text-slate-500 mt-2">
                  Are you sure you want to execute this workflow update for transaction ticket {modalItem?.id || 'Selected Rows'}?
                </p>

                {/* Form fields */}
                <form onSubmit={(activeModal.startsWith('bulk') || activeModal === 'bulk_reject' || activeModal === 'bulk_status' || activeModal === 'bulk_assign') ? executeBulkAction : executeSingleAction} className="mt-4 space-y-4">
                  
                  {/* Approve / Modify Notes input */}
                  {['approve', 'modify', 'escalate'].includes(activeModal) && (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Administrative Notes</label>
                      <textarea
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        placeholder="Provide details or instructions for this transaction..."
                        className="w-full text-xs p-3 border border-slate-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-slate-50/50"
                        rows={3}
                      />
                    </div>
                  )}

                  {/* Reject / Override Reason Input */}
                  {['reject', 'override', 'suspend', 'bulk_reject'].includes(activeModal) && (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                        Reason {activeModal === 'override' && <span className="text-rose-500 font-extrabold">(MANDATORY)</span>}
                      </label>
                      <textarea
                        value={reasonInput}
                        onChange={(e) => setReasonInput(e.target.value)}
                        placeholder="Provide explanation..."
                        className="w-full text-xs p-3 border border-slate-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-slate-50/50"
                        rows={3}
                        required={activeModal === 'override'}
                      />
                    </div>
                  )}

                  {/* Assign reviewer head selection */}
                  {['assign', 'bulk_assign'].includes(activeModal) && (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Choose Community Head reviewer</label>
                      <select
                        onChange={(e) => {
                          const reviewerObj = reviewersList.find(r => r.id === e.target.value);
                          if (reviewerObj) setSelectedReviewer(reviewerObj);
                        }}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                      >
                        {reviewersList.map(rev => (
                          <option key={rev.id} value={rev.id}>
                            {rev.name} - {rev.email}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Bulk status update input */}
                  {activeModal === 'bulk_status' && (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Select Status to Apply</label>
                      <select
                        value={bulkStatusToUpdate}
                        onChange={(e) => setBulkStatusToUpdate(e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-100 rounded-xl"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Waiting Documents">Waiting Documents</option>
                        <option value="Returned">Returned</option>
                        <option value="Escalated">Escalated</option>
                        <option value="Completed">Completed</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-black uppercase hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black uppercase tracking-wider shadow-md"
                    >
                      Confirm Update
                    </button>
                  </div>

                </form>

              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
