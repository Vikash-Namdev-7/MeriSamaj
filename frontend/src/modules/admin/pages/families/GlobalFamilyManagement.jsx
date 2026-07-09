import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Sliders, RefreshCw, Download, Plus, ArrowUpRight, Eye, Edit3, 
  GitMerge, Split, Share2, ShieldAlert, Archive, Trash2, CheckCircle2, XCircle, 
  MapPin, Calendar, Heart, Briefcase, Activity, Check, Info, FileText, ChevronRight,
  ZoomIn, ZoomOut, Maximize, User, Phone, Globe, DollarSign, Award, Settings, ShieldCheck, HelpCircle
} from 'lucide-react';
import { Avatar } from '../../../member/components/common/Avatar';
import { familyService } from '../../services/familyService';
import { familyAnalyticsService } from '../../services/familyAnalyticsService';
import { familyTransferService } from '../../services/familyTransferService';
import { familyMergeService } from '../../services/familyMergeService';
import { familyAuditService } from '../../services/familyAuditService';
import { AreaChart, BarChart, DonutChart, ProgressRing, Sparkline } from '../../../head/pages/reports/components/ChartComponents';

export default function GlobalFamilyManagement() {
  // Page Tabs: 'directory' | 'duplicates' | 'analytics' | 'audits'
  const [activeTab, setActiveTab] = useState('directory');
  
  // Data States
  const [families, setFamilies] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    community: 'All',
    city: 'All',
    status: 'All',
    verificationStatus: 'All',
    size: 'All',
    sort: 'newest'
  });

  // UI States
  const [toast, setToast] = useState(null);
  const [drawerFamily, setDrawerFamily] = useState(null);
  const [drawerTab, setDrawerTab] = useState('personal');
  
  // Action Modals State
  const [activeModal, setActiveModal] = useState(null); // 'merge' | 'split' | 'transfer' | 'changeHead' | 'confirmAction' | null
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [selectedFamilyB, setSelectedFamilyB] = useState(null); // Used for merge selection
  const [splitSelectedMembers, setSplitSelectedMembers] = useState([]); // Members selected to split
  const [splitNewFamilyName, setSplitNewFamilyName] = useState('');
  const [splitNewHeadName, setSplitNewHeadName] = useState('');
  const [transferTargetCommunity, setTransferTargetCommunity] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [transferPrecheck, setTransferPrecheck] = useState(null);
  const [changeHeadTargetId, setChangeHeadTargetId] = useState('');
  
  // Confirmation action details
  const [pendingAction, setPendingAction] = useState({
    type: '', // 'suspend' | 'archive' | 'delete' | 'restore' | 'verify' | 'reject'
    familyId: null,
    title: '',
    message: ''
  });

  const isFetching = useRef(false);

  // Load Data function
  const loadData = async () => {
    if (isFetching.current) return;
    try {
      isFetching.current = true;
      setLoading(true);
      setError(null);
      
      const familiesRes = await familyService.getFamilies({
        searchQuery,
        ...filters
      });
      setFamilies(familiesRes.data);

      const analyticsRes = await familyAnalyticsService.getDashboardAnalytics();
      setAnalytics(analyticsRes);

      const duplicatesRes = await familyMergeService.detectDuplicates();
      setDuplicates(duplicatesRes);

      const auditsRes = await familyAuditService.getAuditLogs();
      setAuditLogs(auditsRes.data);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load family data modules.');
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  useEffect(() => {
    loadData();
  }, [
    searchQuery, 
    filters.community, 
    filters.city, 
    filters.status, 
    filters.verificationStatus, 
    filters.size, 
    filters.sort, 
    activeTab
  ]);

  // Show Toast Helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Dynamic filter reset
  const handleResetFilters = () => {
    setFilters({
      community: 'All',
      city: 'All',
      status: 'All',
      verificationStatus: 'All',
      size: 'All',
      sort: 'newest'
    });
    setSearchQuery('');
    showToast('Filters reset successfully');
  };

  // Export engine
  const handleExport = (format) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(families, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `global_families_export.${format.toLowerCase()}`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Exported ${families.length} records in ${format} format!`);
  };

  // Handle simple status changes
  const executeStatusChange = async () => {
    const { type, familyId } = pendingAction;
    try {
      if (type === 'suspend') {
        await familyService.changeStatus(familyId, 'Suspended');
        showToast('Family record suspended successfully', 'warning');
      } else if (type === 'archive') {
        await familyService.changeStatus(familyId, 'Archived');
        showToast('Family record archived successfully', 'info');
      } else if (type === 'restore') {
        await familyService.changeStatus(familyId, 'Active');
        showToast('Family record restored to active', 'success');
      } else if (type === 'delete') {
        await familyService.softDeleteFamily(familyId);
        showToast('Family record soft-deleted successfully', 'error');
      } else if (type === 'verify') {
        await familyService.verifyFamily(familyId, true);
        showToast('Family verification approved', 'success');
      } else if (type === 'reject') {
        await familyService.verifyFamily(familyId, false);
        showToast('Family verification rejected', 'error');
      }
      
      // Close drawer if open and affected
      if (drawerFamily && drawerFamily.id === familyId) {
        setDrawerFamily(null);
      }

      setActiveModal(null);
      loadData();
    } catch (e) {
      showToast(e.message || 'Operation failed', 'error');
    }
  };

  const triggerStatusConfirm = (type, familyId) => {
    const actionTitles = {
      suspend: 'Suspend Family Record?',
      archive: 'Archive Family Record?',
      delete: 'Delete Family Record (Soft Delete)?',
      restore: 'Restore Family Record?',
      verify: 'Approve Family Verification?',
      reject: 'Reject Family Verification?'
    };

    const actionMessages = {
      suspend: 'This will freeze access for all members associated with this family.',
      archive: 'This will move the family registry into archives. Data will remain queryable but read-only.',
      delete: 'This will perform a soft-delete on the family record, hiding it from directories.',
      restore: 'This will reactivate the family and grant full dashboard access.',
      verify: 'This will mark all submitted documents as approved and verify the family.',
      reject: 'This will flag the family verification as rejected and request document resubmission.'
    };

    setPendingAction({
      type,
      familyId,
      title: actionTitles[type],
      message: actionMessages[type]
    });
    setActiveModal('confirmAction');
  };

  // Perform community transfer pre-check
  const handleTransferPrecheck = async (familyId, community) => {
    if (!community) return;
    try {
      const check = await familyTransferService.validateTransfer(familyId, community);
      setTransferPrecheck(check);
    } catch (e) {
      console.error(e);
    }
  };

  // Execute transfer
  const executeTransfer = async () => {
    try {
      await familyTransferService.executeTransfer(selectedFamily.id, transferTargetCommunity, transferReason);
      showToast(`Successfully transferred "${selectedFamily.name}" to "${transferTargetCommunity}"!`);
      setActiveModal(null);
      setDrawerFamily(null);
      loadData();
    } catch (e) {
      showToast(e.message || 'Transfer failed', 'error');
    }
  };

  // Execute Merge
  const executeMerge = async () => {
    try {
      await familyMergeService.mergeFamilies(selectedFamily.id, selectedFamilyB.id, {
        sourceHeadRelation: 'Family Member'
      });
      showToast(`Merged duplicate family "${selectedFamilyB.name}" into "${selectedFamily.name}"!`);
      setActiveModal(null);
      setDrawerFamily(null);
      loadData();
    } catch (e) {
      showToast(e.message || 'Merge failed', 'error');
    }
  };

  // Execute Split
  const executeSplit = async () => {
    try {
      await familyMergeService.splitFamily(selectedFamily.id, splitSelectedMembers, {
        name: splitNewFamilyName,
        headName: splitNewHeadName,
        community: selectedFamily.community,
        city: selectedFamily.city,
        address: selectedFamily.address
      });
      showToast(`Split off new family "${splitNewFamilyName}" successfully!`);
      setActiveModal(null);
      setDrawerFamily(null);
      loadData();
    } catch (e) {
      showToast(e.message || 'Split failed', 'error');
    }
  };

  // Execute change head
  const executeChangeHead = async () => {
    try {
      await familyService.changeHead(selectedFamily.id, changeHeadTargetId);
      showToast(`Head of family updated successfully!`);
      setActiveModal(null);
      setDrawerFamily(null);
      loadData();
    } catch (e) {
      showToast(e.message || 'Change head failed', 'error');
    }
  };

  // Unique list values for filter dropdowns
  const communitiesList = ['All', 'Agrawal Samaj', 'Brahmin Samaj', 'Patidar Samaj', 'Rajput Samaj', 'Verma Samaj', 'Mali Samaj', 'Jain Samaj'];
  const citiesList = ['All', 'Indore', 'Jaipur', 'Bhopal', 'Ujjain', 'Ahmedabad', 'Delhi', 'Mumbai', 'Surat', 'Lucknow'];

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* ─── TITLE & ACTIONS HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Users className="text-purple-600 w-7 h-7" />
            Global Family Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Master control room to audit, split, merge, and transfer family structures across all Samaj organizations.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={loadData}
            className="p-2.5 rounded-2xl bg-white border border-gray-200 text-gray-600 hover:text-purple-600 hover:border-purple-200 hover:shadow-sm active:scale-95 transition-all"
            title="Refresh Data"
          >
            <RefreshCw size={16} />
          </button>
          
          <div className="relative group">
            <button className="px-4 py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-xs flex items-center gap-2 hover:bg-purple-700 shadow-md shadow-purple-500/20 active:scale-95 transition-all">
              <Download size={14} /> Export Registry
            </button>
            <div className="absolute right-0 top-full mt-2 w-36 bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-40">
              {['CSV', 'Excel', 'Print'].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => handleExport(fmt)}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                >
                  Export as {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── TABS HEADER ─── */}
      <div className="flex border-b border-gray-200 gap-6">
        {[
          { id: 'directory', label: 'Directory', icon: Users },
          { id: 'duplicates', label: 'Duplicate Records', icon: GitMerge, count: duplicates.length },
          { id: 'analytics', label: 'Analytics Centre', icon: Globe },
          { id: 'audits', label: 'Global Audit Logs', icon: Activity }
        ].map(tb => (
          <button
            key={tb.id}
            onClick={() => setActiveTab(tb.id)}
            className={`pb-3.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all relative ${
              activeTab === tb.id 
                ? 'border-purple-600 text-purple-600 font-bold' 
                : 'border-transparent text-gray-500 hover:text-gray-900 font-medium'
            }`}
          >
            <tb.icon size={15} />
            {tb.label}
            {tb.count > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-rose-500 text-white animate-pulse">
                {tb.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── DASHBOARD KPI CARDS ─── */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Families */}
          <div 
            onClick={() => { setActiveTab('directory'); handleResetFilters(); }}
            className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col justify-between min-h-[140px] cursor-pointer group hover:-translate-y-1 transition-all duration-300 hover:border-purple-200"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-100/50 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform">
                <Users size={18} />
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-0.5">
                +12% <ArrowUpRight size={10} />
              </span>
            </div>
            
            <div className="mt-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 leading-none">Total Families</span>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight mt-1.5 leading-none">{analytics.stats.totalFamilies}</h3>
            </div>
            <div className="w-full h-7 mt-2 opacity-65">
              <Sparkline data={analytics.trends.growth.data} color="#8b5cf6" />
            </div>
          </div>

          {/* Card 2: Active Families */}
          <div 
            onClick={() => { setActiveTab('directory'); setFilters(f => ({ ...f, status: 'Active' })); }}
            className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col justify-between min-h-[140px] cursor-pointer group hover:-translate-y-1 transition-all duration-300 hover:border-emerald-200"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100/50 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                <CheckCircle2 size={18} />
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                98.1% Active
              </span>
            </div>
            
            <div className="mt-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 leading-none">Active Families</span>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight mt-1.5 leading-none">{analytics.stats.activeFamilies}</h3>
            </div>
            <div className="w-full h-7 mt-2 opacity-65">
              <Sparkline data={[95, 96, 96, 97, 98, 98.1]} color="#10b981" />
            </div>
          </div>

          {/* Card 3: Pending Verifications */}
          <div 
            onClick={() => { setActiveTab('directory'); setFilters(f => ({ ...f, verificationStatus: 'Pending' })); }}
            className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col justify-between min-h-[140px] cursor-pointer group hover:-translate-y-1 transition-all duration-300 hover:border-amber-200"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100/50 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform relative">
                <ShieldAlert size={18} />
                {analytics.stats.pendingVerifications > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                )}
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                Requires Audit
              </span>
            </div>
            
            <div className="mt-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 leading-none">Pending Approvals</span>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight mt-1.5 leading-none">{analytics.stats.pendingVerifications}</h3>
            </div>
            <div className="w-full h-7 mt-2 opacity-65">
              <Sparkline data={[5, 7, 4, 8, 3, analytics.stats.pendingVerifications]} color="#f59e0b" />
            </div>
          </div>

          {/* Card 4: Duplicate Records */}
          <div 
            onClick={() => setActiveTab('duplicates')}
            className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col justify-between min-h-[140px] cursor-pointer group hover:-translate-y-1 transition-all duration-300 hover:border-rose-200"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100/50 flex items-center justify-center text-rose-600 group-hover:scale-105 transition-transform">
                <GitMerge size={18} />
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
                Scan Action
              </span>
            </div>
            
            <div className="mt-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 leading-none">Suggested Duplicates</span>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight mt-1.5 leading-none">{analytics.stats.duplicateCount}</h3>
            </div>
            <div className="w-full h-7 mt-2 opacity-65">
              <Sparkline data={[6, 4, 5, 2, 3, analytics.stats.duplicateCount]} color="#f43f5e" />
            </div>
          </div>

        </div>
      )}

      {/* ─── TAB 1: DIRECTORY ─── */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          
          {/* Sticky Advanced Filters */}
          <div className="bg-white/80 backdrop-blur-md p-4 border border-gray-200 rounded-3xl shadow-sm sticky top-0 z-30 flex flex-col gap-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="Search by ID, Surname, Head, Member name, Phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-xs outline-none focus:bg-white focus:border-purple-600 transition-all font-semibold"
                />
                <Search size={14} className="absolute left-3.5 top-3 text-gray-400" />
              </div>

              {/* Reset filter button */}
              <button 
                onClick={handleResetFilters}
                className="w-full md:w-auto px-4 py-2 border border-gray-200 text-gray-600 hover:text-purple-600 hover:border-purple-200 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-purple-50 active:scale-95 transition-all shrink-0"
              >
                <Sliders size={14} /> Clear Filters
              </button>
            </div>

            {/* Grid Selectors */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider px-1">Community</label>
                <select
                  value={filters.community}
                  onChange={(e) => setFilters(f => ({ ...f, community: e.target.value }))}
                  className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-purple-600"
                >
                  {communitiesList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider px-1">City</label>
                <select
                  value={filters.city}
                  onChange={(e) => setFilters(f => ({ ...f, city: e.target.value }))}
                  className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-purple-600"
                >
                  {citiesList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider px-1">Record Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                  className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-purple-600"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider px-1">Verification</label>
                <select
                  value={filters.verificationStatus}
                  onChange={(e) => setFilters(f => ({ ...f, verificationStatus: e.target.value }))}
                  className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-purple-600"
                >
                  <option value="All">All Verification</option>
                  <option value="Verified">Verified</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider px-1">Family Size</label>
                <select
                  value={filters.size}
                  onChange={(e) => setFilters(f => ({ ...f, size: e.target.value, minMembers: e.target.value === 'single' ? 1 : e.target.value === 'small' ? 2 : e.target.value === 'large' ? 4 : 0 }))}
                  className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-purple-600"
                >
                  <option value="All">All Sizes</option>
                  <option value="single">Single Member</option>
                  <option value="small">2-3 Members</option>
                  <option value="large">4+ Members</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider px-1">Sort By</label>
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters(f => ({ ...f, sort: e.target.value }))}
                  className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-purple-600 text-purple-600 font-bold"
                >
                  <option value="newest">Newest Added</option>
                  <option value="oldest">Oldest Added</option>
                  <option value="largest">Largest Family</option>
                  <option value="updated">Recently Updated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Families Table Registry */}
          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-400">
                    <th className="px-6 py-4">Family ID</th>
                    <th className="px-6 py-4">Family Name</th>
                    <th className="px-6 py-4">Community</th>
                    <th className="px-6 py-4">City</th>
                    <th className="px-6 py-4">Head of Family</th>
                    <th className="px-6 py-4 text-center">Members</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Verification</th>
                    <th className="px-6 py-4">Created Date</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {families.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Users size={32} className="opacity-30" />
                          <span className="font-bold">No families found matching filter query</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    families.map((fam) => (
                      <tr 
                        key={fam.id} 
                        onClick={() => { setDrawerFamily(fam); setDrawerTab('personal'); }}
                        className="hover:bg-purple-50/20 active:bg-purple-50/40 cursor-pointer transition-all group"
                      >
                        <td className="px-6 py-4 font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {fam.id}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">
                          {fam.name}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-600">
                          {fam.community}
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1"><MapPin size={12} className="text-gray-400" /> {fam.city}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-800">{fam.headName}</span>
                            <span className="text-[10px] text-gray-400">{fam.headPhone}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-gray-800">
                          {fam.members.length}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            fam.status === 'Active' ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' :
                            fam.status === 'Suspended' ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20' :
                            'bg-blue-500/10 text-blue-700 border border-blue-500/20'
                          }`}>
                            {fam.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            fam.verificationStatus === 'Verified' ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' :
                            fam.verificationStatus === 'Pending' ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20' :
                            'bg-rose-500/10 text-rose-700 border border-rose-500/20'
                          }`}>
                            {fam.verificationStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 font-medium">
                          {new Date(fam.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => { setDrawerFamily(fam); setDrawerTab('personal'); }}
                              className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>
                            <button 
                              onClick={() => { setSelectedFamily(fam); setActiveModal('transfer'); setTransferTargetCommunity(''); setTransferPrecheck(null); }}
                              className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              title="Transfer Community"
                            >
                              <Share2 size={14} />
                            </button>
                            <button 
                              onClick={() => { setSelectedFamily(fam); setSelectedFamilyB(null); setActiveModal('merge'); }}
                              className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                              title="Merge Record"
                            >
                              <GitMerge size={14} />
                            </button>
                            <button 
                              onClick={() => { setSelectedFamily(fam); setSplitSelectedMembers([]); setSplitNewFamilyName(''); setSplitNewHeadName(''); setActiveModal('split'); }}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Split Family"
                            >
                              <Split size={14} />
                            </button>
                            <button 
                              onClick={() => triggerStatusConfirm(fam.status === 'Active' ? 'suspend' : 'restore', fam.id)}
                              className={`p-1.5 rounded-lg transition-all ${
                                fam.status === 'Active' 
                                  ? 'text-gray-500 hover:text-amber-600 hover:bg-amber-50' 
                                  : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={fam.status === 'Active' ? 'Suspend Family' : 'Reactivate Family'}
                            >
                              <ShieldAlert size={14} />
                            </button>
                            <button 
                              onClick={() => triggerStatusConfirm('delete', fam.id)}
                              className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              title="Delete Record"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: DUPLICATES & MERGE ─── */}
      {activeTab === 'duplicates' && (
        <div className="space-y-4">
          <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-3xl flex items-start gap-3">
            <Info className="text-purple-600 shrink-0 mt-0.5" size={18} />
            <div className="text-xs text-purple-950 font-medium">
              <span className="font-black text-purple-900">Duplicate Record Scanner:</span> Our algorithms scan surnames, phone numbers, matching cities, addresses, and member roster overlaps to suggest merge candidates. Merge them to consolidate memberships and donation registries.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {duplicates.length === 0 ? (
              <div className="col-span-2 bg-white border border-gray-200 rounded-3xl p-12 text-center text-gray-400">
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 size={36} className="text-emerald-500 animate-bounce" />
                  <span className="font-bold text-gray-700">Perfect Registry Alignment!</span>
                  <span className="text-xs">No duplicate records detected. All member trees are unique.</span>
                </div>
              </div>
            ) : (
              duplicates.map((dup) => (
                <div 
                  key={dup.id} 
                  className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-4 hover:border-purple-300 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full border border-rose-100">
                        {dup.confidence}% Match Confidence
                      </span>
                      <span className="text-[10px] font-bold text-gray-400">{dup.id}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 divide-x divide-gray-100 pt-2">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Candidate A</p>
                        <p className="text-sm font-black text-gray-900">{dup.familyA.name}</p>
                        <p className="text-xs text-gray-500 font-semibold">{dup.familyA.id}</p>
                        <p className="text-[11px] text-gray-700 font-medium">{dup.familyA.headName} • {dup.familyA.city}</p>
                        <p className="text-[10px] text-gray-400 truncate">{dup.familyA.address}</p>
                      </div>
                      <div className="pl-4 space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase">Candidate B</p>
                        <p className="text-sm font-black text-gray-900">{dup.familyB.name}</p>
                        <p className="text-xs text-gray-500 font-semibold">{dup.familyB.id}</p>
                        <p className="text-[11px] text-gray-700 font-medium">{dup.familyB.headName} • {dup.familyB.city}</p>
                        <p className="text-[10px] text-gray-400 truncate">{dup.familyB.address}</p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Deduction Reasons</p>
                      <ul className="space-y-1">
                        {dup.reasons.map((r, i) => (
                          <li key={i} className="text-[11px] font-medium text-gray-600 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => { setSelectedFamily(dup.familyA); setSelectedFamilyB(dup.familyB); setActiveModal('merge'); }}
                      className="flex-1 py-2.5 bg-purple-600 text-white text-xs font-bold rounded-2xl hover:bg-purple-700 flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <GitMerge size={14} /> Merge Records
                    </button>
                    <button 
                      onClick={() => {
                        // Simulates ignoring duplicate suggestion
                        setDuplicates(prev => prev.filter(d => d.id !== dup.id));
                        showToast('Duplicate suggestion ignored');
                      }}
                      className="px-4 py-2.5 border border-gray-200 text-gray-500 text-xs font-bold rounded-2xl hover:bg-gray-50 transition-all"
                    >
                      Ignore
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 3: ANALYTICS CENTRE ─── */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart 1: Growth */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-black text-gray-900">Family Growth Timeline</h3>
                <p className="text-[10px] text-gray-400">Total registered family entities over last 6 months</p>
              </div>
              <div className="h-[200px]">
                <AreaChart 
                  data={analytics.trends.growth.data} 
                  labels={analytics.trends.growth.labels} 
                  color="#8B5CF6"
                />
              </div>
            </div>

            {/* Chart 2: Verification Share */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black text-gray-900">Verification Compliance</h3>
                <p className="text-[10px] text-gray-400">Ration of verified vs pending audits</p>
              </div>
              <div className="flex flex-col items-center gap-4 w-full flex-1 justify-center py-4">
                <DonutChart 
                  data={analytics.trends.verification.data.map(v => ({ value: v }))} 
                  colors={['#10B981', '#F59E0B', '#EF4444', '#3B82F6']} 
                  size={120} 
                />
                <div className="grid grid-cols-2 gap-2 text-[10px] font-black w-full text-center">
                  <span className="flex items-center gap-1 justify-center"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> {analytics.trends.verification.data[0]} Verified</span>
                  <span className="flex items-center gap-1 justify-center"><span className="w-2.5 h-2.5 rounded bg-amber-500" /> {analytics.trends.verification.data[1]} Pending</span>
                  <span className="flex items-center gap-1 justify-center"><span className="w-2.5 h-2.5 rounded bg-rose-500" /> {analytics.trends.verification.data[2]} Suspended</span>
                  <span className="flex items-center gap-1 justify-center"><span className="w-2.5 h-2.5 rounded bg-blue-500" /> {analytics.trends.verification.data[3]} Archived</span>
                </div>
              </div>
            </div>

            {/* Chart 3: Community distribution */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4 lg:col-span-2">
              <div>
                <h3 className="text-sm font-black text-gray-900">Families Across Communities</h3>
                <p className="text-[10px] text-gray-400">Roster weight in each community</p>
              </div>
              <div className="h-[200px] flex items-center justify-center">
                <BarChart 
                  data={analytics.communityWise.map(c => c.value)} 
                  labels={analytics.communityWise.map(c => c.name.split(' ')[0])} 
                  colors={['#8B5CF6']}
                />
              </div>
            </div>

            {/* Top Largest families list */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-black text-gray-900">Largest Family Roster Size</h3>
                <p className="text-[10px] text-gray-400">Top 5 families by member list</p>
              </div>
              <div className="space-y-2">
                {analytics.largestFamilies.map((f, idx) => (
                  <div 
                    key={f.id} 
                    onClick={() => { setDrawerFamily(familyService._getRawFamilies().find(a=>a.id===f.id)); setDrawerTab('members'); }}
                    className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:border-purple-300 hover:bg-purple-50/10 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center font-black text-[9px] bg-purple-100 text-purple-700">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-gray-900 leading-none">{f.name}</p>
                        <p className="text-[9px] text-gray-400 mt-1 leading-none">{f.headName} • {f.city}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">{f.membersCount} Members</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ─── TAB 4: GLOBAL AUDIT LOGS ─── */}
      {activeTab === 'audits' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gray-50/50">
              <div>
                <h3 className="text-sm font-black text-gray-900">Audit Stream</h3>
                <p className="text-[10px] text-gray-400">System changes tracked globally across family nodes</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-400">
                    <th className="px-6 py-3.5">Timestamp</th>
                    <th className="px-6 py-3.5">Family ID</th>
                    <th className="px-6 py-3.5">Family Name</th>
                    <th className="px-6 py-3.5">Action Event</th>
                    <th className="px-6 py-3.5">Performed By</th>
                    <th className="px-6 py-3.5">Operational Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                        No audit history found in local storage
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-gray-400 font-medium">
                          {new Date(log.date).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">{log.familyId}</td>
                        <td className="px-6 py-4 font-semibold text-gray-800">{log.familyName}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            log.action.includes('Created') ? 'bg-emerald-500/10 text-emerald-700' :
                            log.action.includes('Split') ? 'bg-blue-500/10 text-blue-700' :
                            log.action.includes('Merged') ? 'bg-orange-500/10 text-orange-700' :
                            log.action.includes('Transferred') ? 'bg-purple-500/10 text-purple-700' :
                            'bg-gray-500/10 text-gray-700'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-700">{log.operator}</td>
                        <td className="px-6 py-4 text-gray-500 font-medium max-w-xs truncate" title={log.details}>
                          {log.details}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── DETAIL SIDE DRAWER (FAMILY PROFILE) ─── */}
      <AnimatePresence>
        {drawerFamily && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerFamily(null)}
              className="fixed inset-0 bg-black z-[990]"
            />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-full md:w-[600px] bg-white z-[995] shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-50/50 to-indigo-50/30 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black">
                    {drawerFamily.name[0]}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900 leading-tight">{drawerFamily.name}</h3>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">
                      {drawerFamily.id} • {drawerFamily.community}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setDrawerFamily(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 bg-white shadow-sm border border-gray-100 hover:bg-gray-50 active:scale-90 transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Navigation Tabs (Nested Drawer Tabs) */}
              <div className="flex border-b border-gray-100 px-6 bg-gray-50/30 overflow-x-auto shrink-0 no-scrollbar select-none">
                {[
                  { id: 'personal', label: 'Info' },
                  { id: 'members', label: 'Members' },
                  { id: 'tree', label: 'Visual Tree' },
                  { id: 'address', label: 'Address' },
                  { id: 'occupation', label: 'Career' },
                  { id: 'docs', label: 'Documents' },
                  { id: 'donations', label: 'Donations' },
                  { id: 'audits', label: 'Audit Trail' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setDrawerTab(t.id)}
                    className={`py-3 px-1 text-[11px] font-black uppercase tracking-wider border-b-2 whitespace-nowrap mr-5 transition-all ${
                      drawerTab === t.id 
                        ? 'border-purple-600 text-purple-600' 
                        : 'border-transparent text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* 1. Tab Personal Info */}
                {drawerTab === 'personal' && (
                  <div className="space-y-6">
                    <div className="bg-purple-50/40 p-4 border border-purple-100/50 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-purple-800">Family Status Action desk</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase">{drawerFamily.status}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {drawerFamily.status !== 'Active' && (
                          <button 
                            onClick={() => triggerStatusConfirm('restore', drawerFamily.id)}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-1.5"
                          >
                            <CheckCircle2 size={13} /> Reactivate Family
                          </button>
                        )}
                        {drawerFamily.status === 'Active' && (
                          <button 
                            onClick={() => triggerStatusConfirm('suspend', drawerFamily.id)}
                            className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-all flex items-center gap-1.5"
                          >
                            <ShieldAlert size={13} /> Suspend Family
                          </button>
                        )}
                        {drawerFamily.status !== 'Archived' && (
                          <button 
                            onClick={() => triggerStatusConfirm('archive', drawerFamily.id)}
                            className="px-4 py-2 border border-purple-200 text-purple-700 rounded-xl text-xs font-bold hover:bg-purple-50 bg-white transition-all flex items-center gap-1.5"
                          >
                            <Archive size={13} /> Move to Archives
                          </button>
                        )}
                        <button 
                          onClick={() => triggerStatusConfirm('delete', drawerFamily.id)}
                          className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all flex items-center gap-1.5 border border-rose-100"
                        >
                          <Trash2 size={13} /> Soft Delete
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Metadata Registry</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3.5 rounded-2xl">
                          <span className="text-[10px] font-bold text-gray-400 block uppercase">Created Date</span>
                          <span className="text-xs font-black text-gray-700 mt-1 block">
                            {new Date(drawerFamily.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-gray-50 p-3.5 rounded-2xl">
                          <span className="text-[10px] font-bold text-gray-400 block uppercase">Last Modified</span>
                          <span className="text-xs font-black text-gray-700 mt-1 block">
                            {new Date(drawerFamily.updatedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-gray-50 p-3.5 rounded-2xl">
                          <span className="text-[10px] font-bold text-gray-400 block uppercase">Members Count</span>
                          <span className="text-xs font-black text-gray-700 mt-1 block">{drawerFamily.members.length} Members</span>
                        </div>
                        <div className="bg-gray-50 p-3.5 rounded-2xl">
                          <span className="text-[10px] font-bold text-gray-400 block uppercase">Verification Document Link</span>
                          <span className="text-xs font-black mt-1 block text-purple-600">
                            {drawerFamily.verificationStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Tab Members */}
                {drawerTab === 'members' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest"> Roster Directory</h4>
                      <button 
                        onClick={() => { setSelectedFamily(drawerFamily); setChangeHeadTargetId(''); setActiveModal('changeHead'); }}
                        className="text-purple-600 font-bold hover:underline text-xs flex items-center gap-1"
                      >
                        <User size={13} /> Change Head Of Family
                      </button>
                    </div>

                    <div className="space-y-3">
                      {drawerFamily.members.map(m => (
                        <div key={m.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <Avatar src={m.avatar} initials={m.name} size="md" className="border border-purple-200" />
                            <div>
                              <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                                {m.name}
                                {m.id === drawerFamily.headId && (
                                  <span className="bg-purple-100 text-purple-700 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">HEAD</span>
                                )}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {m.relation} • {m.age} Yrs • {m.gender}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            {m.phone && <p className="text-[10px] text-gray-600 font-bold">{m.phone}</p>}
                            <p className="text-[9px] text-gray-400 mt-0.5 font-medium">{m.occupation || 'No Career Info'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Tab Visual Tree */}
                {drawerTab === 'tree' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Interactive Kinship Network</h4>
                    <div className="border border-purple-100 rounded-3xl bg-slate-50/50 p-2 overflow-hidden shadow-inner relative h-[320px]">
                      {/* Interactive Visual Family Tree Component */}
                      <FamilyTreeCanvas 
                        members={drawerFamily.members} 
                        headId={drawerFamily.headId} 
                        familyName={drawerFamily.name}
                      />
                    </div>
                  </div>
                )}

                {/* 4. Tab Address */}
                {drawerTab === 'address' && (
                  <div className="space-y-4 bg-gray-50/50 border border-gray-200/50 p-4 rounded-3xl">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                      <MapPin size={14} className="text-purple-600" /> Demographic Placement
                    </h4>
                    <div className="space-y-3.5 text-xs">
                      <div>
                        <span className="text-[10px] font-black text-gray-400 block uppercase">Address Line</span>
                        <span className="font-bold text-gray-800 mt-1 block">{drawerFamily.address}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] font-black text-gray-400 block uppercase">City Demography</span>
                          <span className="font-bold text-gray-800 mt-1 block">{drawerFamily.city}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-gray-400 block uppercase">Samaj Community Node</span>
                          <span className="font-bold text-gray-800 mt-1 block text-purple-700">{drawerFamily.community}</span>
                        </div>
                      </div>
                      <div className="h-28 bg-purple-100/30 rounded-2xl flex items-center justify-center border border-dashed border-purple-200">
                        <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider flex items-center gap-1.5">
                          Map Grid Render Connected
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Tab Career */}
                {drawerTab === 'occupation' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Career & Occupation Roster</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {drawerFamily.members.map(m => (
                        <div key={m.id} className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex items-center gap-2.5">
                          <Briefcase size={14} className="text-purple-500 shrink-0" />
                          <div>
                            <p className="text-[11px] font-bold text-gray-900 leading-none">{m.name}</p>
                            <p className="text-[9px] text-gray-500 mt-1.5 leading-none">{m.occupation || 'N/A'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Tab Documents */}
                {drawerTab === 'docs' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Submitted Verification Certificates</h4>
                    
                    <div className="space-y-3">
                      {drawerFamily.documents && drawerFamily.documents.length > 0 ? (
                        drawerFamily.documents.map(d => (
                          <div key={d.id} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText size={20} className="text-purple-500" />
                              <div>
                                <p className="text-xs font-bold text-gray-900">{d.name}</p>
                                <p className="text-[9px] text-gray-400 mt-0.5">{d.type}</p>
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              d.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' :
                              'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                            }`}>
                              {d.status}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 italic">No verification certificates uploaded for this family.</p>
                      )}
                    </div>

                    {drawerFamily.verificationStatus === 'Pending' && (
                      <div className="flex gap-2.5 pt-4 border-t border-gray-100">
                        <button 
                          onClick={() => triggerStatusConfirm('verify', drawerFamily.id)}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-colors"
                        >
                          Approve Verification
                        </button>
                        <button 
                          onClick={() => triggerStatusConfirm('reject', drawerFamily.id)}
                          className="flex-1 py-2.5 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-2xl text-xs font-bold transition-colors"
                        >
                          Reject Request
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 7. Tab Donations */}
                {drawerTab === 'donations' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Financial Contributions Log</h4>
                    
                    {drawerFamily.donationHistory && drawerFamily.donationHistory.length > 0 ? (
                      <div className="space-y-2">
                        {drawerFamily.donationHistory.map(don => (
                          <div key={don.id} className="p-3 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-gray-900">{don.purpose}</p>
                              <p className="text-[9px] text-gray-400 mt-0.5">{new Date(don.date).toLocaleDateString()}</p>
                            </div>
                            <span className="text-xs font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl">
                              ₹{don.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No donations registered under this family ledger.</p>
                    )}
                  </div>
                )}

                {/* 8. Tab Audits */}
                {drawerTab === 'audits' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Mutation Log History</h4>
                    
                    <div className="relative border-l border-gray-200 pl-4 space-y-6 ml-2 pt-2">
                      {drawerFamily.auditHistory && drawerFamily.auditHistory.length > 0 ? (
                        drawerFamily.auditHistory.map((audit, idx) => (
                          <div key={idx} className="relative">
                            <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-purple-600 rounded-full ring-4 ring-white" />
                            <p className="text-[10px] text-gray-400 font-bold">{new Date(audit.date).toLocaleString()}</p>
                            <h5 className="text-xs font-bold text-gray-900 mt-1">{audit.action}</h5>
                            <p className="text-[11px] text-gray-500 mt-0.5 font-medium">{audit.details}</p>
                            <p className="text-[9px] text-gray-400 mt-1 font-bold">Operator: {audit.operator}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 italic">No history logged for this family.</p>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── TOAST NOTIFICATION ─── */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-[9999] px-4 py-3 rounded-2xl text-xs font-bold text-white shadow-xl flex items-center gap-2 ${
              toast.type === 'error' ? 'bg-rose-500 shadow-rose-500/20' :
              toast.type === 'warning' ? 'bg-amber-500 shadow-amber-500/20' :
              toast.type === 'info' ? 'bg-blue-500 shadow-blue-500/20' :
              'bg-purple-600 shadow-purple-500/20'
            }`}
          >
            <CheckCircle2 size={15} />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── ACTION MODALS ─── */}
      
      {/* Modal 1: Merge Families */}
      <AnimatePresence>
        {activeModal === 'merge' && (
          <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] p-6 w-full max-w-lg shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setActiveModal(null)} 
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100"
              >
                <X size={16} />
              </button>

              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <GitMerge size={20} className="text-purple-600" />
                Merge Family Records
              </h3>

              <div className="space-y-4">
                <div className="p-3 bg-purple-50 rounded-2xl text-xs text-purple-950 font-medium">
                  Select a duplicate candidate family to merge into **{selectedFamily.name}** ({selectedFamily.id}). All members, history, and activities will be combined under the target family.
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Select Candidate Family to absorb</label>
                  <select 
                    value={selectedFamilyB ? selectedFamilyB.id : ''}
                    onChange={(e) => setSelectedFamilyB(families.find(f => f.id === e.target.value))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-purple-600"
                  >
                    <option value="">-- Choose Family --</option>
                    {families
                      .filter(f => f.id !== selectedFamily.id)
                      .map(f => (
                        <option key={f.id} value={f.id}>{f.name} ({f.id}) - Head: {f.headName}</option>
                      ))
                    }
                  </select>
                </div>

                {selectedFamilyB && (
                  <div className="border border-purple-100 rounded-2xl p-4 bg-purple-50/10 space-y-3 text-xs">
                    <p className="font-bold text-gray-800 flex items-center gap-1 text-[11px]"><Check size={14} className="text-purple-600" /> Merge Preview Configuration</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase">Survivor Record (Target)</p>
                        <p className="font-bold text-gray-900 mt-1">{selectedFamily.name}</p>
                        <p className="text-gray-500 mt-0.5">{selectedFamily.members.length} members</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase">Absorbed Record (Source)</p>
                        <p className="font-bold text-gray-900 mt-1">{selectedFamilyB.name}</p>
                        <p className="text-gray-500 mt-0.5">{selectedFamilyB.members.length} members</p>
                      </div>
                    </div>
                    
                    <div className="pt-2 text-[10px] text-gray-500 font-medium">
                      *Note: Source record ({selectedFamilyB.id}) status will be set to "Soft Deleted" with audit links referencing this merger.
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-3 bg-gray-50 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-100 border border-gray-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeMerge}
                  disabled={!selectedFamilyB}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 shadow shadow-purple-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Complete Merger
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Split Family */}
      <AnimatePresence>
        {activeModal === 'split' && (
          <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] p-6 w-full max-w-lg shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setActiveModal(null)} 
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100"
              >
                <X size={16} />
              </button>

              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <Split size={20} className="text-purple-600" />
                Split Family
              </h3>

              <div className="space-y-4">
                <div className="p-3 bg-purple-50 rounded-2xl text-xs text-purple-950 font-medium">
                  Select family members to split from **{selectedFamily.name}** and construct a new, independent family branch.
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Check members to split off</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
                    {selectedFamily.members.map(m => (
                      <label key={m.id} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer text-xs font-semibold text-gray-800">
                        <span>{m.name} ({m.relation})</span>
                        <input
                          type="checkbox"
                          checked={splitSelectedMembers.includes(m.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSplitSelectedMembers([...splitSelectedMembers, m.id]);
                            } else {
                              setSplitSelectedMembers(splitSelectedMembers.filter(id => id !== m.id));
                            }
                          }}
                          className="accent-purple-600 w-4 h-4"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {splitSelectedMembers.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">New Family Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Agrawal Family Bhopal" 
                        value={splitNewFamilyName}
                        onChange={(e) => setSplitNewFamilyName(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-purple-600"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">Select Head of Family for New Branch</label>
                      <select 
                        value={splitNewHeadName}
                        onChange={(e) => setSplitNewHeadName(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-purple-600"
                      >
                        <option value="">-- Choose Member --</option>
                        {selectedFamily.members
                          .filter(m => splitSelectedMembers.includes(m.id))
                          .map(m => <option key={m.id} value={m.name}>{m.name}</option>)
                        }
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-3 bg-gray-50 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-100 border border-gray-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeSplit}
                  disabled={splitSelectedMembers.length === 0 || !splitNewFamilyName || !splitNewHeadName}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 shadow shadow-purple-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Create Split
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 3: Community Transfer */}
      <AnimatePresence>
        {activeModal === 'transfer' && (
          <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] p-6 w-full max-w-lg shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setActiveModal(null)} 
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100"
              >
                <X size={16} />
              </button>

              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <Share2 size={20} className="text-purple-600" />
                Community Transfer Center
              </h3>

              <div className="space-y-4">
                <div className="p-3 bg-purple-50 rounded-2xl text-xs text-purple-950 font-medium">
                  Transfer family **{selectedFamily.name}** ({selectedFamily.id}) to a different community. Pre-check algorithms validate rule parameters before execution.
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Select Target Community</label>
                  <select 
                    value={transferTargetCommunity}
                    onChange={(e) => {
                      setTransferTargetCommunity(e.target.value);
                      handleTransferPrecheck(selectedFamily.id, e.target.value);
                    }}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-purple-600 text-purple-600 font-bold"
                  >
                    <option value="">-- Choose Target Community --</option>
                    {communitiesList
                      .filter(c => c !== 'All' && c.toLowerCase() !== selectedFamily.community.toLowerCase())
                      .map(c => <option key={c} value={c}>{c}</option>)
                    }
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Reason for Transfer</label>
                  <textarea 
                    rows={2}
                    placeholder="Enter notes/reason..."
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-purple-600 text-gray-800"
                  />
                </div>

                {/* Pre-check Results */}
                {transferTargetCommunity && transferPrecheck && (
                  <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50 space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase">Automated Pre-check Validations</p>
                    
                    {transferPrecheck.errors.length > 0 && (
                      <div className="space-y-1">
                        {transferPrecheck.errors.map((e, idx) => (
                          <div key={idx} className="p-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-[11px] font-bold flex items-center gap-1.5">
                            <XCircle size={14} /> {e}
                          </div>
                        ))}
                      </div>
                    )}

                    {transferPrecheck.warnings.length > 0 && (
                      <div className="space-y-1">
                        {transferPrecheck.warnings.map((w, idx) => (
                          <div key={idx} className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-[11px] font-bold flex items-center gap-1.5">
                            <ShieldAlert size={14} /> {w}
                          </div>
                        ))}
                      </div>
                    )}

                    {transferPrecheck.errors.length === 0 && transferPrecheck.warnings.length === 0 && (
                      <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-bold flex items-center gap-1.5">
                        <CheckCircle2 size={14} /> All checks passed. Family compatible with target community nodes.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-3 bg-gray-50 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-100 border border-gray-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeTransfer}
                  disabled={!transferTargetCommunity || (transferPrecheck && !transferPrecheck.isValid)}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 shadow shadow-purple-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Confirm Transfer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 4: Change Head Of Family */}
      <AnimatePresence>
        {activeModal === 'changeHead' && (
          <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl relative space-y-4"
            >
              <button 
                onClick={() => setActiveModal(null)} 
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100"
              >
                <X size={16} />
              </button>

              <h3 className="text-base font-black text-gray-900">Change Head Of Family</h3>
              <p className="text-xs text-gray-500">
                Select a member of **{selectedFamily.name}** to designate as the new Head of Family. Previous relation bindings will be updated.
              </p>

              <div className="space-y-3">
                <select 
                  value={changeHeadTargetId}
                  onChange={(e) => setChangeHeadTargetId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-purple-600"
                >
                  <option value="">-- Choose Member --</option>
                  {selectedFamily.members
                    .filter(m => m.id !== selectedFamily.headId)
                    .map(m => <option key={m.id} value={m.id}>{m.name} ({m.relation})</option>)
                  }
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-3 bg-gray-50 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-100 border border-gray-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeChangeHead}
                  disabled={!changeHeadTargetId}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 disabled:opacity-40 shadow shadow-purple-500/20"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 5: Confirm Simple Action */}
      <AnimatePresence>
        {activeModal === 'confirmAction' && (
          <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto ring-4 ring-rose-50">
                <ShieldAlert size={24} className="text-rose-500" />
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-sm font-black text-gray-900">{pendingAction.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-semibold">{pendingAction.message}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-3 bg-gray-50 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-100 border border-gray-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeStatusChange}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-200"
                >
                  Proceed
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// ─── NESTED MINI VISUAL TREE CANVAS ───
function FamilyTreeCanvas({ members, headId, familyName }) {
  // Simple inference mapping to draw SVG tree connections for family drawer view
  const nodes = useMemo(() => {
    const headNode = members.find(m => m.id === headId);
    if (!headNode) return [];

    const tree = [];
    
    // Level 0: Head of Family & Spouse
    tree.push({
      ...headNode,
      x: 180,
      y: 80,
      level: 0,
      isHead: true
    });

    const spouse = members.find(m => ['Wife', 'Husband', 'Spouse'].includes(m.relation));
    if (spouse) {
      tree.push({
        ...spouse,
        x: 320,
        y: 80,
        level: 0,
        isSpouse: true
      });
    }

    // Level 1: Children
    const children = members.filter(m => ['Son', 'Daughter', 'Child'].includes(m.relation));
    const childWidth = 140;
    const totalChildWidth = children.length * childWidth;
    const startX = 250 - (totalChildWidth - childWidth) / 2;

    children.forEach((c, idx) => {
      tree.push({
        ...c,
        x: startX + idx * childWidth,
        y: 220,
        level: 1,
        isChild: true
      });
    });

    // Level -1: Parents of Head
    const parents = members.filter(m => ['Father', 'Mother'].includes(m.relation));
    const parentWidth = 140;
    const startParentX = 250 - (parents.length * parentWidth - parentWidth) / 2;
    parents.forEach((p, idx) => {
      tree.push({
        ...p,
        x: startParentX + idx * parentWidth,
        y: -40,
        level: -1,
        isParent: true
      });
    });

    return tree;
  }, [members, headId]);

  return (
    <div className="w-full h-full relative overflow-auto custom-scrollbar select-none bg-slate-900/5 rounded-2xl flex items-center justify-center min-w-[500px]">
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
        {/* Draw curved links */}
        {nodes.map((node, i) => {
          if (node.isChild) {
            // Draw lines from head center down to child top
            return (
              <path
                key={i}
                d={`M 250 120 C 250 170, ${node.x} 170, ${node.x} 220`}
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="2"
                className="opacity-50"
              />
            );
          }
          if (node.isSpouse) {
            // Draw horizontal connection between head & spouse
            return (
              <path
                key={i}
                d={`M 180 80 L 320 80`}
                fill="none"
                stroke="#EC4899"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                className="opacity-60"
              />
            );
          }
          if (node.isParent) {
            // Draw lines from parents down to head center
            return (
              <path
                key={i}
                d={`M ${node.x} 0 C ${node.x} 40, 250 40, 250 80`}
                fill="none"
                stroke="#6366F1"
                strokeWidth="2"
                className="opacity-40"
              />
            );
          }
          return null;
        })}
      </svg>

      {/* Nodes layer */}
      <div className="absolute inset-0 pointer-events-none">
        {nodes.map(node => (
          <div 
            key={node.id} 
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto bg-white border border-gray-100 p-2.5 rounded-2xl shadow-sm text-center flex flex-col items-center gap-1.5 w-24 hover:-translate-y-0.5 transition-transform"
            style={{ left: node.x, top: node.y + 60 }} // Offset y-axis down slightly to fit canvas
          >
            <Avatar initials={node.name} src={node.avatar} size="sm" className="w-8 h-8 rounded-full border border-purple-100 shadow-sm" />
            <div className="w-full">
              <p className="text-[10px] font-black text-gray-800 truncate leading-none">{node.name}</p>
              <p className="text-[8px] font-bold text-gray-400 mt-1 uppercase tracking-wider leading-none">
                {node.isHead ? 'HEAD' : node.relation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
