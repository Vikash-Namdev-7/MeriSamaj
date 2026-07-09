import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Search, Filter, RefreshCw, Download, Plus, Eye, Edit3, 
  GitMerge, ShieldAlert, Archive, Trash2, CheckCircle2, XCircle, 
  MapPin, Calendar, Heart, Activity, Check, Info, FileText, ChevronRight,
  ZoomIn, Phone, Globe, DollarSign, Award, Settings, ShieldCheck, HelpCircle,
  AlertCircle, Grid, List, Map, MoreHorizontal, User, Mail, Sparkles, Building2,
  Trash, Users, ArrowUpRight, TrendingUp, AlertTriangle, Layers, ChevronDown, CheckSquare,
  FileSpreadsheet, FileJson, Clock, Flame, CheckCircle, ShieldX, Star
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Avatar } from '../../../member/components/common/Avatar';

// Import Services
import { professionalDirectoryService } from '../../services/professionalDirectoryService';
import { professionalVerificationService } from '../../services/professionalVerificationService';
import { professionalComplianceService } from '../../services/professionalComplianceService';
import { professionalAnalyticsService } from '../../services/professionalAnalyticsService';
import { professionalAuditService } from '../../services/professionalAuditService';
import { professionalNotificationService } from '../../services/professionalNotificationService';
import { professionalDuplicateService } from '../../services/professionalDuplicateService';
import { featuredBusinessService } from '../../services/featuredBusinessService';

// Import Custom SVG charts from head reports module
import { 
  LineChart, AreaChart, BarChart, DonutChart, ProgressRing, Sparkline 
} from '../../../head/pages/reports/components/ChartComponents';

export default function GlobalProfessionalDirectory() {
  // Page states
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Core Data sets
  const [professionals, setProfessionals] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [comparisonList, setComparisonList] = useState([]);
  const [complianceAlerts, setComplianceAlerts] = useState([]);
  const [duplicatesList, setDuplicatesList] = useState([]);
  const [auditLogsList, setAuditLogsList] = useState([]);
  const [uniqueCities, setUniqueCities] = useState([]);
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [uniqueCommunities, setUniqueCommunities] = useState([]);

  // Search, Filter & Presets
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    community: 'All',
    city: 'All',
    category: 'All',
    subcategory: 'All',
    verificationStatus: 'All',
    listingStatus: 'All',
    featuredStatus: 'All',
    experience: 'All',
    sort: 'newest'
  });
  const [savedPresets, setSavedPresets] = useState([
    { name: 'Pending Approvals', filters: { ...filters, listingStatus: 'Submitted' } },
    { name: 'Featured Pinned', filters: { ...filters, featuredStatus: 'Featured' } },
    { name: 'Indore Health Core', filters: { ...filters, city: 'Indore', verificationStatus: 'Gold' } }
  ]);
  const [newPresetName, setNewPresetName] = useState('');
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);

  // Table selection and pagination
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Workspace Drawer state (14 Workspace Tabs)
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [selectedProf, setSelectedProf] = useState(null);
  const [workspaceTab, setWorkspaceTab] = useState('overview'); // overview | owner | business | docs | verification | products | gallery | reviews | complaints | connections | events | donation | analytics | audit

  // Modals / Action variables
  const [activeModal, setActiveModal] = useState(null); // actions | featured
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [overrideNotes, setOverrideNotes] = useState('');
  const [selectedDuplicatePair, setSelectedDuplicatePair] = useState(null);
  const [mergeReason, setMergeReason] = useState('');
  const [transferTargetComm, setTransferTargetComm] = useState('');
  const [transferTargetOwnerId, setTransferTargetOwnerId] = useState('');
  const [transferTargetOwnerName, setTransferTargetOwnerName] = useState('');
  const [featuredConfigForm, setFeaturedConfigForm] = useState({
    isPinned: false, priorityScore: 5, carouselOrder: 0, homepageVisible: false,
    featuredDuration: 'Unlimited', startDate: '', endDate: '', cityFeatured: false, communityFeatured: false
  });
  const [bulkActionType, setBulkActionType] = useState('');
  const [bulkCategoryVal, setBulkCategoryVal] = useState('');
  const [bulkCommunityVal, setBulkCommunityVal] = useState('');

  // Column width resizing state
  const [columnWidths, setColumnWidths] = useState({
    logo: 60, name: 180, id: 100, owner: 140, community: 110, city: 110, 
    category: 120, badge: 100, health: 80, status: 110, featured: 90, rating: 80, date: 110
  });
  const resizingCol = useRef(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  // Fetch all lists from services
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Directory List
      const res = await professionalDirectoryService.getProfessionals({
        searchQuery,
        ...filters
      });
      setProfessionals(res.data);

      // Analytics
      const statsRes = await professionalAnalyticsService.getDashboardAnalytics();
      setAnalytics(statsRes);

      const chartsRes = await professionalAnalyticsService.getAnalyticsCharts();
      setChartsData(chartsRes);

      // Community Comparison
      const compRes = await professionalAnalyticsService.getCommunityComparison();
      setComparisonList(compRes);

      // Compliance
      const compAlertsRes = await professionalComplianceService.getComplianceAlerts();
      setComplianceAlerts(compAlertsRes);

      // Duplicates
      const dupsRes = await professionalDuplicateService.detectDuplicates();
      setDuplicatesList(dupsRes);

      // Audit logs
      const auditsRes = await professionalAuditService.getAuditLogs();
      setAuditLogsList(auditsRes.data);

      // Get unique search boundaries
      const filterBounds = professionalDirectoryService.getUniqueFilters();
      setUniqueCommunities(filterBounds.communities);
      setUniqueCities(filterBounds.cities);
      setUniqueCategories(filterBounds.categories);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load enterprise directory data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [
    searchQuery,
    filters.community,
    filters.city,
    filters.category,
    filters.subcategory,
    filters.verificationStatus,
    filters.listingStatus,
    filters.featuredStatus,
    filters.experience,
    filters.sort
  ]);

  // Toast Notification
  const triggerToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Preset Filters
  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      triggerToast('Please provide a name for the preset', 'error');
      return;
    }
    setSavedPresets(prev => [...prev, { name: newPresetName, filters: { ...filters } }]);
    setNewPresetName('');
    setShowSavePresetModal(false);
    triggerToast('Filter preset saved successfully');
  };

  const handleApplyPreset = (preset) => {
    setFilters({ ...preset.filters });
    triggerToast(`Applied filter preset: ${preset.name}`);
  };

  // Pagination Helper
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return professionals.slice(start, start + itemsPerPage);
  }, [professionals, currentPage]);

  const totalPages = Math.ceil(professionals.length / itemsPerPage);

  // Selection helpers
  const handleSelectAll = () => {
    const pageIds = paginatedList.map(p => p.id);
    const allSelected = pageIds.every(id => selectedRows.includes(id));
    if (allSelected) {
      setSelectedRows(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedRows(prev => [...new Set([...prev, ...pageIds])]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  // Master Admin Status transition trigger
  const handleStatusTransition = async (profId, newStatus, reason = 'Master Admin operation') => {
    try {
      await professionalDirectoryService.changeStatus(profId, newStatus, reason);
      
      // Audit log entry
      await professionalAuditService.logAction(
        profId,
        'Status Transition',
        selectedProf?.status || 'Previous',
        newStatus,
        `Status set to ${newStatus}`,
        reason
      );

      // Notification Dispatch
      if (newStatus === 'Verified') {
        await professionalNotificationService.sendApprovalNotification(profId, selectedProf?.verificationBadge || 'Standard');
      } else if (newStatus === 'Suspended') {
        await professionalNotificationService.sendSuspensionNotification(profId, reason);
      } else if (newStatus === 'Removed' || newStatus === 'Rejected') {
        await professionalNotificationService.sendRejectionNotification(profId, reason);
      }

      triggerToast(`Listing status updated to ${newStatus}`);
      if (selectedProf && selectedProf.id === profId) {
        const updatedItem = await professionalDirectoryService.getProfessionalById(profId);
        setSelectedProf(updatedItem);
      }
      loadData();
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  // Master Admin Override trigger
  const handleOverrideVerification = async (profId, badge, notes) => {
    try {
      await professionalVerificationService.overrideVerification(profId, badge, notes);
      await professionalNotificationService.sendApprovalNotification(profId, badge);
      
      triggerToast(`Master Override applied with ${badge} badge`);
      setOverrideNotes('');
      if (selectedProf && selectedProf.id === profId) {
        const updatedItem = await professionalDirectoryService.getProfessionalById(profId);
        setSelectedProf(updatedItem);
      }
      loadData();
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  // Merge Duplicate execution
  const handleMergeDuplicates = async () => {
    if (!selectedDuplicatePair) return;
    try {
      const { primaryBusiness, duplicateBusiness } = selectedDuplicatePair;
      await professionalDuplicateService.mergeBusinesses(primaryBusiness.id, duplicateBusiness.id, { reason: mergeReason });
      
      // Dispatch alert notify
      await professionalNotificationService.sendSystemNotification(
        primaryBusiness.id,
        'business_merge',
        'Duplicate Business Consolidated',
        `Your business listings were merged with primary listing ID: ${primaryBusiness.id}.`
      );

      triggerToast('Businesses consolidated successfully');
      setSelectedDuplicatePair(null);
      setMergeReason('');
      loadData();
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  // Transfer actions
  const handleCommunityTransfer = async () => {
    if (!selectedProf || !transferTargetComm) return;
    try {
      await professionalDirectoryService.transferCommunity(selectedProf.id, transferTargetComm);
      triggerToast(`Business community ownership transferred to Samaj Node: ${transferTargetComm}`);
      
      const updatedItem = await professionalDirectoryService.getProfessionalById(selectedProf.id);
      setSelectedProf(updatedItem);
      setTransferTargetComm('');
      setActiveModal(null);
      loadData();
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  const handleOwnerTransfer = async () => {
    if (!selectedProf || !transferTargetOwnerId) return;
    try {
      await professionalDirectoryService.transferOwner(selectedProf.id, transferTargetOwnerId, transferTargetOwnerName || 'New Owner');
      triggerToast(`Listing ownership transferred to Member: ${transferTargetOwnerId}`);
      
      const updatedItem = await professionalDirectoryService.getProfessionalById(selectedProf.id);
      setSelectedProf(updatedItem);
      setTransferTargetOwnerId('');
      setTransferTargetOwnerName('');
      setActiveModal(null);
      loadData();
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  // Configure Featured duration priority Homepage
  const handleConfigureFeatured = async () => {
    if (!selectedProf) return;
    try {
      await featuredBusinessService.configureFeatured(selectedProf.id, featuredConfigForm);
      await professionalNotificationService.sendSystemNotification(
        selectedProf.id,
        'promotion_update',
        'Featured Promotion Updated',
        'Your listing featured visibility parameters have been modified by Master Admin.'
      );

      triggerToast('Featured parameters configured successfully');
      const updatedItem = await professionalDirectoryService.getProfessionalById(selectedProf.id);
      setSelectedProf(updatedItem);
      setActiveModal(null);
      loadData();
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  // Document review update
  const handleReviewDocument = async (status) => {
    if (!selectedProf || !selectedDoc) return;
    try {
      await professionalVerificationService.reviewDocument(selectedProf.id, selectedDoc.id, status, reviewNote);
      
      if (status === 'Re-upload Required') {
        await professionalNotificationService.sendReuploadRequest(selectedProf.id, selectedDoc.type, reviewNote);
      } else {
        await professionalNotificationService.sendSystemNotification(
          selectedProf.id,
          'document_status',
          'Document Verification Update',
          `Your document '${selectedDoc.type}' verification status is set to: ${status}.`
        );
      }

      triggerToast(`Document verification status updated to ${status}`);
      const updatedItem = await professionalDirectoryService.getProfessionalById(selectedProf.id);
      setSelectedProf(updatedItem);
      setSelectedDoc(null);
      setReviewNote('');
      loadData();
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  // Bulk Operations
  const handleBulkAction = async () => {
    if (selectedRows.length === 0) {
      triggerToast('Select listings to run bulk action', 'error');
      return;
    }
    try {
      for (const id of selectedRows) {
        if (bulkActionType === 'approve') {
          await professionalDirectoryService.changeStatus(id, 'Verified', 'Bulk approved');
          await professionalNotificationService.sendApprovalNotification(id, 'Standard');
        } else if (bulkActionType === 'suspend') {
          await professionalDirectoryService.changeStatus(id, 'Suspended', 'Bulk suspended');
          await professionalNotificationService.sendSuspensionNotification(id, 'Bulk admin suspension');
        } else if (bulkActionType === 'restore') {
          await professionalDirectoryService.restoreProfessional(id);
        } else if (bulkActionType === 'feature') {
          await featuredBusinessService.configureFeatured(id, { isPinned: true, homepageVisible: true });
        } else if (bulkActionType === 'category' && bulkCategoryVal) {
          await professionalDirectoryService.updateProfessional(id, { category: bulkCategoryVal });
        } else if (bulkActionType === 'community' && bulkCommunityVal) {
          await professionalDirectoryService.transferCommunity(id, bulkCommunityVal);
        }
      }

      triggerToast(`Bulk operation executed successfully for ${selectedRows.length} items`);
      setSelectedRows([]);
      setBulkActionType('');
      setActiveModal(null);
      loadData();
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  // Export functions
  const handleExportCSV = () => {
    const listToExport = selectedRows.length > 0 
      ? professionals.filter(p => selectedRows.includes(p.id)) 
      : professionals;

    const headers = ['Business ID', 'Business Name', 'Owner Name', 'Category', 'City', 'Phone', 'Experience', 'Badge', 'Status', 'Health Score'];
    const rows = listToExport.map(p => [
      p.businessId || p.id,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.ownerName.replace(/"/g, '""')}"`,
      p.category,
      p.city,
      p.phone || '',
      p.experience || '',
      p.verificationBadge || '',
      p.status,
      professionalAnalyticsService.calculateHealthScore(p).score
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Master_Professional_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Directory rows exported successfully.');
  };

  const handleExportJSON = () => {
    const listToExport = selectedRows.length > 0 
      ? professionals.filter(p => selectedRows.includes(p.id)) 
      : professionals;
    
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(listToExport, null, 2))}`;
    const link = document.createElement('a');
    link.setAttribute('href', jsonString);
    link.setAttribute('download', `Master_Professional_Directory_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Directory exported as JSON.');
  };

  const handlePrint = () => {
    window.print();
  };

  // Column resize mouse handlers
  const handleMouseDown = (e, colKey) => {
    resizingCol.current = colKey;
    startX.current = e.clientX;
    startWidth.current = columnWidths[colKey];
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!resizingCol.current) return;
    const diff = e.clientX - startX.current;
    setColumnWidths(prev => ({
      ...prev,
      [resizingCol.current]: Math.max(50, startWidth.current + diff)
    }));
  };

  const handleMouseUp = () => {
    resizingCol.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Format Date utility
  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Inline dynamic calculation for health score colors
  const getHealthBadge = (score) => {
    let color = 'bg-rose-50 text-rose-700 border-rose-100';
    let grade = 'D';
    if (score >= 95) { color = 'bg-emerald-50 text-emerald-700 border-emerald-100'; grade = 'A+'; }
    else if (score >= 80) { color = 'bg-teal-50 text-teal-700 border-teal-100'; grade = 'A'; }
    else if (score >= 60) { color = 'bg-amber-50 text-amber-700 border-amber-100'; grade = 'B'; }
    else if (score >= 40) { color = 'bg-orange-50 text-orange-700 border-orange-100'; grade = 'C'; }
    return { color, grade };
  };

  // Compliance metrics computed from active filtered dataset to prevent negative logic bugs
  const complianceStats = useMemo(() => {
    const totalCount = professionals.length;
    const nonCompliantCount = professionals.filter(p => {
      return complianceAlerts.some(a => a.professionalId === p.id && a.complianceStatus === 'Non-Compliant');
    }).length;
    const warningCount = professionals.filter(p => {
      return complianceAlerts.some(a => a.professionalId === p.id && a.complianceStatus === 'Action Required');
    }).length;
    const compliantCount = totalCount - nonCompliantCount - warningCount;
    return { compliantCount, nonCompliantCount, warningCount };
  }, [professionals, complianceAlerts]);

  return (
    <div className="space-y-6 pb-16 text-slate-800 relative min-h-screen">
      
      {/* Toast message display */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl flex items-center gap-2.5 font-bold text-xs ${
              toast.type === 'error' 
                ? 'bg-rose-50 border-rose-200 text-rose-700' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider bg-gradient-to-r from-slate-900 via-purple-800 to-indigo-800 bg-clip-text text-transparent flex items-center gap-2">
            <Briefcase className="text-purple-600" /> Global Directory Operations Center
          </h1>
          <p className="text-[10px] md:text-xs text-slate-500 mt-1 uppercase font-bold tracking-widest">
            Cross-Community Verification • Compliance Guard • Feature Controller
          </p>
        </div>

        {/* Global actions bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => loadData()}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-purple-600 hover:border-purple-300 hover:shadow-sm transition-all"
            title="Reload Database"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          
          <div className="relative group">
            <button className="px-3.5 py-2.5 rounded-xl bg-purple-600 text-white border border-purple-500/25 text-xs font-bold hover:bg-purple-700 shadow-md shadow-purple-500/10 transition-all flex items-center gap-2 uppercase cursor-pointer">
              <Download size={13} /> Export Actions <ChevronDown size={12} />
            </button>
            <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white border border-slate-100 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-30 py-1">
              <button onClick={handleExportCSV} className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2"><FileSpreadsheet size={14} /> Export CSV</button>
              <button onClick={handleExportJSON} className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2"><FileJson size={14} /> Export JSON</button>
              <button onClick={handlePrint} className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2"><Globe size={14} /> Print Directory</button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Layout */}
      <div className="flex border-b border-slate-250 overflow-x-auto gap-6 pb-px scrollbar-none">
        {[
          { id: 'overview', name: 'Overview', icon: Grid },
          { id: 'directory', name: 'Directory Grid', icon: List },
          { id: 'verification', name: 'Approval Queue', icon: ShieldCheck },
          { id: 'compliance', name: 'Compliance Monitor', icon: ShieldAlert },
          { id: 'duplicates', name: 'Duplicates Scan', icon: GitMerge },
          { id: 'featured', name: 'Featured Center', icon: Sparkles },
          { id: 'analytics', name: 'Interactive Charts', icon: Activity },
          { id: 'comparison', name: 'Samaj Comparison', icon: Users },
          { id: 'audits', name: 'Audit Tracker', icon: Clock }
        ].map(tab => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all relative ${
                isActive 
                  ? 'border-purple-600 text-purple-600 font-black bg-purple-500/5' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <TabIcon size={14} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Loader */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="animate-spin text-purple-600" size={32} />
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Syncing Cloud Database Ledger...</span>
        </div>
      )}

      {/* Main workspace panels */}
      {!loading && (
        <div className="space-y-6">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && analytics && (
            <div className="space-y-6">
              {/* Executive KPI Widget grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'Total Businesses', val: analytics.stats.totalBusinesses, trend: '+12.4%', color: 'border-purple-100 hover:border-purple-200', iconColor: 'bg-purple-50 text-purple-600', sub: 'Active listings', act: 'directory', icon: Briefcase },
                  { title: 'Verified Businesses', val: analytics.stats.verifiedBusinesses, trend: '+9.8%', color: 'border-emerald-100 hover:border-emerald-200', iconColor: 'bg-emerald-50 text-emerald-600', sub: 'Gold/Silver badges', act: 'directory', icon: CheckSquare },
                  { title: 'Pending Verification', val: analytics.stats.pendingVerification, trend: '4 in queue', color: 'border-amber-100 hover:border-amber-200', iconColor: 'bg-amber-50 text-amber-600', sub: 'Needs review', act: 'verification', icon: Clock },
                  { title: 'Suspended Listings', val: analytics.stats.suspendedBusinesses, trend: 'Critical checks', color: 'border-rose-100 hover:border-rose-200', iconColor: 'bg-rose-50 text-rose-600', sub: 'Policy violation', act: 'compliance', icon: ShieldX },
                  { title: 'Homepage Pinned', val: analytics.stats.featuredBusinesses, trend: 'Top tier placement', color: 'border-violet-100 hover:border-violet-200', iconColor: 'bg-violet-50 text-violet-600', sub: 'Priority listings', act: 'featured', icon: Sparkles },
                  { title: 'Duplicate Alerts', val: analytics.stats.duplicateAlerts, trend: 'High match flag', color: 'border-cyan-100 hover:border-cyan-200', iconColor: 'bg-cyan-50 text-cyan-600', sub: 'Candidate merges', act: 'duplicates', icon: GitMerge },
                  { title: 'Pending Grievances', val: analytics.stats.complaintsPending, trend: 'Grievance logs', color: 'border-pink-100 hover:border-pink-200', iconColor: 'bg-pink-50 text-pink-600', sub: 'Awaiting resolution', act: 'directory', icon: AlertCircle },
                  { title: 'Health Score Avg', val: `${analytics.stats.avgHealthScore}/100`, trend: 'Grade A rating', color: 'border-indigo-100 hover:border-indigo-200', iconColor: 'bg-indigo-50 text-indigo-600', sub: 'Compliance status', act: 'analytics', icon: Activity }
                ].map((kpi, idx) => {
                  const Icon = kpi.icon;
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -3 }}
                      className={`p-5 rounded-3xl border bg-white shadow-sm flex flex-col justify-between h-[150px] relative overflow-hidden group cursor-pointer transition-all duration-300 ${kpi.color}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className={`w-10 h-10 rounded-2xl ${kpi.iconColor} flex items-center justify-center font-bold`}>
                          <Icon size={18} />
                        </div>
                        <span className="text-[9px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">{kpi.trend}</span>
                      </div>

                      <div className="my-2">
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">{kpi.title}</span>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-1">{kpi.val}</h3>
                      </div>

                      <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button 
                          onClick={() => setActiveTab(kpi.act)}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1"
                        >
                          Action <ArrowUpRight size={10} />
                        </button>
                      </div>

                      {/* Simulating a mini SVG graph in background */}
                      <div className="absolute inset-x-0 bottom-0 h-4 opacity-35">
                        <Sparkline data={[23, 45, 12, 67, 34, 90]} color="#8B5CF6" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Overview Analytics Spotlight */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Growth trend visual snippet */}
                <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm col-span-2 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Business Registration Growth</h4>
                      <p className="text-[10px] text-slate-500 uppercase mt-0.5">Rolling last 6 months metrics</p>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">+14.2% Growth</span>
                  </div>
                  <div className="h-64 flex items-end">
                    {chartsData && (
                      <AreaChart 
                        data={chartsData.growthTrend.data} 
                        labels={chartsData.growthTrend.labels} 
                        color="#a855f7" 
                        height={240} 
                      />
                    )}
                  </div>
                </div>

                {/* Verification Pipeline spotlight */}
                <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Verification Allocation</h4>
                    <p className="text-[10px] text-slate-500 uppercase">Verification pipeline breakdown</p>
                  </div>
                  
                  <div className="py-6 flex justify-center">
                    {chartsData && (
                      <DonutChart 
                        data={chartsData.healthScoreDistribution} 
                        colors={['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']} 
                        size={160} 
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-5 gap-1 text-center text-[9px] uppercase font-bold text-slate-400">
                    <div><span className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-1"></span>A+</div>
                    <div><span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1"></span>A</div>
                    <div><span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1"></span>B</div>
                    <div><span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1"></span>C</div>
                    <div><span className="inline-block w-2 h-2 rounded-full bg-rose-500 mr-1"></span>D</div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* DIRECTORY GRID & DATA TABLE */}
          {activeTab === 'directory' && (
            <div className="space-y-4">
              
              {/* Search Engine & Filters Toolbar (Sticky Header panel) */}
              <div className="sticky top-0 z-20 p-4 rounded-2xl border border-slate-100 bg-white/95 backdrop-blur-md shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-3 items-center">
                  
                  {/* Search input field */}
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search Business Name, Owner, Phone, Email, GST, PAN, ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-300 focus:border-purple-500 focus:bg-white focus:outline-none transition-all text-xs font-bold placeholder-slate-400 text-slate-800"
                    />
                  </div>

                  {/* Filter configurations */}
                  <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <select
                      value={filters.community}
                      onChange={(e) => setFilters(prev => ({ ...prev, community: e.target.value }))}
                      className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-none focus:border-purple-500 focus:bg-white text-slate-800 cursor-pointer"
                    >
                      <option value="All" className="text-slate-800">All Communities</option>
                      {uniqueCommunities.map(c => <option key={c} value={c} className="text-slate-800">{`Samaj Node ${c.toUpperCase()}`}</option>)}
                    </select>

                    <select
                      value={filters.city}
                      onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                      className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-none focus:border-purple-500 focus:bg-white text-slate-800 cursor-pointer"
                    >
                      <option value="All" className="text-slate-800">All Cities</option>
                      {uniqueCities.map(c => <option key={c} value={c} className="text-slate-800">{c}</option>)}
                    </select>

                    <select
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-none focus:border-purple-500 focus:bg-white text-slate-800 cursor-pointer"
                    >
                      <option value="All" className="text-slate-800">All Categories</option>
                      {uniqueCategories.map(c => <option key={c} value={c} className="text-slate-800">{c}</option>)}
                    </select>

                    <select
                      value={filters.listingStatus}
                      onChange={(e) => setFilters(prev => ({ ...prev, listingStatus: e.target.value }))}
                      className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-none focus:border-purple-500 focus:bg-white text-slate-800 cursor-pointer"
                    >
                      <option value="All" className="text-slate-800">All Statuses</option>
                      <option value="Submitted" className="text-slate-800">Submitted</option>
                      <option value="Under Review" className="text-slate-800">Under Review</option>
                      <option value="Verified" className="text-slate-800">Verified</option>
                      <option value="Featured" className="text-slate-800">Featured</option>
                      <option value="Suspended" className="text-slate-800">Suspended</option>
                    </select>

                    <button 
                      onClick={() => setShowSavePresetModal(true)}
                      className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all text-xs font-bold flex items-center gap-1.5 uppercase cursor-pointer"
                      title="Save Current Filter Configuration as Preset"
                    >
                      <Archive size={13} /> Save Preset
                    </button>
                  </div>
                </div>

                {/* Presets and Bulk action toolbars */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs font-bold">
                  
                  {/* Saved Filter presets */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Presets:</span>
                    {savedPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleApplyPreset(preset)}
                        className="px-2.5 py-1.5 rounded-lg bg-purple-50 border border-purple-200/50 text-[10px] text-purple-700 hover:bg-purple-100/60 transition-all cursor-pointer font-extrabold"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>

                  {/* Bulk Actions row */}
                  {selectedRows.length > 0 && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-2 bg-purple-50 border border-purple-200/50 px-3 py-1.5 rounded-xl"
                    >
                      <span className="text-[10px] uppercase text-purple-700 font-extrabold">{selectedRows.length} Selected:</span>
                      
                      <button 
                        onClick={() => { setBulkActionType('approve'); handleBulkAction(); }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] uppercase tracking-wider font-extrabold cursor-pointer"
                      >
                        Approve
                      </button>

                      <button 
                        onClick={() => { setBulkActionType('suspend'); handleBulkAction(); }}
                        className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[10px] uppercase tracking-wider font-extrabold cursor-pointer"
                      >
                        Suspend
                      </button>

                      <button 
                        onClick={() => { setBulkActionType('feature'); handleBulkAction(); }}
                        className="px-2.5 py-1 rounded-lg bg-violet-500 hover:bg-violet-600 text-white text-[10px] uppercase tracking-wider font-extrabold cursor-pointer"
                      >
                        Feature
                      </button>

                      <button 
                        onClick={handleExportCSV}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 text-[10px] uppercase tracking-wider font-extrabold cursor-pointer"
                      >
                        Export CSV
                      </button>
                    </motion.div>
                  )}

                </div>

              </div>

              {/* Data Table with Resizable Headers */}
              <div className="rounded-2xl border border-slate-150 bg-white shadow-sm overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs font-bold">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-55 uppercase text-slate-500">
                      
                      {/* Selection checkbox */}
                      <th className="p-4 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={paginatedList.length > 0 && paginatedList.every(p => selectedRows.includes(p.id))}
                          onChange={handleSelectAll}
                          className="rounded border-slate-300 text-purple-600 focus:ring-0 cursor-pointer"
                        />
                      </th>

                      {/* Columns headers with resize handles */}
                      {[
                        { key: 'logo', name: 'Logo', width: columnWidths.logo },
                        { key: 'name', name: 'Business Name', width: columnWidths.name },
                        { key: 'id', name: 'Business ID', width: columnWidths.id },
                        { key: 'owner', name: 'Owner', width: columnWidths.owner },
                        { key: 'community', name: 'Community', width: columnWidths.community },
                        { key: 'city', name: 'City', width: columnWidths.city },
                        { key: 'category', name: 'Category', width: columnWidths.category },
                        { key: 'badge', name: 'Badge', width: columnWidths.badge },
                        { key: 'health', name: 'Health', width: columnWidths.health },
                        { key: 'status', name: 'Status', width: columnWidths.status },
                        { key: 'featured', name: 'Featured', width: columnWidths.featured },
                        { key: 'rating', name: 'Rating', width: columnWidths.rating },
                        { key: 'date', name: 'Created', width: columnWidths.date }
                      ].map(col => (
                        <th 
                          key={col.key} 
                          className="p-4 relative font-black select-none tracking-widest text-[10px]"
                          style={{ width: col.width }}
                        >
                          <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors">
                            <span>{col.name}</span>
                          </div>
                          
                          {/* Draggable Resizer handle */}
                          <div 
                            onMouseDown={(e) => handleMouseDown(e, col.key)}
                            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-purple-500/50 bg-transparent transition-colors"
                          />
                        </th>
                      ))}
                      
                      <th className="p-4 w-28 text-center font-black select-none tracking-widest text-[10px]">Actions</th>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-slate-100">
                    {paginatedList.map(prof => {
                      const health = getHealthBadge(professionalAnalyticsService.calculateHealthScore(prof).score);
                      return (
                        <tr key={prof.id} className="hover:bg-purple-50/20 transition-all group text-slate-700">
                          
                          {/* Checkbox select */}
                          <td className="p-4 text-center">
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(prof.id)}
                              onChange={() => handleSelectRow(prof.id)}
                              className="rounded border-slate-350 text-purple-600 focus:ring-0 cursor-pointer"
                            />
                          </td>

                          {/* Logo initials */}
                          <td className="p-4">
                            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center font-black text-purple-600">
                              {prof.initials || 'BI'}
                            </div>
                          </td>

                          {/* Business Name */}
                          <td className="p-4 font-black text-slate-900">{prof.title}</td>

                          {/* Business ID */}
                          <td className="p-4 font-mono text-purple-600 text-[10px]">{prof.businessId || 'B-N/A'}</td>

                          {/* Owner Name */}
                          <td className="p-4 text-slate-700 font-extrabold">{prof.ownerName || 'Unknown'}</td>

                          {/* Community ID */}
                          <td className="p-4 text-[10px] uppercase font-black tracking-widest text-slate-400">{`Samaj ${prof.communityId?.toUpperCase()}`}</td>

                          {/* City */}
                          <td className="p-4 text-slate-650">{prof.city}</td>

                          {/* Category */}
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px]">
                              {prof.category}
                            </span>
                          </td>

                          {/* Verification Badge */}
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${
                              prof.verificationBadge === 'Gold' 
                                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                : prof.verificationBadge === 'Silver' 
                                ? 'bg-slate-100 text-slate-700 border-slate-200' 
                                : 'bg-orange-50 text-orange-700 border-orange-200'
                            }`}>
                              {prof.verificationBadge}
                            </span>
                          </td>

                          {/* Health Score grade */}
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-black ${health.color}`}>
                              {health.grade}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-extrabold ${
                              prof.status === 'Featured'
                                ? 'bg-violet-50 border-violet-250 text-violet-700 animate-pulse'
                                : prof.status === 'Verified'
                                ? 'bg-emerald-50 border-emerald-250 text-emerald-700'
                                : prof.status === 'Suspended'
                                ? 'bg-rose-50 border-rose-250 text-rose-700'
                                : 'bg-slate-100 border-slate-250 text-slate-600'
                            }`}>
                              {prof.status}
                            </span>
                          </td>

                          {/* Featured Pinned */}
                          <td className="p-4 text-center">
                            {prof.status === 'Featured' ? (
                              <Sparkles size={14} className="text-violet-500 inline animate-spin-slow" />
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          {/* Views count */}
                          <td className="p-4 text-slate-650">{prof.views || 0}</td>

                          {/* Created date */}
                          <td className="p-4 text-slate-500 font-mono text-[10px]">{formatDate(prof.createdAt)}</td>

                          {/* Row Actions menu */}
                          <td className="p-4 text-center">
                            <div className="flex gap-1.5 justify-center">
                              <button
                                onClick={() => { setSelectedProf(prof); setWorkspaceTab('overview'); setIsWorkspaceOpen(true); }}
                                className="p-1.5 rounded-lg bg-slate-50 hover:bg-purple-55 hover:text-white border border-slate-200 transition-all text-slate-600 flex items-center cursor-pointer"
                                title="Open Workspace Console"
                              >
                                <Eye size={12} />
                              </button>

                              <button
                                onClick={() => { setSelectedProf(prof); setTransferTargetComm(prof.communityId); setTransferTargetOwnerId(prof.memberId); setTransferTargetOwnerName(prof.ownerName); setFeaturedConfigForm(prof.featuredConfig || { isPinned: false, priorityScore: 5 }); setActiveModal('actions'); }}
                                className="p-1.5 rounded-lg bg-slate-50 hover:bg-purple-55 hover:text-white border border-slate-200 transition-all text-slate-600 flex items-center cursor-pointer"
                                title="Admin Operational Controls"
                              >
                                <Settings size={12} />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination */}
              <div className="flex justify-between items-center bg-white border border-slate-150 p-4 rounded-2xl text-xs font-bold">
                <span className="text-slate-500">Showing page {currentPage} of {totalPages} ({professionals.length} results)</span>
                
                <div className="flex items-center gap-2">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50 cursor-pointer"
                  >
                    Previous
                  </button>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* APPROVAL QUEUE TAB */}
          {activeTab === 'verification' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Queue sidebar listing */}
              <div className="lg:col-span-1 space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-400 px-1">Pending Validation Queue</h3>
                
                {professionals.filter(p => p.status === 'Submitted' || p.status === 'Under Review').map(prof => (
                  <div 
                    key={prof.id}
                    onClick={() => setSelectedProf(prof)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      selectedProf && selectedProf.id === prof.id
                        ? 'bg-purple-50 border-purple-500 text-purple-800'
                        : 'bg-white border-slate-150 text-slate-700 hover:border-purple-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-black text-xs text-slate-900">{prof.title}</h4>
                      <span className="text-[9px] uppercase font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {prof.pipelineStage || 'Document Review'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">Owner: {prof.ownerName}</p>
                    <div className="flex justify-between items-center mt-3 text-[9px] font-mono text-slate-400">
                      <span>ID: {prof.businessId}</span>
                      <span>{formatDate(prof.createdAt)}</span>
                    </div>
                  </div>
                ))}

                {professionals.filter(p => p.status === 'Submitted' || p.status === 'Under Review').length === 0 && (
                  <div className="p-8 rounded-2xl border border-slate-150 bg-white text-center text-xs font-bold text-slate-400">
                    No listings currently in approval validation queue.
                  </div>
                )}
              </div>

              {/* Focus validation dashboard */}
              <div className="lg:col-span-2 space-y-6">
                {selectedProf && (selectedProf.status === 'Submitted' || selectedProf.status === 'Under Review') ? (
                  <div className="p-6 rounded-2xl border border-slate-150 bg-white shadow-sm space-y-6">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                      <div>
                        <h2 className="text-base font-black text-slate-800">{selectedProf.title}</h2>
                        <p className="text-xs text-slate-400 mt-1 uppercase">Community node ownership: Samaj {selectedProf.communityId?.toUpperCase()}</p>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleStatusTransition(selectedProf.id, 'Verified')}
                          className="px-3.5 py-2 rounded-xl bg-emerald-500 border border-emerald-400/30 text-xs font-bold hover:bg-emerald-600 text-white transition-all uppercase flex items-center gap-1 cursor-pointer"
                        >
                          <Check size={14} /> Approve listing
                        </button>
                        <button 
                          onClick={() => {
                            const reason = prompt('Specify rejection reason:');
                            if (reason) handleStatusTransition(selectedProf.id, 'Removed', reason);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-rose-500 border border-rose-400/30 text-xs font-bold hover:bg-rose-600 text-white transition-all uppercase flex items-center gap-1 cursor-pointer"
                        >
                          <X size={14} /> Reject listing
                        </button>
                      </div>
                    </div>

                    {/* Pipeline visual */}
                    <div className="space-y-2">
                      <h4 className="text-xs uppercase text-slate-500 tracking-wider">Multi-stage pipeline progress:</h4>
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold uppercase">
                        {[
                          { id: 'Document Review', label: '1. Document Review' },
                          { id: 'Compliance Review', label: '2. Compliance Audit' },
                          { id: 'Business Validation', label: '3. Verification Verification' },
                          { id: 'Final Approval', label: '4. Final Validation' }
                        ].map((stage, idx) => {
                          const isDone = idx <= ['Document Review', 'Compliance Review', 'Business Validation', 'Final Approval'].indexOf(selectedProf.pipelineStage);
                          return (
                            <div 
                              key={stage.id} 
                              onClick={() => professionalVerificationService.updatePipelineStage(selectedProf.id, stage.id).then(() => loadData())}
                              className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                                isDone 
                                  ? 'bg-purple-50 border-purple-500 text-purple-700 font-extrabold' 
                                  : 'bg-slate-50 border-slate-200 text-slate-400 font-medium'
                              }`}
                            >
                              {stage.label}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Verification documents checklist */}
                    <div className="space-y-4">
                      <h4 className="text-xs uppercase text-slate-500 tracking-wider">Certificate Documentation Audits:</h4>
                      
                      <div className="divide-y divide-slate-100 border border-slate-150 rounded-xl bg-slate-50">
                        {(selectedProf.documents || []).map(doc => (
                          <div key={doc.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-slate-700">
                            <div>
                              <span className="text-xs font-black text-slate-800">{doc.type}</span>
                              <div className="flex gap-2 text-[10px] text-slate-400 mt-1 font-semibold">
                                <span>File: <a href={doc.fileUrl} className="underline text-purple-600">{doc.fileName}</a></span>
                                {doc.expiryDate && <span>Expiry: {doc.expiryDate}</span>}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <span className={`px-2 py-0.5 rounded border text-[9px] uppercase font-black tracking-wider ${
                                doc.status === 'Verified' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                  : doc.status === 'Rejected' 
                                  ? 'bg-rose-50 text-rose-700 border-rose-200' 
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {doc.status}
                              </span>

                              <button 
                                onClick={() => { setSelectedDoc(doc); setReviewNote(doc.notes || ''); }}
                                className="px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-[10px] uppercase hover:bg-purple-100 transition-all font-bold text-purple-700 cursor-pointer"
                              >
                                Audit File
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Master Override Panel */}
                    <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 space-y-4">
                      <div className="flex items-center gap-2 text-xs uppercase text-purple-700 font-black">
                        <ShieldAlert size={16} /> Master Admin Override Controls
                      </div>
                      <p className="text-[10px] text-slate-500">Configure override status parameters, bypassing typical validator checks.</p>
                      
                      <div className="flex gap-2 flex-wrap items-center">
                        <input
                          type="text"
                          placeholder="Override justification note..."
                          value={overrideNotes}
                          onChange={(e) => setOverrideNotes(e.target.value)}
                          className="flex-1 min-w-[200px] px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:border-purple-500 text-slate-800"
                        />
                        <button 
                          onClick={() => handleOverrideVerification(selectedProf.id, 'Gold', overrideNotes)}
                          className="px-3 py-2 rounded-xl bg-amber-500 text-white font-black text-[10px] uppercase hover:bg-amber-600 transition-all cursor-pointer"
                        >
                          Override Gold Verify
                        </button>
                        <button 
                          onClick={() => handleOverrideVerification(selectedProf.id, 'Silver', overrideNotes)}
                          className="px-3 py-2 rounded-xl bg-slate-400 text-white font-black text-[10px] uppercase hover:bg-slate-50 transition-all cursor-pointer"
                        >
                          Override Silver Verify
                        </button>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-xs font-bold text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-white">
                    Select a listing from queue sidebar to load operational reviews workspace.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* COMPLIANCE TAB */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              
              {/* Compliance Overview indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs font-black uppercase text-slate-400">
                    <span>Compliant Listings</span>
                    <CheckCircle className="text-emerald-500" size={16} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800">{complianceStats.compliantCount}</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Active businesses matching standard rules.</p>
                </div>

                <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs font-black uppercase text-slate-400">
                    <span>Non-Compliant Listings</span>
                    <AlertTriangle className="text-rose-500" size={16} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800">{complianceStats.nonCompliantCount}</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Severe missing or expired files matching warning checklist.</p>
                </div>

                <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs font-black uppercase text-slate-400">
                    <span>Warning Actions</span>
                    <ShieldAlert className="text-amber-500" size={16} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800">{complianceStats.warningCount}</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Non-mandatory reviews awaiting action.</p>
                </div>

              </div>

              {/* Compliance Alerts list */}
              <div className="p-6 rounded-2xl border border-slate-150 bg-white shadow-sm space-y-4">
                <h3 className="text-sm font-black uppercase text-slate-500">Compliance Audit logs alerts</h3>
                
                <div className="divide-y divide-slate-100">
                  {complianceAlerts.map((alert, idx) => (
                    <div key={idx} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-800">{alert.businessName}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-black ${
                            alert.complianceStatus === 'Non-Compliant' 
                              ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {alert.complianceStatus}
                          </span>
                        </div>
                        <ul className="mt-2 space-y-1">
                          {alert.issues.map((issue, i) => (
                            <li key={i} className="text-[10px] text-slate-500 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> {issue}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            professionalNotificationService.sendComplianceReminder(alert.professionalId, 'GST/Trade License');
                            triggerToast('Compliance alert notification sent to owner inbox tray.');
                          }}
                          className="px-3.5 py-2 rounded-xl bg-purple-50 border border-purple-200/50 text-xs hover:bg-purple-100 text-purple-700 font-bold uppercase cursor-pointer"
                        >
                          Send reminder alert
                        </button>
                        <button
                          onClick={() => {
                            handleStatusTransition(alert.professionalId, 'Suspended', 'Suspended due to compliance warning issues.');
                          }}
                          className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200/50 text-xs hover:bg-rose-100 text-rose-700 font-bold uppercase cursor-pointer"
                        >
                          Suspend listing
                        </button>
                      </div>
                    </div>
                  ))}

                  {complianceAlerts.length === 0 && (
                    <div className="py-8 text-center text-xs font-bold text-slate-400">
                      All directory professional listings compliant. No warnings flagged.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* DUPLICATE CENTER TAB */}
          {activeTab === 'duplicates' && (
            <div className="space-y-6">
              
              <div className="p-6 rounded-3xl border border-slate-150 bg-white shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-black uppercase text-slate-800">Suggested Duplicate Pairings</h3>
                    <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">Consolidated duplicate listings via primary selection merges</p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {duplicatesList.map((pair, idx) => (
                    <div key={idx} className="py-5 flex flex-col gap-4">
                      
                      {/* Pair Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600"><GitMerge size={16} /></span>
                          <div>
                            <h4 className="text-xs font-black text-slate-850 uppercase tracking-wider">Potential Duplicate Pair Detected</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">Matched by: <span className="text-rose-600 font-black">{pair.reasons.join(', ')}</span></p>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[9px] uppercase font-black tracking-wider ${
                          pair.confidence === 'High' 
                            ? 'bg-rose-50 text-rose-700 border border-rose-250' 
                            : 'bg-amber-50 text-amber-700 border border-amber-250'
                        }`}>
                          {pair.confidence} Confidence
                        </span>
                      </div>
                      
                      {/* Side-by-side Listings Comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Listing A Card */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 space-y-2 relative">
                          <span className="absolute right-3 top-3 text-[9px] uppercase font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">Listing A (Primary Option)</span>
                          
                          <div className="pt-2">
                            <h4 className="text-sm font-black text-slate-800">{pair.primaryBusiness.title}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5 font-bold uppercase">Owner: {pair.primaryBusiness.ownerName} ({pair.primaryBusiness.memberId})</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] text-slate-500">
                            <div>
                              <span className="block text-[8px] uppercase tracking-wider text-slate-400">GST Number:</span>
                              <span className="font-mono font-bold text-slate-700">{pair.primaryBusiness.gstNumber || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="block text-[8px] uppercase tracking-wider text-slate-400">Phone:</span>
                              <span className="font-bold text-slate-700">{pair.primaryBusiness.phone || 'N/A'}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="block text-[8px] uppercase tracking-wider text-slate-400">City / Location:</span>
                              <span className="font-bold text-slate-700">{pair.primaryBusiness.city} ({pair.primaryBusiness.address})</span>
                            </div>
                          </div>
                        </div>

                        {/* Listing B Card */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 space-y-2 relative">
                          <span className="absolute right-3 top-3 text-[9px] uppercase font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Listing B (Duplicate Choice)</span>
                          
                          <div className="pt-2">
                            <h4 className="text-sm font-black text-slate-800">{pair.duplicateBusiness.title}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5 font-bold uppercase">Owner: {pair.duplicateBusiness.ownerName} ({pair.duplicateBusiness.memberId})</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] text-slate-500">
                            <div>
                              <span className="block text-[8px] uppercase tracking-wider text-slate-400">GST Number:</span>
                              <span className="font-mono font-bold text-slate-700">{pair.duplicateBusiness.gstNumber || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="block text-[8px] uppercase tracking-wider text-slate-400">Phone:</span>
                              <span className="font-bold text-slate-700">{pair.duplicateBusiness.phone || 'N/A'}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="block text-[8px] uppercase tracking-wider text-slate-400">City / Location:</span>
                              <span className="font-bold text-slate-700">{pair.duplicateBusiness.city} ({pair.duplicateBusiness.address})</span>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Action */}
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => { setSelectedDuplicatePair(pair); setMergeReason('Consolidate duplicate listing entries.'); }}
                          className="px-4 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-500/10 transition-all font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer"
                        >
                          <GitMerge size={14} /> Merge & Archive Duplicate Listing
                        </button>
                      </div>

                    </div>
                  ))}

                  {duplicatesList.length === 0 && (
                    <div className="py-8 text-center text-xs font-bold text-slate-400">
                      No duplicate listings detected in search ledger scanner checks.
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* FEATURED DIRECTORY TAB */}
          {activeTab === 'featured' && (
            <div className="space-y-6">
              
              <div className="p-6 rounded-3xl border border-slate-150 bg-white shadow-sm space-y-4">
                <h3 className="text-sm font-black uppercase text-slate-800">Promotional featured business placements</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {professionals.filter(p => p.status === 'Featured').map(prof => (
                    <div key={prof.id} className="p-5 rounded-2xl border border-purple-200 bg-purple-50/50 relative overflow-hidden group">
                      <span className="absolute right-3 top-3"><Sparkles className="text-purple-600" size={16} /></span>
                      
                      <h4 className="text-xs font-black text-slate-800">{prof.title}</h4>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">Owner: {prof.ownerName}</p>
                      
                      <div className="mt-4 pt-4 border-t border-slate-200 space-y-2 text-[10px] font-bold text-slate-600">
                        <div className="flex justify-between">
                          <span>Priority Rating Score:</span>
                          <span>{prof.featuredConfig?.priorityScore || 5}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Carousel Order Rank:</span>
                          <span>#{prof.featuredConfig?.carouselOrder || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Visibility Scope:</span>
                          <span>{prof.featuredConfig?.homepageVisible ? 'Homepage + City' : 'City Only'}</span>
                        </div>
                        {prof.featuredConfig?.endDate && (
                          <div className="flex justify-between text-rose-600">
                            <span>Ends:</span>
                            <span>{formatDate(prof.featuredConfig.endDate)}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => { setSelectedProf(prof); setFeaturedConfigForm(prof.featuredConfig || { isPinned: false, priorityScore: 5 }); setActiveModal('featured'); }}
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[9px] uppercase font-bold text-slate-700 cursor-pointer"
                        >
                          Modify placements
                        </button>
                        <button
                          onClick={() => handleStatusTransition(prof.id, 'Verified')}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 text-[9px] uppercase font-bold cursor-pointer"
                        >
                          Remove tier
                        </button>
                      </div>

                    </div>
                  ))}
                </div>

                {professionals.filter(p => p.status === 'Featured').length === 0 && (
                  <div className="py-8 text-center text-xs font-bold text-slate-400">
                    No active featured business promotions scheduled.
                  </div>
                )}

              </div>

            </div>
          )}

          {/* ANALYTICS CENTER TAB */}
          {activeTab === 'analytics' && chartsData && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <div className="p-6 rounded-3xl border border-slate-150 bg-white shadow-sm space-y-3">
                  <h4 className="text-xs uppercase text-slate-500 font-black tracking-widest">Business Growth Timeline</h4>
                  <div className="h-44 flex items-end">
                    <AreaChart data={chartsData.growthTrend.data} labels={chartsData.growthTrend.labels} color="#8b5cf6" height={160} />
                  </div>
                </div>

                <div className="p-6 rounded-3xl border border-slate-150 bg-white shadow-sm space-y-3">
                  <h4 className="text-xs uppercase text-slate-500 font-black tracking-widest">Category distribution metrics</h4>
                  <div className="h-44 flex items-end">
                    <BarChart data={chartsData.categoryDistribution.map(c => c.value)} labels={chartsData.categoryDistribution.map(c => c.name)} colors={['#a855f7']} height={160} />
                  </div>
                </div>

                <div className="p-6 rounded-3xl border border-slate-150 bg-white shadow-sm space-y-3">
                  <h4 className="text-xs uppercase text-slate-500 font-black tracking-widest">Community Node Distributions</h4>
                  <div className="h-44 flex items-end">
                    <BarChart data={chartsData.communityDistribution.map(c => c.value)} labels={chartsData.communityDistribution.map(c => c.name)} colors={['#6366f1']} height={160} />
                  </div>
                </div>

                <div className="p-6 rounded-3xl border border-slate-150 bg-white shadow-sm space-y-3">
                  <h4 className="text-xs uppercase text-slate-500 font-black tracking-widest">Compliance Health Grades Map</h4>
                  <div className="h-44 flex items-end">
                    <BarChart data={chartsData.healthScoreDistribution.map(c => c.value)} labels={chartsData.healthScoreDistribution.map(c => c.name)} colors={['#10b981']} height={160} />
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* COMMUNITY COMPARISON TAB */}
          {activeTab === 'comparison' && (
            <div className="p-6 rounded-3xl border border-slate-150 bg-white shadow-sm space-y-4">
              <h3 className="text-sm font-black uppercase text-slate-500">Cross-Community Aggregated Comparisons</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-bold divide-y divide-slate-150 border border-slate-150 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-slate-50 uppercase text-slate-500">
                      <th className="p-4">Community Node</th>
                      <th className="p-4 text-center">Total Businesses</th>
                      <th className="p-4 text-center">Verification %</th>
                      <th className="p-4 text-center">Featured Listings</th>
                      <th className="p-4 text-center">Growth Rate</th>
                      <th className="p-4 text-center">Avg Health Score</th>
                      <th className="p-4 text-center">Active Complaints</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                    {comparisonList.map((node, idx) => (
                      <tr key={idx} className="hover:bg-purple-50/10 transition-all">
                        <td className="p-4 font-black text-slate-800">{node.communityName}</td>
                        <td className="p-4 text-center text-slate-700">{node.businesses}</td>
                        <td className="p-4 text-center text-purple-600 font-mono">{node.verificationPercent}%</td>
                        <td className="p-4 text-center text-slate-600">{node.featuredListings}</td>
                        <td className="p-4 text-center text-emerald-600 font-mono">{node.growth}</td>
                        <td className="p-4 text-center">
                          <span className="px-2 py-0.5 rounded bg-purple-50 border border-purple-100 text-purple-700 font-bold">{node.avgHealthScore}</span>
                        </td>
                        <td className="p-4 text-center text-rose-600 font-mono">{node.complaints}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* AUDIT LOGGER TAB */}
          {activeTab === 'audits' && (
            <div className="p-6 rounded-3xl border border-slate-150 bg-white shadow-sm space-y-4">
              <h3 className="text-sm font-black uppercase text-slate-500">Central Directory Operations Audit log</h3>
              
              <div className="overflow-x-auto border border-slate-150 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs font-bold divide-y divide-slate-150">
                  <thead>
                    <tr className="bg-slate-50 uppercase text-slate-500">
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Business Target</th>
                      <th className="p-4">Action Event</th>
                      <th className="p-4">Previous State</th>
                      <th className="p-4">New Consolidated Value</th>
                      <th className="p-4">Performed By</th>
                      <th className="p-4">Justification reason</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white text-slate-750 text-[10px]">
                    {auditLogsList.map((log, idx) => (
                      <tr key={idx} className="hover:bg-purple-50/10 transition-all font-mono">
                        <td className="p-4 whitespace-nowrap text-slate-400">{formatDate(log.timestamp)}</td>
                        <td className="p-4 font-bold text-slate-800 whitespace-nowrap">{log.businessName}</td>
                        <td className="p-4 text-purple-650 font-extrabold whitespace-nowrap">{log.action}</td>
                        <td className="p-4 text-slate-500 max-w-xs truncate" title={log.oldValue}>{log.oldValue}</td>
                        <td className="p-4 text-emerald-600 max-w-xs truncate" title={log.newValue}>{log.newValue}</td>
                        <td className="p-4 text-slate-500 whitespace-nowrap">{log.performedBy}</td>
                        <td className="p-4 text-slate-500 font-bold max-w-xs truncate" title={log.reason}>{log.reason || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ─── 14-TAB BUSINESS PROFILE WORKSPACE PANEL (Slide-out drawer) ─── */}
      <AnimatePresence>
        {isWorkspaceOpen && selectedProf && (
          <div className="fixed inset-0 z-45 overflow-hidden text-slate-800 flex justify-end">
            
            {/* Backdrop opacity layer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWorkspaceOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
            />

            {/* Slide drawer container */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-3xl h-full bg-white border-l border-slate-200 flex flex-col z-10 shadow-2xl"
            >
              
              {/* Workspace Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-[9px] font-mono text-purple-700 font-extrabold">{selectedProf.businessId}</span>
                    <h2 className="text-base font-black text-slate-800">{selectedProf.title}</h2>
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Management Workspace console</p>
                </div>

                <button 
                  onClick={() => setIsWorkspaceOpen(false)}
                  className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <XCircle size={16} />
                </button>
              </div>

              {/* Workspace 14 Tabs slider panel */}
              <div className="flex border-b border-slate-150 overflow-x-auto gap-2 px-6 pb-px scrollbar-none text-[10px] font-black uppercase">
                {[
                  { id: 'overview', name: 'Overview' },
                  { id: 'owner', name: 'Owner Details' },
                  { id: 'business', name: 'Business info' },
                  { id: 'docs', name: 'Documents' },
                  { id: 'verification', name: 'Pipeline' },
                  { id: 'products', name: 'Catalog' },
                  { id: 'gallery', name: 'Gallery' },
                  { id: 'reviews', name: 'Feedback' },
                  { id: 'complaints', name: 'Grievances' },
                  { id: 'connections', name: 'Connections' },
                  { id: 'events', name: 'Samaj events' },
                  { id: 'donation', name: 'Donation History' },
                  { id: 'analytics', name: 'Lead views' },
                  { id: 'audit', name: 'Audit Timeline' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setWorkspaceTab(tab.id)}
                    className={`py-3.5 px-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                      workspaceTab === tab.id 
                        ? 'border-purple-650 text-purple-650 font-black' 
                        : 'border-transparent text-slate-400 hover:text-slate-800'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>

              {/* Workspace Contents panel */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-700 bg-white">
                
                {/* 1. Overview Tab */}
                {workspaceTab === 'overview' && (
                  <div className="space-y-6">
                    
                    {/* Health Grade Score card */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl border border-slate-150 bg-slate-50 flex flex-col justify-between h-28">
                        <span className="text-[9px] uppercase tracking-widest text-slate-400 font-black">Business Health Grade</span>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl border ${getHealthBadge(professionalAnalyticsService.calculateHealthScore(selectedProf).score).color}`}>
                            {getHealthBadge(professionalAnalyticsService.calculateHealthScore(selectedProf).score).grade}
                          </span>
                          <div>
                            <span className="text-lg font-black text-slate-800">{professionalAnalyticsService.calculateHealthScore(selectedProf).score}/100</span>
                            <p className="text-[9px] uppercase text-slate-400">Compliance health metric</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl border border-slate-150 bg-slate-50 flex flex-col justify-between h-28">
                        <span className="text-[9px] uppercase tracking-widest text-slate-400 font-black">General Rating Score</span>
                        <div className="mt-2">
                          <span className="text-xl font-black text-slate-800">{selectedProf.rating} / 5.0</span>
                          <div className="flex gap-0.5 text-amber-500 mt-1">
                            {[1,2,3,4,5].map(i => <Star key={i} size={10} fill={i <= Math.floor(selectedProf.rating) ? 'currentColor' : 'none'} />)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Admin Actions toolbar */}
                    <div className="p-5 rounded-2xl border border-purple-100 bg-purple-50/20 space-y-3">
                      <h4 className="text-xs uppercase text-purple-700 font-black tracking-wide">Quick governance operations</h4>
                      
                      <div className="flex gap-2 flex-wrap">
                        {selectedProf.status !== 'Verified' && (
                          <button 
                            onClick={() => handleStatusTransition(selectedProf.id, 'Verified')}
                            className="px-3.5 py-2 rounded-xl bg-purple-650 hover:bg-purple-700 text-[10px] font-black uppercase text-white cursor-pointer"
                          >
                            Approve listing
                          </button>
                        )}
                        {selectedProf.status !== 'Suspended' && (
                          <button 
                            onClick={() => {
                              const note = prompt('Reason for suspension:');
                              if (note) handleStatusTransition(selectedProf.id, 'Suspended', note);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/50 text-[10px] font-black uppercase cursor-pointer"
                          >
                            Suspend listing
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            const reason = prompt('Specify deletion reason note:');
                            if (reason) professionalDirectoryService.softDeleteProfessional(selectedProf.id).then(() => { triggerToast('Listing soft deleted'); setIsWorkspaceOpen(false); loadData(); });
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 text-[10px] font-black uppercase transition-all cursor-pointer"
                        >
                          Soft Delete
                        </button>
                      </div>
                    </div>

                  </div>
                )}

                {/* 2. Owner Details Tab */}
                {workspaceTab === 'owner' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-150">
                      <div className="w-12 h-12 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center font-black text-lg text-purple-700">
                        {selectedProf.ownerName?.split(' ').map(n => n[0]).join('') || 'ON'}
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-slate-800">{selectedProf.ownerName}</h4>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Samaj Registration ID: {selectedProf.memberId}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-700">
                      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-150">
                        <span className="text-[9px] text-slate-400 uppercase block font-black">Owner Email:</span>
                        <p className="mt-1 text-slate-800 font-black">{selectedProf.ownerEmail || 'N/A'}</p>
                      </div>
                      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-150">
                        <span className="text-[9px] text-slate-400 uppercase block font-black">Owner Contact Phone:</span>
                        <p className="mt-1 text-slate-800 font-black">{selectedProf.ownerPhone || selectedProf.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Business Info Tab */}
                {workspaceTab === 'business' && (
                  <div className="space-y-4 text-xs font-bold text-slate-700">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 space-y-2">
                      <span className="text-[9px] text-slate-400 uppercase block font-black">Business Description:</span>
                      <p className="text-slate-800 text-xs font-semibold leading-relaxed">{selectedProf.description || 'No description provided.'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-150">
                        <span className="text-[9px] text-slate-400 uppercase block font-black">Categories:</span>
                        <p className="mt-1 text-slate-800 font-black">{selectedProf.category} • {selectedProf.subcategory}</p>
                      </div>
                      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-150">
                        <span className="text-[9px] text-slate-400 uppercase block font-black">Business Hours:</span>
                        <p className="mt-1 text-slate-800 font-black">{selectedProf.businessHours || '09:00 AM - 08:00 PM'}</p>
                      </div>
                      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-150 col-span-2">
                        <span className="text-[9px] text-slate-400 uppercase block font-black">Business Location Address:</span>
                        <p className="mt-1 text-slate-800 font-black leading-relaxed">{selectedProf.address}, {selectedProf.city}, {selectedProf.state} - {selectedProf.pinCode}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Documents Tab */}
                {workspaceTab === 'docs' && (
                  <div className="space-y-4">
                    <div className="divide-y divide-slate-100 border border-slate-150 rounded-xl overflow-hidden bg-slate-50">
                      {(selectedProf.documents || []).map(doc => (
                        <div key={doc.id} className="p-4 flex justify-between items-center text-slate-700">
                          <div>
                            <span className="text-xs font-black text-slate-800">{doc.type}</span>
                            <div className="flex gap-2 text-[10px] text-slate-400 mt-1 font-semibold font-mono">
                              <span>File: {doc.fileName}</span>
                              {doc.expiryDate && <span>Expiry: {doc.expiryDate}</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded border text-[9px] uppercase font-black tracking-wider ${
                              doc.status === 'Verified' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : doc.status === 'Rejected' 
                                ? 'bg-rose-50 text-rose-700 border-rose-200' 
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {doc.status}
                            </span>
                            <button 
                              onClick={() => setSelectedDoc(doc)}
                              className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-[10px] font-bold uppercase cursor-pointer"
                            >
                              Audit file
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Verification Tab */}
                {workspaceTab === 'verification' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-slate-150 bg-slate-50 space-y-3">
                      <span className="text-xs font-black uppercase text-slate-400">Validation stage logs:</span>
                      <div className="text-xs font-bold text-slate-700 flex justify-between">
                        <span>Current Pipeline stage:</span>
                        <span className="text-purple-650 font-black">{selectedProf.pipelineStage || 'Document Review'}</span>
                      </div>
                    </div>
                    
                    {/* Pipeline transition trigger action buttons */}
                    <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-bold uppercase">
                      {['Document Review', 'Compliance Review', 'Business Validation', 'Final Approval'].map(stage => (
                        <button
                          key={stage}
                          onClick={() => professionalVerificationService.updatePipelineStage(selectedProf.id, stage).then(() => loadData())}
                          className={`p-3 rounded-xl border transition-all cursor-pointer ${
                            selectedProf.pipelineStage === stage 
                              ? 'bg-purple-50 border-purple-500 text-purple-700 font-extrabold' 
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          {stage}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Products catalog */}
                {workspaceTab === 'products' && (
                  <div className="space-y-3">
                    {(selectedProf.productsServices || []).map(prod => (
                      <div key={prod.id} className="p-4 rounded-xl bg-slate-55 border border-slate-150 flex justify-between items-center text-slate-700">
                        <div>
                          <span className="text-xs font-black text-slate-800">{prod.name}</span>
                          <p className="text-[10px] text-slate-450 mt-1 font-semibold">{prod.description}</p>
                        </div>
                        <span className="text-sm font-black text-purple-650">{prod.price}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 7. Gallery Photos */}
                {workspaceTab === 'gallery' && (
                  <div className="grid grid-cols-2 gap-4">
                    {(selectedProf.gallery || []).map(img => (
                      <div key={img.id} className="rounded-xl border border-slate-150 bg-slate-50 overflow-hidden space-y-2 pb-2">
                        <img src={img.fileUrl} alt={img.caption} className="w-full h-32 object-cover" />
                        <div className="px-3">
                          <span className="text-xs font-black text-slate-800">{img.caption}</span>
                          <p className="text-[9px] uppercase text-slate-400 font-bold mt-0.5">{img.isCoverImage ? 'Primary Cover photo' : 'Gallery item'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 8. Reviews Tab */}
                {workspaceTab === 'reviews' && (
                  <div className="space-y-4">
                    {(selectedProf.reviews || []).map(rev => (
                      <div key={rev.id} className="p-4 rounded-xl bg-slate-50 border border-slate-150 space-y-2 text-slate-700">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-slate-800">{rev.reviewerName}</span>
                          <span className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5"><Star size={10} fill="currentColor" /> {rev.rating}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">{rev.comment}</p>
                        <span className="text-[9px] text-slate-400 font-mono block mt-1">{formatDate(rev.date)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 9. Complaints Tab */}
                {workspaceTab === 'complaints' && (
                  <div className="space-y-4">
                    {(selectedProf.complaints || []).map(comp => (
                      <div key={comp.id} className="p-4 rounded-xl bg-rose-50 border border-rose-200/50 space-y-2 text-slate-700">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-rose-700">{comp.type}</span>
                          <span className="text-[9px] uppercase font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-250">{comp.status}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">Report: {comp.evidence}</p>
                        <p className="text-[10px] text-slate-500 font-bold">Reported By: {comp.reportedBy}</p>
                      </div>
                    ))}

                    {(selectedProf.complaints || []).length === 0 && (
                      <div className="py-8 text-center text-xs font-bold text-slate-400 bg-slate-50 rounded-xl border border-slate-150">
                        No grievance complaint logs logged against business.
                      </div>
                    )}
                  </div>
                )}

                {/* 10. Connections Tab */}
                {workspaceTab === 'connections' && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 text-xs font-bold text-slate-400 text-center">
                    Simulated employee records and customer connections mapping log.
                  </div>
                )}

                {/* 11. Events Tab */}
                {workspaceTab === 'events' && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 text-xs font-bold text-slate-400 text-center">
                    Participated in annual Samaj conventions, trade fairs, and trade stall sponsorships list.
                  </div>
                )}

                {/* 12. Donation Tab */}
                {workspaceTab === 'donation' && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 text-xs font-bold text-slate-500 text-center text-emerald-700 font-mono">
                    Total charity funds contributed to Indore Bhawan renovation fund: ₹15,000
                  </div>
                )}

                {/* 13. Analytics Tab */}
                {workspaceTab === 'analytics' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 space-y-1">
                      <span className="text-[10px] uppercase text-slate-400 font-black">Monthly Search Impressions Clicks</span>
                      <div className="h-16">
                        <Sparkline data={[120, 140, 165, 190, 220, 280]} color="#a855f7" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 14. Audit logs timeline */}
                {workspaceTab === 'audit' && (
                  <div className="space-y-4">
                    {(selectedProf.auditLogs || []).map((log, idx) => (
                      <div key={idx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-150 space-y-1 font-mono text-[10px] text-slate-700">
                        <div className="flex justify-between items-center text-slate-400 font-semibold">
                          <span>{formatDate(log.timestamp)}</span>
                          <span className="text-purple-650 font-black">{log.performedBy}</span>
                        </div>
                        <h5 className="font-black text-slate-800 text-xs">{log.action}</h5>
                        <p className="text-[9px] text-slate-400 max-w-lg truncate" title={log.newValue}>Diff: {log.newValue}</p>
                      </div>
                    ))}
                  </div>
                )}

              </div>
              
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODALS DIALOGS ─── */}

      {/* Action modal parameters configure */}
      {activeModal === 'actions' && selectedProf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay dark backdrop */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer" onClick={() => setActiveModal(null)} />
          
          <div className="relative w-full max-w-md p-6 rounded-3xl border border-slate-200 bg-white text-slate-800 shadow-2xl space-y-5">
            <h3 className="text-sm font-black uppercase text-slate-800 border-b border-slate-100 pb-3">Admin operational actions</h3>
            
            {/* Transfer Community */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-black block">Transfer Community Node:</span>
              <div className="flex gap-2">
                <select
                  value={transferTargetComm}
                  onChange={(e) => setTransferTargetComm(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-none focus:bg-white text-slate-800 cursor-pointer"
                >
                  <option value="c1">Samaj Indore (c1)</option>
                  <option value="c2">Samaj Jaipur (c2)</option>
                  <option value="c3">Samaj Kota (c3)</option>
                  <option value="c4">Samaj Bhopal (c4)</option>
                </select>
                <button 
                  onClick={handleCommunityTransfer}
                  className="px-3.5 py-2 rounded-xl bg-purple-650 hover:bg-purple-700 text-white font-bold text-xs uppercase cursor-pointer"
                >
                  Transfer Community
                </button>
              </div>
            </div>

            {/* Transfer Owner */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-black block">Transfer Owner Association:</span>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Target Owner Member ID (e.g. M-10002)"
                  value={transferTargetOwnerId}
                  onChange={(e) => setTransferTargetOwnerId(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-none focus:bg-white text-slate-800"
                />
                <input
                  type="text"
                  placeholder="Target Owner Name"
                  value={transferTargetOwnerName}
                  onChange={(e) => setTransferTargetOwnerName(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-none focus:bg-white text-slate-800"
                />
                <button 
                  onClick={handleOwnerTransfer}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-purple-650 hover:bg-purple-700 text-white font-bold text-xs uppercase cursor-pointer"
                >
                  Transfer Owner Listing
                </button>
              </div>
            </div>

            {/* Cancel Button */}
            <button 
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors text-xs font-bold uppercase cursor-pointer"
            >
              Cancel Controls
            </button>
          </div>
        </div>
      )}

      {/* Featured configs modal */}
      {activeModal === 'featured' && selectedProf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer" onClick={() => setActiveModal(null)} />
          
          <div className="relative w-full max-w-md p-6 rounded-3xl border border-slate-200 bg-white text-slate-800 shadow-2xl space-y-4">
            <h3 className="text-sm font-black uppercase text-slate-800 border-b border-slate-100 pb-3">Featured listing parameters</h3>
            
            <div className="space-y-3 text-xs font-bold">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={featuredConfigForm.isPinned}
                  onChange={(e) => setFeaturedConfigForm(prev => ({ ...prev, isPinned: e.target.checked }))}
                  className="rounded border-slate-350 text-purple-600 focus:ring-0"
                />
                <span>Pin to homepage Featured</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={featuredConfigForm.homepageVisible}
                  onChange={(e) => setFeaturedConfigForm(prev => ({ ...prev, homepageVisible: e.target.checked }))}
                  className="rounded border-slate-350 text-purple-600 focus:ring-0"
                />
                <span>Configure Homepage Visibility</span>
              </label>

              <div className="space-y-1">
                <span className="text-[9px] uppercase text-slate-400">Priority Score Rank:</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={featuredConfigForm.priorityScore}
                  onChange={(e) => setFeaturedConfigForm(prev => ({ ...prev, priorityScore: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-55 border border-slate-200 text-xs focus:outline-none focus:bg-white text-slate-850"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] uppercase text-slate-400">Carousel Placement Order Rank:</span>
                <input
                  type="number"
                  value={featuredConfigForm.carouselOrder}
                  onChange={(e) => setFeaturedConfigForm(prev => ({ ...prev, carouselOrder: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-55 border border-slate-200 text-xs focus:outline-none focus:bg-white text-slate-850"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] uppercase text-slate-400">Duration Period Type:</span>
                <select
                  value={featuredConfigForm.featuredDuration}
                  onChange={(e) => setFeaturedConfigForm(prev => ({ ...prev, featuredDuration: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-55 border border-slate-200 text-xs focus:outline-none focus:bg-white text-slate-850 cursor-pointer"
                >
                  <option value="Unlimited">Unlimited Duration</option>
                  <option value="7 Days">7 Days duration scope</option>
                  <option value="30 Days">30 Days duration scope</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <span className="text-[9px] uppercase text-slate-400">Start Date:</span>
                  <input
                    type="date"
                    value={featuredConfigForm.startDate?.split('T')[0] || ''}
                    onChange={(e) => setFeaturedConfigForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-55 border border-slate-200 text-xs focus:outline-none focus:bg-white font-mono"
                  />
                </div>
                <div>
                  <span className="text-[9px] uppercase text-slate-400">End Date (Auto Expiry):</span>
                  <input
                    type="date"
                    value={featuredConfigForm.endDate?.split('T')[0] || ''}
                    onChange={(e) => setFeaturedConfigForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-55 border border-slate-200 text-xs focus:outline-none focus:bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={handleConfigureFeatured}
                className="flex-1 py-2.5 rounded-xl bg-purple-650 hover:bg-purple-700 text-white font-black text-xs uppercase cursor-pointer"
              >
                Save placements
              </button>
              <button 
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Preset filters modal */}
      {showSavePresetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer" onClick={() => setShowSavePresetModal(false)} />
          
          <div className="relative w-full max-sm:w-full max-w-sm p-6 rounded-3xl border border-slate-200 bg-white text-slate-800 shadow-2xl space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Save Filter Settings Preset</h3>
            <input
              type="text"
              placeholder="Preset Name (e.g. Pending reviews, Gold badges)"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-none focus:border-purple-500 focus:bg-white text-slate-800 placeholder-slate-400"
            />
            <div className="flex gap-2">
              <button 
                onClick={handleSavePreset}
                className="flex-1 py-2 rounded-xl bg-purple-650 hover:bg-purple-700 text-white font-bold text-xs uppercase cursor-pointer"
              >
                Save Preset
              </button>
              <button 
                onClick={() => setShowSavePresetModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Review audit dialog modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer" onClick={() => setSelectedDoc(null)} />
          
          <div className="relative w-full max-w-md p-6 rounded-3xl border border-slate-250 bg-white text-slate-800 shadow-2xl space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">Audit Certificate Document File</h3>
            <div className="text-xs font-bold space-y-1">
              <div>Document type: <span className="text-purple-650 font-black">{selectedDoc.type}</span></div>
              <div>Filename: <span className="text-slate-500 font-mono font-bold">{selectedDoc.fileName}</span></div>
            </div>
            
            <textarea
              placeholder="Audit log review feedback notes..."
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:bg-white text-slate-800 focus:border-purple-500"
            />

            <div className="flex gap-2">
              <button 
                onClick={() => handleReviewDocument('Verified')}
                className="flex-1 py-2 rounded-xl bg-emerald-500 text-white font-black text-xs uppercase hover:bg-emerald-650 transition-all cursor-pointer"
              >
                Verify
              </button>
              <button 
                onClick={() => handleReviewDocument('Re-upload Required')}
                className="flex-1 py-2 rounded-xl bg-amber-500 text-white font-black text-xs uppercase hover:bg-amber-650 transition-all cursor-pointer"
              >
                Re-upload
              </button>
              <button 
                onClick={() => handleReviewDocument('Rejected')}
                className="flex-1 py-2 rounded-xl bg-rose-500 border border-rose-450 hover:bg-rose-600 text-white text-xs font-bold uppercase transition-all cursor-pointer"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suggested merge modal confirmation */}
      {selectedDuplicatePair && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer" onClick={() => setSelectedDuplicatePair(null)} />
          
          <div className="relative w-full max-w-lg p-6 rounded-3xl border border-slate-200 bg-white text-slate-800 shadow-2xl space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-rose-600 flex items-center gap-1.5"><GitMerge size={16} /> Confirm Consolidation business listing merge</h3>
            
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              Merging duplicate listings consolidates reviews, complaints, products catalog, views, and audit history logs into the Primary Business Listing record. The Consolidated Duplicate business listing record will be archived as soft-deleted.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 text-xs font-mono space-y-1">
              <div>Primary Business Target: <span className="text-purple-650 font-bold">{selectedDuplicatePair.primaryBusiness.title}</span></div>
              <div>Consolidated Duplicate Business: <span className="text-rose-600 font-bold">{selectedDuplicatePair.duplicateBusiness.title}</span></div>
              <div>Match Reasons: <span className="text-slate-500 font-bold">{selectedDuplicatePair.reasons.join(', ')}</span></div>
            </div>

            <input
              type="text"
              placeholder="Provide reason for consolidation merge..."
              value={mergeReason}
              onChange={(e) => setMergeReason(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:bg-white text-slate-800 placeholder-slate-400"
            />

            <div className="flex gap-2">
              <button 
                onClick={handleMergeDuplicates}
                className="flex-1 py-2.5 rounded-xl bg-purple-650 hover:bg-purple-700 text-white font-bold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-purple-500/10"
              >
                Consolidate Merge
              </button>
              <button 
                onClick={() => setSelectedDuplicatePair(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
