import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Search, Filter, Grid, List, Map, CheckCircle, XCircle, 
  AlertTriangle, ArrowUpDown, ChevronLeft, ChevronRight, Eye, 
  ShieldAlert, Sparkles, TrendingUp, Download, Printer, User, 
  Award, Clock, Link as LinkIcon, Calendar, Check, X, FileText, 
  ChevronDown, RefreshCw, Trash, Star, UploadCloud, MessageSquare,
  Building, Hammer, GraduationCap, Heart, MoreHorizontal, ShieldCheck, Mail, Phone, MapPin
} from 'lucide-react';
import { useData } from '../../../member/context/DataProvider';
import { Avatar } from '../../../member/components/common/Avatar';

// Category configuration mapping matching mock data
const categoryConfig = {
  manufacturing: { icon: Building, color: 'text-orange-400 bg-orange-400/10 border-orange-400/20', label: 'Manufacturing' },
  construction: { icon: Hammer, color: 'text-sky-400 bg-sky-400/10 border-sky-400/20', label: 'Construction' },
  education: { icon: GraduationCap, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', label: 'Education' },
  health: { icon: Heart, color: 'text-rose-400 bg-rose-400/10 border-rose-400/20', label: 'Health' },
  business: { icon: Briefcase, color: 'text-violet-400 bg-violet-400/10 border-violet-400/20', label: 'Business' },
  others: { icon: MoreHorizontal, color: 'text-gray-400 bg-gray-400/10 border-gray-400/20', label: 'Others' }
};

export default function ProfessionalDirectoryManagement() {
  const { 
    currentUser, 
    professionals = [], 
    updateProfessionalStatus, 
    updateProfessionalDocumentStatus, 
    resolveProfessionalComplaint,
    updateProfessional
  } = useData();

  // Toast Notification State
  const [toast, setToast] = useState(null);
  const triggerToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 1. ACCESS BOUNDARY: Enforce Current Head's Community Only
  const activeCommunityId = currentUser?.communityId || 'c1';
  const myProfessionals = useMemo(() => {
    return professionals.filter(p => p.communityId === activeCommunityId && !p.isDeleted);
  }, [professionals, activeCommunityId]);

  // 2. ACTIVE SYSTEM VIEWS: grid, table, compact, map
  const [activeView, setActiveView] = useState('grid'); // grid | table | compact | map

  // 3. ADVANCED SEARCH & FILTERING
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all'); // all | junior (<5) | senior (5-10) | expert (>10)
  
  // Sort State
  const [sortBy, setSortBy] = useState('newest'); // newest | oldest | name | rating | updated
  const [sortOrder, setSortOrder] = useState('desc');

  // Multi-row Selection
  const [selectedRows, setSelectedRows] = useState([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Drawer / Slider State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProf, setSelectedProf] = useState(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState('business'); // business | owner | documents | gallery | activity

  // Lightbox View State
  const [lightboxImage, setLightboxImage] = useState(null);

  // Form Editor Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);

  // Document Review Temp States
  const [reviewDocId, setReviewDocId] = useState(null);
  const [reviewNote, setReviewNote] = useState('');

  // Complaint Decision Dialog
  const [reviewComplaintId, setReviewComplaintId] = useState(null);
  const [complaintNote, setComplaintNote] = useState('');

  // Presets Save
  const [savedFilters, setSavedFilters] = useState([
    { name: 'Pending Review', status: 'Submitted', verification: 'all' },
    { name: 'Featured Gold', status: 'Featured', verification: 'Gold' }
  ]);
  const [newPresetName, setNewPresetName] = useState('');

  // Auto suggestions array based on business titles
  const searchSuggestions = useMemo(() => {
    if (!searchQuery) return [];
    return myProfessionals
      .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5)
      .map(p => p.title);
  }, [searchQuery, myProfessionals]);

  // Unique lists from data
  const uniqueCities = useMemo(() => {
    return [...new Set(myProfessionals.map(p => p.city))].sort();
  }, [myProfessionals]);

  const uniqueCategories = useMemo(() => {
    return [...new Set(myProfessionals.map(p => p.category))].sort();
  }, [myProfessionals]);

  // Dynamic Dashboard Stats Calculations
  const stats = useMemo(() => {
    const total = myProfessionals.length;
    const pending = myProfessionals.filter(p => p.status === 'Submitted' || p.status === 'Under Review').length;
    const verified = myProfessionals.filter(p => p.status === 'Verified' || p.status === 'Featured').length;
    const featured = myProfessionals.filter(p => p.status === 'Featured').length;
    const reported = myProfessionals.filter(p => (p.complaints || []).some(c => c.status === 'Pending')).length;
    const inactive = myProfessionals.filter(p => p.status === 'Inactive' || p.status === 'Suspended').length;

    // Derived growth counts (simulate last month compare)
    const growthRate = '+12.4%';
    
    // Top category breakdown
    const catCounts = {};
    myProfessionals.forEach(p => {
      catCounts[p.category] = (catCounts[p.category] || 0) + 1;
    });
    const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return { total, pending, verified, featured, reported, inactive, topCat, growthRate };
  }, [myProfessionals]);

  // Filters application
  const filteredProfessionals = useMemo(() => {
    let result = [...myProfessionals];

    // Global Search (Business name, owner, phone, member ID, GST)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.ownerName.toLowerCase().includes(q) ||
        (p.phone && p.phone.includes(q)) ||
        (p.memberId && p.memberId.toLowerCase().includes(q)) ||
        (p.gstNumber && p.gstNumber.toLowerCase().includes(q)) ||
        (p.businessId && p.businessId.toLowerCase().includes(q))
      );
    }

    // Dropdowns
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category === categoryFilter);
    }
    if (cityFilter !== 'all') {
      result = result.filter(p => p.city === cityFilter);
    }
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }
    if (verificationFilter !== 'all') {
      result = result.filter(p => p.verificationBadge === verificationFilter);
    }
    if (featuredFilter !== 'all') {
      const isFeatured = featuredFilter === 'Featured';
      result = result.filter(p => (p.status === 'Featured') === isFeatured);
    }

    // Experience ranges
    if (experienceFilter !== 'all') {
      result = result.filter(p => {
        const years = parseInt(p.experience) || 0;
        if (experienceFilter === 'junior') return years < 5;
        if (experienceFilter === 'senior') return years >= 5 && years <= 10;
        if (experienceFilter === 'expert') return years > 10;
        return true;
      });
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'newest') {
        comparison = (b.id.substring(2) || 0) - (a.id.substring(2) || 0); // fallback based on ID timestamp creation
      } else if (sortBy === 'oldest') {
        comparison = (a.id.substring(2) || 0) - (b.id.substring(2) || 0);
      } else if (sortBy === 'name') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'rating') {
        comparison = (b.rating || 0) - (a.rating || 0);
      } else if (sortBy === 'updated') {
        const tA = (a.auditLogs && a.auditLogs[0]) ? new Date(a.auditLogs[0].timestamp).getTime() : 0;
        const tB = (b.auditLogs && b.auditLogs[0]) ? new Date(b.auditLogs[0].timestamp).getTime() : 0;
        comparison = tB - tA;
      }
      return sortOrder === 'desc' ? comparison : -comparison;
    });

    return result;
  }, [myProfessionals, searchQuery, categoryFilter, cityFilter, statusFilter, verificationFilter, featuredFilter, experienceFilter, sortBy, sortOrder]);

  // Paginated List
  const paginatedList = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredProfessionals.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredProfessionals, currentPage]);

  const totalPages = Math.ceil(filteredProfessionals.length / itemsPerPage);

  // Sorting columns triggers
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Multiple Row selection helpers
  const toggleSelectRow = (id) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const pageIds = paginatedList.map(p => p.id);
    const allOnPageSelected = pageIds.every(id => selectedRows.includes(id));
    if (allOnPageSelected) {
      setSelectedRows(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedRows(prev => [...new Set([...prev, ...pageIds])]);
    }
  };

  // Bulk operation actions
  const handleBulkApprove = () => {
    selectedRows.forEach(id => updateProfessionalStatus(id, 'Verified'));
    triggerToast(`Approved ${selectedRows.length} professional listings.`);
    setSelectedRows([]);
  };

  const handleBulkReject = () => {
    selectedRows.forEach(id => updateProfessionalStatus(id, 'Removed'));
    triggerToast(`Rejected/Removed ${selectedRows.length} listings.`);
    setSelectedRows([]);
  };

  const handleBulkVerify = () => {
    selectedRows.forEach(id => {
      const prof = myProfessionals.find(p => p.id === id);
      if (prof) {
        // Mark all docs verified
        (prof.documents || []).forEach(doc => {
          updateProfessionalDocumentStatus(id, doc.id, 'Verified', 'Bulk approved');
        });
        updateProfessionalStatus(id, 'Verified');
      }
    });
    triggerToast(`Bulk-verified documents and listings for ${selectedRows.length} items.`);
    setSelectedRows([]);
  };

  const handleBulkSuspend = () => {
    selectedRows.forEach(id => updateProfessionalStatus(id, 'Suspended'));
    triggerToast(`Suspended ${selectedRows.length} listings.`);
    setSelectedRows([]);
  };

  const handleBulkRestore = () => {
    selectedRows.forEach(id => updateProfessionalStatus(id, 'Verified'));
    triggerToast(`Restored ${selectedRows.length} listings.`);
    setSelectedRows([]);
  };

  const handleBulkExport = () => {
    const listToExport = myProfessionals.filter(p => selectedRows.includes(p.id));
    exportCSV(listToExport);
    setSelectedRows([]);
  };

  // Save Filter Presets
  const saveCurrentFilters = () => {
    if (!newPresetName.trim()) {
      triggerToast('Please provide a preset name', 'error');
      return;
    }
    const newPreset = {
      name: newPresetName,
      category: categoryFilter,
      city: cityFilter,
      status: statusFilter,
      verification: verificationFilter
    };
    setSavedFilters(prev => [...prev, newPreset]);
    setNewPresetName('');
    triggerToast('Filter preset saved!');
  };

  const applySavedFilter = (preset) => {
    if (preset.category) setCategoryFilter(preset.category);
    if (preset.city) setCityFilter(preset.city);
    if (preset.status) setStatusFilter(preset.status);
    if (preset.verification) setVerificationFilter(preset.verification);
    triggerToast(`Applied filter: ${preset.name}`);
  };

  // Single Item workflows
  const handleOpenDrawer = (prof) => {
    setSelectedProf(prof);
    setActiveDrawerTab('business');
    setIsDrawerOpen(true);
  };

  const handleOpenEditModal = (prof) => {
    setEditForm({ ...prof });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    updateProfessional(editForm.id, editForm);
    triggerToast('Business profile updated successfully');
    setIsEditModalOpen(false);
    if (selectedProf && selectedProf.id === editForm.id) {
      setSelectedProf(editForm);
    }
  };

  const handleStatusChangeAction = (profId, newStatus) => {
    updateProfessionalStatus(profId, newStatus);
    triggerToast(`Listing status updated to: ${newStatus}`);
    // Sync state in open drawer
    if (selectedProf && selectedProf.id === profId) {
      setSelectedProf(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handleDocumentVerificationAction = (status) => {
    if (!selectedProf || !reviewDocId) return;
    updateProfessionalDocumentStatus(selectedProf.id, reviewDocId, status, reviewNote);
    triggerToast(`Document updated to: ${status}`);
    
    // Sync UI local states
    setSelectedProf(prev => {
      const updatedDocs = prev.documents.map(d => d.id === reviewDocId ? { ...d, status, notes: reviewNote } : d);
      return { ...prev, documents: updatedDocs };
    });
    setReviewDocId(null);
    setReviewNote('');
  };

  const handleComplaintResolutionAction = (actionType) => {
    if (!selectedProf || !reviewComplaintId) return;
    
    // Action Type: 'Dismissed', 'Resolved', 'Action Taken'
    let status = 'Resolved';
    if (actionType === 'Dismissed') status = 'Resolved';
    if (actionType === 'Action Taken') status = 'Action Taken';
    
    resolveProfessionalComplaint(selectedProf.id, reviewComplaintId, status, complaintNote);
    
    // If Action taken involves suspending
    if (actionType === 'Suspend Listing') {
      updateProfessionalStatus(selectedProf.id, 'Suspended');
      triggerToast('Complaint closed and business suspended.');
    } else {
      triggerToast(`Complaint status set to: ${status}`);
    }

    // Sync UI drawer states
    setSelectedProf(prev => {
      const updatedComps = prev.complaints.map(c => c.id === reviewComplaintId ? { ...c, status, notes: complaintNote } : c);
      return { ...prev, complaints: updatedComps, status: actionType === 'Suspend Listing' ? 'Suspended' : prev.status };
    });
    setReviewComplaintId(null);
    setComplaintNote('');
  };

  // CSV Exporter
  const exportCSV = (dataList = myProfessionals) => {
    const headers = ['Business ID', 'Business Name', 'Owner Name', 'Category', 'City', 'Phone', 'Experience', 'Badge', 'Status'];
    const rows = dataList.map(p => [
      p.businessId || p.id,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.ownerName.replace(/"/g, '""')}"`,
      p.category,
      p.city,
      p.phone || '',
      p.experience || '',
      p.verificationBadge || '',
      p.status
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Professional_Directory_${activeCommunityId}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Directory exported successfully.');
  };

  return (
    <div className="space-y-6 pb-16 text-white relative">
      
      {/* Toast Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl flex items-center gap-2.5 font-bold text-xs ${
              toast.type === 'error' 
                ? 'bg-rose-500/25 border-rose-500/40 text-rose-255 animate-pulse' 
                : 'bg-emerald-500/25 border-emerald-500/40 text-emerald-255'
            }`}
          >
            {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle size={16} />}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── TITLE HEADER ─── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            <Briefcase className="text-purple-400" /> Professional Directory
          </h1>
          <p className="text-[10px] md:text-xs text-text-muted mt-1 uppercase font-bold tracking-widest">
            Approve Listings • Verify Certifications • Handle Grievances
          </p>
        </div>
        
        {/* Quick Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => exportCSV()}
            className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all flex items-center gap-2 uppercase"
          >
            <Download size={13} /> Export All
          </button>
          <button 
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all flex items-center gap-2 uppercase"
          >
            <Printer size={13} /> Print List
          </button>
          <button 
            onClick={() => triggerToast('CSV Import Template downloaded.')}
            className="px-3.5 py-2 rounded-xl bg-purple-500/20 border border-purple-500/35 text-purple-200 text-xs font-bold hover:bg-purple-500 hover:text-white transition-all flex items-center gap-2 uppercase"
          >
            <UploadCloud size={13} /> Import Template
          </button>
        </div>
      </header>

      {/* ─── STATISTICS ANALYTICS GRID ─── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            title: 'Total Listings', 
            val: stats.total, 
            sub: 'Active & Inactive', 
            icon: Briefcase, 
            color: 'from-purple-500/25 to-indigo-500/25 border-purple-500/30 text-purple-300',
            points: [10, 15, 8, 22, 18, 28, 30]
          },
          { 
            title: 'Pending Review', 
            val: stats.pending, 
            sub: 'Verification Waiting', 
            icon: ShieldAlert, 
            color: 'from-amber-500/25 to-orange-500/25 border-amber-500/30 text-amber-300',
            points: [5, 9, 12, 8, 15, 7, 4]
          },
          { 
            title: 'Featured (Local)', 
            val: stats.featured, 
            sub: 'Top Banner Placed', 
            icon: Sparkles, 
            color: 'from-pink-500/25 to-rose-500/25 border-pink-500/30 text-pink-300',
            points: [2, 4, 3, 5, 8, 10, 12]
          },
          { 
            title: 'Reported Grievances', 
            val: stats.reported, 
            sub: 'Open Complaints', 
            icon: AlertTriangle, 
            color: 'from-rose-500/25 to-red-500/25 border-rose-500/30 text-rose-300',
            points: [1, 3, 2, 4, 1, 0, 2]
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
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5"><TrendingUp size={10} /> {stats.growthRate}</span>
                </h3>
              </div>
              <w.icon size={18} className="opacity-80" />
            </div>

            {/* Sparkline mini-graph */}
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

      {/* ─── FILTERS & SEARCH MODULE ─── */}
      <section className="card-neo p-4 bg-white/2 space-y-4">
        
        {/* Row 1: Search box & layout toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="relative flex-1 max-w-lg">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
              <Search size={15} />
            </span>
            <input 
              type="text"
              placeholder="Search Business, Owner name, Phone, GST, Member ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#120739]/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-text-muted focus:outline-none focus:border-purple-500/50 transition-all font-semibold"
            />
            {/* Auto-suggestions Panel */}
            {searchSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1.5 bg-[#1a0f4c] border border-white/10 rounded-xl overflow-hidden z-20 shadow-2xl">
                {searchSuggestions.map((s, i) => (
                  <div 
                    key={i}
                    onClick={() => {
                      setSearchQuery(s);
                    }}
                    className="px-3.5 py-2 hover:bg-white/5 text-[11px] font-bold text-purple-200 cursor-pointer transition-colors"
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grid/Table/Compact toggles */}
          <div className="flex items-center gap-1.5 p-1 bg-[#120739]/60 rounded-xl border border-white/5 self-start">
            {[
              { id: 'grid', label: 'Grid', icon: Grid },
              { id: 'table', label: 'Table', icon: List },
              { id: 'compact', label: 'Compact', icon: List },
              { id: 'map', label: 'Map View', icon: Map }
            ].map(v => (
              <button 
                key={v.id}
                onClick={() => setActiveView(v.id)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
                  activeView === v.id ? 'bg-purple-500 text-white shadow-lg' : 'text-purple-300 hover:bg-white/5'
                }`}
              >
                <v.icon size={11} /> {v.label}
              </button>
            ))}
          </div>

        </div>

        {/* Row 2: Advanced Dropdowns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* Category */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Category</label>
            <div className="relative">
              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-[#120739]/50 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold focus:outline-none appearance-none cursor-pointer text-purple-200"
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-3 text-purple-300 pointer-events-none" />
            </div>
          </div>

          {/* City */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">City</label>
            <div className="relative">
              <select 
                value={cityFilter} 
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full bg-[#120739]/50 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold focus:outline-none appearance-none cursor-pointer text-purple-200"
              >
                <option value="all">All Cities</option>
                {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-3 text-purple-300 pointer-events-none" />
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Experience</label>
            <div className="relative">
              <select 
                value={experienceFilter} 
                onChange={(e) => setExperienceFilter(e.target.value)}
                className="w-full bg-[#120739]/50 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold focus:outline-none appearance-none cursor-pointer text-purple-200"
              >
                <option value="all">All Exp Levels</option>
                <option value="junior">Junior (&lt; 5 Years)</option>
                <option value="senior">Senior (5-10 Years)</option>
                <option value="expert">Expert (&gt; 10 Years)</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-3 text-purple-300 pointer-events-none" />
            </div>
          </div>

          {/* Listing Status */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Lifecycle Status</label>
            <div className="relative">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#120739]/50 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold focus:outline-none appearance-none cursor-pointer text-purple-200"
              >
                <option value="all">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Verified">Verified</option>
                <option value="Featured">Featured</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-3 text-purple-300 pointer-events-none" />
            </div>
          </div>

          {/* Verification Badge */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Verification Badge</label>
            <div className="relative">
              <select 
                value={verificationFilter} 
                onChange={(e) => setVerificationFilter(e.target.value)}
                className="w-full bg-[#120739]/50 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold focus:outline-none appearance-none cursor-pointer text-purple-200"
              >
                <option value="all">All Badges</option>
                <option value="None">None</option>
                <option value="Bronze">Bronze Badge</option>
                <option value="Silver">Silver Badge</option>
                <option value="Gold">Gold Badge</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-3 text-purple-300 pointer-events-none" />
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Sort List</label>
            <div className="relative">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-[#120739]/50 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold focus:outline-none appearance-none cursor-pointer text-purple-200"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Alphabetical</option>
                <option value="rating">Top Rated</option>
                <option value="updated">Recent Activity</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-3 text-purple-300 pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Row 3: Preset saving & active chips */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-3">
          
          {/* Preset Filter Creator */}
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Preset Name..."
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              className="bg-[#120739]/40 border border-white/10 rounded-lg px-2.5 py-1 text-[10px] focus:outline-none text-white font-bold"
            />
            <button 
              onClick={saveCurrentFilters}
              className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500 text-purple-200 hover:text-white rounded-lg text-[9px] font-black uppercase border border-purple-500/30 transition-all"
            >
              Save Preset
            </button>
          </div>

          {/* Render Filter Presets */}
          {savedFilters.length > 0 && (
            <div className="flex items-center gap-2 text-[10px] text-text-muted font-bold">
              <span>Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {savedFilters.map((p, idx) => (
                  <button 
                    key={idx}
                    onClick={() => applySavedFilter(p)}
                    className="px-2.5 py-1 rounded-lg bg-[#20134f] hover:bg-[#2e1c70] text-purple-250 border border-white/5 transition-all"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Active Filter Chips */}
        {(categoryFilter !== 'all' || cityFilter !== 'all' || statusFilter !== 'all' || verificationFilter !== 'all' || experienceFilter !== 'all' || searchQuery) && (
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-purple-200">
            <span>Active Filters:</span>
            {categoryFilter !== 'all' && (
              <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-550 text-purple-300 flex items-center gap-1">
                Category: {categoryFilter}
                <X size={10} className="cursor-pointer" onClick={() => setCategoryFilter('all')} />
              </span>
            )}
            {cityFilter !== 'all' && (
              <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-550 text-purple-300 flex items-center gap-1">
                City: {cityFilter}
                <X size={10} className="cursor-pointer" onClick={() => setCityFilter('all')} />
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-550 text-purple-300 flex items-center gap-1">
                Status: {statusFilter}
                <X size={10} className="cursor-pointer" onClick={() => setStatusFilter('all')} />
              </span>
            )}
            {verificationFilter !== 'all' && (
              <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-550 text-purple-300 flex items-center gap-1">
                Badge: {verificationFilter}
                <X size={10} className="cursor-pointer" onClick={() => setVerificationFilter('all')} />
              </span>
            )}
            {experienceFilter !== 'all' && (
              <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-550 text-purple-300 flex items-center gap-1">
                Exp: {experienceFilter}
                <X size={10} className="cursor-pointer" onClick={() => setExperienceFilter('all')} />
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-550 text-purple-300 flex items-center gap-1">
                Search: "{searchQuery}"
                <X size={10} className="cursor-pointer" onClick={() => setSearchQuery('')} />
              </span>
            )}
            <button 
              onClick={() => {
                setCategoryFilter('all');
                setCityFilter('all');
                setStatusFilter('all');
                setVerificationFilter('all');
                setExperienceFilter('all');
                setSearchQuery('');
              }}
              className="text-amber-400 hover:text-white transition-colors"
            >
              Clear All
            </button>
          </div>
        )}

      </section>

      {/* ─── DIRECTORY WORKSPACE VIEW ─── */}
      <section className="min-h-[400px]">
        {filteredProfessionals.length === 0 ? (
          <div className="card-neo py-16 flex flex-col items-center justify-center text-center space-y-4">
            <Briefcase size={40} className="text-purple-400 opacity-60 animate-pulse" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Professionals Found</h3>
              <p className="text-xs text-text-muted mt-1 max-w-sm">No business listings match your search criteria. Try modifying your filter criteria or query text.</p>
            </div>
            <button 
              onClick={() => {
                setCategoryFilter('all');
                setCityFilter('all');
                setStatusFilter('all');
                setVerificationFilter('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-[#20134f] hover:bg-[#2e1c70] border border-white/10 rounded-xl text-xs font-bold transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : activeView === 'grid' ? (
          /* ─── GRID VIEW ─── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {paginatedList.map(p => {
              const config = categoryConfig[p.categoryKey || 'others'] || categoryConfig.others;
              const CatIcon = config.icon;
              return (
                <div 
                  key={p.id} 
                  className="card-neo bg-gradient-to-b from-white/5 to-[#120739]/40 border border-white/10 p-4 hover:border-purple-500/40 transition-all flex flex-col justify-between group relative overflow-hidden h-[240px]"
                >
                  {/* Rating or featured badge overlay */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                    {p.status === 'Featured' && (
                      <span className="px-2 py-0.5 rounded bg-pink-500/20 border border-pink-500 text-pink-300 text-[8px] font-black uppercase tracking-wider shadow-lg">Featured</span>
                    )}
                    {p.verificationBadge !== 'None' && (
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5 ${
                        p.verificationBadge === 'Gold' ? 'bg-amber-500/20 border border-amber-500 text-amber-300' :
                        p.verificationBadge === 'Silver' ? 'bg-slate-400/20 border border-slate-400 text-slate-200' :
                        'bg-orange-600/20 border border-orange-600 text-orange-300'
                      }`}>
                        <Award size={8} /> {p.verificationBadge}
                      </span>
                    )}
                  </div>

                  <div>
                    {/* Header: Avatar, Name & Category */}
                    <div className="flex items-center gap-3">
                      <Avatar 
                        name={p.title} 
                        src={p.logo} 
                        initials={p.initials} 
                        size="md" 
                        className={`font-black uppercase shadow-inner ${p.color}`} 
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate pr-16">{p.title}</h4>
                        <span className={`inline-flex items-center gap-1 mt-1 text-[8px] font-bold px-2 py-0.5 rounded-lg border ${config.color}`}>
                          <CatIcon size={8} /> {p.category}
                        </span>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="mt-4 space-y-1.5 text-[10px] text-text-muted font-bold">
                      <div className="flex items-center gap-1.5 truncate">
                        <User size={10} className="text-purple-400" />
                        <span>Owner: {p.ownerName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin size={10} className="text-purple-400" />
                        <span>City: {p.city} | Exp: {p.experience}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Phone size={10} className="text-purple-400" />
                        <span>Phone: {p.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status row */}
                  <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between">
                    {/* Status Badge */}
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                      p.status === 'Verified' || p.status === 'Featured' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      p.status === 'Submitted' || p.status === 'Under Review' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {p.status}
                    </span>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleOpenDrawer(p)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-purple-500/25 border border-white/5 text-purple-300 hover:text-white transition-all"
                        title="View Details"
                      >
                        <Eye size={12} />
                      </button>
                      <button 
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-500/25 border border-white/5 text-amber-300 hover:text-white transition-all"
                        title="Edit Details"
                      >
                        <FileText size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : activeView === 'compact' ? (
          /* ─── COMPACT VIEW ─── */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {paginatedList.map(p => (
              <div 
                key={p.id}
                onClick={() => handleOpenDrawer(p)}
                className="card-neo p-3 bg-[#120739]/40 hover:bg-[#20134f] border border-white/5 hover:border-purple-500/20 cursor-pointer flex items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={p.title} src={p.logo} initials={p.initials} size="sm" className={p.color} />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{p.title}</h4>
                    <p className="text-[10px] text-text-muted mt-0.5">Owner: {p.ownerName} | City: {p.city} | Exp: {p.experience}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                    p.status === 'Verified' || p.status === 'Featured' ? 'bg-emerald-500/10 text-emerald-400' :
                    p.status === 'Submitted' || p.status === 'Under Review' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-rose-500/10 text-rose-400'
                  }`}>
                    {p.status}
                  </span>
                  <Eye size={12} className="text-purple-300" />
                </div>
              </div>
            ))}
          </div>
        ) : activeView === 'map' ? (
          /* ─── MAP VIEW (FUTURE READY) ─── */
          <div className="card-neo p-12 bg-white/2 border border-white/10 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-300 animate-pulse">
              <Map size={30} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Map Visualization Workspace</h3>
              <p className="text-xs text-text-muted mt-1 max-w-sm">This space is configured for Google Maps API integration. Once client keys are mapped in settings, geographic coordinate plotting will render automatically.</p>
            </div>
            <button 
              onClick={() => setActiveView('grid')}
              className="px-4 py-2 bg-[#20134f] hover:bg-[#2e1c70] border border-white/10 rounded-xl text-xs font-bold transition-all uppercase"
            >
              Back to Grid View
            </button>
          </div>
        ) : (
          /* ─── TABLE VIEW ─── */
          <div className="card-neo overflow-hidden flex flex-col justify-between bg-white/2">
            
            {/* Table wrapper */}
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-white/3 border-b border-white/5 text-[9px] uppercase font-black text-purple-200 tracking-wider sticky top-0">
                  <tr>
                    <th className="p-4 w-12 text-center">
                      <input 
                        type="checkbox" 
                        checked={paginatedList.length > 0 && paginatedList.every(e => selectedRows.includes(e.id))}
                        onChange={toggleSelectAll}
                        className="rounded accent-purple-500 cursor-pointer"
                      />
                    </th>
                    <th className="p-4 cursor-pointer" onClick={() => handleSort('name')}>
                      Business Name <ArrowUpDown size={10} className="inline ml-1" />
                    </th>
                    <th className="p-4">Owner</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">City</th>
                    <th className="p-4">Experience</th>
                    <th className="p-4 text-center">Rating</th>
                    <th className="p-4">Badge</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedList.map(p => (
                    <tr 
                      key={p.id}
                      className="hover:bg-white/2 transition-colors duration-150 font-medium"
                    >
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={selectedRows.includes(p.id)}
                          onChange={() => toggleSelectRow(p.id)}
                          className="rounded accent-purple-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={p.title} src={p.logo} initials={p.initials} size="sm" className={p.color} />
                          <div>
                            <span className="font-bold text-white block">{p.title}</span>
                            <span className="text-[9px] text-text-muted uppercase font-bold tracking-wider">{p.businessId || p.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{p.ownerName}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-4">{p.city}</td>
                      <td className="p-4">{p.experience}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1 font-bold text-amber-400">
                          <Star size={10} fill="currentColor" /> {p.rating}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          p.verificationBadge === 'Gold' ? 'bg-amber-500/25 text-amber-300 border border-amber-500/30' :
                          p.verificationBadge === 'Silver' ? 'bg-slate-400/25 text-slate-300 border border-slate-400/30' :
                          p.verificationBadge === 'Bronze' ? 'bg-orange-600/25 text-orange-300 border border-orange-600/30' :
                          'bg-white/5 text-text-muted border border-white/5'
                        }`}>
                          {p.verificationBadge}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          p.status === 'Verified' || p.status === 'Featured' ? 'bg-emerald-500/15 text-emerald-400' :
                          p.status === 'Submitted' || p.status === 'Under Review' ? 'bg-amber-500/15 text-amber-400' :
                          'bg-rose-500/15 text-rose-400'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleOpenDrawer(p)}
                            className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-purple-300 hover:text-white hover:bg-purple-500/25 transition-all"
                          >
                            <Eye size={12} />
                          </button>
                          <button 
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-amber-300 hover:text-white hover:bg-amber-500/25 transition-all"
                          >
                            <FileText size={12} />
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
      </section>

      {/* ─── INTERACTIVE PAGINATION BOTTOM FOOTER ─── */}
      {totalPages > 1 && (
        <footer className="flex items-center justify-between border-t border-white/5 pt-4">
          <span className="text-[10px] text-text-muted font-bold uppercase">
            Showing Page {currentPage} of {totalPages} ({filteredProfessionals.length} total entries)
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

      {/* ─── STICKY BULK ACTION BAR ─── */}
      {selectedRows.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 md:left-64 md:right-8 z-40 bg-[#120739]/90 border border-purple-500/30 px-4 py-3 rounded-2xl backdrop-blur-md shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-[11px] font-black uppercase text-purple-250 tracking-wider">
              {selectedRows.length} Rows Selected for Bulk Updates
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase">
            <button 
              onClick={handleBulkVerify}
              className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 border border-emerald-500/30 text-emerald-300 hover:text-white rounded-lg transition-all"
            >
              Verify All
            </button>
            <button 
              onClick={handleBulkApprove}
              className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500 border border-purple-500/30 text-purple-200 hover:text-white rounded-lg transition-all"
            >
              Approve Listing
            </button>
            <button 
              onClick={handleBulkReject}
              className="px-3 py-1.5 bg-rose-600/30 hover:bg-rose-600 border border-rose-600/40 text-rose-350 hover:text-white rounded-lg transition-all"
            >
              Reject / Trash
            </button>
            <button 
              onClick={handleBulkSuspend}
              className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500 border border-yellow-500/30 text-yellow-300 hover:text-white rounded-lg transition-all"
            >
              Suspend
            </button>
            <button 
              onClick={handleBulkRestore}
              className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500 border border-blue-500/30 text-blue-300 hover:text-white rounded-lg transition-all"
            >
              Restore
            </button>
            <button 
              onClick={handleBulkExport}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-all"
            >
              Export selected
            </button>
            <button 
              onClick={() => setSelectedRows([])}
              className="px-3 py-1.5 text-text-muted hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ─── PROFILE TABBED DRAWER PANEL ─── */}
      <AnimatePresence>
        {isDrawerOpen && selectedProf && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            {/* Drawer container */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-2xl bg-[#090325] border-l border-white/10 z-50 flex flex-col justify-between shadow-2xl overflow-hidden text-xs text-white"
            >
              
              {/* Header profile info */}
              <div className="p-5 border-b border-white/10 bg-white/2 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={selectedProf.title} src={selectedProf.logo} initials={selectedProf.initials} size="md" className={selectedProf.color} />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{selectedProf.title}</h3>
                    <p className="text-[10px] text-purple-300 font-bold uppercase mt-0.5 tracking-wider">Owner: {selectedProf.ownerName} | ID: {selectedProf.businessId || selectedProf.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-full bg-white/5 border border-white/5 text-text-muted hover:text-white transition-all"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Tabs list selectors */}
              <div className="bg-[#120739] border-b border-white/5 px-4 flex overflow-x-auto no-scrollbar font-bold">
                {[
                  { id: 'business', label: 'Business' },
                  { id: 'owner', label: 'Owner Details' },
                  { id: 'documents', label: 'Documents' },
                  { id: 'gallery', label: 'Gallery' },
                  { id: 'activity', label: 'Timeline & Activity' }
                ].map(t => (
                  <button 
                    key={t.id}
                    onClick={() => setActiveDrawerTab(t.id)}
                    className={`py-3.5 px-4 border-b-2 text-[10px] uppercase tracking-wider shrink-0 transition-all ${
                      activeDrawerTab === t.id 
                        ? 'border-purple-500 text-purple-350 bg-white/2 font-black' 
                        : 'border-transparent text-text-muted hover:text-purple-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab Scroll Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                
                {/* ─── TAB 1: BUSINESS DETAILS ─── */}
                {activeDrawerTab === 'business' && (
                  <div className="space-y-4">
                    {/* Banner Card */}
                    <div className="h-32 rounded-xl bg-purple-955/40 border border-white/10 relative overflow-hidden flex items-center justify-center text-purple-300">
                      <Briefcase size={36} className="opacity-40 animate-pulse" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                        <span className="px-2 py-0.5 rounded bg-purple-500/25 border border-purple-500 text-purple-200 font-bold text-[9px] uppercase tracking-wider">{selectedProf.category} | {selectedProf.subcategory}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="card-neo p-3 bg-white/2 space-y-3">
                        <h4 className="font-bold text-white uppercase text-[10px] tracking-wider border-b border-white/5 pb-1">Core Info</h4>
                        <div className="space-y-2">
                          <p className="text-text-muted">Business Hours: <span className="text-white block font-bold mt-0.5">{selectedProf.businessHours}</span></p>
                          <p className="text-text-muted">Experience: <span className="text-white block font-bold mt-0.5">{selectedProf.experience}</span></p>
                          <p className="text-text-muted">GST Number: <span className="text-white block font-mono font-bold mt-0.5">{selectedProf.gstNumber || 'N/A'}</span></p>
                        </div>
                      </div>

                      <div className="card-neo p-3 bg-white/2 space-y-3">
                        <h4 className="font-bold text-white uppercase text-[10px] tracking-wider border-b border-white/5 pb-1">Digital Reach</h4>
                        <div className="space-y-2">
                          <p className="text-text-muted">Website: <a href={`https://${selectedProf.website}`} target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-white font-bold block mt-0.5 flex items-center gap-1"><LinkIcon size={10} /> {selectedProf.website}</a></p>
                          <p className="text-text-muted">Social Media: 
                            <span className="flex items-center gap-2 mt-1">
                              <a href="#" className="px-2 py-1 rounded bg-[#20134f] hover:bg-[#2e1c70] text-purple-250 font-bold transition-all text-[9px]">Facebook</a>
                              <a href="#" className="px-2 py-1 rounded bg-[#20134f] hover:bg-[#2e1c70] text-purple-250 font-bold transition-all text-[9px]">LinkedIn</a>
                            </span>
                          </p>
                        </div>
                      </div>

                    </div>

                    {/* Description */}
                    <div className="card-neo p-4 bg-white/2">
                      <h4 className="font-bold text-white uppercase text-[10px] tracking-wider border-b border-white/5 pb-2">Business Description</h4>
                      <p className="text-text-muted leading-relaxed mt-2 text-[11px]">{selectedProf.description}</p>
                    </div>

                  </div>
                )}

                {/* ─── TAB 2: OWNER DETAILS ─── */}
                {activeDrawerTab === 'owner' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 card-neo bg-white/2">
                      <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold">
                        <User size={30} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{selectedProf.ownerName}</h4>
                        <p className="text-[10px] text-text-muted mt-0.5">Member ID: {selectedProf.memberId}</p>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold mt-1.5 uppercase">
                          <ShieldCheck size={10} /> Verified Member
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="card-neo p-3 bg-white/2 space-y-2">
                        <h5 className="font-bold text-white uppercase text-[10px] tracking-wider border-b border-white/5 pb-1">Contact Details</h5>
                        <p className="text-text-muted">Primary Phone: <span className="text-white block font-bold mt-0.5">{selectedProf.phone || 'N/A'}</span></p>
                        <p className="text-text-muted">Primary Email: <span className="text-white block font-bold mt-0.5">owner@email.com</span></p>
                        <p className="text-text-muted">Emergency Line: <span className="text-white block font-bold mt-0.5">{selectedProf.emergencyContact || 'N/A'}</span></p>
                      </div>

                      <div className="card-neo p-3 bg-white/2 space-y-2">
                        <h5 className="font-bold text-white uppercase text-[10px] tracking-wider border-b border-white/5 pb-1">Full Address</h5>
                        <p className="text-text-muted">Address: <span className="text-white block font-bold mt-0.5">{selectedProf.address}</span></p>
                        <p className="text-text-muted">Landmark: <span className="text-white block font-bold mt-0.5">{selectedProf.landmark}</span></p>
                        <p className="text-text-muted">City / State: <span className="text-white block font-bold mt-0.5">{selectedProf.city}, {selectedProf.state} ({selectedProf.pinCode})</span></p>
                      </div>

                    </div>
                  </div>
                )}

                {/* ─── TAB 3: DOCUMENTS VERIFICATION DESK ─── */}
                {activeDrawerTab === 'documents' && (
                  <div className="space-y-4">
                    
                    {/* Document Verification Drawer Inner Form */}
                    {reviewDocId && (
                      <div className="card-neo p-4 border border-amber-500/30 bg-amber-500/5 space-y-3">
                        <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                          <span className="text-[10px] font-black uppercase text-amber-300">Verify Document : {selectedProf.documents.find(d => d.id === reviewDocId)?.type}</span>
                          <button onClick={() => setReviewDocId(null)} className="text-text-muted hover:text-white"><X size={13} /></button>
                        </div>
                        <div className="space-y-2.5">
                          <label className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Review Audit Note</label>
                          <textarea 
                            placeholder="Add reason for approval, rejection, or re-upload request..."
                            value={reviewNote}
                            onChange={(e) => setReviewNote(e.target.value)}
                            className="w-full bg-[#120739] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                            rows={3}
                          />
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleDocumentVerificationAction('Verified')}
                              className="px-3.5 py-1.5 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 transition-colors uppercase text-[10px]"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleDocumentVerificationAction('Rejected')}
                              className="px-3.5 py-1.5 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-colors uppercase text-[10px]"
                            >
                              Reject
                            </button>
                            <button 
                              onClick={() => handleDocumentVerificationAction('Correction Requested')}
                              className="px-3.5 py-1.5 bg-yellow-600 text-white rounded-lg font-bold hover:bg-yellow-700 transition-colors uppercase text-[10px]"
                            >
                              Request Re-upload
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2.5">
                      {(selectedProf.documents || []).map(doc => (
                        <div key={doc.id} className="card-neo p-3.5 bg-white/2 border border-white/5 flex items-center justify-between gap-4 hover:border-white/10 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-300">
                              <FileText size={16} />
                            </div>
                            <div>
                              <span className="font-bold text-white block">{doc.type}</span>
                              <span className="text-[9px] text-text-muted mt-0.5 block truncate max-w-xs">{doc.fileName}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                              doc.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400' :
                              doc.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400' :
                              'bg-amber-500/10 text-amber-400'
                            }`}>
                              {doc.status}
                            </span>
                            
                            <div className="flex items-center gap-1.5">
                              <button 
                                onClick={() => setReviewDocId(doc.id)}
                                className="px-2.5 py-1 rounded bg-[#20134f] hover:bg-[#2e1c70] text-purple-250 border border-white/5 font-bold transition-all text-[9px] uppercase"
                              >
                                Review
                              </button>
                              <a 
                                href="#"
                                onClick={(e) => { e.preventDefault(); triggerToast('Downloaded document preview.'); }}
                                className="p-1 rounded bg-white/5 border border-white/5 text-purple-300 hover:text-white"
                                title="Download Document"
                              >
                                <Download size={11} />
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── TAB 4: BUSINESS MEDIA GALLERY ─── */}
                {activeDrawerTab === 'gallery' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-text-muted font-bold uppercase">Image Portfolio (Click to preview)</span>
                      <button 
                        onClick={() => triggerToast('Select files to upload into portfolio')}
                        className="px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-500/35 text-purple-200 text-[10px] hover:bg-purple-500 hover:text-white transition-all uppercase font-bold"
                      >
                        Add Media
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                      {(selectedProf.gallery || []).map(img => (
                        <div key={img.id} className="relative group rounded-xl border border-white/5 overflow-hidden h-28 cursor-pointer" onClick={() => setLightboxImage(img.fileUrl)}>
                          <img src={img.fileUrl} alt={img.caption} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2.5 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[8px] bg-purple-500 px-1.5 py-0.5 rounded text-white self-start uppercase font-bold">Photo</span>
                            <p className="text-[9px] text-white font-bold truncate">{img.caption}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── TAB 5: TIMELINE & COMPLAINTS ACTIVITY ─── */}
                {activeDrawerTab === 'activity' && (
                  <div className="space-y-6">
                    
                    {/* Reported Complaints Section */}
                    <div className="space-y-3.5">
                      <h4 className="font-bold text-white uppercase text-[10px] tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5 text-rose-355 text-rose-300">
                        <AlertTriangle size={12} /> Reported Disputes & Complaints
                      </h4>

                      {reviewComplaintId && (
                        <div className="card-neo p-4 border border-rose-500/30 bg-rose-500/5 space-y-3">
                          <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                            <span className="text-[10px] font-black uppercase text-rose-300">Resolve Complaint</span>
                            <button onClick={() => setReviewComplaintId(null)} className="text-text-muted hover:text-white"><X size={13} /></button>
                          </div>
                          <div className="space-y-2.5">
                            <label className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Resolution Audit Notes</label>
                            <textarea 
                              placeholder="Add warnings details or action logs..."
                              value={complaintNote}
                              onChange={(e) => setComplaintNote(e.target.value)}
                              className="w-full bg-[#120739] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                              rows={3}
                            />
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleComplaintResolutionAction('Dismissed')}
                                className="px-3 py-1.5 bg-[#20134f] hover:bg-[#2e1c70] text-purple-250 border border-white/5 rounded-lg transition-all text-[9px] font-bold uppercase"
                              >
                                Dismiss Complaint
                              </button>
                              <button 
                                onClick={() => handleComplaintResolutionAction('Resolved')}
                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg transition-all text-[9px] font-bold uppercase"
                              >
                                Warn Owner & Close
                              </button>
                              <button 
                                onClick={() => handleComplaintResolutionAction('Suspend Listing')}
                                className="px-3 py-1.5 bg-rose-600 text-white rounded-lg transition-all text-[9px] font-bold uppercase"
                              >
                                Suspend Business
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {(selectedProf.complaints || []).length === 0 ? (
                        <p className="text-[10px] text-text-muted font-bold">No active grievances registered against this business.</p>
                      ) : (
                        <div className="space-y-2">
                          {(selectedProf.complaints || []).map(comp => (
                            <div key={comp.id} className="p-3 card-neo bg-white/2 border border-rose-550/10 hover:border-rose-550/25 transition-all">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white block text-[10px]">{comp.type}</span>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                  comp.status === 'Pending' ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'
                                }`}>
                                  {comp.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-text-muted mt-1 leading-relaxed">Reported by: <span className="text-white font-bold">{comp.reportedBy}</span> | Priority: <span className="text-rose-300 font-bold">{comp.priority}</span></p>
                              <p className="text-[10px] text-text-muted mt-1 leading-relaxed">Evidence: <span className="text-white block italic font-medium mt-0.5">"{comp.evidence}"</span></p>
                              {comp.status === 'Pending' && (
                                <button 
                                  onClick={() => setReviewComplaintId(comp.id)}
                                  className="mt-3 px-3 py-1 bg-rose-500/25 hover:bg-rose-500 text-rose-300 hover:text-white rounded-lg text-[9px] font-bold border border-rose-500/35 transition-all uppercase"
                                >
                                  Take Action
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Timeline Audit Logs */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-white uppercase text-[10px] tracking-wider border-b border-white/5 pb-2">Verification & Action Logs</h4>
                      <div className="relative border-l border-white/10 pl-4 ml-2 space-y-4 py-2">
                        {(selectedProf.auditLogs || []).map(log => (
                          <div key={log.id} className="relative">
                            <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-purple-500" />
                            <span className="text-[8px] text-text-muted font-bold uppercase">{new Date(log.timestamp).toLocaleString()}</span>
                            <span className="font-bold text-white block text-[10px] mt-0.5">{log.action}</span>
                            <p className="text-[9px] text-purple-300 font-medium mt-0.5 leading-relaxed">
                              {log.oldValue ? `Change: ${log.oldValue} → ${log.newValue}` : log.newValue}
                            </p>
                            <span className="text-[9px] text-text-muted font-bold mt-1 block uppercase">Logged By: {log.performedBy}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

              </div>

              {/* Action Toolbar bottom */}
              <div className="p-4 border-t border-white/10 bg-[#120739] flex items-center justify-between">
                
                {/* Suspended alert banner */}
                {selectedProf.status === 'Suspended' ? (
                  <div className="flex items-center gap-2 text-rose-450 font-bold uppercase text-[9px]">
                    <ShieldAlert size={12} /> Account Suspended
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[9px] font-bold text-text-muted">
                    <span>Badge:</span>
                    {['Bronze', 'Silver', 'Gold'].map(b => (
                      <button 
                        key={b}
                        onClick={() => {
                          updateProfessional(selectedProf.id, { verificationBadge: b });
                          setSelectedProf(prev => ({ ...prev, verificationBadge: b }));
                          triggerToast(`Verification badge set to ${b}`);
                        }}
                        className={`px-2 py-0.5 rounded border text-[8px] transition-all ${
                          selectedProf.verificationBadge === b 
                            ? 'bg-purple-500/25 border-purple-500 text-purple-200' 
                            : 'bg-white/2 border-white/5 hover:bg-white/10 text-white'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 text-[10px] font-bold uppercase">
                  {selectedProf.status === 'Submitted' || selectedProf.status === 'Under Review' ? (
                    <>
                      <button 
                        onClick={() => handleStatusChangeAction(selectedProf.id, 'Verified')}
                        className="px-3.5 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        Approve Listing
                      </button>
                      <button 
                        onClick={() => handleStatusChangeAction(selectedProf.id, 'Removed')}
                        className="px-3.5 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                      >
                        Reject Listing
                      </button>
                    </>
                  ) : selectedProf.status === 'Suspended' ? (
                    <button 
                      onClick={() => handleStatusChangeAction(selectedProf.id, 'Verified')}
                      className="px-3.5 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      Restore Listing
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleStatusChangeAction(selectedProf.id, selectedProf.status === 'Featured' ? 'Verified' : 'Featured')}
                        className="px-3.5 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-1"
                      >
                        <Sparkles size={11} /> {selectedProf.status === 'Featured' ? 'Demote Featured' : 'Feature Listing'}
                      </button>
                      <button 
                        onClick={() => handleStatusChangeAction(selectedProf.id, 'Suspended')}
                        className="px-3.5 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                      >
                        Suspend Listing
                      </button>
                    </>
                  )}
                </div>

              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── GALLERY LIGHTBOX MODAL OVERLAY ─── */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setLightboxImage(null)}
          >
            <button 
              className="absolute top-4 right-4 text-white hover:text-purple-300"
              onClick={() => setLightboxImage(null)}
            >
              <X size={24} />
            </button>
            <img src={lightboxImage} alt="Lightbox Preview" className="max-w-full max-h-[85vh] object-contain rounded-lg border border-white/10" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── BUSINESS PROFILE FORM EDITOR MODAL ─── */}
      <AnimatePresence>
        {isEditModalOpen && editForm && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto w-full max-w-lg h-[500px] bg-[#0c0533] border border-white/10 rounded-2xl z-50 flex flex-col justify-between overflow-hidden text-xs text-white"
            >
              <div className="p-4 border-b border-white/10 bg-white/2 flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-purple-200">Edit Business Profile</span>
                <button onClick={() => setIsEditModalOpen(false)} className="text-text-muted hover:text-white"><X size={15} /></button>
              </div>

              <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-4 space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Business Title</label>
                  <input 
                    type="text" 
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-[#120739]/50 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Category</label>
                    <input 
                      type="text" 
                      value={editForm.category}
                      onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-[#120739]/50 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Experience</label>
                    <input 
                      type="text" 
                      value={editForm.experience}
                      onChange={(e) => setEditForm(prev => ({ ...prev, experience: e.target.value }))}
                      className="w-full bg-[#120739]/50 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Owner Name</label>
                    <input 
                      type="text" 
                      value={editForm.ownerName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, ownerName: e.target.value }))}
                      className="w-full bg-[#120739]/50 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Primary Phone</label>
                    <input 
                      type="text" 
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-[#120739]/50 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Description</label>
                  <textarea 
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-[#120739]/50 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    rows={4}
                  />
                </div>

              </form>

              <div className="p-4 border-t border-white/10 bg-[#120739] flex items-center justify-end gap-2 uppercase font-bold text-[10px]">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3.5 py-2 text-text-muted hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors"
                >
                  Save Profile
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
