import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Plus, Search, Filter, Edit, Trash2, CheckCircle, XCircle, 
  UploadCloud, X, ChevronLeft, ChevronRight, Download, Printer, 
  Clock, MapPin, Users, Check, Share2, FileText, Settings, AlertCircle, 
  Eye, Video, Image, File, History, Sparkles, TrendingUp, BarChart3, 
  HelpCircle, ShieldAlert, ListFilter, Copy, Play, Info
} from 'lucide-react';
import { useData } from '../../../member/context/DataProvider';
import { Avatar } from '../../../member/components/common/Avatar';

// Configuration presets for categories
const categoryConfig = {
  Cultural: { label: 'Cultural', emoji: '🎭', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', gradient: 'from-purple-500/20 to-indigo-500/10' },
  Education: { label: 'Education', emoji: '📚', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', gradient: 'from-blue-500/20 to-cyan-500/10' },
  Matrimonial: { label: 'Matrimonial', emoji: '💍', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', gradient: 'from-pink-500/20 to-rose-500/10' },
  Health: { label: 'Health', emoji: '🏥', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', gradient: 'from-emerald-500/20 to-teal-500/10' },
  Sports: { label: 'Sports', emoji: '🏆', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', gradient: 'from-orange-500/20 to-amber-500/10' },
};

export const EventManagement = () => {
  const { 
    currentUser, 
    events, 
    addEvent, 
    updateEvent, 
    deleteEvent, 
    duplicateEvent,
    updateRegistrationStatus,
    updateAttendanceStatus,
    uploadGalleryItem,
    deleteGalleryItem,
    addEventAnnouncement
  } = useData();

  // Primary State Flags
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'analytics'
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null); // { message, action }
  
  // Drawer States
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState('overview'); // 'overview' | 'registrations' | 'gallery' | 'announcements' | 'audit'
  
  // Modal Wizard (Create/Edit) States
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardMode, setWizardMode] = useState('create'); // 'create' | 'edit'
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardEventId, setWizardEventId] = useState(null);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [savedFilters, setSavedFilters] = useState([]);
  const [activeSavedFilterName, setActiveSavedFilterName] = useState('');

  // Table Pagination & Selection States
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Form Wizard Form Values
  const [formValues, setFormValues] = useState({
    title: '', subtitle: '', category: 'Cultural', description: '', bannerImage: '', thumbnailImage: '',
    tags: '', venueType: 'Offline', address: '', city: '', googleMapsLink: '', latitude: '', longitude: '',
    startDate: '', endDate: '', registrationDeadline: '', timings: '', timezone: 'IST',
    capacity: '100', waitlistLimit: '20', isRSVPRequired: true, guestLimit: '2', ticketType: 'Free', ticketPrice: '0',
    terms: ''
  });

  // Announcement State
  const [newNotice, setNewNotice] = useState('');

  // Gallery Upload Simulator State
  const [dragActive, setDragActive] = useState(false);
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadType, setUploadType] = useState('Photo');

  // Multi-step form step titles
  const steps = [
    { number: 1, title: 'Basic Details' },
    { number: 2, title: 'Venue' },
    { number: 3, title: 'Schedule' },
    { number: 4, title: 'Registration' },
    { number: 5, title: 'Review & Publish' }
  ];

  // Show dynamic toast alert
  const triggerToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Filter events belonging only to the assigned head community (RBAC Check)
  const myCommunityEvents = useMemo(() => {
    return events.filter(e => !e.isDeleted && e.communityId === currentUser.communityId);
  }, [events, currentUser]);

  const selectedEvent = useMemo(() => {
    return events.find(e => e.id === selectedEventId) || null;
  }, [events, selectedEventId]);

  // Aggregate Metrics for Dashboard cards (Indore events)
  const dashboardStats = useMemo(() => {
    const total = myCommunityEvents.length;
    const upcoming = myCommunityEvents.filter(e => e.status === 'Published' || e.status === 'Registration Open' || e.status === 'Registration Closed').length;
    const live = myCommunityEvents.filter(e => e.status === 'Event Live').length;
    const completed = myCommunityEvents.filter(e => e.status === 'Completed').length;
    const cancelled = myCommunityEvents.filter(e => e.status === 'Cancelled').length;

    let totalRegs = 0;
    let checkedIn = 0;
    let capacity = 0;

    myCommunityEvents.forEach(e => {
      totalRegs += (e.registrations || []).length;
      checkedIn += (e.registrations || []).filter(r => r.attendance === 'Attended' || r.attendance === 'Late').length;
      capacity += Number(e.capacity || 0);
    });

    const attendanceRate = totalRegs > 0 ? Math.round((checkedIn / totalRegs) * 100) : 0;
    
    return { total, upcoming, live, completed, cancelled, totalRegs, attendanceRate, capacity };
  }, [myCommunityEvents]);

  // Handle global search suggestions and filters
  const filteredEvents = useMemo(() => {
    let list = [...myCommunityEvents];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e => 
        e.title?.toLowerCase().includes(q) ||
        e.venue?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== 'all') {
      list = list.filter(e => e.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      list = list.filter(e => e.status === statusFilter);
    }

    if (cityFilter !== 'all') {
      list = list.filter(e => e.city === cityFilter);
    }

    // Sort order mapping
    list.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';

      if (sortField === 'registrations') {
        aVal = (a.registrations || []).length;
        bVal = (b.registrations || []).length;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return list;
  }, [myCommunityEvents, searchQuery, categoryFilter, statusFilter, cityFilter, sortField, sortOrder]);

  // Pagination bounds
  const paginatedEvents = useMemo(() => {
    const itemsPerPage = 5;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEvents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEvents, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / 5));

  // AutoSuggestions List based on active query
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const matches = new Set();
    myCommunityEvents.forEach(e => {
      if (e.title.toLowerCase().includes(query)) matches.add(e.title);
      if (e.venue.toLowerCase().includes(query)) matches.add(e.venue);
      if (e.category.toLowerCase().includes(query)) matches.add(e.category);
    });
    return Array.from(matches).slice(0, 5);
  }, [searchQuery, myCommunityEvents]);

  // Saved filter handling
  const handleSaveFilter = () => {
    if (!activeSavedFilterName.trim()) {
      triggerToast('Please provide a name for the filter', 'warning');
      return;
    }
    const filterObj = {
      name: activeSavedFilterName,
      category: categoryFilter,
      status: statusFilter,
      city: cityFilter
    };
    setSavedFilters(prev => [...prev, filterObj]);
    setActiveSavedFilterName('');
    triggerToast('Filter settings saved successfully!');
  };

  const applySavedFilter = (f) => {
    setCategoryFilter(f.category);
    setStatusFilter(f.status);
    setCityFilter(f.city);
    triggerToast(`Applied filter: "${f.name}"`);
  };

  // Form Creation Setup
  const openCreateWizard = () => {
    setFormValues({
      title: '', subtitle: '', category: 'Cultural', description: '', bannerImage: '', thumbnailImage: '',
      tags: 'General, Gathering', venueType: 'Offline', address: 'Samaj Bhawan, Indore', city: 'Indore', googleMapsLink: '', latitude: '22.7196', longitude: '75.8577',
      startDate: new Date().toISOString().substring(0, 16), endDate: new Date(Date.now() + 86400000).toISOString().substring(0, 16),
      registrationDeadline: new Date(Date.now() - 3600000).toISOString().substring(0, 16), timings: '10:00 AM - 6:00 PM', timezone: 'IST',
      capacity: '150', waitlistLimit: '30', isRSVPRequired: true, guestLimit: '2', ticketType: 'Free', ticketPrice: '0',
      terms: 'Carry ID; Mask mandatory.'
    });
    setWizardMode('create');
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  // Edit Event Form Populate
  const openEditWizard = (eventObj) => {
    setWizardEventId(eventObj.id);
    setFormValues({
      title: eventObj.title || '',
      subtitle: eventObj.subtitle || '',
      category: eventObj.category || 'Cultural',
      description: eventObj.description || '',
      bannerImage: eventObj.image || '',
      thumbnailImage: eventObj.image || '',
      tags: (eventObj.tagsEn || []).join(', ') || 'General',
      venueType: eventObj.venueType || 'Offline',
      address: eventObj.venue || '',
      city: eventObj.city || 'Indore',
      googleMapsLink: eventObj.googleMapsLink || '',
      latitude: eventObj.latitude || '22.7196',
      longitude: eventObj.longitude || '75.8577',
      startDate: eventObj.startDateRaw || new Date().toISOString().substring(0, 16),
      endDate: eventObj.endDateRaw || new Date(Date.now() + 86400000).toISOString().substring(0, 16),
      registrationDeadline: eventObj.registrationDeadlineRaw || new Date().toISOString().substring(0, 16),
      timings: eventObj.time || '',
      timezone: eventObj.timezone || 'IST',
      capacity: String(eventObj.capacity || '100'),
      waitlistLimit: String(eventObj.waitlistLimit || '20'),
      isRSVPRequired: eventObj.isRSVPRequired !== undefined ? eventObj.isRSVPRequired : true,
      guestLimit: String(eventObj.guestLimit || '2'),
      ticketType: eventObj.ticketType || 'Free',
      ticketPrice: String(eventObj.ticketPrice || '0'),
      terms: (eventObj.termsAndInstructions || []).join('; ') || ''
    });
    setWizardMode('edit');
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  // Submit / Save Step Flow
  const handleWizardSubmit = (publishDirectly = false) => {
    // Form verification step checks
    if (!formValues.title || !formValues.startDate || !formValues.address) {
      triggerToast('Mandatory fields missing in review parameters', 'warning');
      return;
    }

    const payload = {
      title: formValues.title,
      subtitle: formValues.subtitle,
      category: formValues.category,
      venue: formValues.address,
      city: formValues.city,
      date: new Date(formValues.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      startDateRaw: formValues.startDate,
      endDateRaw: formValues.endDate,
      registrationDeadlineRaw: formValues.registrationDeadline,
      time: formValues.timings,
      capacity: Number(formValues.capacity),
      waitlistLimit: Number(formValues.waitlistLimit),
      isRSVPRequired: formValues.isRSVPRequired,
      guestLimit: Number(formValues.guestLimit),
      ticketType: formValues.ticketType,
      ticketPrice: Number(formValues.ticketPrice),
      image: formValues.bannerImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      description: formValues.description,
      tagsEn: formValues.tags.split(',').map(t => t.trim()),
      termsAndInstructions: formValues.terms.split(';').map(t => t.trim()),
      status: publishDirectly ? 'Published' : 'Draft',
    };

    if (wizardMode === 'create') {
      addEvent(payload);
      triggerToast(`Successfully created event "${payload.title}" as ${payload.status}!`);
    } else {
      updateEvent(wizardEventId, payload);
      triggerToast(`Updated event details for "${payload.title}"!`);
    }

    setIsWizardOpen(false);
  };

  // Lifecycle stage triggers
  const handleTriggerPublish = (eventId, eventTitle) => {
    updateEvent(eventId, { status: 'Published' });
    triggerToast(`Event "${eventTitle}" has been published to community feeds!`);
  };

  const handleTriggerCancel = (eventId, eventTitle) => {
    setConfirmDialog({
      message: `Are you sure you want to cancel the event "${eventTitle}"? Members will be notified instantly.`,
      action: () => {
        updateEvent(eventId, { status: 'Cancelled' });
        triggerToast(`Event "${eventTitle}" is now Cancelled.`, 'error');
        setConfirmDialog(null);
      }
    });
  };

  const handleTriggerDelete = (eventId, eventTitle) => {
    setConfirmDialog({
      message: `Are you sure you want to delete the event "${eventTitle}"? This soft-deletes the schedule.`,
      action: () => {
        deleteEvent(eventId);
        triggerToast(`Event "${eventTitle}" has been soft-deleted.`, 'error');
        setConfirmDialog(null);
      }
    });
  };

  const handleTriggerDuplicate = (eventId, eventTitle) => {
    duplicateEvent(eventId);
    triggerToast(`Cloned event copy of "${eventTitle}" created as Draft.`);
  };

  // Bulk execution handlers
  const handleBulkPublish = () => {
    if (selectedRows.length === 0) return;
    selectedRows.forEach(id => {
      const ev = myCommunityEvents.find(e => e.id === id);
      if (ev && ev.status === 'Draft') {
        updateEvent(id, { status: 'Published' });
      }
    });
    triggerToast(`Published ${selectedRows.length} draft events in bulk!`);
    setSelectedRows([]);
  };

  const handleBulkCancel = () => {
    if (selectedRows.length === 0) return;
    setConfirmDialog({
      message: `Are you sure you want to cancel the ${selectedRows.length} selected events in bulk?`,
      action: () => {
        selectedRows.forEach(id => {
          updateEvent(id, { status: 'Cancelled' });
        });
        triggerToast(`Cancelled ${selectedRows.length} events in bulk.`, 'error');
        setSelectedRows([]);
        setConfirmDialog(null);
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;
    setConfirmDialog({
      message: `Are you sure you want to soft-delete the ${selectedRows.length} selected events in bulk?`,
      action: () => {
        selectedRows.forEach(id => deleteEvent(id));
        triggerToast(`Soft-deleted ${selectedRows.length} events in bulk.`, 'error');
        setSelectedRows([]);
        setConfirmDialog(null);
      }
    });
  };

  // Checkbox bindings
  const toggleSelectRow = (id) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const visibleIds = paginatedEvents.map(e => e.id);
    const allSelected = visibleIds.every(id => selectedRows.includes(id));
    if (allSelected) {
      setSelectedRows(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedRows(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Announcement broadcast
  const handleBroadcastAnnouncement = (e) => {
    e.preventDefault();
    if (!newNotice.trim() || !selectedEventId) return;
    addEventAnnouncement(selectedEventId, newNotice);
    setNewNotice('');
    triggerToast('Important Notice broadcasted and pinned to attendees!');
  };

  // Gallery Drag & Drop Upload Mocking
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      mockGalleryUpload(file.name, file.size, file.type);
    }
  };

  const triggerManualUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      mockGalleryUpload(file.name, file.size, file.type);
    }
  };

  const mockGalleryUpload = (fileName, fileSize, fileMime) => {
    if (fileSize > 5 * 1024 * 1024 && uploadType === 'Photo') {
      triggerToast('Max photo limit is 5MB. Upload aborted.', 'warning');
      return;
    }
    if (fileSize > 20 * 1024 * 1024) {
      triggerToast('Max file size limit is 20MB. Upload aborted.', 'warning');
      return;
    }

    const payload = {
      fileType: uploadType,
      fileUrl: uploadType === 'Photo' 
        ? 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800' 
        : '#',
      fileName: fileName,
      caption: uploadCaption || 'Uploaded Media Resource',
      isCoverImage: false,
      isFeaturedImage: false,
      uploadMetadata: {
        fileSizeInBytes: fileSize || 450000,
        mimeType: fileMime || 'image/jpeg',
        uploadedAt: new Date().toISOString()
      }
    };

    uploadGalleryItem(selectedEventId, payload);
    setUploadCaption('');
    triggerToast('Media item uploaded and logged in event gallery!');
  };

  // CSV Data compiler
  const exportToCSV = () => {
    if (myCommunityEvents.length === 0) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Event ID,Title,Category,Venue,City,Date,Status,Registrations,Capacity\r\n";
    
    myCommunityEvents.forEach(e => {
      csvContent += `"${e.id}","${e.title}","${e.category}","${e.venue}","${e.city}","${e.date}","${e.status}",${(e.registrations || []).length},${e.capacity}\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Samaj_Events_${currentUser.city}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Exported CSV template list successfully!');
  };

  return (
    <div className="space-y-6 pb-12 text-white">
      
      {/* ─── TOAST NOTIFICATION ─── */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-55 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border backdrop-blur-md ${
              toast.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : toast.type === 'warning'
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-450'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-bold tracking-wide">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── CONFIRM DIALOG OVERLAY ─── */}
      <AnimatePresence>
        {confirmDialog && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-55 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card-neo max-w-md w-full p-6 space-y-6 border border-white/10"
            >
              <div className="flex items-center gap-3.5 text-amber-400">
                <ShieldAlert size={26} />
                <h3 className="text-lg font-black tracking-tight">Administrative Action Check</h3>
              </div>
              <p className="text-sm text-purple-200/90 leading-relaxed">
                {confirmDialog.message}
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => setConfirmDialog(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold uppercase border border-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDialog.action}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold uppercase transition-all shadow-md shadow-rose-600/20"
                >
                  Confirm Action
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── PAGE HEADER ─── */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2.5">
            <Calendar className="text-purple-400" />
            Event Operations Command
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Manage registrations, schedules, check-ins, galleries, and notice boards for <span className="text-amber-400 font-bold">{currentUser.community} ({currentUser.city})</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Main Module Tabs Toggle */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 text-xs font-bold">
            <button 
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'list' ? 'bg-purple-650 text-white shadow-md' : 'text-purple-200 hover:text-white'}`}
            >
              Console List
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'analytics' ? 'bg-purple-650 text-white shadow-md' : 'text-purple-200 hover:text-white'}`}
            >
              Module Analytics
            </button>
          </div>

          <button 
            onClick={openCreateWizard}
            className="px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 press-scale shadow-lg shadow-purple-500/25 border border-purple-400/20"
          >
            <Plus size={14} /> Schedule Event
          </button>
        </div>
      </section>

      {activeTab === 'list' ? (
        <>
          {/* ─── STATISTICS CARDS GRID ─── */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stat Card 1: Active Events */}
            <div className="card-neo p-4 relative overflow-hidden group hover:border-purple-500/20 transition-all flex flex-col justify-between min-h-[110px]">
              <div>
                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-wider">Scheduled Programs</h4>
                <h3 className="text-2xl font-black text-white mt-1.5 tracking-tight">{dashboardStats.upcoming}</h3>
              </div>
              <div className="flex items-center justify-between text-[10px] text-text-muted mt-2 border-t border-white/5 pt-1.5">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Active Registry</span>
                <span className="text-indigo-400 font-bold">Total: {dashboardStats.total}</span>
              </div>
            </div>

            {/* Stat Card 2: Live Right Now */}
            <div className="card-neo p-4 relative overflow-hidden group hover:border-purple-500/20 transition-all flex flex-col justify-between min-h-[110px]">
              <div>
                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-wider">Live Gatherings</h4>
                <h3 className={`text-2xl font-black mt-1.5 tracking-tight ${dashboardStats.live > 0 ? 'text-emerald-400 animate-pulse' : 'text-white'}`}>
                  {dashboardStats.live}
                </h3>
              </div>
              <div className="flex items-center justify-between text-[10px] text-text-muted mt-2 border-t border-white/5 pt-1.5">
                <span className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${dashboardStats.live > 0 ? 'bg-emerald-500 animate-ping' : 'bg-white/30'}`} /> 
                  On-site Check-in
                </span>
                <span className="text-emerald-400 font-bold">{dashboardStats.live > 0 ? 'Active' : 'Standby'}</span>
              </div>
            </div>

            {/* Stat Card 3: Attendance Conversion */}
            <div className="card-neo p-4 relative overflow-hidden group hover:border-purple-500/20 transition-all flex flex-col justify-between min-h-[110px]">
              <div>
                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-wider">Attendance Rate</h4>
                <h3 className="text-2xl font-black text-white mt-1.5 tracking-tight">{dashboardStats.attendanceRate}%</h3>
              </div>
              {/* Mini SVG Progress Bar */}
              <div className="w-full bg-white/10 rounded-full h-1 mt-2">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1 rounded-full" style={{ width: `${dashboardStats.attendanceRate}%` }} />
              </div>
              <div className="flex items-center justify-between text-[10px] text-text-muted mt-1.5">
                <span>Roster Count: {dashboardStats.totalRegs}</span>
                <span className="text-amber-400 font-bold">Cap: {dashboardStats.capacity}</span>
              </div>
            </div>

            {/* Stat Card 4: Cancelled Events */}
            <div className="card-neo p-4 relative overflow-hidden group hover:border-purple-500/20 transition-all flex flex-col justify-between min-h-[110px]">
              <div>
                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-wider">Cancelled / Archives</h4>
                <h3 className="text-2xl font-black text-white mt-1.5 tracking-tight">{dashboardStats.cancelled}</h3>
              </div>
              <div className="flex items-center justify-between text-[10px] text-text-muted mt-2 border-t border-white/5 pt-1.5">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> System Suspensions</span>
                <span className="text-rose-400 font-bold">Rate: {Math.round((dashboardStats.cancelled / (dashboardStats.total || 1)) * 100)}%</span>
              </div>
            </div>
          </section>

          {/* ─── SEARCH & FILTER & AUTO SUGGESTIONS ─── */}
          <section className="card-neo p-4 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              
              {/* Search Bar Input */}
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-4 top-3 text-white/40" />
                <input 
                  type="text"
                  placeholder="Global Search (Title, venue, category, description)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-brand-primary text-xs tracking-wide"
                />
                
                {/* Auto Suggestions popup */}
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a0f44] border border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden">
                    {suggestions.map((item, index) => (
                      <button 
                        key={index}
                        onClick={() => {
                          setSearchQuery(item);
                        }}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-white/5 text-purple-200 hover:text-white transition-colors"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl outline-none text-white focus:border-brand-primary"
                >
                  <option value="all" className="bg-[#160b37]">All Categories</option>
                  <option value="Cultural" className="bg-[#160b37]">🎭 Cultural</option>
                  <option value="Education" className="bg-[#160b37]">📚 Education</option>
                  <option value="Matrimonial" className="bg-[#160b37]">💍 Matrimonial</option>
                  <option value="Health" className="bg-[#160b37]">🏥 Health</option>
                  <option value="Sports" className="bg-[#160b37]">🏆 Sports</option>
                </select>

                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl outline-none text-white focus:border-brand-primary"
                >
                  <option value="all" className="bg-[#160b37]">All Statuses</option>
                  <option value="Draft" className="bg-[#160b37]">Draft</option>
                  <option value="Published" className="bg-[#160b37]">Published</option>
                  <option value="Registration Open" className="bg-[#160b37]">Registration Open</option>
                  <option value="Registration Closed" className="bg-[#160b37]">Registration Closed</option>
                  <option value="Event Live" className="bg-[#160b37]">Event Live</option>
                  <option value="Completed" className="bg-[#160b37]">Completed</option>
                  <option value="Cancelled" className="bg-[#160b37]">Cancelled</option>
                </select>

                <select 
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl outline-none text-white focus:border-brand-primary"
                >
                  <option value="all" className="bg-[#160b37]">All Cities</option>
                  <option value="Indore" className="bg-[#160b37]">Indore</option>
                  <option value="Jaipur" className="bg-[#160b37]">Jaipur</option>
                  <option value="Bhopal" className="bg-[#160b37]">Bhopal</option>
                  <option value="Lucknow" className="bg-[#160b37]">Lucknow</option>
                  <option value="Delhi" className="bg-[#160b37]">Delhi</option>
                </select>

              </div>
            </div>

            {/* Save Filter widget */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/5">
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Save current filters as..."
                  value={activeSavedFilterName}
                  onChange={(e) => setActiveSavedFilterName(e.target.value)}
                  className="px-3 py-1.5 bg-white/3 border border-white/5 rounded-lg text-[11px] outline-none focus:border-brand-primary"
                />
                <button 
                  onClick={handleSaveFilter}
                  className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500 text-purple-200 hover:text-white rounded-lg text-[10px] font-black uppercase border border-purple-500/25 transition-all"
                >
                  Save Preset
                </button>
              </div>

              {/* Render Saved Presets */}
              {savedFilters.length > 0 && (
                <div className="flex items-center gap-2 text-[10px] text-text-muted">
                  <span>Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {savedFilters.map((f, i) => (
                      <button 
                        key={i}
                        onClick={() => applySavedFilter(f)}
                        className="px-2.5 py-1 rounded bg-[#20134f] hover:bg-[#2e1c70] text-purple-250 border border-white/5 transition-all font-bold"
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Active Filter Chips */}
            {(categoryFilter !== 'all' || statusFilter !== 'all' || cityFilter !== 'all' || searchQuery) && (
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-purple-200">
                <span>Active Filters:</span>
                {categoryFilter !== 'all' && (
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-550 text-purple-300 flex items-center gap-1">
                    Category: {categoryFilter}
                    <X size={10} className="cursor-pointer" onClick={() => setCategoryFilter('all')} />
                  </span>
                )}
                {statusFilter !== 'all' && (
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-550 text-purple-300 flex items-center gap-1">
                    Status: {statusFilter}
                    <X size={10} className="cursor-pointer" onClick={() => setStatusFilter('all')} />
                  </span>
                )}
                {cityFilter !== 'all' && (
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-550 text-purple-300 flex items-center gap-1">
                    City: {cityFilter}
                    <X size={10} className="cursor-pointer" onClick={() => setCityFilter('all')} />
                  </span>
                )}
                {searchQuery && (
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-550 text-purple-300 flex items-center gap-1">
                    Query: "{searchQuery}"
                    <X size={10} className="cursor-pointer" onClick={() => setSearchQuery('')} />
                  </span>
                )}
                <button 
                  onClick={() => {
                    setCategoryFilter('all');
                    setStatusFilter('all');
                    setCityFilter('all');
                    setSearchQuery('');
                  }}
                  className="text-amber-400 hover:text-white transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}
          </section>

          {/* ─── EVENT LIST TABLE ─── */}
          <section className="card-neo overflow-hidden flex flex-col justify-between min-h-[350px]">
            
            {/* Table Header toolbar */}
            <div className="p-4 bg-white/2 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
              
              {/* Bulk Operations buttons */}
              {selectedRows.length > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black text-amber-400 mr-2 uppercase tracking-wider">{selectedRows.length} Rows selected:</span>
                  <button 
                    onClick={handleBulkPublish}
                    className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-350 hover:text-white rounded-lg text-[10px] font-bold border border-emerald-500/30 transition-all uppercase"
                  >
                    Publish
                  </button>
                  <button 
                    onClick={handleBulkCancel}
                    className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-355 hover:text-white rounded-lg text-[10px] font-bold border border-rose-500/30 transition-all uppercase"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleBulkDelete}
                    className="px-3 py-1.5 bg-rose-600/30 hover:bg-rose-600 text-rose-355 hover:text-white rounded-lg text-[10px] font-bold border border-rose-600/40 transition-all uppercase"
                  >
                    Delete
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedRows([]);
                      triggerToast('Selection cleared');
                    }}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] border border-white/5 transition-all"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Scheduled Lists</span>
                </div>
              )}

              {/* Data utilities */}
              <div className="flex items-center gap-2 text-xs">
                <button 
                  onClick={exportToCSV}
                  className="px-3 py-1.5 rounded-lg bg-[#20134f] hover:bg-[#2e1c70] text-purple-250 border border-white/5 flex items-center gap-1.5 font-bold transition-all text-[11px]"
                >
                  <Download size={12} /> CSV
                </button>
                <button 
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-[#20134f] hover:bg-[#2e1c70] text-purple-250 border border-white/5 flex items-center gap-1.5 font-bold transition-all text-[11px]"
                >
                  <Printer size={12} /> Print
                </button>
              </div>

            </div>

            {/* Advanced Table Frame */}
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-white/3 border-b border-white/5 text-[10px] uppercase font-black tracking-wider text-purple-200 sticky top-0">
                  <tr>
                    <th className="p-4 w-12 text-center">
                      <input 
                        type="checkbox" 
                        checked={paginatedEvents.length > 0 && paginatedEvents.every(e => selectedRows.includes(e.id))}
                        onChange={toggleSelectAll}
                        className="rounded accent-purple-500 cursor-pointer"
                      />
                    </th>
                    <th className="p-4">Banner</th>
                    <th className="p-4">Event Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Venue & City</th>
                    <th className="p-4">Schedule Date</th>
                    <th className="p-4 text-center">RSVPs</th>
                    <th className="p-4 text-center">Capacity</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedEvents.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="p-12 text-center text-text-muted">
                        <FolderMinus className="mx-auto text-purple-400/40 mb-3" size={32} />
                        <h4 className="font-bold text-white">No community events scheduled</h4>
                        <p className="text-[11px] mt-1">Create a schedule or check active filter settings.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedEvents.map((evt) => {
                      const cat = categoryConfig[evt.category] || categoryConfig.Cultural;
                      const isSelected = selectedRows.includes(evt.id);
                      
                      return (
                        <tr 
                          key={evt.id} 
                          className={`hover:bg-white/3 transition-all ${isSelected ? 'bg-purple-500/5' : ''}`}
                        >
                          {/* Selection Checkbox */}
                          <td className="p-4 text-center">
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => toggleSelectRow(evt.id)}
                              className="rounded accent-purple-500 cursor-pointer"
                            />
                          </td>

                          {/* Banner Image / Category placeholder */}
                          <td className="p-4">
                            <div className="w-12 h-8 rounded-lg overflow-hidden border border-white/10 bg-white/5 shadow-md">
                              {evt.image ? (
                                <img src={evt.image} alt={evt.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-[10px] text-white">
                                  {cat.emoji}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Event Title and subtitle info */}
                          <td className="p-4 max-w-[200px] truncate">
                            <div>
                              <h4 className="font-black text-white text-[13px]">{evt.titleEn || evt.title}</h4>
                              <p className="text-[10px] text-text-muted mt-0.5 truncate">{evt.subtitle || 'Official Samaj Event'}</p>
                            </div>
                          </td>

                          {/* Event category badge */}
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${cat.bg} ${cat.color} ${cat.border}`}>
                              <span>{cat.emoji}</span>
                              <span>{cat.label}</span>
                            </span>
                          </td>

                          {/* Venue Location Address */}
                          <td className="p-4 max-w-[180px] truncate">
                            <div>
                              <p className="text-white text-[12px] truncate">{evt.venueEn || evt.venue}</p>
                              <p className="text-[10px] text-text-muted flex items-center gap-0.5 mt-0.5"><MapPin size={9} /> {evt.city}</p>
                            </div>
                          </td>

                          {/* Scheduled date */}
                          <td className="p-4">
                            <div className="text-[12px]">
                              <p className="font-bold text-white">{evt.date}</p>
                              <p className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5"><Clock size={9} /> {evt.time || '10:00 AM'}</p>
                            </div>
                          </td>

                          {/* Registrations count */}
                          <td className="p-4 text-center font-bold text-[13px]">
                            {(evt.registrations || []).length}
                          </td>

                          {/* Total capacity */}
                          <td className="p-4 text-center font-bold text-[12px] text-text-muted">
                            {evt.capacity || 100}
                          </td>

                          {/* Status Badge */}
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                              evt.status === 'Published' || evt.status === 'Registration Open'
                                ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20'
                                : evt.status === 'Draft'
                                ? 'bg-amber-500/10 text-amber-450 border border-amber-500/20'
                                : evt.status === 'Cancelled'
                                ? 'bg-rose-500/10 text-rose-455 border border-rose-500/20'
                                : 'bg-[#20134f] text-purple-300 border border-white/5'
                            }`}>
                              <span className={`w-1 h-1 rounded-full ${
                                evt.status === 'Published' || evt.status === 'Registration Open'
                                  ? 'bg-emerald-400 animate-pulse'
                                  : evt.status === 'Draft'
                                  ? 'bg-amber-400'
                                  : evt.status === 'Cancelled'
                                  ? 'bg-rose-400'
                                  : 'bg-purple-400'
                              }`} />
                              {evt.status}
                            </span>
                          </td>

                          {/* Table Row Actions */}
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button 
                                onClick={() => {
                                  setSelectedEventId(evt.id);
                                  setDrawerTab('overview');
                                  setIsDrawerOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500 text-purple-200 hover:text-white border border-purple-500/20 transition-all active:scale-95"
                                title="View Details"
                              >
                                <Eye size={12} />
                              </button>
                              
                              <button 
                                onClick={() => openEditWizard(evt)}
                                className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500 text-blue-200 hover:text-white border border-blue-500/20 transition-all active:scale-95"
                                title="Edit Event"
                              >
                                <Edit size={12} />
                              </button>

                              {evt.status === 'Draft' && (
                                <button 
                                  onClick={() => handleTriggerPublish(evt.id, evt.title)}
                                  className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-250 hover:text-white border border-emerald-500/20 transition-all active:scale-95"
                                  title="Publish Event"
                                >
                                  <Check size={12} />
                                </button>
                              )}

                              {evt.status !== 'Cancelled' && (
                                <button 
                                  onClick={() => handleTriggerCancel(evt.id, evt.title)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-550 text-rose-355 hover:text-white border border-rose-500/20 transition-all active:scale-95"
                                  title="Cancel Event"
                                >
                                  <XCircle size={12} />
                                </button>
                              )}

                              <button 
                                onClick={() => handleTriggerDuplicate(evt.id, evt.title)}
                                className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500 text-indigo-250 hover:text-white border border-indigo-500/20 transition-all active:scale-95"
                                title="Duplicate Event"
                              >
                                <Copy size={12} />
                              </button>

                              <button 
                                onClick={() => handleTriggerDelete(evt.id, evt.title)}
                                className="p-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-650 text-rose-355 hover:text-white border border-rose-650/20 transition-all active:scale-95"
                                title="Delete Event"
                              >
                                <Trash2 size={12} />
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 bg-white/2 border-t border-white/5 flex items-center justify-between text-xs text-text-muted">
                <span>Showing Page {currentPage} of {totalPages}</span>
                <div className="flex items-center gap-1">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="p-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-all text-white border border-white/5 cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 transition-all text-white border border-white/5 cursor-pointer"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

          </section>
        </>
      ) : (
        /* ─── ANALYTICS INTEGRATION PANEL ─── */
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Chart 1: Registration Conversion Trends */}
            <div className="card-neo p-5 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5"><TrendingUp size={14} className="text-purple-400" /> Registration Conversion Trends</h4>
                <p className="text-[10px] text-text-muted">Visualizing monthly conversion vectors</p>
              </div>
              <div className="h-44 mt-4 flex items-center justify-center">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 150">
                  <line x1="20" y1="20" x2="280" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                  <line x1="20" y1="70" x2="280" y2="70" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                  <line x1="20" y1="120" x2="280" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                  <path d="M20,120 Q60,110 100,85 T180,50 T260,30 L280,25 L280,130 L20,130 Z" fill="url(#area-grad-evt)" />
                  <path d="M20,120 Q60,110 100,85 T180,50 T260,30" fill="none" stroke="#a78bfa" strokeWidth="3" />
                  <circle cx="100" cy="85" r="4" fill="#a78bfa" stroke="white" strokeWidth="1" />
                  <circle cx="180" cy="50" r="4" fill="#a78bfa" stroke="white" strokeWidth="1" />
                  <circle cx="260" cy="30" r="4" fill="#a78bfa" stroke="white" strokeWidth="1" />
                  <defs>
                    <linearGradient id="area-grad-evt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.4"/>
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Chart 2: Popular Categories splits */}
            <div className="card-neo p-5 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5"><BarChart3 size={14} className="text-purple-400" /> Category Distributions</h4>
                <p className="text-[10px] text-text-muted">Total active programs split by tags</p>
              </div>
              <div className="h-44 mt-4 flex items-center justify-between gap-4">
                <div className="w-24 h-24 shrink-0">
                  <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4.5" />
                    <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#8B5CF6" strokeWidth="4.5" strokeDasharray="45 55" strokeDashoffset="0" />
                    <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#EC4899" strokeWidth="4.5" strokeDasharray="30 70" strokeDashoffset="-45" />
                    <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#10B981" strokeWidth="4.5" strokeDasharray="25 75" strokeDashoffset="-75" />
                  </svg>
                </div>
                <div className="flex-1 space-y-1.5 text-[10px] font-bold text-text-muted">
                  <div className="flex items-center justify-between text-white">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-purple-500" /> Cultural</span>
                    <span>45%</span>
                  </div>
                  <div className="flex items-center justify-between text-white">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-pink-500" /> Matrimonial</span>
                    <span>30%</span>
                  </div>
                  <div className="flex items-center justify-between text-white">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-emerald-500" /> Health / Other</span>
                    <span>25%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 3: Average Attendance Rings */}
            <div className="card-neo p-5 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5"><CheckCircle size={14} className="text-purple-400" /> Average Attendance Rate</h4>
                <p className="text-[10px] text-text-muted">Proportion of registrations checked in</p>
              </div>
              <div className="h-44 mt-4 flex flex-col items-center justify-center relative">
                <div className="w-24 h-24">
                  <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="rgba(16,185,129,0.15)" strokeWidth="4.5" />
                    <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#10B981" strokeWidth="4.5" strokeDasharray="72 28" strokeDashoffset="0" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-3">
                  <span className="text-xl font-black text-white">72%</span>
                  <span className="text-[8px] font-bold text-emerald-400 tracking-wider uppercase">Conversion</span>
                </div>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* ─── MULTI-STEP CREATION WIZARD MODAL ─── */}
      <AnimatePresence>
        {isWizardOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card-neo max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-white/10"
            >
              
              {/* Wizard Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/2">
                <div>
                  <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-400" />
                    {wizardMode === 'create' ? 'Schedule New Community Event' : 'Modify Scheduled Event'}
                  </h3>
                  <p className="text-[10px] text-text-muted mt-0.5">Fill out all sections to initialize the program.</p>
                </div>
                <button 
                  onClick={() => setIsWizardOpen(false)}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Wizard Progress Steps Timeline */}
              <div className="p-4 bg-[#120739] border-b border-white/5 flex items-center justify-between">
                {steps.map((st, i) => (
                  <div key={i} className="flex items-center flex-1 last:flex-none">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all ${
                        wizardStep === st.number 
                          ? 'bg-purple-650 text-white border-purple-500' 
                          : wizardStep > st.number
                          ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/25'
                          : 'bg-white/5 text-white/40 border-white/5'
                      }`}>
                        {wizardStep > st.number ? <Check size={10} /> : st.number}
                      </span>
                      <span className={`text-[10px] font-bold hidden sm:inline ${wizardStep === st.number ? 'text-white' : 'text-text-muted'}`}>
                        {st.title}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`h-[1px] flex-1 mx-4 transition-colors ${wizardStep > st.number ? 'bg-emerald-500/20' : 'bg-white/5'}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Wizard Content Scroll Frame */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                
                {/* STEP 1: Basic Details */}
                {wizardStep === 1 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5 col-span-2">
                        <label className="text-[10px] font-black uppercase text-purple-200">Event Title <span className="text-rose-400">*</span></label>
                        <input 
                          type="text" 
                          placeholder="e.g. Annual Grand Conference 2026"
                          required
                          value={formValues.title}
                          onChange={(e) => setFormValues(f => ({ ...f, title: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs"
                        />
                      </div>
                      <div className="space-y-1.5 col-span-2">
                        <label className="text-[10px] font-black uppercase text-purple-200">Subtitle / Tagline</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Promoting harmony and social alignment"
                          value={formValues.subtitle}
                          onChange={(e) => setFormValues(f => ({ ...f, subtitle: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-purple-200">Category</label>
                        <select 
                          value={formValues.category}
                          onChange={(e) => setFormValues(f => ({ ...f, category: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-[#160b37] border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs"
                        >
                          <option value="Cultural">🎭 Cultural</option>
                          <option value="Education">📚 Education</option>
                          <option value="Matrimonial">💍 Matrimonial</option>
                          <option value="Health">🏥 Health</option>
                          <option value="Sports">🏆 Sports</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-purple-200">Search Tags (Comma separated)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Cultural, Meeting, Awards"
                          value={formValues.tags}
                          onChange={(e) => setFormValues(f => ({ ...f, tags: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs"
                        />
                      </div>
                      <div className="space-y-1.5 col-span-2">
                        <label className="text-[10px] font-black uppercase text-purple-200">Event Description</label>
                        <textarea 
                          rows="4"
                          placeholder="Detailed announcement content..."
                          value={formValues.description}
                          onChange={(e) => setFormValues(f => ({ ...f, description: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs resize-none"
                        />
                      </div>
                      <div className="space-y-1.5 col-span-2">
                        <label className="text-[10px] font-black uppercase text-purple-200">Event Banner URL</label>
                        <input 
                          type="text" 
                          placeholder="https://images.unsplash.com/photo-..."
                          value={formValues.bannerImage}
                          onChange={(e) => setFormValues(f => ({ ...f, bannerImage: e.target.value, thumbnailImage: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Venue */}
                {wizardStep === 2 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-purple-200">Venue Type</label>
                        <select 
                          value={formValues.venueType}
                          onChange={(e) => setFormValues(f => ({ ...f, venueType: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-[#160b37] border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs"
                        >
                          <option value="Offline">📍 Offline Address</option>
                          <option value="Online">💻 Virtual link</option>
                          <option value="Hybrid">🤝 Hybrid Mode</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-purple-200">City</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Indore"
                          value={formValues.city}
                          onChange={(e) => setFormValues(f => ({ ...f, city: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs"
                        />
                      </div>
                      <div className="space-y-1.5 col-span-2">
                        <label className="text-[10px] font-black uppercase text-purple-200">Address / Video Link</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Samaj Bhawan, Indore"
                          value={formValues.address}
                          onChange={(e) => setFormValues(f => ({ ...f, address: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs"
                        />
                      </div>
                      <div className="space-y-1.5 col-span-2">
                        <label className="text-[10px] font-black uppercase text-purple-200">Google Maps URL</label>
                        <input 
                          type="text" 
                          placeholder="e.g. https://maps.google.com/?q=..."
                          value={formValues.googleMapsLink}
                          onChange={(e) => setFormValues(f => ({ ...f, googleMapsLink: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-purple-200">Latitude Coordinates</label>
                        <input 
                          type="text" 
                          placeholder="22.7196"
                          value={formValues.latitude}
                          onChange={(e) => setFormValues(f => ({ ...f, latitude: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-purple-200">Longitude Coordinates</label>
                        <input 
                          type="text" 
                          placeholder="75.8577"
                          value={formValues.longitude}
                          onChange={(e) => setFormValues(f => ({ ...f, longitude: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Schedule */}
                {wizardStep === 3 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-purple-200">Start Date & Time</label>
                        <input 
                          type="datetime-local" 
                          value={formValues.startDate}
                          onChange={(e) => setFormValues(f => ({ ...f, startDate: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-[#160b37] border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-purple-200">End Date & Time</label>
                        <input 
                          type="datetime-local" 
                          value={formValues.endDate}
                          onChange={(e) => setFormValues(f => ({ ...f, endDate: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-[#160b37] border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs"
                        />
                      </div>
                      <div className="space-y-1.5 col-span-2">
                        <label className="text-[10px] font-black uppercase text-purple-200">Registration RSVP Deadline</label>
                        <input 
                          type="datetime-local" 
                          value={formValues.registrationDeadline}
                          onChange={(e) => setFormValues(f => ({ ...f, registrationDeadline: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-[#160b37] border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-purple-200">Display Time Label</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 10:00 AM - 6:00 PM"
                          value={formValues.timings}
                          onChange={(e) => setFormValues(f => ({ ...f, timings: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-purple-200">Timezone</label>
                        <input 
                          type="text" 
                          value={formValues.timezone}
                          onChange={(e) => setFormValues(f => ({ ...f, timezone: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Registration */}
                {wizardStep === 4 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-purple-200">Total Seat Capacity</label>
                        <input 
                          type="number" 
                          value={formValues.capacity}
                          onChange={(e) => setFormValues(f => ({ ...f, capacity: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-purple-200">Waitlist Threshold</label>
                        <input 
                          type="number" 
                          value={formValues.waitlistLimit}
                          onChange={(e) => setFormValues(f => ({ ...f, waitlistLimit: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-purple-200">Max Guest per RSVP</label>
                        <input 
                          type="number" 
                          value={formValues.guestLimit}
                          onChange={(e) => setFormValues(f => ({ ...f, guestLimit: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs"
                        />
                      </div>
                      <div className="space-y-1.5 flex items-center justify-between p-4 bg-white/2 rounded-xl border border-white/5">
                        <div>
                          <p className="text-xs font-bold text-white">RSVP Approval Required</p>
                          <p className="text-[9px] text-text-muted mt-0.5">Admin must approve members manually.</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={formValues.isRSVPRequired}
                          onChange={(e) => setFormValues(f => ({ ...f, isRSVPRequired: e.target.checked }))}
                          className="rounded accent-purple-500 w-4.5 h-4.5 cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-purple-200">Ticket Type</label>
                        <select 
                          value={formValues.ticketType}
                          onChange={(e) => setFormValues(f => ({ ...f, ticketType: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-[#160b37] border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs"
                        >
                          <option value="Free">Free Entry</option>
                          <option value="Paid">Paid Ticket</option>
                        </select>
                      </div>
                      {formValues.ticketType === 'Paid' && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-purple-200">Ticket Price (INR)</label>
                          <input 
                            type="number" 
                            value={formValues.ticketPrice}
                            onChange={(e) => setFormValues(f => ({ ...f, ticketPrice: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs"
                          />
                        </div>
                      )}
                      <div className="space-y-1.5 col-span-2">
                        <label className="text-[10px] font-black uppercase text-purple-200">Instructions & Guidelines (Semicolon separated)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Carry ID card; Arrive 15 min early"
                          value={formValues.terms}
                          onChange={(e) => setFormValues(f => ({ ...f, terms: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: Review & Publish */}
                {wizardStep === 5 && (
                  <div className="space-y-4 animate-fade-in text-xs">
                    <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-3.5">
                      <div className="flex gap-4">
                        <div className="w-24 h-16 rounded-xl overflow-hidden bg-white/5 border border-white/10">
                          {formValues.bannerImage ? (
                            <img src={formValues.bannerImage} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white">
                              🎭
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[9px] uppercase font-black">
                            {formValues.category}
                          </span>
                          <h4 className="text-sm font-black text-white mt-1">{formValues.title || 'Untitled Event'}</h4>
                          <p className="text-[10px] text-text-muted mt-0.5">{formValues.subtitle}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5 pt-3 border-t border-white/5 text-[11px]">
                        <div>
                          <p className="text-text-muted font-bold uppercase tracking-wider text-[9px]">Location Venue</p>
                          <p className="text-white mt-0.5">{formValues.address} ({formValues.city})</p>
                        </div>
                        <div>
                          <p className="text-text-muted font-bold uppercase tracking-wider text-[9px]">Scheduled Timing</p>
                          <p className="text-white mt-0.5">{formValues.startDate ? new Date(formValues.startDate).toLocaleString() : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-text-muted font-bold uppercase tracking-wider text-[9px]">RSVP Capacity</p>
                          <p className="text-white mt-0.5">{formValues.capacity} Seats (Waitlist: {formValues.waitlistLimit})</p>
                        </div>
                        <div>
                          <p className="text-text-muted font-bold uppercase tracking-wider text-[9px]">Ticket Type</p>
                          <p className="text-white mt-0.5">{formValues.ticketType === 'Free' ? 'Free Admission' : `Paid (INR ${formValues.ticketPrice})`}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Wizard Footer controls */}
              <div className="p-4 border-t border-white/5 flex items-center justify-between bg-white/2">
                <button 
                  disabled={wizardStep === 1}
                  onClick={() => setWizardStep(s => Math.max(1, s - 1))}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-wider border border-white/5 cursor-pointer"
                >
                  Previous
                </button>
                
                {wizardStep < 5 ? (
                  <button 
                    onClick={() => setWizardStep(s => Math.min(5, s + 1))}
                    className="px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-purple-500/15"
                  >
                    Next Step
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleWizardSubmit(false)}
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider border border-white/10 transition-all"
                    >
                      Save Draft
                    </button>
                    <button 
                      onClick={() => handleWizardSubmit(true)}
                      className="px-5 py-2.5 rounded-xl bg-purple-650 hover:bg-purple-600 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-purple-500/25 border border-purple-500/30"
                    >
                      Publish Event
                    </button>
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── EVENT DETAILS DRAWER (SIDE PANEL) ─── */}
      <AnimatePresence>
        {isDrawerOpen && selectedEvent && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-all duration-300"
              onClick={() => setIsDrawerOpen(false)}
            />
            {/* Slide Drawer Content */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 max-w-xl w-full bg-gradient-to-b from-[#0f072e] to-[#1e0f49] shadow-2xl z-50 border-l border-white/10 flex flex-col overflow-hidden text-xs"
            >
              
              {/* Drawer Brand Header */}
              <div className="p-5 border-b border-white/5 bg-white/2 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/10 border border-purple-500/20 text-purple-300">
                    {selectedEvent.category}
                  </span>
                  <h3 className="text-base font-black text-white leading-tight mt-1">
                    {selectedEvent.titleEn || selectedEvent.title}
                  </h3>
                  <p className="text-[10px] text-text-muted mt-0.5 flex items-center gap-1"><MapPin size={10} /> {selectedEvent.venue}</p>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Tabs Selectors */}
              <div className="bg-[#120739] px-4 border-b border-white/5 flex overflow-x-auto no-scrollbar font-bold">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'registrations', label: 'Registrations' },
                  { id: 'gallery', label: 'Gallery' },
                  { id: 'announcements', label: 'Announcements' },
                  { id: 'audit', label: 'Audit Logs' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setDrawerTab(t.id)}
                    className={`px-4 py-3 shrink-0 text-[10px] uppercase border-b-2 tracking-wider transition-colors ${
                      drawerTab === t.id 
                        ? 'border-purple-500 text-white' 
                        : 'border-transparent text-purple-250 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Drawer Tab Scroll Panel */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                
                {/* DRAWER TAB: Overview */}
                {drawerTab === 'overview' && (
                  <div className="space-y-4 animate-fade-in text-[11px] leading-relaxed text-purple-100">
                    
                    {/* Media Image banner */}
                    {selectedEvent.image && (
                      <div className="w-full h-40 rounded-2xl overflow-hidden border border-white/5 shadow-inner">
                        <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="card-neo p-4 space-y-3 border border-white/5">
                      <h4 className="font-black text-white text-[12px]">Event Description</h4>
                      <p>{selectedEvent.description || 'No description provided for this Samaj event. Inquire with local coordinators.'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="card-neo p-4 border border-white/5 space-y-1.5">
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-wider">Start Date</p>
                        <p className="font-bold text-white text-[12px]">{selectedEvent.date}</p>
                        <p className="text-[10px] text-purple-200">{selectedEvent.time}</p>
                      </div>

                      <div className="card-neo p-4 border border-white/5 space-y-1.5">
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-wider">RSVP Capacity</p>
                        <p className="font-bold text-white text-[12px]">{selectedEvent.capacity} Available</p>
                        <p className="text-[10px] text-purple-200">Registered: {(selectedEvent.registrations || []).length}</p>
                      </div>
                    </div>

                    {/* Terms */}
                    {selectedEvent.termsAndInstructions && selectedEvent.termsAndInstructions.length > 0 && (
                      <div className="card-neo p-4 border border-white/5 space-y-2">
                        <h4 className="font-black text-white text-[12px]">Important Instructions</h4>
                        <ul className="list-disc pl-4 space-y-1">
                          {selectedEvent.termsAndInstructions.map((term, index) => (
                            <li key={index}>{term}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                  </div>
                )}

                {/* DRAWER TAB: Registrations Desk */}
                {drawerTab === 'registrations' && (
                  <div className="space-y-4 animate-fade-in">
                    
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white">Registered Participants ({(selectedEvent.registrations || []).length})</h4>
                      
                      {/* PDF/Print list */}
                      <button 
                        onClick={() => window.print()}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-bold text-white uppercase transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Printer size={10} /> Print Roster
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                      {(selectedEvent.registrations || []).length === 0 ? (
                        <p className="text-center text-text-muted py-8 bg-white/2 border border-white/5 rounded-2xl">
                          No registrations recorded for this event.
                        </p>
                      ) : (
                        (selectedEvent.registrations || []).map((reg) => (
                          <div key={reg.id} className="p-3 rounded-xl bg-white/3 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px]">
                            
                            {/* Member info */}
                            <div className="flex items-center gap-2.5">
                              <Avatar initials={reg.name.split(' ').map(n=>n[0]).join('')} size="sm" color="bg-purple-650 text-white font-bold" />
                              <div>
                                <h5 className="font-black text-white">{reg.name}</h5>
                                <p className="text-[10px] text-text-muted mt-0.5">{reg.phone} • {reg.role || 'Member'}</p>
                              </div>
                            </div>

                            {/* Status controls */}
                            <div className="flex items-center gap-2">
                              {reg.status === 'Pending Approval' ? (
                                <div className="flex items-center gap-1.5">
                                  <button 
                                    onClick={() => {
                                      updateRegistrationStatus(selectedEventId, reg.id, 'Approved');
                                      triggerToast(`Approved RSVP for ${reg.name}`);
                                    }}
                                    className="p-1 rounded bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 active:scale-95 transition-all"
                                    title="Approve"
                                  >
                                    <Check size={12} />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      updateRegistrationStatus(selectedEventId, reg.id, 'Rejected');
                                      triggerToast(`Rejected RSVP for ${reg.name}`);
                                    }}
                                    className="p-1 rounded bg-rose-500/20 hover:bg-rose-550 text-rose-355 hover:text-white border border-rose-500/20 active:scale-95 transition-all"
                                    title="Reject"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ) : (
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                  reg.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-455 border border-rose-500/20'
                                }`}>
                                  {reg.status}
                                </span>
                              )}

                              {/* Attendance Check-in Toggle */}
                              {reg.status === 'Approved' && (
                                <select
                                  value={reg.attendance || 'Registered'}
                                  onChange={(e) => {
                                    updateAttendanceStatus(selectedEventId, reg.id, e.target.value);
                                    triggerToast(`Marked ${reg.name} as ${e.target.value}`);
                                  }}
                                  className="px-2 py-0.5 bg-[#160b37] border border-white/10 rounded text-[9px] outline-none text-purple-250 focus:border-brand-primary"
                                >
                                  <option value="Registered">Registered</option>
                                  <option value="Checked In">Checked In</option>
                                  <option value="Late">Late Arrival</option>
                                  <option value="Absent">Absent</option>
                                </select>
                              )}
                            </div>

                          </div>
                        ))
                      )}
                    </div>

                  </div>
                )}

                {/* DRAWER TAB: Gallery Management */}
                {drawerTab === 'gallery' && (
                  <div className="space-y-4 animate-fade-in">
                    
                    {/* Drag & Drop Visual Block */}
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`p-6 border-2 border-dashed rounded-2xl text-center transition-all ${
                        dragActive 
                          ? 'border-purple-400 bg-purple-500/5' 
                          : 'border-white/10 bg-white/2 hover:border-white/20'
                      }`}
                    >
                      <UploadCloud className="mx-auto text-purple-400/60 mb-2" size={28} />
                      <p className="text-xs font-bold text-white">Drag & drop files here to upload</p>
                      <p className="text-[10px] text-text-muted mt-0.5">Supports images, videos, and documents up to 20MB</p>
                      
                      <div className="mt-3 flex items-center justify-center gap-2">
                        <select 
                          value={uploadType}
                          onChange={(e) => setUploadType(e.target.value)}
                          className="px-2 py-1 bg-[#160b37] border border-white/10 rounded text-[10px]"
                        >
                          <option value="Photo">📷 Photo</option>
                          <option value="Video">🎥 Video</option>
                          <option value="Document">📄 Document</option>
                        </select>
                        <input 
                          type="file" 
                          id="file-upload" 
                          className="hidden" 
                          onChange={triggerManualUpload} 
                        />
                        <label 
                          htmlFor="file-upload"
                          className="px-3 py-1 bg-purple-650 hover:bg-purple-600 text-white rounded text-[10px] font-bold cursor-pointer transition-all"
                        >
                          Choose File
                        </label>
                      </div>
                    </div>

                    {/* Media Gallery items */}
                    <h4 className="font-bold text-white pt-2">Gallery Assets ({(selectedEvent.gallery || []).length})</h4>
                    <div className="grid grid-cols-2 gap-3.5 max-h-[300px] overflow-y-auto pr-1">
                      {(selectedEvent.gallery || []).length === 0 ? (
                        <p className="col-span-2 text-center text-text-muted py-6">
                          No media uploads in the event album.
                        </p>
                      ) : (
                        (selectedEvent.gallery || []).map((item) => (
                          <div key={item.id} className="card-neo p-2.5 border border-white/5 space-y-2 relative group text-[10px]">
                            {item.fileType === 'Photo' ? (
                              <div className="w-full h-24 rounded-lg overflow-hidden bg-black/20">
                                <img src={item.fileUrl} alt={item.fileName} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-full h-24 rounded-lg bg-[#201449] flex flex-col items-center justify-center text-purple-250">
                                {item.fileType === 'Video' ? <Video size={20} /> : <File size={20} />}
                                <span className="mt-1 truncate max-w-[80px] font-bold">{item.fileName}</span>
                              </div>
                            )}
                            <p className="font-bold text-white truncate">{item.caption}</p>
                            
                            <button 
                              onClick={() => {
                                deleteGalleryItem(selectedEventId, item.id);
                                triggerToast('Gallery media removed');
                              }}
                              className="absolute top-2 right-2 p-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white border border-rose-450/20 active:scale-95 transition-all opacity-0 group-hover:opacity-100 duration-200 shadow-md"
                              title="Delete Item"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                  </div>
                )}

                {/* DRAWER TAB: Announcements Notice Composer */}
                {drawerTab === 'announcements' && (
                  <div className="space-y-4 animate-fade-in">
                    
                    <form onSubmit={handleBroadcastAnnouncement} className="space-y-3.5 card-neo p-4 border border-white/5">
                      <h4 className="font-bold text-white flex items-center gap-1.5"><Info size={14} className="text-purple-400" /> Write Important Notice</h4>
                      <textarea 
                        rows="4"
                        placeholder="Write updates, scheduling alterations, or venue directions here... This broadcasts to all registered members of this community."
                        required
                        value={newNotice}
                        onChange={(e) => setNewNotice(e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white resize-none"
                      />
                      <div className="flex justify-end">
                        <button 
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-brand-primary text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 hover:bg-purple-650 transition-all border border-purple-500/20"
                        >
                          <Share2 size={12} /> Broadcast Update
                        </button>
                      </div>
                    </form>

                    {/* Announcements List */}
                    <h4 className="font-bold text-white pt-2">Notice History ({(selectedEvent.announcements || []).length})</h4>
                    <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                      {(selectedEvent.announcements || []).length === 0 ? (
                        <p className="text-center text-text-muted py-6">
                          No circular notices broadcasted yet.
                        </p>
                      ) : (
                        (selectedEvent.announcements || []).map((ann) => (
                          <div key={ann.id} className="p-3.5 rounded-xl bg-white/3 border border-white/5 space-y-1.5 text-[11px]">
                            <div className="flex items-center justify-between text-[9px] text-text-muted font-bold">
                              <span>By: {ann.author}</span>
                              <span>Published</span>
                            </div>
                            <p className="text-white leading-relaxed">{ann.content}</p>
                          </div>
                        ))
                      )}
                    </div>

                  </div>
                )}

                {/* DRAWER TAB: Audit Logs */}
                {drawerTab === 'audit' && (
                  <div className="space-y-4 animate-fade-in text-[11px]">
                    <h4 className="font-bold text-white flex items-center gap-1.5"><History size={14} className="text-purple-400" /> Administrative Action Audits</h4>
                    
                    <div className="relative border-l border-white/10 pl-4 ml-2 space-y-5 py-2">
                      {(selectedEvent.auditLogs || []).length === 0 ? (
                        <p className="text-text-muted py-4 pl-2">No audits logged.</p>
                      ) : (
                        (selectedEvent.auditLogs || []).map((log) => (
                          <div key={log.id} className="relative space-y-1.5">
                            
                            {/* Bullet indicator */}
                            <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-purple-500 border-2 border-[#160b37] shadow" />
                            
                            <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-bold">
                              <span className="text-white">{log.action}</span>
                              <span className="text-text-muted">{new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-purple-200">
                              <strong className="text-amber-400 font-medium">Performed by:</strong> {log.performedBy}
                            </p>
                            
                            {log.newValue && (
                              <div className="p-2 rounded bg-white/2 border border-white/5 font-mono text-[9px] text-purple-300 break-all overflow-x-auto whitespace-pre-wrap">
                                {log.newValue}
                              </div>
                            )}

                          </div>
                        ))
                      )}
                    </div>

                  </div>
                )}

              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default EventManagement;
