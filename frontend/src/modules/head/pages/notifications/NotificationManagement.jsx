import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Search, Filter, Calendar, Clock, Download, Printer, Plus, 
  Trash2, CheckCircle, XCircle, AlertTriangle, Eye, Copy, Sparkles, 
  TrendingUp, ChevronLeft, ChevronRight, X, ChevronDown, Award, 
  Users, Info, FileText, Check, Edit, HelpCircle, Bell, ArrowUpDown, CornerDownRight
} from 'lucide-react';
import { useData } from '../../../member/context/DataProvider';

export default function NotificationManagement() {
  const {
    currentUser,
    sentNotifications = [],
    notificationTemplates = [],
    sendCommunityNotification,
    cancelScheduledNotification,
    retryFailedNotification,
    deleteNotificationLog,
    addNotificationTemplate,
    updateNotificationTemplate,
    deleteNotificationTemplate,
    togglePinNotificationLog,
    members = []
  } = useData();

  // Toast Notification State
  const [toast, setToast] = useState(null);
  const triggerToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 1. ACCESS BOUNDARY: Enforce Current Head's Community Only
  const activeCommunityId = currentUser?.communityId || 'c1';
  const myNotificationLogs = useMemo(() => {
    return sentNotifications.filter(log => log.communityId === activeCommunityId);
  }, [sentNotifications, activeCommunityId]);

  // Unified Workspace Tabs
  const [activeTab, setActiveTab] = useState('board'); // board | history | templates | analytics

  // Advanced Search & Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all'); // all | today | week | month
  
  // Sort State
  const [sortBy, setSortBy] = useState('newest'); // newest | oldest | reach | openRate
  const [sortOrder, setSortOrder] = useState('desc');

  // Multi-row Selection
  const [selectedRows, setSelectedRows] = useState([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Drawer / Composer Wizard Modal State
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Composer Form Temp State
  const [composerForm, setComposerForm] = useState({
    type: 'Announcement',
    audience: 'Entire Community',
    title: '',
    subtitle: '',
    message: '',
    channels: ['Push', 'In-App'],
    attachments: [],
    ctaButtonText: '',
    ctaButtonUrl: '',
    scheduledTime: '',
    expiryDate: ''
  });

  // Template Viewer & Intersect Tool
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateVariables, setTemplateVariables] = useState({});
  const [interpolatedPreview, setInterpolatedPreview] = useState('');

  // Auto suggestions for search query
  const suggestions = useMemo(() => {
    if (!searchQuery) return [];
    return myNotificationLogs
      .filter(log => log.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5)
      .map(log => log.title);
  }, [searchQuery, myNotificationLogs]);

  // Dynamic Dashboard Stats Calculations
  const stats = useMemo(() => {
    const total = myNotificationLogs.length;
    const scheduled = myNotificationLogs.filter(n => n.status === 'Queued').length;
    const delivered = myNotificationLogs.filter(n => n.status === 'Delivered').length;
    const failed = myNotificationLogs.filter(n => n.status === 'Failed').length;
    const pending = myNotificationLogs.filter(n => n.status === 'Sending').length;

    // Derived analytics metrics
    const totalSentCount = myNotificationLogs.reduce((acc, curr) => acc + (curr.stats?.sentCount || 0), 0);
    const totalOpenCount = myNotificationLogs.reduce((acc, curr) => acc + (curr.stats?.openCount || 0), 0);
    const avgOpenRate = totalSentCount > 0 ? ((totalOpenCount / totalSentCount) * 100).toFixed(1) : '0';
    const weeklyEngagement = '+22.8%';

    return { total, scheduled, delivered, failed, pending, avgOpenRate, totalSentCount, weeklyEngagement };
  }, [myNotificationLogs]);

  // Apply filters
  const filteredLogs = useMemo(() => {
    let result = [...myNotificationLogs];

    // Search Query (title, message, createdBy)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        (n.subtitle && n.subtitle.toLowerCase().includes(q)) ||
        n.createdBy.toLowerCase().includes(q)
      );
    }

    // Dropdowns
    if (typeFilter !== 'all') {
      result = result.filter(n => n.type === typeFilter);
    }
    if (channelFilter !== 'all') {
      result = result.filter(n => n.channels.includes(channelFilter));
    }
    if (statusFilter !== 'all') {
      result = result.filter(n => n.status === statusFilter);
    }

    // Date filters
    if (dateRangeFilter !== 'all') {
      const now = new Date();
      result = result.filter(n => {
        const cTime = new Date(n.createdTime);
        const diffMs = now - cTime;
        if (dateRangeFilter === 'today') return diffMs <= 24 * 60 * 60 * 1000;
        if (dateRangeFilter === 'week') return diffMs <= 7 * 24 * 60 * 60 * 1000;
        if (dateRangeFilter === 'month') return diffMs <= 30 * 24 * 60 * 60 * 1000;
        return true;
      });
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'newest') {
        comparison = new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime();
      } else if (sortBy === 'oldest') {
        comparison = new Date(a.createdTime).getTime() - new Date(b.createdTime).getTime();
      } else if (sortBy === 'reach') {
        comparison = (b.stats?.sentCount || 0) - (a.stats?.sentCount || 0);
      } else if (sortBy === 'openRate') {
        const rateA = a.stats?.sentCount > 0 ? (a.stats.openCount / a.stats.sentCount) : 0;
        const rateB = b.stats?.sentCount > 0 ? (b.stats.openCount / b.stats.sentCount) : 0;
        comparison = rateB - rateA;
      }
      return sortOrder === 'desc' ? comparison : -comparison;
    });

    return result;
  }, [myNotificationLogs, searchQuery, typeFilter, channelFilter, statusFilter, dateRangeFilter, sortBy, sortOrder]);

  // Paginated History Logs
  const paginatedLogs = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  // Sorting triggers
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Multiple selection helpers
  const toggleSelectRow = (id) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const pageIds = paginatedLogs.map(n => n.id);
    const allOnPageSelected = pageIds.every(id => selectedRows.includes(id));
    if (allOnPageSelected) {
      setSelectedRows(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedRows(prev => [...new Set([...prev, ...pageIds])]);
    }
  };

  // Bulk Operations
  const handleBulkRetry = () => {
    selectedRows.forEach(id => retryFailedNotification(id));
    triggerToast(`Retrying delivery for ${selectedRows.length} notifications.`);
    setSelectedRows([]);
  };

  const handleBulkCancel = () => {
    selectedRows.forEach(id => cancelScheduledNotification(id));
    triggerToast(`Cancelled queue for ${selectedRows.length} notifications.`);
    setSelectedRows([]);
  };

  const handleBulkDelete = () => {
    selectedRows.forEach(id => deleteNotificationLog(id));
    triggerToast(`Trashed ${selectedRows.length} notification logs.`);
    setSelectedRows([]);
  };

  const handleBulkExport = () => {
    const listToExport = myNotificationLogs.filter(n => selectedRows.includes(n.id));
    exportCSV(listToExport);
    setSelectedRows([]);
  };

  // Wizard Step navigation
  const nextStep = () => {
    if (wizardStep === 3 && !composerForm.title.trim()) {
      triggerToast('Message Title is required', 'error');
      return;
    }
    setWizardStep(prev => Math.min(5, prev + 1));
  };

  const prevStep = () => {
    setWizardStep(prev => Math.max(1, prev - 1));
  };

  // Submit composed notification
  const handleSendNotification = (e) => {
    e.preventDefault();
    const payload = {
      type: composerForm.type,
      audience: composerForm.audience,
      title: composerForm.title,
      subtitle: composerForm.subtitle,
      message: composerForm.message,
      channels: composerForm.channels,
      attachments: composerForm.attachments,
      ctaButton: composerForm.ctaButtonText ? { text: composerForm.ctaButtonText, url: composerForm.ctaButtonUrl } : null,
      scheduledTime: composerForm.scheduledTime || null,
      expiryDate: composerForm.expiryDate || null
    };

    sendCommunityNotification(payload);
    triggerToast(composerForm.scheduledTime ? 'Broadcast successfully scheduled!' : 'Notification broadcasted successfully!');
    setIsComposerOpen(false);
    resetComposer();
  };

  const resetComposer = () => {
    setWizardStep(1);
    setComposerForm({
      type: 'Announcement',
      audience: 'Entire Community',
      title: '',
      subtitle: '',
      message: '',
      channels: ['Push', 'In-App'],
      attachments: [],
      ctaButtonText: '',
      ctaButtonUrl: '',
      scheduledTime: '',
      expiryDate: ''
    });
  };

  // Template Interpolation
  const handleOpenTemplateModal = (tpl) => {
    setSelectedTemplate(tpl);
    const initialVars = {};
    tpl.variables.forEach(v => {
      initialVars[v] = v === 'communityName' ? (currentUser?.community || 'Agrawal Samaj') : '';
    });
    setTemplateVariables(initialVars);
    updateTemplatePreview(tpl, initialVars);
  };

  const handleVarChange = (name, value) => {
    const updatedVars = { ...templateVariables, [name]: value };
    setTemplateVariables(updatedVars);
    updateTemplatePreview(selectedTemplate, updatedVars);
  };

  const updateTemplatePreview = (tpl, variablesMap) => {
    let preview = tpl.bodyTemplate;
    Object.entries(variablesMap).forEach(([k, v]) => {
      preview = preview.replace(new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, 'g'), v || `[${k}]`);
    });
    setInterpolatedPreview(preview);
  };

  const handleUseTemplate = () => {
    let parsedTitle = selectedTemplate.titleTemplate;
    Object.entries(templateVariables).forEach(([k, v]) => {
      parsedTitle = parsedTitle.replace(new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, 'g'), v || `[${k}]`);
    });

    setComposerForm({
      type: selectedTemplate.type.includes('Announcement') ? 'Announcement' : 'General',
      audience: 'Entire Community',
      title: parsedTitle,
      subtitle: '',
      message: interpolatedPreview,
      channels: ['Push', 'Email', 'In-App'],
      attachments: [],
      ctaButtonText: '',
      ctaButtonUrl: '',
      scheduledTime: '',
      expiryDate: ''
    });

    setSelectedTemplate(null);
    setIsComposerOpen(true);
    setWizardStep(3); // skip selection and go directly to compose step with pre-filled content
  };

  // CSV Exporter
  const exportCSV = (dataList = myNotificationLogs) => {
    const headers = ['Notification ID', 'Type', 'Audience', 'Title', 'Channels', 'Status', 'Reach', 'Open Rate', 'Sent Time'];
    const rows = dataList.map(n => {
      const openRate = n.stats?.sentCount > 0 ? ((n.stats.openCount / n.stats.sentCount) * 100).toFixed(1) + '%' : '0%';
      return [
        n.id,
        n.type,
        n.audience,
        `"${n.title.replace(/"/g, '""')}"`,
        `"${n.channels.join(', ')}"`,
        n.status,
        n.stats?.sentCount || 0,
        openRate,
        new Date(n.createdTime).toLocaleString()
      ];
    });
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Notifications_Log_${activeCommunityId}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Notifications logs exported.');
  };

  return (
    <div className="space-y-6 pb-16 text-white relative">
      
      {/* Toast Overlay */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl flex items-center gap-2.5 font-bold text-xs ${
              toast.type === 'error' 
                ? 'bg-rose-500/25 border-rose-500/40 text-rose-200' 
                : 'bg-emerald-500/25 border-emerald-500/40 text-emerald-200'
            }`}
          >
            {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle size={16} />}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── PAGE HEADER ─── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent flex items-center gap-2.5">
            <Send className="text-purple-400 rotate-45" /> Notifications & Communication
          </h1>
          <p className="text-[10px] md:text-xs text-text-muted mt-1 uppercase font-bold tracking-widest">
            Announcement Board • Composer Wizard • Template Engine • History Tracker
          </p>
        </div>
        
        {/* Quick actions panel */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setIsComposerOpen(true)}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-wider shadow-lg shadow-purple-500/20"
          >
            <Plus size={14} /> Send Broadcast
          </button>
          <button 
            onClick={() => exportCSV()}
            className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all flex items-center gap-2 uppercase"
          >
            <Download size={13} /> Export Logs
          </button>
        </div>
      </header>

      {/* ─── SUMMARY DASHBOARD CARDS ─── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            title: 'Total Broadcasts', 
            val: stats.total, 
            sub: `${stats.totalSentCount} total target reaches`, 
            icon: Send, 
            color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-300',
            points: [12, 18, 10, 24, 20, 32, 28]
          },
          { 
            title: 'Scheduled Queue', 
            val: stats.scheduled, 
            sub: 'Future alerts registered', 
            icon: Clock, 
            color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300',
            points: [2, 4, 3, 5, 2, 8, 6]
          },
          { 
            title: 'Delivered Success', 
            val: stats.delivered, 
            sub: `Avg Open Rate: ${stats.avgOpenRate}%`, 
            icon: CheckCircle, 
            color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300',
            points: [10, 14, 8, 20, 18, 30, 26]
          },
          { 
            title: 'Failed Deliveries', 
            val: stats.failed, 
            sub: 'Requires retry operations', 
            icon: AlertTriangle, 
            color: 'from-rose-500/20 to-red-500/20 border-rose-500/30 text-rose-300',
            points: [1, 2, 0, 3, 1, 0, 1]
          }
        ].map((w, idx) => (
          <div 
            key={idx}
            className={`card-neo bg-gradient-to-br ${w.color} p-4 flex flex-col justify-between h-[125px] transition-all hover:scale-[1.02] duration-300`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{w.title}</p>
                <h3 className="text-2xl font-black mt-1 flex items-baseline gap-1.5">
                  {w.val}
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5"><TrendingUp size={10} /> {stats.weeklyEngagement}</span>
                </h3>
              </div>
              <w.icon size={18} className="opacity-80" />
            </div>

            {/* Sparkline */}
            <div className="flex items-end justify-between mt-3">
              <span className="text-[9px] text-text-muted font-bold uppercase">{w.sub}</span>
              <svg className="w-16 h-6 stroke-current opacity-70" viewBox="0 0 100 30" fill="none">
                <path 
                  d={`M 0 ${30 - w.points[0]} L 16.6 ${30 - w.points[1]} L 33.3 ${30 - w.points[2]} L 50 ${30 - w.points[3]} L 66.6 ${30 - w.points[4]} L 83.3 ${30 - w.points[5]} L 100 ${30 - w.points[6]}`} 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            </div>
          </div>
        ))}
      </section>

      {/* ─── WORKSPACE TABS SELECTOR ─── */}
      <section className="flex border-b border-white/10 bg-[#120739]/50 rounded-xl p-1 self-start max-w-md">
        {[
          { id: 'board', label: 'Announcement Board' },
          { id: 'history', label: 'Delivery History' },
          { id: 'templates', label: 'Template Engine' }
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2 px-3 text-center rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
              activeTab === t.id ? 'bg-purple-500 text-white shadow-lg' : 'text-purple-300 hover:bg-white/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </section>

      {/* ─── TAB CONTENT WORKSPACES ─── */}
      <section className="min-h-[400px]">

        {/* 1. ANNOUNCEMENT BOARD TAB */}
        {activeTab === 'board' && (
          <div className="space-y-6">
            
            {/* Pinned Section */}
            <div className="space-y-3">
              <span className="text-[10px] text-purple-300 font-black uppercase tracking-widest block">Pinned Announcements</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myNotificationLogs.filter(n => n.isPinned).length === 0 ? (
                  <div className="p-6 card-neo bg-white/2 border border-white/5 text-center text-text-muted font-bold text-[11px] col-span-2">
                    No pinned circulars. Pin important notices to keep them at the top.
                  </div>
                ) : (
                  myNotificationLogs.filter(n => n.isPinned).map(ann => (
                    <div 
                      key={ann.id}
                      className="card-neo p-4 border border-purple-500/30 bg-purple-950/15 relative overflow-hidden flex flex-col justify-between h-[180px]"
                    >
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-purple-500 text-[8px] font-black uppercase tracking-wider text-white">Pinned</div>
                      
                      <div>
                        <span className="text-[9px] text-text-muted font-bold uppercase">{ann.audience} • {new Date(ann.createdTime).toLocaleDateString()}</span>
                        <h4 className="text-xs font-black text-white mt-1 text-purple-200 truncate">{ann.title}</h4>
                        {ann.subtitle && <p className="text-[9px] text-purple-300 italic font-bold truncate mt-0.5">{ann.subtitle}</p>}
                        <p className="text-[10px] text-text-muted leading-relaxed mt-2.5 line-clamp-3">{ann.message}</p>
                      </div>

                      <div className="border-t border-white/5 pt-2 flex items-center justify-between mt-3 text-[10px]">
                        <span className="text-text-muted font-bold">Channels: <span className="text-white">{ann.channels.join(', ')}</span></span>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => togglePinNotificationLog(ann.id)}
                            className="px-2 py-1 rounded bg-[#20134f] hover:bg-[#2e1c70] text-purple-250 font-bold transition-all text-[9px] uppercase border border-white/5"
                          >
                            Unpin
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pinned & Pinned Logs Separator */}
            <div className="space-y-3">
              <span className="text-[10px] text-purple-300 font-black uppercase tracking-widest block">Latest Updates & Notices</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {myNotificationLogs.filter(n => !n.isPinned).length === 0 ? (
                  <div className="p-12 card-neo bg-white/2 text-center text-text-muted font-bold text-[11px] col-span-3">
                    No general announcements broadcasted yet. Click "Send Broadcast" to compose a message.
                  </div>
                ) : (
                  myNotificationLogs.filter(n => !n.isPinned).slice(0, 6).map(ann => (
                    <div 
                      key={ann.id}
                      className="card-neo p-4 border border-white/5 hover:border-purple-500/25 bg-[#120739]/40 hover:bg-[#20134f] transition-all flex flex-col justify-between h-[180px]"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] text-text-muted font-bold uppercase">{ann.audience}</span>
                          <span className="text-[8px] text-text-muted font-bold">{new Date(ann.createdTime).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white mt-1 truncate">{ann.title}</h4>
                        <p className="text-[10px] text-text-muted mt-2 line-clamp-3 leading-relaxed">{ann.message}</p>
                      </div>

                      <div className="border-t border-white/5 pt-2 flex items-center justify-between mt-3 text-[10px]">
                        <span className="text-text-muted font-bold">Reach: <span className="text-white">{ann.stats?.sentCount || 0}</span></span>
                        <div className="flex items-center gap-1 font-bold">
                          <button 
                            onClick={() => togglePinNotificationLog(ann.id)}
                            className="px-2 py-1 rounded bg-white/5 hover:bg-purple-500/20 text-purple-300 border border-white/5 text-[9px]"
                            title="Pin notice to board"
                          >
                            Pin
                          </button>
                          <button 
                            onClick={() => {
                              setComposerForm({
                                type: ann.type,
                                audience: ann.audience,
                                title: `Duplicate: ${ann.title}`,
                                subtitle: ann.subtitle || '',
                                message: ann.message,
                                channels: ann.channels,
                                attachments: [],
                                ctaButtonText: ann.ctaButton?.text || '',
                                ctaButtonUrl: ann.ctaButton?.url || '',
                                scheduledTime: '',
                                expiryDate: ''
                              });
                              setIsComposerOpen(true);
                              setWizardStep(3);
                            }}
                            className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white border border-white/5 text-[9px]"
                            title="Duplicate announcement"
                          >
                            Duplicate
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* 2. DELIVERY HISTORY WORKSPACE TAB */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            
            {/* Toolbar Filters */}
            <div className="card-neo p-4 bg-white/2 space-y-4">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                    <Search size={14} />
                  </span>
                  <input 
                    type="text" 
                    placeholder="Search logs by Title, message, ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#120739]/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-text-muted focus:outline-none"
                  />
                  {/* Suggestions panel */}
                  {suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-[#1a0f4c] border border-white/10 rounded-xl overflow-hidden z-20 shadow-2xl font-bold">
                      {suggestions.map((s, i) => (
                        <div 
                          key={i}
                          onClick={() => setSearchQuery(s)}
                          className="px-3.5 py-2 hover:bg-white/5 text-[10px] text-purple-200 cursor-pointer"
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date range filter */}
                <div className="flex items-center gap-1.5 p-1 bg-[#120739]/60 rounded-xl border border-white/5 self-start shrink-0 text-[10px] font-black uppercase tracking-wider">
                  {[
                    { id: 'all', label: 'All Time' },
                    { id: 'today', label: 'Today' },
                    { id: 'week', label: 'Weekly' },
                    { id: 'month', label: 'Monthly' }
                  ].map(d => (
                    <button 
                      key={d.id}
                      onClick={() => setDateRangeFilter(d.id)}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        dateRangeFilter === d.id ? 'bg-purple-500 text-white' : 'text-purple-300 hover:bg-white/5'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

              </div>

              {/* Advanced Dropdowns */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                
                {/* Type */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Type</label>
                  <div className="relative">
                    <select 
                      value={typeFilter} 
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full bg-[#120739]/50 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold focus:outline-none appearance-none cursor-pointer text-purple-200"
                    >
                      <option value="all">All Types</option>
                      <option value="Announcement">Announcement</option>
                      <option value="Event Update">Event Update</option>
                      <option value="Matrimonial Update">Matrimonial Update</option>
                      <option value="Emergency Alert">Emergency Alert</option>
                      <option value="Festival Greeting">Festival Greeting</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-3 top-3 text-purple-300 pointer-events-none" />
                  </div>
                </div>

                {/* Channel */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Channel</label>
                  <div className="relative">
                    <select 
                      value={channelFilter} 
                      onChange={(e) => setChannelFilter(e.target.value)}
                      className="w-full bg-[#120739]/50 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold focus:outline-none appearance-none cursor-pointer text-purple-200"
                    >
                      <option value="all">All Channels</option>
                      <option value="Push">Push Notification</option>
                      <option value="SMS">SMS</option>
                      <option value="Email">Email</option>
                      <option value="In-App">In-App</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-3 top-3 text-purple-300 pointer-events-none" />
                  </div>
                </div>

                {/* Delivery Status */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Delivery Status</label>
                  <div className="relative">
                    <select 
                      value={statusFilter} 
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full bg-[#120739]/50 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold focus:outline-none appearance-none cursor-pointer text-purple-200"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Queued">Queued</option>
                      <option value="Sending">Sending</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Failed">Failed</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-3 top-3 text-purple-300 pointer-events-none" />
                  </div>
                </div>

                {/* Sorting */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Sort</label>
                  <div className="relative">
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-[#120739]/50 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold focus:outline-none appearance-none cursor-pointer text-purple-200"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="reach">Reach Size</option>
                      <option value="openRate">Highest Open Rate</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-3 top-3 text-purple-300 pointer-events-none" />
                  </div>
                </div>

              </div>

            </div>

            {/* Data Grid table */}
            <div className="card-neo overflow-hidden flex flex-col justify-between bg-white/2">
              
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-white/3 border-b border-white/5 text-[9px] uppercase font-black text-purple-200 tracking-wider sticky top-0">
                    <tr>
                      <th className="p-4 w-12 text-center">
                        <input 
                          type="checkbox" 
                          checked={paginatedLogs.length > 0 && paginatedLogs.every(e => selectedRows.includes(e.id))}
                          onChange={toggleSelectAll}
                          className="rounded accent-purple-500 cursor-pointer"
                        />
                      </th>
                      <th className="p-4 cursor-pointer" onClick={() => handleSort('title')}>
                        Notification Title <ArrowUpDown size={10} className="inline ml-1" />
                      </th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Audience</th>
                      <th className="p-4">Channels</th>
                      <th className="p-4 text-center">Reach</th>
                      <th className="p-4 text-center">Open Rate</th>
                      <th className="p-4">Sent Time</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {paginatedLogs.map(log => {
                      const openRate = log.stats?.sentCount > 0 ? ((log.stats.openCount / log.stats.sentCount) * 100).toFixed(1) + '%' : '0%';
                      return (
                        <tr 
                          key={log.id}
                          className="hover:bg-white/2 transition-colors duration-150"
                        >
                          <td className="p-4 text-center">
                            <input 
                              type="checkbox" 
                              checked={selectedRows.includes(log.id)}
                              onChange={() => toggleSelectRow(log.id)}
                              className="rounded accent-purple-500 cursor-pointer"
                            />
                          </td>
                          <td className="p-4">
                            <div>
                              <span className="font-bold text-white block truncate max-w-xs">{log.title}</span>
                              <span className="text-[9px] text-text-muted mt-0.5 block truncate max-w-xs font-normal">{log.subtitle}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold">
                              {log.type}
                            </span>
                          </td>
                          <td className="p-4">{log.audience}</td>
                          <td className="p-4 text-purple-200">{log.channels.join(', ')}</td>
                          <td className="p-4 text-center">{log.stats?.sentCount || 0}</td>
                          <td className="p-4 text-center text-emerald-400 font-bold">{openRate}</td>
                          <td className="p-4">{new Date(log.createdTime).toLocaleString()}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                              log.status === 'Delivered' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' :
                              log.status === 'Queued' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' :
                              log.status === 'Sending' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 animate-pulse' :
                              'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {log.status === 'Failed' && (
                                <button 
                                  onClick={() => {
                                    retryFailedNotification(log.id);
                                    triggerToast('Retrying failed broadcast.');
                                  }}
                                  className="px-2 py-1 rounded bg-[#20134f] hover:bg-[#2e1c70] text-purple-250 font-bold transition-all text-[9px] uppercase border border-white/5"
                                  title="Retry Delivery"
                                >
                                  Retry
                                </button>
                              )}
                              {log.status === 'Queued' && (
                                <button 
                                  onClick={() => {
                                    cancelScheduledNotification(log.id);
                                    triggerToast('Cancelled scheduled alert.');
                                  }}
                                  className="px-2 py-1 rounded bg-rose-600/30 hover:bg-rose-600 text-rose-300 font-bold transition-all text-[9px] uppercase border border-rose-600/40"
                                  title="Cancel scheduled"
                                >
                                  Cancel
                                </button>
                              )}
                              <button 
                                onClick={() => {
                                  deleteNotificationLog(log.id);
                                  triggerToast('Log item removed.');
                                }}
                                className="p-1 rounded bg-white/5 border border-white/5 text-rose-350 hover:text-white"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <footer className="flex items-center justify-between border-t border-white/5 pt-4">
                <span className="text-[10px] text-text-muted font-bold uppercase">
                  Showing Page {currentPage} of {totalPages} ({filteredLogs.length} total entries)
                </span>
                <div className="flex items-center gap-1">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                        currentPage === idx + 1 ? 'bg-purple-500 text-white' : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </footer>
            )}

          </div>
        )}

        {/* 3. NOTIFICATION TEMPLATES TAB */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-muted font-bold uppercase">Template Directory (Use to pre-fill composers)</span>
              <button 
                onClick={() => {
                  triggerToast('Define template scheme');
                }}
                className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500 border border-purple-500/35 text-purple-200 hover:text-white text-[10px] font-bold rounded-lg uppercase transition-all"
              >
                Add Template
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {notificationTemplates.map(tpl => (
                <div 
                  key={tpl.id}
                  className="card-neo p-4 border border-white/5 bg-[#120739]/40 hover:border-purple-500/20 transition-all flex flex-col justify-between h-[180px]"
                >
                  <div>
                    <span className="text-[8px] bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded text-purple-300 font-bold uppercase">{tpl.type}</span>
                    <h4 className="text-xs font-black text-white mt-2 truncate">{tpl.titleTemplate}</h4>
                    <p className="text-[10px] text-text-muted leading-relaxed mt-2.5 line-clamp-3">{tpl.bodyTemplate}</p>
                  </div>

                  <div className="border-t border-white/5 pt-2 flex items-center justify-between mt-3 text-[10px] font-bold uppercase">
                    <span className="text-text-muted text-[8px]">Vars: {tpl.variables.join(', ')}</span>
                    <button 
                      onClick={() => handleOpenTemplateModal(tpl)}
                      className="px-3 py-1 bg-[#20134f] hover:bg-[#2e1c70] border border-white/5 text-purple-250 hover:text-white rounded-lg transition-all text-[9px] uppercase"
                    >
                      Fill Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </section>

      {/* ─── STICKY BULK ACTION BAR ─── */}
      {selectedRows.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 md:left-64 md:right-8 z-40 bg-[#120739]/90 border border-purple-500/30 px-4 py-3 rounded-2xl backdrop-blur-md shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-[11px] font-black uppercase text-purple-250 tracking-wider">
              {selectedRows.length} Logs selected for bulk operations
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase">
            <button 
              onClick={handleBulkRetry}
              className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 border border-emerald-500/30 text-emerald-300 hover:text-white rounded-lg transition-all"
            >
              Retry Delivery
            </button>
            <button 
              onClick={handleBulkCancel}
              className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500 border border-yellow-500/30 text-yellow-300 hover:text-white rounded-lg transition-all"
            >
              Cancel Queue
            </button>
            <button 
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-rose-600/30 hover:bg-rose-600 border border-rose-600/40 text-rose-350 hover:text-white rounded-lg transition-all"
            >
              Delete Logs
            </button>
            <button 
              onClick={handleBulkExport}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all"
            >
              Export Selected
            </button>
            <button 
              onClick={() => setSelectedRows([])}
              className="px-3 py-1.5 text-text-muted hover:text-white transition-colors animate-pulse"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ─── TEMPLATE FILLER INTERACTION MODAL ─── */}
      <AnimatePresence>
        {selectedTemplate && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTemplate(null)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto w-full max-w-lg h-[460px] bg-[#0c0533] border border-white/10 rounded-2xl z-50 flex flex-col justify-between overflow-hidden text-xs text-white shadow-2xl"
            >
              <div className="p-4 border-b border-white/10 bg-white/2 flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-purple-250">Fill Template Variables</span>
                <button onClick={() => setSelectedTemplate(null)} className="text-text-muted hover:text-white"><X size={15} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-[#120739]/50 border border-white/5 rounded-xl p-3.5 space-y-2">
                  <span className="text-[9px] text-purple-300 font-bold uppercase tracking-wider">Interpolated Preview</span>
                  <div className="text-[11px] text-white/90 leading-relaxed italic bg-black/20 p-2.5 rounded-lg border border-white/5">
                    {interpolatedPreview}
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Dynamic Input Fields</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {selectedTemplate.variables.map(v => (
                      <div key={v} className="space-y-1">
                        <label className="text-[9px] font-bold text-purple-200 capitalize">{v.replace(/([A-Z])/g, ' $1')}</label>
                        <input 
                          type="text" 
                          value={templateVariables[v] || ''}
                          onChange={(e) => handleVarChange(v, e.target.value)}
                          placeholder={`Enter value for ${v}...`}
                          className="w-full bg-[#120739] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-550"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-white/10 bg-[#120739] flex items-center justify-end gap-2 uppercase font-bold text-[10px]">
                <button 
                  type="button" 
                  onClick={() => setSelectedTemplate(null)}
                  className="px-3.5 py-2 text-text-muted hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleUseTemplate}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors"
                >
                  Insert into Composer
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── 5-STEP NOTIFICATION COMPOSER WIZARD ─── */}
      <AnimatePresence>
        {isComposerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsComposerOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto w-full max-w-lg h-[520px] bg-[#0c0533] border border-white/10 rounded-2xl z-50 flex flex-col justify-between overflow-hidden text-xs text-white shadow-2xl"
            >
              {/* Header with step trackers */}
              <div className="p-4 border-b border-white/10 bg-white/2 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black uppercase text-purple-250">Compose Broadcast Message</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    {[1, 2, 3, 4, 5].map(stepNum => (
                      <span 
                        key={stepNum}
                        className={`w-4 h-1.5 rounded-full transition-all ${
                          wizardStep === stepNum ? 'bg-purple-500 w-8' :
                          wizardStep > stepNum ? 'bg-emerald-500' : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <button onClick={() => setIsComposerOpen(false)} className="text-text-muted hover:text-white"><X size={15} /></button>
              </div>

              {/* Form Content steps */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                
                {/* STEP 1: TYPE SELECTION */}
                {wizardStep === 1 && (
                  <div className="space-y-3">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Step 1: Broadcast Type Selection</span>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'Announcement', desc: 'Samaj general announcements, audited briefs' },
                        { id: 'Event Update', desc: 'Agenda change notifications, timing alerts' },
                        { id: 'Matrimonial Update', desc: 'Verified profile digests, matchmaking digests' },
                        { id: 'Emergency Alert', desc: 'Important warnings, meeting postpones' },
                        { id: 'Festival Greeting', desc: 'Guru Purnima, Diwali, general community wishes' },
                        { id: 'General Broadcast', desc: 'General newsletters and logs updates' }
                      ].map(t => (
                        <div 
                          key={t.id}
                          onClick={() => setComposerForm(prev => ({ ...prev, type: t.id }))}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            composerForm.type === t.id 
                              ? 'bg-purple-500/20 border-purple-500 shadow-lg' 
                              : 'bg-[#120739]/50 border-white/5 hover:border-white/20'
                          }`}
                        >
                          <span className="font-bold text-white block">{t.id}</span>
                          <span className="text-[9px] text-text-muted mt-1 block leading-normal">{t.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 2: AUDIENCE SELECTION */}
                {wizardStep === 2 && (
                  <div className="space-y-3">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Step 2: Recipient Audience Groups</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { id: 'Entire Community', desc: 'Broadcasting messages to all members of community' },
                        { id: 'Verified Members', desc: 'Delivery restricted to members with active verify status' },
                        { id: 'Pending Members', desc: 'Targeting profiles waiting verification review' },
                        { id: 'Families', desc: 'Broadcasting to primary house heads' },
                        { id: 'Professionals', desc: 'Business owners, lawyers, doctors' },
                        { id: 'Volunteers', desc: 'Targeting specific volunteers group' },
                        { id: 'Committee Members', desc: 'Executive committee list only' }
                      ].map(aud => (
                        <div 
                          key={aud.id}
                          onClick={() => setComposerForm(prev => ({ ...prev, audience: aud.id }))}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            composerForm.audience === aud.id 
                              ? 'bg-purple-500/20 border-purple-500' 
                              : 'bg-[#120739]/50 border-white/5 hover:border-white/20'
                          }`}
                        >
                          <span className="font-bold text-white block">{aud.id}</span>
                          <span className="text-[9px] text-text-muted mt-0.5 block leading-normal">{aud.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 3: COMPOSE CONTENT */}
                {wizardStep === 3 && (
                  <div className="space-y-4">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Step 3: Message Composition</span>
                    
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Message Title</label>
                      <input 
                        type="text" 
                        placeholder="Samaj audit report, urgent circular..."
                        value={composerForm.title}
                        onChange={(e) => setComposerForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full bg-[#120739]/50 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Subtitle (Optional)</label>
                        <input 
                          type="text" 
                          placeholder="Agenda discussions..."
                          value={composerForm.subtitle}
                          onChange={(e) => setComposerForm(prev => ({ ...prev, subtitle: e.target.value }))}
                          className="w-full bg-[#120739]/50 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-text-muted uppercase font-bold tracking-wider">CTA Button text</label>
                        <input 
                          type="text" 
                          placeholder="Learn More, RSVP Now..."
                          value={composerForm.ctaButtonText}
                          onChange={(e) => setComposerForm(prev => ({ ...prev, ctaButtonText: e.target.value }))}
                          className="w-full bg-[#120739]/50 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Message Body</label>
                      <textarea 
                        placeholder="Write detailed announcements content here..."
                        value={composerForm.message}
                        onChange={(e) => setComposerForm(prev => ({ ...prev, message: e.target.value }))}
                        className="w-full bg-[#120739]/50 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                        rows={4}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* STEP 4: DELIVERY CHANNELS */}
                {wizardStep === 4 && (
                  <div className="space-y-4">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Step 4: Delivery Channels Selection</span>
                    <div className="space-y-2.5">
                      {[
                        { id: 'Push', desc: 'Sends instant alerts push to member mobile notifications bar' },
                        { id: 'In-App', desc: 'Places card logs inside personal notifications tray console' },
                        { id: 'SMS', desc: 'Fires text SMS alerts. SMS charges apply' },
                        { id: 'Email', desc: 'Broadcasts detailed rich emails to member mailbox' }
                      ].map(chan => {
                        const active = composerForm.channels.includes(chan.id);
                        return (
                          <div 
                            key={chan.id}
                            onClick={() => {
                              setComposerForm(prev => {
                                const channels = prev.channels.includes(chan.id) 
                                  ? prev.channels.filter(c => c !== chan.id) 
                                  : [...prev.channels, chan.id];
                                return { ...prev, channels };
                              });
                            }}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                              active ? 'bg-purple-500/20 border-purple-500 shadow-md' : 'bg-[#120739]/50 border-white/5'
                            }`}
                          >
                            <div>
                              <span className="font-bold text-white block">{chan.id}</span>
                              <span className="text-[9px] text-text-muted mt-1 block leading-normal">{chan.desc}</span>
                            </div>
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                              active ? 'bg-purple-505 border-purple-500 text-white' : 'border-white/20'
                            }`}>
                              {active && <Check size={12} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 5: PREVIEW & SCHEDULING */}
                {wizardStep === 5 && (
                  <div className="space-y-4">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Step 5: Scheduling & Final Review</span>
                    
                    <div className="card-neo p-3 bg-white/2 border border-white/5 space-y-2.5 text-[10px] leading-relaxed">
                      <div className="flex items-center justify-between border-b border-white/5 pb-1">
                        <span className="font-black text-purple-250 uppercase">Preview Card Notice</span>
                        <span className="text-[9px] text-text-muted">{composerForm.type} for {composerForm.audience}</span>
                      </div>
                      <span className="text-white font-bold block">{composerForm.title}</span>
                      <p className="text-text-muted italic">{composerForm.message}</p>
                      {composerForm.ctaButtonText && (
                        <div className="px-3 py-1.5 bg-[#20134f] border border-white/5 text-purple-200 text-center font-bold rounded-lg mt-2 inline-block">
                          {composerForm.ctaButtonText}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3.5 mt-2">
                      <div className="space-y-1">
                        <label className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Schedule Time (Optional)</label>
                        <input 
                          type="datetime-local" 
                          value={composerForm.scheduledTime}
                          onChange={(e) => setComposerForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                          className="w-full bg-[#120739] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Expiration Date (Optional)</label>
                        <input 
                          type="date" 
                          value={composerForm.expiryDate}
                          onChange={(e) => setComposerForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                          className="w-full bg-[#120739] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Step toolbar actions */}
              <div className="p-4 border-t border-white/10 bg-[#120739] flex items-center justify-between uppercase font-bold text-[10px]">
                {wizardStep > 1 ? (
                  <button 
                    onClick={prevStep}
                    className="px-3.5 py-2 text-text-muted hover:text-white transition-colors"
                  >
                    Back
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsComposerOpen(false)}
                    className="px-3.5 py-2 text-text-muted hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                )}

                {wizardStep < 5 ? (
                  <button 
                    onClick={nextStep}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button 
                    onClick={handleSendNotification}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Send size={11} className="rotate-45" /> {composerForm.scheduledTime ? 'Schedule Broadcast' : 'Send Immediately'}
                  </button>
                )}
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
