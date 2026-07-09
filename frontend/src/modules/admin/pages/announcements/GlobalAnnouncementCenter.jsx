import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Megaphone, Search, Sliders, Plus, Eye, Edit3, Copy, Archive, Trash2, 
  CheckCircle2, XCircle, MapPin, Calendar, TrendingUp, Sparkles, 
  AlertTriangle, Filter, Send, Check, X, Printer, Download, ChevronRight, 
  Clock, Laptop, Tablet, Smartphone, Mail, MessageSquare, Layers, 
  Activity, FileText, RefreshCw, HelpCircle, ShieldAlert, List, Grid, 
  CalendarDays, Layers3, RotateCcw, FileSpreadsheet, Play, Pause, User, Globe
} from 'lucide-react';

// Import Services
import { announcementManagementService } from '../../services/announcementManagementService';
import { communicationSchedulerService } from '../../services/communicationSchedulerService';
import { audienceManagementService } from '../../services/audienceManagementService';
import { communicationAnalyticsService } from '../../services/communicationAnalyticsService';
import { communicationDeliveryService } from '../../services/communicationDeliveryService';
import { communicationAuditService } from '../../services/communicationAuditService';

// Import Custom SVG charts
import { LineChart, AreaChart, BarChart, DonutChart } from '../../../head/pages/reports/components/ChartComponents';

export default function GlobalAnnouncementCenter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'workspace'; // workspace | analytics | audits

  // Core Data States
  const [announcements, setAnnouncements] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View Mode inside Workspace
  const [activeView, setActiveView] = useState('table'); // table | grid | kanban | timeline | calendar | list

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'All',
    priority: 'All',
    community: 'All',
    city: 'All',
    status: 'All',
    startDate: '',
    endDate: '',
    sort: 'newest'
  });

  // Filter Presets & Recent Searches
  const [savedPresets, setSavedPresets] = useState([
    { name: 'Critical Emergency Alerts', filters: { category: 'Emergency Alerts', priority: 'Critical', status: 'All' } },
    { name: 'Active City Campaigns', filters: { category: 'City Announcements', status: 'Published', priority: 'All' } }
  ]);
  const [recentSearches, setRecentSearches] = useState(['a-1', 'Maintenance', 'Indore', 'Election']);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  // Table Selection & Bulk Operations
  const [selectedIds, setSelectedIds] = useState([]);

  // Detail & Action Drawer/Modal States
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeForm, setComposeForm] = useState(() => getEmptyForm());
  const [composeFormErrors, setComposeFormErrors] = useState({});
  const [formVersionHistory, setFormVersionHistory] = useState([]);
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // desktop | tablet | mobile
  const [previewChannel, setPreviewChannel] = useState('web'); // web | push | email | popup | card

  const [isDeliveryMonitorOpen, setIsDeliveryMonitorOpen] = useState(false);
  const [monitoringItem, setMonitoringItem] = useState(null);
  const [deliveryStats, setDeliveryStats] = useState(null);
  const [deliveryLogs, setDeliveryLogs] = useState([]);
  const [deliveryFilterStatus, setDeliveryFilterStatus] = useState('All');
  const [deliverySearchQuery, setDeliverySearchQuery] = useState('');

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportType, setExportType] = useState('PDF'); // PDF | Excel | CSV | JSON

  // Emergency Safety Prompt
  const [isEmergencyConfirmOpen, setIsEmergencyConfirmOpen] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('');
  
  // Standard Reason Modal for normal modifications
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [pendingAction, setPendingAction] = useState(null); // callback to run after reason input

  // Audience preview and estimates in composer
  const [composerAudienceStats, setComposerAudienceStats] = useState(null);
  const [composerAudiencePreview, setComposerAudiencePreview] = useState([]);
  const [composerAudienceValidation, setComposerAudienceValidation] = useState(null);

  // Toast System
  const [toast, setToast] = useState(null);

  // Setup lists
  const categoriesList = [
    'Platform Announcements', 'Community Announcements', 'City Announcements', 'Emergency Alerts', 
    'Festival Greetings', 'Government Notices', 'Circulars', 'Policy Updates', 'Event Announcements', 
    'Donation Campaign Announcements', 'Matrimonial Announcements', 'Professional Directory Promotions', 
    'Subscription Announcements', 'System Maintenance Notices', 'Platform Updates', 'Feature Launches'
  ];
  const prioritiesList = ['Low', 'Medium', 'High', 'Critical'];
  const communitiesList = ['Agrawal Samaj', 'Brahmin Samaj', 'Maheshwari Samaj', 'Rajput Samaj', 'Jain Samaj', 'Khandelwal Samaj'];
  const citiesList = ['Indore', 'Mumbai', 'Pune', 'Jaipur', 'Ahmedabad', 'Varanasi'];
  const statusesList = ['Published', 'Scheduled', 'Draft', 'Expired', 'Archived'];

  // Toast Trigger
  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  function getEmptyForm() {
    return {
      title: '',
      subtitle: '',
      shortDescription: '',
      content: '',
      category: 'Platform Announcements',
      priority: 'Medium',
      status: 'Draft',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      scheduleTime: '',
      themeColor: '#8B5CF6',
      ctaButton: '',
      ctaUrl: '',
      targetType: 'Platform',
      targetAudience: 'All Platform Members',
      community: 'All Communities',
      city: 'All Cities',
      banner: '',
      tags: '',
      isPinned: false
    };
  }

  // Run on mount
  useEffect(() => {
    const runJobsAndLoad = async () => {
      await communicationSchedulerService.processSchedulerJobs();
      loadAllData();
    };
    runJobsAndLoad();
  }, [
    activeTab, 
    searchQuery, 
    filters.category, 
    filters.priority, 
    filters.community, 
    filters.city, 
    filters.status, 
    filters.startDate, 
    filters.endDate, 
    filters.sort
  ]);

  // Load datasets
  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load announcements
      const listRes = await announcementManagementService.getAllAnnouncements({
        searchQuery,
        ...filters
      });
      if (listRes.success) {
        setAnnouncements(listRes.data);
      } else {
        throw new Error(listRes.error);
      }

      // Load analytics
      const analyticRes = await communicationAnalyticsService.getDashboardAnalytics();
      setAnalytics(analyticRes);

      // Load audits
      const auditRes = await communicationAuditService.getLogs({
        searchQuery
      });
      setAuditLogs(auditRes);

    } catch (e) {
      console.error(e);
      setError(e.message || 'Error occurred while loading announcements command center datasets.');
    } finally {
      setLoading(false);
    }
  };

  // Composer audience estimation tracker
  useEffect(() => {
    if (!isComposeOpen) return;
    
    const updateComposerAudience = async () => {
      const stats = await audienceManagementService.estimateReach({
        targetType: composeForm.targetType,
        targetAudience: composeForm.targetAudience,
        community: composeForm.community,
        city: composeForm.city
      });
      setComposerAudienceStats(stats);

      const preview = await audienceManagementService.previewAudience({
        targetType: composeForm.targetType,
        targetAudience: composeForm.targetAudience,
        community: composeForm.community,
        city: composeForm.city
      });
      setComposerAudiencePreview(preview.previewList);

      const validation = await audienceManagementService.validateAudience({
        targetType: composeForm.targetType,
        targetAudience: composeForm.targetAudience,
        community: composeForm.community,
        city: composeForm.city,
        priority: composeForm.priority,
        startDate: composeForm.startDate,
        endDate: composeForm.endDate
      });
      setComposerAudienceValidation(validation);
    };

    const delayDebounce = setTimeout(updateComposerAudience, 400);
    return () => clearTimeout(delayDebounce);
  }, [
    composeForm.targetType,
    composeForm.targetAudience,
    composeForm.community,
    composeForm.city,
    composeForm.priority,
    composeForm.startDate,
    composeForm.endDate,
    isComposeOpen
  ]);

  // Autosave Composer Drafts
  useEffect(() => {
    if (!isComposeOpen || composeForm.id) return; // only autosave new compose drafts
    const delayAutosave = setTimeout(() => {
      communicationSchedulerService.saveDraft(composeForm);
      // Subtle alert or indicator could be done here
    }, 1500);
    return () => clearTimeout(delayAutosave);
  }, [composeForm, isComposeOpen]);

  // Draft Recovery on Open
  const handleOpenCompose = async () => {
    const recovered = await communicationSchedulerService.loadDraft();
    if (recovered.success && recovered.data) {
      setComposeForm(recovered.data);
      triggerToast('Recovered unsaved composer draft.', 'info');
    } else {
      setComposeForm(getEmptyForm());
    }
    setComposeFormErrors({});
    setFormVersionHistory([]);
    setIsComposeOpen(true);
  };

  // Handle compose save / publish
  const handleSaveAnnouncement = async (isPublishingImmediately = false) => {
    // Validate
    const errors = {};
    if (!composeForm.title.trim()) errors.title = 'Title is required';
    if (!composeForm.shortDescription.trim()) errors.shortDescription = 'Short description is required';
    if (!composeForm.content.trim()) errors.content = 'Full announcement description is required';
    if (composeForm.status === 'Scheduled' && !composeForm.scheduleTime) {
      errors.scheduleTime = 'Schedule date and time are required for scheduled broadcasts.';
    }

    if (Object.keys(errors).length > 0) {
      setComposeFormErrors(errors);
      triggerToast('Please correct form validation errors.', 'error');
      return;
    }

    // Check emergency broadcast
    if (composeForm.category === 'Emergency Alerts' && isPublishingImmediately) {
      setIsEmergencyConfirmOpen(true);
      return;
    }

    // Normal save/publish
    const action = () => {
      requestReasonAndExecute(async (reason) => {
        const formData = { 
          ...composeForm,
          status: isPublishingImmediately ? 'Published' : composeForm.status,
          tags: typeof composeForm.tags === 'string' ? composeForm.tags.split(',').map(t => t.trim()).filter(Boolean) : composeForm.tags
        };

        let result;
        if (composeForm.id) {
          result = await announcementManagementService.updateAnnouncement(composeForm.id, formData, reason);
        } else {
          result = await announcementManagementService.createAnnouncement(formData, reason);
          communicationSchedulerService.clearDraft();
        }

        if (result.success) {
          triggerToast(composeForm.id ? 'Announcement updated successfully.' : 'New announcement created successfully.', 'success');
          setIsComposeOpen(false);
          loadAllData();
        } else {
          triggerToast(result.error || 'Failed to save announcement.', 'error');
        }
      });
    };
    action();
  };

  // Emergency trigger confirmed
  const triggerEmergencyBroadcast = async () => {
    if (!emergencyReason.trim()) {
      triggerToast('A reason is mandatory for emergency alerts.', 'error');
      return;
    }

    const formData = {
      ...composeForm,
      status: 'Published',
      priority: 'Critical',
      tags: typeof composeForm.tags === 'string' ? composeForm.tags.split(',').map(t => t.trim()).filter(Boolean) : composeForm.tags
    };

    let result;
    if (composeForm.id) {
      result = await announcementManagementService.updateAnnouncement(composeForm.id, formData, emergencyReason);
    } else {
      result = await announcementManagementService.createAnnouncement(formData, emergencyReason);
      communicationSchedulerService.clearDraft();
    }

    if (result.success) {
      await communicationAuditService.logAction({
        action: 'Emergency Alert Triggered',
        announcementId: result.data.id,
        announcementTitle: result.data.title,
        prevValue: composeForm.status,
        newValue: 'Published',
        reason: emergencyReason,
        audience: result.data.targetAudience,
        community: result.data.community
      });

      triggerToast('CRITICAL EMERGENCY BROADCAST SENT OUT IMMEDIATELY.', 'success');
      setIsEmergencyConfirmOpen(false);
      setEmergencyReason('');
      setIsComposeOpen(false);
      loadAllData();
    } else {
      triggerToast(result.error || 'Emergency broadcast failed.', 'error');
    }
  };

  // Helper to intercept calls with reason prompting
  const requestReasonAndExecute = (actionCallback) => {
    setActionReason('');
    setPendingAction(() => actionCallback);
    setIsReasonModalOpen(true);
  };

  const handleReasonSubmit = () => {
    if (!actionReason.trim()) {
      triggerToast('Action justification reason is required.', 'error');
      return;
    }
    setIsReasonModalOpen(false);
    if (pendingAction) {
      pendingAction(actionReason);
    }
  };

  // Quick Action triggers
  const handleTogglePin = async (item) => {
    requestReasonAndExecute(async (reason) => {
      const result = await announcementManagementService.updateAnnouncement(item.id, { isPinned: !item.isPinned }, reason);
      if (result.success) {
        triggerToast(item.isPinned ? 'Announcement unpinned.' : 'Announcement pinned successfully.', 'success');
        loadAllData();
      }
    });
  };

  const handleArchive = async (item) => {
    requestReasonAndExecute(async (reason) => {
      const result = await announcementManagementService.archiveAnnouncement(item.id, reason);
      if (result.success) {
        triggerToast('Announcement archived.', 'success');
        loadAllData();
      }
    });
  };

  const handleRestore = async (item) => {
    requestReasonAndExecute(async (reason) => {
      const result = await announcementManagementService.restoreAnnouncement(item.id, reason);
      if (result.success) {
        triggerToast('Announcement restored to draft.', 'success');
        loadAllData();
      }
    });
  };

  const handleDelete = async (item) => {
    requestReasonAndExecute(async (reason) => {
      const result = await announcementManagementService.softDeleteAnnouncement(item.id, reason);
      if (result.success) {
        triggerToast('Announcement deleted successfully.', 'success');
        loadAllData();
      }
    });
  };

  const handleDuplicate = async (item) => {
    requestReasonAndExecute(async (reason) => {
      const result = await announcementManagementService.duplicateAnnouncement(item.id, reason);
      if (result.success) {
        triggerToast('Announcement campaign cloned.', 'success');
        loadAllData();
      }
    });
  };

  const handlePublishImmediately = async (item) => {
    if (item.category === 'Emergency Alerts') {
      setComposeForm(item);
      setIsEmergencyConfirmOpen(true);
      return;
    }
    requestReasonAndExecute(async (reason) => {
      const result = await announcementManagementService.publishAnnouncement(item.id, reason);
      if (result.success) {
        triggerToast('Announcement published successfully.', 'success');
        loadAllData();
      }
    });
  };

  const handleCancelSchedule = async (item) => {
    requestReasonAndExecute(async (reason) => {
      const result = await announcementManagementService.cancelSchedule(item.id, reason);
      if (result.success) {
        triggerToast('Publishing schedule cancelled.', 'success');
        loadAllData();
      }
    });
  };

  // Bulk execution
  const handleBulkAction = async (actionType) => {
    if (selectedIds.length === 0) return;
    
    requestReasonAndExecute(async (reason) => {
      let res;
      if (actionType === 'publish') {
        res = await announcementManagementService.bulkPublish(selectedIds, reason);
      } else if (actionType === 'archive') {
        res = await announcementManagementService.bulkArchive(selectedIds, reason);
      } else if (actionType === 'delete') {
        res = await announcementManagementService.bulkDelete(selectedIds, reason);
      } else if (actionType === 'restore') {
        res = await announcementManagementService.bulkRestore(selectedIds, reason);
      } else if (actionType === 'duplicate') {
        res = await announcementManagementService.bulkDuplicate(selectedIds, reason);
      }
      
      triggerToast(`Successfully processed bulk action for ${res.count} items.`, 'success');
      setSelectedIds([]);
      loadAllData();
    });
  };

  // Preview Drawer trigger
  const handleOpenPreview = (item) => {
    setPreviewItem(item);
    setPreviewDevice('desktop');
    setPreviewChannel('web');
    setIsPreviewOpen(true);
  };

  // Delivery monitor trigger
  const handleOpenDeliveryMonitor = async (item) => {
    setMonitoringItem(item);
    setIsDeliveryMonitorOpen(true);
    const dlv = await communicationDeliveryService.getDeliveryStats(item.id);
    if (dlv.success) {
      setDeliveryStats(dlv.stats);
      setDeliveryLogs(dlv.logs);
    }
  };

  const handleRetryFailedDeliveries = async () => {
    if (!monitoringItem) return;
    const res = await communicationDeliveryService.retryFailedDeliveries(monitoringItem.id);
    if (res.success) {
      triggerToast(`Retried delivery. ${res.count} failed messages successfully queued.`, 'success');
      // reload
      const dlv = await communicationDeliveryService.getDeliveryStats(monitoringItem.id);
      if (dlv.success) {
        setDeliveryStats(dlv.stats);
        setDeliveryLogs(dlv.logs);
      }
      loadAllData();
    }
  };

  // Exports trigger
  const handleExport = (format) => {
    setExportType(format);
    setIsExportOpen(true);
  };

  const executeExportDownload = async () => {
    triggerToast(`Exporting database to ${exportType} format. Downloading file...`, 'success');
    await communicationAuditService.logAction({
      action: 'Downloaded',
      announcementId: 'ALL',
      announcementTitle: 'Global Export',
      prevValue: null,
      newValue: exportType,
      reason: `Master Admin requested announcement center reports database in ${exportType} format.`,
      audience: 'N/A',
      community: 'All Communities'
    });
    setIsExportOpen(false);
  };

  // Edit Composer Trigger
  const handleOpenEdit = (item) => {
    setComposeForm({
      ...item,
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags
    });
    setComposeFormErrors({});
    setFormVersionHistory(item.versions || []);
    setIsComposeOpen(true);
  };

  // Table select helper
  const handleToggleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === announcements.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(announcements.map(a => a.id));
    }
  };

  // Calendar render helpers
  const calendarDays = useMemo(() => {
    // Generate dates of current month (July 2026 as reference from metadata clock)
    const dates = [];
    for (let d = 1; d <= 31; d++) {
      dates.push(`2026-07-${d < 10 ? '0' + d : d}`);
    }
    return dates;
  }, []);

  // Filter Preset Selector
  const applyFilterPreset = (preset) => {
    setFilters(prev => ({
      ...prev,
      ...preset.filters
    }));
    triggerToast(`Preset filters applied: "${preset.name}"`, 'info');
  };

  // Filter Reset
  const handleResetFilters = () => {
    setFilters({
      category: 'All',
      priority: 'All',
      community: 'All',
      city: 'All',
      status: 'All',
      startDate: '',
      endDate: '',
      sort: 'newest'
    });
    setSearchQuery('');
    triggerToast('Filters cleared.', 'info');
  };

  return (
    <div className="space-y-6 pb-12 relative min-h-screen font-sans antialiased">
      {/* Background Neon Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-slate-100 gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/20">
              <Megaphone size={28} className="text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                Communication Command Center
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Enterprise Broadcast, Audience Targeting & Delivery Analytics Suite
              </p>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center flex-wrap gap-3">
          <button 
            onClick={loadAllData}
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 hover:text-purple-600 transition duration-200 flex items-center gap-2 text-sm shadow-sm"
            title="Refresh Command Center Data"
          >
            <RefreshCw size={16} className={`${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />

          <button 
            onClick={() => handleExport('PDF')}
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 hover:text-purple-600 transition duration-200 flex items-center gap-2 text-sm shadow-sm"
          >
            <Download size={16} />
            Export Data
          </button>

          <button 
            onClick={handleOpenCompose}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-white font-bold transition duration-300 flex items-center gap-2 text-sm shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30"
          >
            <Plus size={18} />
            New Broadcast
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-100 mb-6 gap-2 relative z-10">
        <button
          onClick={() => setSearchParams({ tab: 'workspace' })}
          className={`py-3 px-4 font-bold text-sm tracking-wide transition border-b-2 flex items-center gap-2 ${
            activeTab === 'workspace' 
              ? 'border-purple-650 text-purple-650 bg-purple-500/5 font-extrabold shadow-sm'
              : 'border-transparent text-slate-550 hover:text-slate-900 hover:bg-slate-50 font-bold'
          }`}
        >
          <Layers3 size={16} />
          Operational Workspace
        </button>
        <button
          onClick={() => setSearchParams({ tab: 'analytics' })}
          className={`py-3 px-4 font-bold text-sm tracking-wide transition border-b-2 flex items-center gap-2 ${
            activeTab === 'analytics' 
              ? 'border-purple-655 text-purple-655 bg-purple-500/5 font-extrabold shadow-sm'
              : 'border-transparent text-slate-550 hover:text-slate-900 hover:bg-slate-50 font-bold'
          }`}
        >
          <Activity size={16} />
          Interactive Analytics
        </button>
        <button
          onClick={() => setSearchParams({ tab: 'audits' })}
          className={`py-3 px-4 font-bold text-sm tracking-wide transition border-b-2 flex items-center gap-2 ${
            activeTab === 'audits' 
              ? 'border-purple-655 text-purple-655 bg-purple-500/5 font-extrabold shadow-sm'
              : 'border-transparent text-slate-550 hover:text-slate-900 hover:bg-slate-50 font-bold'
          }`}
        >
          <FileText size={16} />
          Security Audit Trail
        </button>
      </div>

      {/* Workspace Contents */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1,2,3,4].map(n => (
            <div key={n} className="h-28 bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="p-6 bg-red-950/30 border border-red-500/20 rounded-2xl text-red-200 flex items-start gap-4 mb-8">
          <AlertTriangle size={24} className="shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-lg">Error Loading Command Center</h3>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {activeTab === 'workspace' && (
            <>
              {/* Executive KPI Stats Dashboard block */}
              {analytics && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                  {/* Total Reach KPI */}
                  <div className="bg-white border border-slate-100 p-5 rounded-2xl relative overflow-hidden group hover:shadow-md transition-all duration-300 shadow-sm">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-all" />
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">TOTAL ESTIMATED REACH</span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <TrendingUp size={10} /> +12.3%
                      </span>
                    </div>
                    <div className="text-2xl md:text-3xl font-black text-slate-800 mb-1">
                      {analytics.kpis.totalReach.toLocaleString()}
                    </div>
                    <div className="h-[30px] w-full mt-2">
                      {analytics.sparklines?.reach && (
                        <AreaChart data={analytics.sparklines.reach} color="#8B5CF6" height={30} width={220} />
                      )}
                    </div>
                  </div>

                  {/* Delivery Success rate KPI */}
                  <div className="bg-white border border-slate-100 p-5 rounded-2xl relative overflow-hidden group hover:shadow-md transition-all duration-300 shadow-sm">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all" />
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">DELIVERY SUCCESS RATE</span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check size={10} /> Optimal
                      </span>
                    </div>
                    <div className="text-2xl md:text-3xl font-black text-slate-800 mb-1">
                      {analytics.kpis.avgDeliveryRate}%
                    </div>
                    <div className="h-[30px] w-full mt-2">
                      {analytics.sparklines?.delivery && (
                        <AreaChart data={analytics.sparklines.delivery} color="#3B82F6" height={30} width={220} />
                      )}
                    </div>
                  </div>

                  {/* Average Read Rate KPI */}
                  <div className="bg-white border border-slate-100 p-5 rounded-2xl relative overflow-hidden group hover:shadow-md transition-all duration-300 shadow-sm">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-xl group-hover:bg-pink-500/10 transition-all" />
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">AVERAGE READ RATE</span>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Eye size={10} /> {analytics.kpis.avgReadTime}s avg
                      </span>
                    </div>
                    <div className="text-2xl md:text-3xl font-black text-slate-800 mb-1">
                      {analytics.kpis.avgReadRate}%
                    </div>
                    <div className="h-[30px] w-full mt-2">
                      {analytics.sparklines?.read && (
                        <AreaChart data={analytics.sparklines.read} color="#EC4899" height={30} width={220} />
                      )}
                    </div>
                  </div>

                  {/* Status Breakdown Counters */}
                  <div className="bg-white border border-slate-100 p-5 rounded-2xl relative overflow-hidden hover:shadow-md transition-all duration-300 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">BROADCAST CAMPAIGNS STATUS</span>
                      {analytics.kpis.emergencyAlerts > 0 && (
                        <span className="text-[10px] font-bold text-red-650 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                          {analytics.kpis.emergencyAlerts} Emergencies
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-1.5 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="text-lg font-bold text-purple-600">{analytics.kpis.published}</div>
                        <div className="text-[9px] font-bold tracking-wider uppercase text-slate-500">Live</div>
                      </div>
                      <div className="p-1.5 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="text-lg font-bold text-blue-600">{analytics.kpis.scheduled}</div>
                        <div className="text-[9px] font-bold tracking-wider uppercase text-slate-500">Sched</div>
                      </div>
                      <div className="p-1.5 bg-amber-50 rounded-lg border border-amber-100">
                        <div className="text-lg font-bold text-amber-600">{analytics.kpis.draft}</div>
                        <div className="text-[9px] font-bold tracking-wider uppercase text-slate-500">Draft</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Search & Sticky Filters toolbar */}
              <div className="bg-white border border-slate-100 p-4 rounded-2xl mb-6 shadow-sm relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Search box with autosuggestion */}
                  <div className="relative flex-1">
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input 
                      type="text"
                      placeholder="Search announcements by ID, title, keyword, community or tag..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSearchSuggestions(true);
                      }}
                      onFocus={() => setShowSearchSuggestions(true)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-purple-500 focus:bg-white rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/30 text-slate-800 transition placeholder-slate-400"
                    />
                    
                    {/* Search Suggestions dropdown */}
                    {showSearchSuggestions && searchQuery.trim() && (
                      <div 
                        className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 animate-fadeIn"
                        onMouseLeave={() => setShowSearchSuggestions(false)}
                      >
                        <div className="p-2 border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-400 tracking-wider uppercase">
                          Search suggestions
                        </div>
                        {announcements.slice(0, 3).map(a => (
                          <button
                            key={a.id}
                            onClick={() => {
                              setSearchQuery(a.title);
                              setShowSearchSuggestions(false);
                            }}
                            className="w-full px-4 py-2 hover:bg-purple-50 text-left text-sm text-slate-700 hover:text-purple-750 flex items-center justify-between border-b border-slate-100 last:border-0 transition duration-150"
                          >
                            <span>{a.title}</span>
                            <span className="text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-bold">{a.id}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Filter controls, view switches */}
                  <div className="flex items-center gap-3 self-end md:self-auto flex-wrap">
                    {/* Presets dropdown */}
                    <div className="relative group">
                      <button className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-purple-500/40 rounded-xl text-sm text-slate-700 hover:text-purple-600 transition flex items-center gap-2">
                        <Sliders size={15} />
                        Filter Presets
                      </button>
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl hidden group-hover:block overflow-hidden z-50">
                        {savedPresets.map((preset, idx) => (
                          <button
                            key={idx}
                            onClick={() => applyFilterPreset(preset)}
                            className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-705 hover:bg-purple-50 hover:text-purple-700 border-b border-slate-100 last:border-0 transition"
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Show/Hide Filters Toggle */}
                    <button 
                      onClick={() => setShowFilters(!showFilters)}
                      className={`px-3.5 py-2.5 border rounded-xl text-sm transition flex items-center gap-2 ${
                        showFilters 
                          ? 'bg-purple-600/10 border-purple-500 text-purple-600 font-bold' 
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-purple-600 hover:border-purple-500/40'
                      }`}
                    >
                      <Filter size={15} />
                      Filters
                    </button>

                    {/* View Switchers */}
                    <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1 shrink-0">
                      {[
                        { id: 'table', icon: List, label: 'Table' },
                        { id: 'grid', icon: Grid, label: 'Grid' },
                        { id: 'kanban', icon: Layers3, label: 'Kanban' },
                        { id: 'timeline', icon: Clock, label: 'Timeline' },
                        { id: 'calendar', icon: CalendarDays, label: 'Calendar' },
                        { id: 'list', icon: List, label: 'List' }
                      ].map(v => (
                        <button
                          key={v.id}
                          onClick={() => setActiveView(v.id)}
                          className={`p-1.5 rounded-lg transition duration-200 ${
                            activeView === v.id 
                              ? 'bg-purple-600 text-white shadow-sm' 
                              : 'text-slate-550 hover:text-purple-600'
                          }`}
                          title={`${v.label} View`}
                        >
                          <v.icon size={15} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Filter Drawers dropdown block */}
                {showFilters && (
                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">Category</label>
                      <select 
                        value={filters.category}
                        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-purple-500 text-slate-700"
                      >
                        <option value="All">All Categories</option>
                        {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">Priority</label>
                      <select 
                        value={filters.priority}
                        onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-purple-500 text-slate-700"
                      >
                        <option value="All">All Priorities</option>
                        {prioritiesList.map(pri => <option key={pri} value={pri}>{pri}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">Community Target</label>
                      <select 
                        value={filters.community}
                        onChange={(e) => setFilters(prev => ({ ...prev, community: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-purple-500 text-slate-700"
                      >
                        <option value="All">All Communities</option>
                        {communitiesList.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">City Target</label>
                      <select 
                        value={filters.city}
                        onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-purple-500 text-slate-700"
                      >
                        <option value="All">All Cities</option>
                        {citiesList.map(city => <option key={city} value={city}>{city}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">Publish Status</label>
                      <select 
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-purple-500 text-slate-700"
                      >
                        <option value="All">All Statuses</option>
                        {statusesList.map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">Start Date After</label>
                      <input 
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-purple-500 text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">End Date Before</label>
                      <input 
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-purple-500 text-slate-700"
                      />
                    </div>

                    <div className="flex items-end justify-between gap-2">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">Sort Order</label>
                        <select 
                          value={filters.sort}
                          onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-purple-500 text-slate-700"
                        >
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                          <option value="reach">Highest Reach</option>
                          <option value="readRate">Read Rate</option>
                          <option value="engagement">Engagement Rate</option>
                        </select>
                      </div>
                      
                      <button
                        onClick={handleResetFilters}
                        className="p-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-600 hover:text-purple-755 rounded-lg text-xs flex items-center gap-1.5 transition font-bold"
                        title="Clear Filters"
                      >
                        <RotateCcw size={13} />
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bulk Operations Panel */}
              {selectedIds.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-purple-50 border border-purple-200 p-4 rounded-xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <CheckSquareIcon className="text-purple-600 shrink-0" size={18} />
                    <span className="text-sm font-bold text-purple-800">
                      {selectedIds.length} Announcements selected for bulk management
                    </span>
                  </div>
                  <div className="flex items-center flex-wrap gap-2">
                    <button 
                      onClick={() => handleBulkAction('publish')}
                      className="px-3 py-1.5 bg-emerald-50 border border-emerald-250 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition"
                    >
                      Bulk Publish
                    </button>
                    <button 
                      onClick={() => handleBulkAction('archive')}
                      className="px-3 py-1.5 bg-amber-50 border border-amber-250 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-lg transition"
                    >
                      Bulk Archive
                    </button>
                    <button 
                      onClick={() => handleBulkAction('duplicate')}
                      className="px-3 py-1.5 bg-blue-50 border border-blue-250 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition"
                    >
                      Bulk Duplicate
                    </button>
                    <button 
                      onClick={() => handleBulkAction('delete')}
                      className="px-3 py-1.5 bg-rose-50 border border-rose-250 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg transition"
                    >
                      Bulk Delete
                    </button>
                    <div className="h-5 w-[1px] bg-slate-200 mx-1" />
                    <button 
                      onClick={() => setSelectedIds([])}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-lg transition"
                    >
                      Clear Selection
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Announcements Views Workspace */}
              {announcements.length === 0 ? (
                <div className="bg-slate-900/20 border border-slate-800 rounded-2xl p-16 text-center">
                  <Megaphone size={48} className="text-slate-600 mx-auto mb-4" />
                  <h3 className="font-bold text-lg text-slate-300">No Announcements Found</h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                    Try adjusting search query or active filter settings. Or trigger a new announcement broadcast.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 px-4 py-2 bg-purple-600/25 hover:bg-purple-600/40 border border-purple-500/20 text-purple-200 rounded-xl text-xs font-bold transition"
                  >
                    Clear Filter Filters
                  </button>
                </div>
              ) : (
                <>
                  {/* TABLE VIEW */}
                  {activeView === 'table' && (
                    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              <th className="p-4 w-12 text-center">
                                <input 
                                  type="checkbox"
                                  checked={selectedIds.length === announcements.length}
                                  onChange={handleToggleSelectAll}
                                  className="rounded border-slate-300 text-purple-650 focus:ring-purple-500/25 bg-white cursor-pointer"
                                />
                              </th>
                              <th className="p-4">Announcement</th>
                              <th className="p-4">Category</th>
                              <th className="p-4">Target Target</th>
                              <th className="p-4">Reach</th>
                              <th className="p-4">Priority</th>
                              <th className="p-4">Status</th>
                              <th className="p-4 text-right w-40 whitespace-nowrap">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-150 text-sm">
                            {announcements.map(item => (
                              <tr 
                                key={item.id}
                                className={`hover:bg-slate-50/65 transition-colors ${
                                  selectedIds.includes(item.id) ? 'bg-purple-50/45' : ''
                                }`}
                              >
                                <td className="p-4 text-center">
                                  <input 
                                    type="checkbox"
                                    checked={selectedIds.includes(item.id)}
                                    onChange={() => handleToggleSelectRow(item.id)}
                                    className="rounded border-slate-350 text-purple-655 focus:ring-purple-500/25 bg-white cursor-pointer"
                                  />
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    {item.banner ? (
                                      <img src={item.banner} alt={item.title} className="w-10 h-10 object-cover rounded-lg border border-slate-150" />
                                    ) : (
                                      <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center border border-purple-100 font-extrabold text-xs uppercase animate-pulse">
                                        {item.category.slice(0, 2)}
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                        {item.isPinned && <span className="text-[10px] bg-yellow-50 text-yellow-600 border border-yellow-250 px-1.5 py-0.25 rounded font-extrabold uppercase">Pinned</span>}
                                        {item.title}
                                      </div>
                                      <div className="text-xs text-slate-500 mt-0.5 max-w-[300px] truncate">{item.shortDescription}</div>
                                      <div className="text-[10px] text-slate-450 mt-1 flex items-center gap-2 font-mono">
                                        <span>ID: {item.id}</span>
                                        <span>•</span>
                                        <span>Start: {item.startDate}</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className="text-xs px-2.5 py-1 bg-purple-50 border border-purple-100 text-purple-600 rounded-full font-bold">
                                    {item.category}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <div className="text-xs text-slate-750 font-bold">{item.targetAudience}</div>
                                  <div className="text-[10px] text-slate-550 mt-0.5">{item.community} • {item.city}</div>
                                </td>
                                <td className="p-4">
                                  <div className="font-extrabold text-slate-850">{(item.reach || 0).toLocaleString()}</div>
                                  <div className="text-[10px] text-slate-500 mt-0.5">Reach metric</div>
                                </td>
                                <td className="p-4">
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                                    item.priority === 'Critical' ? 'bg-rose-50 border-rose-200 text-rose-600' :
                                    item.priority === 'High' ? 'bg-orange-50 border-orange-200 text-orange-600' :
                                    item.priority === 'Medium' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                                    'bg-slate-50 border-slate-200 text-slate-555'
                                  }`}>
                                    {item.priority}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 w-max ${
                                    item.status === 'Published' ? 'bg-emerald-50 text-emerald-600 border border-emerald-150' :
                                    item.status === 'Scheduled' ? 'bg-blue-50 text-blue-600 border border-blue-150' :
                                    item.status === 'Draft' ? 'bg-slate-550/10 text-slate-500 border border-slate-200' :
                                    item.status === 'Expired' ? 'bg-rose-50 text-rose-600 border border-rose-150' :
                                    'bg-amber-50 text-amber-600 border border-amber-150'
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                      item.status === 'Published' ? 'bg-emerald-500' :
                                      item.status === 'Scheduled' ? 'bg-blue-500' :
                                      item.status === 'Draft' ? 'bg-slate-400' :
                                      item.status === 'Expired' ? 'bg-rose-500' :
                                      'bg-amber-500'
                                    }`} />
                                    {item.status}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button 
                                      onClick={() => handleOpenPreview(item)}
                                      className="p-1.5 hover:bg-slate-100 text-black hover:text-slate-800 rounded-lg transition"
                                      title="Live Preview Studio"
                                    >
                                      <Eye size={15} />
                                    </button>
                                    <button 
                                      onClick={() => handleOpenEdit(item)}
                                      className="p-1.5 hover:bg-slate-100 text-black hover:text-slate-800 rounded-lg transition"
                                      title="Edit Announcement"
                                    >
                                      <Edit3 size={15} />
                                    </button>
                                    <button 
                                      onClick={() => handleDuplicate(item)}
                                      className="p-1.5 hover:bg-slate-100 text-black hover:text-slate-800 rounded-lg transition"
                                      title="Duplicate Campaign"
                                    >
                                      <Copy size={15} />
                                    </button>
                                    <button 
                                      onClick={() => handleTogglePin(item)}
                                      className={`p-1.5 hover:bg-slate-100 rounded-lg transition ${item.isPinned ? 'text-yellow-600' : 'text-black hover:text-slate-800'}`}
                                      title="Toggle Pin"
                                    >
                                      <CheckCircle2 size={15} />
                                    </button>
                                    
                                    {item.status === 'Published' && (
                                      <button 
                                        onClick={() => handleOpenDeliveryMonitor(item)}
                                        className="p-1.5 hover:bg-slate-100 text-emerald-600 hover:text-emerald-700 rounded-lg transition"
                                        title="Delivery Monitoring Stats"
                                      >
                                        <Activity size={15} />
                                      </button>
                                    )}

                                    {item.status === 'Draft' && (
                                      <button 
                                        onClick={() => handlePublishImmediately(item)}
                                        className="p-1.5 hover:bg-slate-100 text-emerald-600 hover:text-emerald-755 rounded-lg transition"
                                        title="Publish Instantly"
                                      >
                                        <Play size={15} />
                                      </button>
                                    )}

                                    {item.status === 'Scheduled' && (
                                      <button 
                                        onClick={() => handleCancelSchedule(item)}
                                        className="p-1.5 hover:bg-slate-100 text-rose-600 hover:text-rose-700 rounded-lg transition"
                                        title="Cancel Schedule"
                                      >
                                        <Pause size={15} />
                                      </button>
                                    )}

                                    {item.status !== 'Archived' ? (
                                      <button 
                                        onClick={() => handleArchive(item)}
                                        className="p-1.5 hover:bg-slate-100 text-amber-600 hover:text-amber-700 rounded-lg transition"
                                        title="Move to Archives"
                                      >
                                        <Archive size={15} />
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => handleRestore(item)}
                                        className="p-1.5 hover:bg-slate-100 text-emerald-600 hover:text-emerald-700 rounded-lg transition"
                                        title="Restore Draft"
                                      >
                                        <RotateCcw size={15} />
                                      </button>
                                    )}

                                    <button 
                                      onClick={() => handleDelete(item)}
                                      className="p-1.5 hover:bg-rose-50 text-rose-650 hover:text-rose-700 rounded-lg transition"
                                      title="Delete Permanently"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeView === 'grid' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {announcements.map(item => (
                        <div 
                          key={item.id}
                          className="bg-white border border-slate-100 hover:shadow-md rounded-2xl overflow-hidden shadow-sm transition-all duration-300 flex flex-col group"
                        >
                          {/* Banner & Priority */}
                          <div className="h-40 bg-slate-100 relative overflow-hidden">
                            {item.banner ? (
                              <img src={item.banner} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-tr from-purple-100 to-indigo-100 flex items-center justify-center">
                                <Megaphone size={40} className="text-purple-500/30" />
                              </div>
                            )}
                            <div className="absolute top-3 right-3">
                              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${
                                item.priority === 'Critical' ? 'bg-red-500 border-red-400 text-white' :
                                item.priority === 'High' ? 'bg-orange-500/90 border-orange-400 text-white' :
                                item.priority === 'Medium' ? 'bg-blue-500/90 border-blue-400 text-white' :
                                'bg-slate-605/90 border-slate-500 text-white'
                              }`}>
                                {item.priority}
                              </span>
                            </div>
                            <div className="absolute bottom-3 left-3">
                              <span className="text-[10px] px-2 py-0.5 bg-white border border-slate-200 text-purple-600 rounded font-semibold shadow-sm">
                                {item.category}
                              </span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="font-extrabold text-slate-805 mb-1 flex items-center gap-1.5">
                                {item.isPinned && <span className="w-2 h-2 rounded-full bg-yellow-500" title="Pinned" />}
                                {item.title}
                              </h4>
                              <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">{item.shortDescription}</p>
                            </div>

                            <div>
                              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3.5 mb-4 text-xs">
                                <div>
                                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Target Reach</div>
                                  <div className="font-bold text-slate-700">{(item.reach || 0).toLocaleString()}</div>
                                </div>
                                <div>
                                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Start Date</div>
                                  <div className="font-bold text-slate-700">{item.startDate}</div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  item.status === 'Published' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                  item.status === 'Scheduled' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                  item.status === 'Draft' ? 'bg-slate-50 text-slate-500 border border-slate-200' :
                                  'bg-amber-50 text-amber-600 border border-amber-100'
                                }`}>
                                  {item.status}
                                </span>

                                <div className="flex items-center gap-1.5 font-bold">
                                  <button onClick={() => handleOpenPreview(item)} className="p-1.5 text-slate-500 hover:text-purple-650 hover:bg-slate-50 rounded-lg transition" title="Preview"><Eye size={14} /></button>
                                  <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-slate-500 hover:text-purple-650 hover:bg-slate-50 rounded-lg transition" title="Edit"><Edit3 size={14} /></button>
                                  <button onClick={() => handleDuplicate(item)} className="p-1.5 text-slate-500 hover:text-purple-650 hover:bg-slate-50 rounded-lg transition" title="Duplicate"><Copy size={14} /></button>
                                  <button onClick={() => handleDelete(item)} className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition" title="Delete"><Trash2 size={14} /></button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* KANBAN VIEW */}
                  {activeView === 'kanban' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
                      {['Draft', 'Scheduled', 'Published', 'Expired', 'Archived'].map(colStatus => {
                        const colItems = announcements.filter(a => a.status === colStatus);
                        return (
                          <div key={colStatus} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 min-h-[500px]">
                            <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-2">
                              <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${
                                  colStatus === 'Published' ? 'bg-emerald-500' :
                                  colStatus === 'Scheduled' ? 'bg-blue-500' :
                                  colStatus === 'Draft' ? 'bg-slate-400' :
                                  colStatus === 'Expired' ? 'bg-red-500' :
                                  'bg-amber-500'
                                }`} />
                                {colStatus}
                              </h4>
                              <span className="text-[10px] font-extrabold bg-slate-200 border border-slate-300 text-slate-600 px-2 py-0.5 rounded-full">
                                {colItems.length}
                              </span>
                            </div>

                            <div className="flex flex-col gap-3">
                              {colItems.map(item => (
                                <div 
                                  key={item.id}
                                  className="bg-white border border-slate-150 hover:border-purple-300 p-3 rounded-xl shadow-sm transition duration-200 group cursor-pointer hover:shadow"
                                  onClick={() => handleOpenPreview(item)}
                                >
                                  <div className="text-[9px] font-bold text-purple-600 uppercase tracking-wider mb-1">{item.category}</div>
                                  <h5 className="font-bold text-sm text-slate-800 line-clamp-1 mb-1">{item.title}</h5>
                                  <p className="text-[11px] text-slate-500 line-clamp-2 mb-2.5 leading-relaxed">{item.shortDescription}</p>
                                  
                                  <div className="flex justify-between items-center text-[9px] text-slate-450 border-t border-slate-100 pt-2">
                                    <span>Reach: {item.reach}</span>
                                    <div className="flex items-center gap-1 transition duration-150" onClick={e => e.stopPropagation()}>
                                      <button onClick={() => handleOpenEdit(item)} className="p-1 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded transition"><Edit3 size={11} /></button>
                                      <button onClick={() => handleDuplicate(item)} className="p-1 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded transition"><Copy size={11} /></button>
                                      <button onClick={() => handleDelete(item)} className="p-1 hover:bg-rose-50 text-rose-600 hover:text-rose-700 rounded transition"><Trash2 size={11} /></button>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {colItems.length === 0 && (
                                <div className="text-center py-8 text-xs text-slate-400 font-semibold italic">
                                  No campaigns
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* TIMELINE VIEW */}
                  {activeView === 'timeline' && (
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm relative">
                      <div className="absolute left-[34px] md:left-[179px] top-8 bottom-8 w-[2px] bg-slate-150" />
                      
                      <div className="flex flex-col gap-6 relative">
                        {announcements.map(item => (
                          <div key={item.id} className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8 group">
                            {/* Date Column */}
                            <div className="w-20 md:w-36 text-xs text-slate-500 font-semibold shrink-0 pt-1 text-left md:text-right pl-12 md:pl-0">
                              <div>Start: {item.startDate}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">End: {item.endDate}</div>
                            </div>

                            {/* Timeline Point */}
                            <div className="absolute left-6 md:left-[172px] w-4 h-4 rounded-full border-4 border-white bg-purple-500 group-hover:bg-purple-600 shadow transition shrink-0 z-10" />

                            {/* Card Details */}
                            <div className="flex-1 bg-white border border-slate-150 hover:border-purple-200 p-5 rounded-2xl shadow-sm hover:shadow transition-all duration-300 hover:translate-x-1">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-purple-650 uppercase tracking-wider bg-purple-50 px-2.5 py-0.5 rounded border border-purple-100">
                                  {item.category}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  item.status === 'Published' ? 'bg-emerald-50 text-emerald-600' :
                                  item.status === 'Scheduled' ? 'bg-blue-50 text-blue-600' :
                                  'bg-slate-50 text-slate-500'
                                }`}>
                                  {item.status}
                                </span>
                              </div>
                              <h5 className="font-extrabold text-base text-slate-800 mb-1.5">{item.title}</h5>
                              <p className="text-xs text-slate-500 mb-3.5 leading-relaxed">{item.shortDescription}</p>

                              <div className="flex flex-wrap items-center justify-between text-xs text-slate-450 pt-3 border-t border-slate-100 gap-2">
                                <div className="flex items-center gap-4">
                                  <span>Reach: <strong className="text-slate-700 font-bold">{item.reach}</strong></span>
                                  <span>Audience: <strong className="text-slate-700 font-bold">{item.targetAudience}</strong></span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button onClick={() => handleOpenPreview(item)} className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded border border-slate-200 transition text-[11px] font-semibold">Preview</button>
                                  <button onClick={() => handleOpenEdit(item)} className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded border border-slate-200 transition text-[11px] font-semibold">Edit</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CALENDAR VIEW */}
                  {activeView === 'calendar' && (
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="font-extrabold text-sm text-slate-800">July 2026</h4>
                        <div className="text-xs text-slate-400 italic">Mock Scheduler Grid</div>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-2 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                          <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1.5">{d}</div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-2">
                        {/* Empty spacer blocks to align first day in July 2026 (Wednesday is 1st) */}
                        <div className="aspect-video bg-slate-50 rounded-xl" />
                        <div className="aspect-video bg-slate-50 rounded-xl" />
                        
                        {calendarDays.map((dateStr, idx) => {
                          const dayNum = idx + 1;
                          const dayItems = announcements.filter(a => a.startDate === dateStr);
                          
                          return (
                            <div key={dateStr} className="min-h-[80px] bg-white border border-slate-150 hover:border-purple-200 rounded-xl p-2 flex flex-col justify-between shadow-sm">
                              <div className="text-xs font-bold text-slate-400">{dayNum}</div>
                              
                              <div className="flex flex-col gap-1 mt-1.5">
                                {dayItems.map(item => (
                                  <div 
                                    key={item.id}
                                    onClick={() => handleOpenPreview(item)}
                                    className={`text-[8px] font-bold px-1.5 py-0.5 rounded truncate cursor-pointer uppercase ${
                                      item.priority === 'Critical' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                      item.priority === 'High' ? 'bg-orange-50 text-orange-600' :
                                      'bg-purple-50 text-purple-650'
                                    }`}
                                    title={item.title}
                                  >
                                    {item.title}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* LIST VIEW */}
                  {activeView === 'list' && (
                    <div className="flex flex-col gap-3">
                      {announcements.map(item => (
                        <div 
                          key={item.id}
                          className="bg-white border border-slate-100 hover:border-purple-200 p-4 rounded-xl flex items-center justify-between gap-4 transition duration-200 group shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg ${
                              item.priority === 'Critical' ? 'bg-rose-50 text-rose-600' :
                              item.priority === 'High' ? 'bg-orange-50 text-orange-600' :
                              'bg-purple-50 text-purple-605'
                            }`}>
                              <Megaphone size={18} />
                            </div>
                            <div>
                              <h5 className="font-bold text-sm text-slate-805 flex items-center gap-2">
                                {item.title}
                                <span className="text-[10px] text-slate-400 normal-case font-medium">{item.id}</span>
                              </h5>
                              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.shortDescription}</p>
                              <div className="flex items-center gap-3 text-[10px] text-slate-450 mt-1.5">
                                <span>Audience: <strong>{item.targetAudience}</strong></span>
                                <span>•</span>
                                <span>Start: <strong>{item.startDate}</strong></span>
                                <span>•</span>
                                <span>Status: <strong>{item.status}</strong></span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 transition duration-150 font-bold">
                            <button onClick={() => handleOpenPreview(item)} className="p-2 bg-slate-50 hover:bg-slate-150 text-slate-500 hover:text-slate-900 rounded-lg border border-slate-200 transition"><Eye size={13} /></button>
                            <button onClick={() => handleOpenEdit(item)} className="p-2 bg-slate-50 hover:bg-slate-150 text-slate-500 hover:text-slate-900 rounded-lg border border-slate-200 transition"><Edit3 size={13} /></button>
                            <button onClick={() => handleDelete(item)} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-605 rounded-lg border border-rose-100 transition"><Trash2 size={13} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {activeTab === 'analytics' && analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Line chart: Engagement & reach trends */}
              <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
                <h4 className="font-extrabold text-sm text-slate-805 mb-4 uppercase tracking-wider">7-Day Engagement & Reach Density Trend</h4>
                <div className="h-[250px] w-full mt-6">
                  <LineChart 
                    data={analytics.engagementTimeline.reachData} 
                    color="#8B5CF6" 
                    height={220} 
                    width={500} 
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-4 border-t border-slate-100 pt-3">
                  <span>Timeline days ({analytics.engagementTimeline.labels[0]} to {analytics.engagementTimeline.labels[6]})</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-purple-500 rounded-full" /> Total Reach</span>
                  </div>
                </div>
              </div>

              {/* Donut chart: Categories breakdown */}
              <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-805 mb-6 uppercase tracking-wider">Communications by Category</h4>
                  <div className="flex justify-center mb-6">
                    <DonutChart data={analytics.categoryDistribution.map((item, idx) => ({ ...item, color: ['#8B5CF6', '#3B82F6', '#EC4899', '#10B981', '#F59E0B'][idx % 5] }))} size={150} />
                  </div>
                </div>

                <div className="divide-y divide-slate-100 max-h-[160px] overflow-y-auto pr-1">
                  {analytics.categoryDistribution.map((item, idx) => (
                    <div key={item.label} className="py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ['#8B5CF6', '#3B82F6', '#EC4899', '#10B981', '#F59E0B'][idx % 5] }} />
                        <span className="text-slate-700 font-bold truncate">{item.label}</span>
                      </div>
                      <span className="text-slate-500 font-bold shrink-0">{item.value} ({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Communities comparison bars */}
              <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
                <h4 className="font-extrabold text-sm text-slate-805 mb-6 uppercase tracking-wider">Reach Comparison by Community</h4>
                <div className="h-[180px] w-full">
                  <BarChart 
                    data={analytics.communityData.map(c => c.reach)} 
                    labels={analytics.communityData.map(c => c.community)} 
                    height={160} 
                    width={400}
                    colors={['#8B5CF6', '#3B82F6']}
                  />
                </div>
              </div>

              {/* Cities comparison bars */}
              <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
                <h4 className="font-extrabold text-sm text-slate-805 mb-6 uppercase tracking-wider">Reach Comparison by City</h4>
                <div className="h-[180px] w-full">
                  <BarChart 
                    data={analytics.cityData.map(c => c.reach)} 
                    labels={analytics.cityData.map(c => c.city)} 
                    height={160} 
                    width={400}
                    colors={['#EC4899', '#F59E0B']}
                  />
                </div>
              </div>

              {/* High & Low performing lists */}
              <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
                <h4 className="font-extrabold text-sm text-slate-805 mb-4 uppercase tracking-wider">Campaign Performance Ranking</h4>
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-slate-450 uppercase mb-2">Top Engaging Broadcasts</div>
                    <div className="flex flex-col gap-2">
                      {analytics.topPerforming.map(item => (
                        <div key={item.id} className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-750 truncate">{item.title}</span>
                          <span className="font-bold text-emerald-600 ml-2">{item.engagementRate}%</span>
                        </div>
                      ))}
                      {analytics.topPerforming.length === 0 && <span className="text-xs text-slate-500 italic">No published data yet</span>}
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-100 pt-3">
                    <div className="text-[10px] font-bold text-slate-450 uppercase mb-2">Underperforming Broadcasts</div>
                    <div className="flex flex-col gap-2">
                      {analytics.lowPerforming.map(item => (
                        <div key={item.id} className="p-2 bg-rose-50 border border-rose-100 rounded-xl flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-755 truncate">{item.title}</span>
                          <span className="font-bold text-rose-600 ml-2">{item.engagementRate}%</span>
                        </div>
                      ))}
                      {analytics.lowPerforming.length === 0 && <span className="text-xs text-slate-500 italic">No published data yet</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Audit Trail Tab */}
          {activeTab === 'audits' && (
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">Administrative Audit History Logs</h4>
                  <p className="text-xs text-slate-505">Immutable audit logs reflecting all announcements adjustments.</p>
                </div>

                <div className="flex items-center gap-2 font-bold">
                  <button
                    onClick={() => handleExport('CSV')}
                    className="p-2 bg-white border border-slate-200 text-slate-700 hover:text-purple-650 hover:border-purple-250 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Download size={13} />
                    Export Audits
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to wipe all logs from the database? This is immutable.')) {
                        communicationAuditService.clearLogs();
                        loadAllData();
                        triggerToast('Audit database logs wiped.', 'warning');
                      }
                    }}
                    className="p-2 bg-rose-50 border border-rose-200 text-rose-600 hover:text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold transition"
                  >
                    Wipe Logs
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Operator</th>
                      <th className="p-4">Action</th>
                      <th className="p-4">Announcement Target</th>
                      <th className="p-4">Change Delta</th>
                      <th className="p-4">Audit Rationale Reason</th>
                      <th className="p-4 w-32">Security Meta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-xs bg-white">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-mono text-slate-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-4 font-bold text-slate-800 font-sans">
                          {log.operator}
                          <div className="text-[10px] text-slate-500 font-semibold">{log.role}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded border font-bold uppercase text-[9px] ${
                            log.action.includes('Created') ? 'bg-purple-50 border-purple-100 text-purple-600' :
                            log.action.includes('Published') ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                            log.action.includes('Deleted') ? 'bg-rose-50 border-rose-100 text-rose-605' :
                            log.action.includes('Emergency') ? 'bg-rose-600 border-rose-605 text-white font-extrabold animate-pulse' :
                            'bg-blue-50 border-blue-100 text-blue-600'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-800 max-w-[200px] truncate">{log.announcementTitle}</div>
                          <div className="text-[10px] text-slate-450 font-mono mt-0.5">{log.announcementId}</div>
                        </td>
                        <td className="p-4 font-mono text-slate-500 break-all max-w-[200px]">
                          {log.prevValue ? (
                            <span className="line-through text-red-500/80 mr-1.5">{log.prevValue.substring(0, 30)}</span>
                          ) : null}
                          {log.newValue ? (
                            <span className="text-emerald-605 font-bold">{log.newValue.substring(0, 30)}</span>
                          ) : null}
                        </td>
                        <td className="p-4 text-slate-600 italic max-w-[250px] leading-relaxed">
                          "{log.reason}"
                        </td>
                        <td className="p-4 text-slate-450 font-mono leading-tight whitespace-nowrap">
                          IP: {log.ip}
                          <div className="text-[9px] text-slate-500">{log.browser.substring(0, 20)}...</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* -------------------- DRAWERS & MODALS -------------------- */}

      {/* RICH ANNOUNCEMENT COMPOSER MODAL */}
      <AnimatePresence>
        {isComposeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-950/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Megaphone className="text-purple-600" size={20} />
                  <h3 className="font-extrabold text-lg text-slate-800">
                    {composeForm.id ? `Edit Announcement Campaign: ${composeForm.id}` : 'Create New Broadcast Campaign'}
                  </h3>
                </div>
                <button 
                  onClick={() => {
                    if (window.confirm('Close composer? Any unsaved edits will be cached in local recovery.')) {
                      setIsComposeOpen(false);
                    }
                  }}
                  className="p-1 hover:bg-slate-150 rounded-lg text-slate-500 hover:text-slate-900 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                {/* Form Inputs (Cols 1 & 2) */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  {/* Campaign Title & Subtitle */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-550 mb-1.5 uppercase tracking-wider">Campaign Title *</label>
                      <input 
                        type="text"
                        value={composeForm.title}
                        onChange={(e) => setComposeForm(prev => ({ ...prev, title: e.target.value }))}
                        className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500/30 ${composeFormErrors.title ? 'border-red-500' : 'border-slate-200 focus:border-purple-500'}`}
                        placeholder="e.g. Teej Festival Program 2026"
                      />
                      {composeFormErrors.title && <span className="text-[10px] text-red-400 font-semibold mt-1">{composeFormErrors.title}</span>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-550 mb-1.5 uppercase tracking-wider">Sub-title / Caption</label>
                      <input 
                        type="text"
                        value={composeForm.subtitle}
                        onChange={(e) => setComposeForm(prev => ({ ...prev, subtitle: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-purple-500 rounded-lg text-sm text-slate-800 focus:outline-none"
                        placeholder="e.g. swadeshi foods & stalls"
                      />
                    </div>
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-550 mb-1.5 uppercase tracking-wider">Short Description (Push Snippet) *</label>
                    <input 
                      type="text"
                      value={composeForm.shortDescription}
                      onChange={(e) => setComposeForm(prev => ({ ...prev, shortDescription: e.target.value }))}
                      className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500/30 ${composeFormErrors.shortDescription ? 'border-red-500' : 'border-slate-200 focus:border-purple-500'}`}
                      placeholder="Brief headline that fits on notification screen summaries..."
                    />
                    {composeFormErrors.shortDescription && <span className="text-[10px] text-red-400 font-semibold mt-1">{composeFormErrors.shortDescription}</span>}
                  </div>

                  {/* Rich Text content simulator */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider">Full Announcement Description (HTML Rich Text) *</label>
                      <div className="flex gap-1 text-[10px] font-bold">
                        <button 
                          type="button"
                          onClick={() => setComposeForm(prev => ({ ...prev, content: prev.content + '<strong>TEXT</strong>' }))}
                          className="bg-slate-50 px-2 py-0.5 border border-slate-200 text-slate-600 rounded hover:bg-slate-100 hover:text-slate-900 transition font-semibold text-xs"
                        >
                          Bold
                        </button>
                        <button 
                          type="button"
                          onClick={() => setComposeForm(prev => ({ ...prev, content: prev.content + '<em>TEXT</em>' }))}
                          className="bg-slate-50 px-2 py-0.5 border border-slate-200 text-slate-600 rounded hover:bg-slate-100 hover:text-slate-900 transition font-semibold text-xs"
                        >
                          Italic
                        </button>
                        <button 
                          type="button"
                          onClick={() => setComposeForm(prev => ({ ...prev, content: prev.content + '<p>Paragraph</p>' }))}
                          className="bg-slate-50 px-2 py-0.5 border border-slate-200 text-slate-600 rounded hover:bg-slate-100 hover:text-slate-900 transition font-semibold text-xs"
                        >
                          P
                        </button>
                      </div>
                    </div>
                    <textarea 
                      value={composeForm.content}
                      onChange={(e) => setComposeForm(prev => ({ ...prev, content: e.target.value }))}
                      rows={5}
                      className={`w-full p-3 bg-slate-50 border rounded-lg text-sm text-slate-800 focus:outline-none font-mono ${composeFormErrors.content ? 'border-red-500' : 'border-slate-200 focus:border-purple-500'}`}
                      placeholder="<p>Write detailed broadcast description here. HTML supports tagging links, lists, structural layout...</p>"
                    />
                    {composeFormErrors.content && <span className="text-[10px] text-red-400 font-semibold mt-1">{composeFormErrors.content}</span>}
                  </div>

                  {/* Category & Priority selector */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-550 mb-1.5 uppercase tracking-wider">Communication Category</label>
                      <select 
                        value={composeForm.category}
                        onChange={(e) => setComposeForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-850 focus:outline-none focus:border-purple-500"
                      >
                        {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-550 mb-1.5 uppercase tracking-wider">Priority Level</label>
                      <select 
                        value={composeForm.priority}
                        onChange={(e) => setComposeForm(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-850 focus:outline-none focus:border-purple-500"
                      >
                        {prioritiesList.map(pri => <option key={pri} value={pri}>{pri}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Target Audience Engine */}
                  <div className="bg-slate-50/50 p-4 border border-slate-200 rounded-xl mt-2">
                    <h5 className="text-xs font-extrabold text-purple-650 uppercase tracking-wider mb-3">Audience Targeting Filters</h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Target Dimension</label>
                        <select 
                          value={composeForm.targetType}
                          onChange={(e) => setComposeForm(prev => ({ ...prev, targetType: e.target.value }))}
                          className="w-full px-3 py-1.5 bg-white border border-slate-250 rounded text-xs text-slate-700 focus:outline-none focus:border-purple-500"
                        >
                          <option value="Platform">Entire Platform</option>
                          <option value="Cities">Cities Selected</option>
                          <option value="Community">Communities Selected</option>
                          <option value="Members">Platform Members</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Demographics Group</label>
                        <select 
                          value={composeForm.targetAudience}
                          onChange={(e) => setComposeForm(prev => ({ ...prev, targetAudience: e.target.value }))}
                          className="w-full px-3 py-1.5 bg-white border border-slate-250 rounded text-xs text-slate-700 focus:outline-none focus:border-purple-500"
                        >
                          <option value="All Platform Members">All Platform Members</option>
                          <option value="Community Heads">Community Heads Only</option>
                          <option value="Volunteers">Active Volunteers</option>
                          <option value="Donors">Samaj Campaign Donors</option>
                          <option value="Premium Members">Premium Subscribers</option>
                          <option value="Matrimonial Users">Matrimonial Registered</option>
                          <option value="Professional Directory Users">Professional Directory Members</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Specific Community</label>
                        <select 
                          value={composeForm.community}
                          onChange={(e) => setComposeForm(prev => ({ ...prev, community: e.target.value }))}
                          className="w-full px-3 py-1.5 bg-white border border-slate-250 rounded text-xs text-slate-700 focus:outline-none focus:border-purple-500"
                        >
                          <option value="All Communities">All Communities</option>
                          {communitiesList.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Specific City</label>
                        <select 
                          value={composeForm.city}
                          onChange={(e) => setComposeForm(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full px-3 py-1.5 bg-white border border-slate-250 rounded text-xs text-slate-700 focus:outline-none focus:border-purple-500"
                        >
                          <option value="All Cities">All Cities</option>
                          {citiesList.map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Banner Image, Tags, Theme color */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-550 mb-1.5 uppercase tracking-wider">Banner URL</label>
                      <input 
                        type="text"
                        value={composeForm.banner}
                        onChange={(e) => setComposeForm(prev => ({ ...prev, banner: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-purple-500 rounded-lg text-sm text-slate-800 focus:outline-none"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-550 mb-1.5 uppercase tracking-wider">Tags (comma split)</label>
                      <input 
                        type="text"
                        value={composeForm.tags}
                        onChange={(e) => setComposeForm(prev => ({ ...prev, tags: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-purple-500 rounded-lg text-sm text-slate-800 focus:outline-none"
                        placeholder="election, results, committee"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-550 mb-1.5 uppercase tracking-wider">Theme Accents (Hex)</label>
                      <div className="flex gap-2">
                        <input 
                          type="color"
                          value={composeForm.themeColor}
                          onChange={(e) => setComposeForm(prev => ({ ...prev, themeColor: e.target.value }))}
                          className="w-10 h-9 p-0 bg-transparent border-0 rounded cursor-pointer shrink-0"
                        />
                        <input 
                          type="text"
                          value={composeForm.themeColor}
                          onChange={(e) => setComposeForm(prev => ({ ...prev, themeColor: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-purple-500 rounded-lg text-sm text-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CTA Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-550 mb-1.5 uppercase tracking-wider">CTA Button text</label>
                      <input 
                        type="text"
                        value={composeForm.ctaButton}
                        onChange={(e) => setComposeForm(prev => ({ ...prev, ctaButton: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-purple-500 rounded-lg text-sm text-slate-800 focus:outline-none"
                        placeholder="e.g. Register RSVP / Contribute"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-550 mb-1.5 uppercase tracking-wider">CTA URL Link</label>
                      <input 
                        type="text"
                        value={composeForm.ctaUrl}
                        onChange={(e) => setComposeForm(prev => ({ ...prev, ctaUrl: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-purple-500 rounded-lg text-sm text-slate-800 focus:outline-none"
                        placeholder="e.g. https://merisamaj.com/rsvp"
                      />
                    </div>
                  </div>

                  {/* Scheduling options */}
                  <div className="bg-slate-50/50 p-4 border border-slate-200 rounded-xl">
                    <h5 className="text-xs font-extrabold text-purple-650 uppercase tracking-wider mb-3">Broadcast Scheduling Center</h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">State on Save</label>
                        <select 
                          value={composeForm.status}
                          onChange={(e) => setComposeForm(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full px-3 py-1.5 bg-white border border-slate-250 rounded text-xs text-slate-750 focus:outline-none focus:border-purple-500"
                        >
                          <option value="Draft">Draft (Save & Close)</option>
                          <option value="Scheduled">Scheduled (Auto publish on date)</option>
                          <option value="Published">Published Instantly</option>
                        </select>
                      </div>

                      {composeForm.status === 'Scheduled' && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">Publish Date & Time *</label>
                          <input 
                            type="datetime-local"
                            value={composeForm.scheduleTime}
                            onChange={(e) => setComposeForm(prev => ({ ...prev, scheduleTime: e.target.value }))}
                            className={`w-full px-3 py-1.5 bg-white border rounded text-xs text-slate-755 focus:outline-none ${composeFormErrors.scheduleTime ? 'border-red-500' : 'border-slate-250 focus:border-purple-500'}`}
                          />
                          {composeFormErrors.scheduleTime && <span className="text-[10px] text-red-400 font-semibold mt-1">{composeFormErrors.scheduleTime}</span>}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Campaign Start Date</label>
                        <input 
                          type="date"
                          value={composeForm.startDate}
                          onChange={(e) => setComposeForm(prev => ({ ...prev, startDate: e.target.value }))}
                          className="w-full px-3 py-1.5 bg-white border border-slate-250 rounded text-xs text-slate-755 focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Campaign Auto-Expiry End Date</label>
                        <input 
                          type="date"
                          value={composeForm.endDate}
                          onChange={(e) => setComposeForm(prev => ({ ...prev, endDate: e.target.value }))}
                          className="w-full px-3 py-1.5 bg-white border border-slate-250 rounded text-xs text-slate-755 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar Preview & Stats Panel (Col 3) */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-5 self-start w-full">
                  {/* Version History if Editing */}
                  {formVersionHistory.length > 0 && (
                    <div>
                      <h5 className="text-[10px] font-extrabold text-slate-500 tracking-wider uppercase mb-2">Campaign Version History</h5>
                      <div className="flex flex-col gap-1.5 max-h-24 overflow-y-auto pr-1">
                        {formVersionHistory.map(v => (
                          <div key={v.version} className="p-1.5 bg-white border border-slate-150 rounded flex justify-between items-center text-[10px]">
                            <span className="font-bold text-purple-605">Ver {v.version}</span>
                            <span className="text-slate-500">{new Date(v.updatedAt).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Live audience reach estimations */}
                  {composerAudienceStats && (
                    <div>
                      <h5 className="text-[10px] font-extrabold text-slate-500 tracking-wider uppercase mb-2">Real-time Reach Target Estimation</h5>
                      <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl">
                        <div className="text-2xl font-extrabold text-purple-600">
                          {composerAudienceStats.reach.toLocaleString()}
                        </div>
                        <div className="text-[9px] text-slate-500 uppercase tracking-wide mt-0.5">Estimated platform members target</div>

                        <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                          <div className="flex justify-between">
                            <span>Push Banners:</span>
                            <strong className="text-slate-700">{composerAudienceStats.breakdown.push.toLocaleString()}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Email Letters:</span>
                            <strong className="text-slate-700">{composerAudienceStats.breakdown.email.toLocaleString()}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>WhatsApp (Mock):</span>
                            <strong className="text-slate-700">{composerAudienceStats.breakdown.whatsapp.toLocaleString()}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Smart Filters warnings or conflict checks */}
                  {composerAudienceValidation && (
                    <div>
                      <h5 className="text-[10px] font-extrabold text-slate-500 tracking-wider uppercase mb-2">Target validation checks</h5>
                      <div className="flex flex-col gap-2">
                        {composerAudienceValidation.warnings.map((warn, i) => (
                          <div key={i} className="p-2.5 bg-amber-50 border border-amber-150 text-amber-605 text-[10px] rounded-lg flex items-start gap-1.5 font-medium">
                            <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                            <span>{warn}</span>
                          </div>
                        ))}

                        {composerAudienceValidation.conflicts.map((conf, i) => (
                          <div key={i} className="p-2.5 bg-rose-50 border border-rose-150 text-rose-600 text-[10px] rounded-lg flex flex-col gap-1 font-medium">
                            <div className="flex items-center gap-1.5 font-bold">
                              <ShieldAlert size={12} className="shrink-0 text-red-400" />
                              <span>{conf.type}</span>
                            </div>
                            <span className="italic">"{conf.description}"</span>
                          </div>
                        ))}

                        {composerAudienceValidation.warnings.length === 0 && composerAudienceValidation.conflicts.length === 0 && (
                          <div className="p-2.5 bg-emerald-55 border border-emerald-100 text-emerald-600 text-[10px] rounded-lg flex items-center gap-1.5 font-extrabold">
                            <Check size={12} />
                            <span>Validation checks passed. Ready to broadcast.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sample members preview */}
                  {composerAudiencePreview.length > 0 && (
                    <div>
                      <h5 className="text-[10px] font-extrabold text-slate-500 tracking-wider uppercase mb-2">Sample recipients preview</h5>
                      <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                        {composerAudiencePreview.map((m, i) => (
                          <div key={i} className="p-2 bg-white border border-slate-150 rounded-lg text-[10px] flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-650 font-black flex items-center justify-center shrink-0 uppercase">
                              {m.name.slice(0, 1)}
                            </div>
                            <div className="truncate">
                              <div className="font-extrabold text-slate-800 truncate">{m.name}</div>
                              <div className="text-slate-550 truncate">{m.city} • {m.community}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Composer Footer Actions */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                <button
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 text-xs font-bold rounded-xl transition shadow-sm"
                >
                  Discard Draft
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveAnnouncement(false)}
                    className="px-4 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-650 hover:text-purple-755 text-xs font-bold rounded-xl transition"
                  >
                    Save Campaign Draft
                  </button>

                  <button
                    onClick={() => handleSaveAnnouncement(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow transition"
                  >
                    {composeForm.status === 'Scheduled' ? 'Schedule Broadcast' : 'Publish Broadcast Immediately'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIVE PREVIEW STUDIO DRAWER */}
      <AnimatePresence>
        {isPreviewOpen && previewItem && (
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white border-l border-slate-100 shadow-2xl flex flex-col justify-between animate-slideLeft">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-purple-650 uppercase tracking-wider">Live Preview Studio</h3>
                <h4 className="font-extrabold text-base text-slate-800 truncate max-w-[280px] mt-0.5">{previewItem.title}</h4>
              </div>
              <button 
                onClick={() => {
                  setIsPreviewOpen(false);
                  setPreviewItem(null);
                }}
                className="p-1 hover:bg-slate-150 rounded-lg text-slate-500 hover:text-slate-900 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Studio Controls (Device & Channel select) */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center gap-4">
              {/* Screen Device */}
              <div className="flex bg-white rounded-lg p-0.5 border border-slate-200 shadow-sm">
                {[
                  { id: 'desktop', icon: Laptop },
                  { id: 'tablet', icon: Tablet },
                  { id: 'mobile', icon: Smartphone }
                ].map(dev => (
                  <button
                    key={dev.id}
                    onClick={() => setPreviewDevice(dev.id)}
                    className={`p-1.5 rounded transition ${previewDevice === dev.id ? 'bg-purple-50 text-purple-600 border border-purple-100 font-bold' : 'text-slate-500 hover:text-slate-805'}`}
                  >
                    <dev.icon size={14} />
                  </button>
                ))}
              </div>

              {/* Template channel */}
              <div className="flex bg-white rounded-lg p-0.5 border border-slate-200 text-xs shadow-sm">
                {[
                  { id: 'web', icon: Globe, text: 'Web' },
                  { id: 'push', icon: Megaphone, text: 'Push' },
                  { id: 'email', icon: Mail, text: 'Email' },
                  { id: 'popup', icon: MessageSquare, text: 'Popup' }
                ].map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => setPreviewChannel(ch.id)}
                    className={`px-2.5 py-1 rounded transition flex items-center gap-1 ${
                      previewChannel === ch.id 
                        ? 'bg-purple-50 text-purple-605 font-bold border border-purple-100' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <ch.icon size={11} />
                    {ch.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Screen Frame Display */}
            <div className="p-6 bg-slate-50/50 flex-1 overflow-y-auto flex items-center justify-center border-b border-slate-100">
              <div className={`transition-all duration-300 border border-slate-200 bg-slate-50 shadow-2xl relative overflow-hidden flex flex-col ${
                previewDevice === 'mobile' ? 'w-[280px] h-[480px] rounded-[32px] border-8 border-slate-350' :
                previewDevice === 'tablet' ? 'w-[400px] h-[550px] rounded-[24px] border-8 border-slate-350' :
                'w-full max-w-md h-[400px] rounded-2xl'
              }`}>
                {/* Mobile notch simulator */}
                {previewDevice === 'mobile' && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-350 rounded-b-xl z-55 flex justify-center items-start">
                    <div className="w-2.5 h-2.5 bg-black rounded-full mt-1" />
                  </div>
                )}

                {/* Simulated Channel Interface Frame */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-start pt-8">
                  {/* PUSH NOTIFICATION CHANNEL */}
                  {previewChannel === 'push' && (
                    <div className="p-3.5 bg-white border border-slate-205 rounded-2xl shadow-lg flex gap-3 animate-bounce">
                      <div className="p-2 bg-purple-50 text-purple-600 rounded-xl self-start border border-purple-100">
                        <Megaphone size={16} />
                      </div>
                      <div className="truncate flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-purple-650 tracking-wider">MERI SAMAJ</span>
                          <span className="text-[9px] text-slate-400">now</span>
                        </div>
                        <h6 className="text-xs font-bold text-slate-800 mt-0.5 truncate">{previewItem.title}</h6>
                        <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">{previewItem.shortDescription}</p>
                      </div>
                    </div>
                  )}

                  {/* POPUP MODAL CHANNEL */}
                  {previewChannel === 'popup' && (
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xl my-auto animate-fadeIn relative">
                      {previewItem.banner && (
                        <img src={previewItem.banner} alt={previewItem.title} className="w-full h-24 object-cover rounded-lg mb-3" />
                      )}
                      <span className="text-[9px] font-bold text-purple-650 uppercase tracking-widest">{previewItem.category}</span>
                      <h5 className="text-sm font-extrabold text-slate-800 mt-1">{previewItem.title}</h5>
                      <p className="text-[11px] text-slate-500 mt-2 line-clamp-3 leading-relaxed">{previewItem.shortDescription}</p>
                      
                      {previewItem.ctaButton && (
                        <button className="w-full mt-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white font-bold text-[10px] uppercase tracking-wider">
                          {previewItem.ctaButton}
                        </button>
                      )}
                    </div>
                  )}

                  {/* EMAIL TEMPLATE CHANNEL */}
                  {previewChannel === 'email' && (
                    <div className="bg-white text-slate-800 p-5 rounded-xl border border-slate-200 shadow-xl overflow-y-auto text-left flex flex-col gap-4 font-serif">
                      {/* Logo header */}
                      <div className="border-b pb-3 text-center font-sans">
                        <div className="text-base font-black tracking-widest text-purple-900">MERI SAMAJ BROADCAST</div>
                        <div className="text-[9px] text-slate-400 tracking-wide uppercase mt-0.5">{previewItem.category}</div>
                      </div>

                      {previewItem.banner && (
                        <img src={previewItem.banner} alt={previewItem.title} className="w-full h-32 object-cover rounded" />
                      )}

                      <div className="font-sans text-xs">
                        <h4 className="text-base font-extrabold text-slate-900 mb-1 leading-tight">{previewItem.title}</h4>
                        <div className="text-[10px] text-slate-500 italic">Dear Community Members,</div>
                        
                        <div className="mt-3 text-xs leading-relaxed text-slate-700 font-normal" dangerouslySetInnerHTML={{ __html: previewItem.content }} />

                        {previewItem.ctaButton && (
                          <div className="text-center mt-6">
                            <a href={previewItem.ctaUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-purple-750 text-white font-bold text-[11px] uppercase tracking-wider rounded-lg no-underline inline-block shadow">
                              {previewItem.ctaButton}
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="border-t pt-3 mt-4 text-center text-[9px] text-slate-400 font-sans">
                        This is an official communication sent via MeriSamaj administrative platform.
                      </div>
                    </div>
                  )}

                  {/* WEB BANNER CARD VIEW */}
                  {previewChannel === 'web' && (
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl flex flex-col">
                      {previewItem.banner && (
                        <img src={previewItem.banner} alt={previewItem.title} className="w-full h-36 object-cover" />
                      )}
                      <div className="p-4 text-left">
                        <span className="text-[9px] font-bold text-purple-655 uppercase tracking-widest">{previewItem.category}</span>
                        <h5 className="text-sm font-extrabold text-slate-800 mt-1">{previewItem.title}</h5>
                        <p className="text-[11px] text-slate-500 mt-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: previewItem.content }} />
                        
                        {previewItem.ctaButton && (
                          <a href={previewItem.ctaUrl} target="_blank" rel="noopener noreferrer" className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white font-bold text-[10px] uppercase tracking-wider inline-block text-center no-underline">
                            {previewItem.ctaButton}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <span className="text-xs text-slate-550 font-mono">Template: {previewChannel.toUpperCase()}</span>
              <button 
                onClick={() => handleOpenEdit(previewItem)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <Edit3 size={12} />
                Edit Campaign
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* DELIVERY MONITORING DRAWER */}
      <AnimatePresence>
        {isDeliveryMonitorOpen && monitoringItem && (
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white border-l border-slate-100 shadow-2xl flex flex-col justify-between animate-slideLeft">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-xs text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  Live Delivery & Channel Monitoring
                </h3>
                <h4 className="font-extrabold text-base text-slate-805 truncate max-w-[400px] mt-0.5">{monitoringItem.title}</h4>
              </div>
              <button 
                onClick={() => {
                  setIsDeliveryMonitorOpen(false);
                  setMonitoringItem(null);
                  setDeliveryStats(null);
                  setDeliveryLogs([]);
                }}
                className="p-1 hover:bg-slate-150 rounded-lg text-slate-500 hover:text-slate-900 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Metrics Breakdown Grid */}
            {deliveryStats && (
              <div className="p-4 bg-slate-50 border-b border-slate-100 grid grid-cols-5 gap-2 text-center text-xs font-bold">
                <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <div className="font-bold text-slate-500">Total Sent</div>
                  <div className="text-lg font-extrabold text-slate-800">{deliveryStats.total}</div>
                </div>
                <div className="p-2 bg-emerald-50 border border-emerald-150 rounded-lg shadow-sm">
                  <div className="font-bold text-emerald-650">Delivered</div>
                  <div className="text-lg font-extrabold text-emerald-700">{deliveryStats.delivered}</div>
                </div>
                <div className="p-2 bg-rose-50 border border-rose-150 rounded-lg shadow-sm">
                  <div className="font-bold text-rose-650">Failed</div>
                  <div className="text-lg font-extrabold text-rose-700">{deliveryStats.failed}</div>
                </div>
                <div className="p-2 bg-blue-50 border border-blue-150 rounded-lg shadow-sm">
                  <div className="font-bold text-blue-650">Opened</div>
                  <div className="text-lg font-extrabold text-blue-700">{deliveryStats.read}</div>
                </div>
                <div className="p-2 bg-purple-50 border border-purple-150 rounded-lg shadow-sm">
                  <div className="font-bold text-purple-650">Clicked</div>
                  <div className="text-lg font-extrabold text-purple-700">{deliveryStats.clicked}</div>
                </div>
              </div>
            )}

            {/* Filters / Search within delivery */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Filter users..."
                  value={deliverySearchQuery}
                  onChange={(e) => setDeliverySearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none text-slate-800 shadow-sm"
                />
              </div>

              <select 
                value={deliveryFilterStatus}
                onChange={(e) => setDeliveryFilterStatus(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-750 w-full sm:w-36 focus:outline-none shadow-sm font-bold"
              >
                <option value="All">All Deliveries</option>
                <option value="Clicked">Clicked Link</option>
                <option value="Read">Read Notice</option>
                <option value="Delivered">Delivered Only</option>
                <option value="Failed">Failed Gateways</option>
                <option value="Dismissed">Dismissed</option>
              </select>
            </div>

            {/* Delivery Logs List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-105 bg-slate-50 text-[9px] font-bold text-slate-550 uppercase tracking-wider">
                      <th className="p-3">User</th>
                      <th className="p-3">Channel</th>
                      <th className="p-3">Gateway Status</th>
                      <th className="p-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {deliveryLogs
                      .filter(l => {
                        if (deliveryFilterStatus !== 'All' && l.status !== deliveryFilterStatus) return false;
                        if (deliverySearchQuery.trim() && !l.user.toLowerCase().includes(deliverySearchQuery.toLowerCase())) return false;
                        return true;
                      })
                      .map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 font-bold text-slate-800">{log.user}</td>
                          <td className="p-3 text-slate-600">{log.channel}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              log.status === 'Failed' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                              log.status === 'Clicked' ? 'bg-purple-50 text-purple-650 border border-purple-100' :
                              log.status === 'Read' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                              'bg-slate-50 text-slate-500 border border-slate-200'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="p-3 text-right text-slate-500 font-mono text-[9px]">{log.details}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer with Retry Action */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <span className="text-xs text-slate-500 italic">Queue updates in real-time</span>
              {deliveryStats?.failed > 0 && (
                <button
                  onClick={handleRetryFailedDeliveries}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <RefreshCw size={12} />
                </button>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* EMERGENCY SAFETY VERIFICATION PROMPT */}
      <AnimatePresence>
        {isEmergencyConfirmOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 p-6 rounded-2xl w-full max-w-md shadow-2xl text-center relative"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200 shadow-sm">
                <AlertTriangle size={32} className="animate-bounce" />
              </div>

              <h4 className="text-lg font-black text-red-600 uppercase tracking-wider mb-2">Critical Security Verification</h4>
              <p className="text-sm text-slate-500 mb-5 leading-relaxed font-medium">
                You are about to launch a <strong className="text-red-650">Critical Emergency Broadcast Alert</strong>. This will instantly override member preferences and push notifications to all users on the platform.
              </p>

              {/* Justification input */}
              <div className="text-left mb-6">
                <label className="block text-xs font-bold text-slate-550 mb-2 uppercase tracking-wide">
                  Emergency Justification Reason (Mandatory) *
                </label>
                <textarea 
                  rows={3}
                  value={emergencyReason}
                  onChange={(e) => setEmergencyReason(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-red-200 rounded-xl text-sm focus:outline-none focus:border-red-500 text-slate-805 shadow-sm"
                  placeholder="Provide brief legal/safety justification details for the immutable security logs..."
                />
              </div>

              <div className="flex gap-3 font-bold">
                <button
                  onClick={() => setIsEmergencyConfirmOpen(false)}
                  className="flex-1 py-2.5 bg-white hover:bg-slate-100 border border-slate-205 text-slate-500 hover:text-slate-800 text-xs rounded-xl transition shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={triggerEmergencyBroadcast}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-550 text-white text-xs font-bold rounded-xl shadow transition"
                >
                  Authorize Alert
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* JUSTIFICATION REASON DIALOG FOR MODIFICATIONS */}
      <AnimatePresence>
        {isReasonModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 p-6 rounded-2xl w-full max-w-md shadow-2xl text-center"
            >
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-100 shadow-sm">
                <ShieldAlert size={22} />
              </div>

              <h4 className="text-base font-extrabold text-slate-800 uppercase tracking-wider mb-2">Administrative Audit Rationale</h4>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed font-medium">
                Meri Samaj requires a detailed justification for every administrative action. Please verify your reason below to complete this update.
              </p>

              {/* Justification reason input */}
              <div className="text-left mb-6">
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Change Justification Reason *
                </label>
                <input 
                  type="text"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-purple-500 rounded-xl text-sm text-slate-800 focus:outline-none shadow-sm"
                  placeholder="e.g. Schedule dates updated based on core committee feedback."
                  autoFocus
                />
              </div>

              <div className="flex gap-3 font-bold">
                <button
                  onClick={() => setIsReasonModalOpen(false)}
                  className="flex-1 py-2 bg-white hover:bg-slate-100 border border-slate-205 text-slate-500 hover:text-slate-800 text-xs rounded-xl transition shadow-sm"
                >
                  Cancel Action
                </button>
                <button
                  onClick={handleReasonSubmit}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition"
                >
                  Confirm Reason
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXPORT OPTIONS MODAL */}
      <AnimatePresence>
        {isExportOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 p-6 rounded-2xl w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <FileSpreadsheet size={16} className="text-purple-600" />
                  Select Export Format
                </h4>
                <button onClick={() => setIsExportOpen(false)} className="text-slate-400 hover:text-slate-800"><X size={16} /></button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6 font-bold">
                {[
                  { id: 'PDF', label: 'PDF Report' },
                  { id: 'Excel', label: 'Excel Spreadsheet' },
                  { id: 'CSV', label: 'CSV Spreadsheet' },
                  { id: 'JSON', label: 'JSON Dataset' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setExportType(item.id)}
                    className={`p-3 rounded-xl border text-xs font-bold transition text-center shadow-sm ${
                      exportType === item.id 
                        ? 'bg-purple-50 border-purple-305 text-purple-650' 
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-850 hover:bg-slate-100/80'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 font-bold">
                <button
                  onClick={() => setIsExportOpen(false)}
                  className="flex-1 py-2 bg-white hover:bg-slate-100 border border-slate-205 text-slate-500 hover:text-slate-805 text-xs rounded-lg transition shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={executeExportDownload}
                  className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg transition shadow"
                >
                  Download Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST SYSTEM COMPONENT */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 left-6 z-[100] max-w-sm"
          >
            <div className={`p-4 rounded-xl border shadow-2xl flex items-center gap-3 backdrop-blur-md font-bold ${
              toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700 shadow-lg' :
              toast.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-705 shadow-lg' :
              toast.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-lg' :
              'bg-purple-50 border-purple-200 text-purple-650 shadow-lg'
            }`}>
              {toast.type === 'error' ? <XCircle size={18} className="shrink-0 text-red-500" /> :
               toast.type === 'warning' ? <AlertTriangle size={18} className="shrink-0 text-amber-500" /> :
               toast.type === 'info' ? <HelpCircle size={18} className="shrink-0 text-blue-500" /> :
               <CheckCircle2 size={18} className="shrink-0 text-purple-600" />}
              <span className="text-xs font-bold leading-relaxed">{toast.message}</span>
              <button onClick={() => setToast(null)} className="text-slate-450 hover:text-slate-700 shrink-0 ml-auto"><X size={14} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple Helper Icon components
function CheckSquareIcon({ size = 20, className = '' }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <polyline points="9 11 12 14 22 4"/>
    </svg>
  );
}
