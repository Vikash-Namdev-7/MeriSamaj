import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Search, Filter, Edit, Trash2, CheckCircle, XCircle, 
  X, ChevronLeft, ChevronRight, Clock, MapPin, Users, Heart,
  Sparkles, TrendingUp, BarChart3, HelpCircle, ShieldAlert, 
  Copy, Play, Info, Eye, ExternalLink, Bookmark, CheckSquare,
  AlertTriangle, Star, RefreshCw, Plus
} from 'lucide-react';
import { adminEventService } from '../../../../core/api/adminEventService';
import { axiosPrivate } from '../../../../core/api/axiosPrivate';
import { Avatar } from '../../../member/components/common/Avatar';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'all', label: 'All Events', icon: Calendar },
  { id: 'create', label: 'Create Event', icon: Plus },
  { id: 'monitoring', label: 'Event Monitoring', icon: ShieldAlert },
  { id: 'featured', label: 'Featured Events', icon: Star },
  { id: 'analytics', label: 'Event Analytics', icon: TrendingUp }
];

const categoryConfig = {
  Cultural: { label: 'Cultural', emoji: '🎭', color: 'text-purple-600 bg-purple-50 border-purple-100' },
  Education: { label: 'Education', emoji: '📚', color: 'text-blue-600 bg-blue-50 border-blue-100' },
  Matrimonial: { label: 'Matrimonial', emoji: '💍', color: 'text-pink-600 bg-pink-50 border-pink-100' },
  Health: { label: 'Health', emoji: '🏥', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  Sports: { label: 'Sports', emoji: '🏆', color: 'text-orange-600 bg-orange-50 border-orange-100' },
};

const statusConfig = {
  Upcoming: { label: 'Upcoming', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  Ongoing: { label: 'Ongoing', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  Completed: { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  Cancelled: { label: 'Cancelled', color: 'bg-rose-50 text-rose-700 border-rose-100' },
  Inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-600 border-gray-200' }
};

export const EventsDesk = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') || 'overview';
  const activeTab = ['overview', 'all', 'create', 'monitoring', 'featured', 'analytics'].includes(rawTab) ? rawTab : 'overview';

  // Create wizard states
  const [wizardStep, setWizardStep] = useState(1);
  const [formValues, setFormValues] = useState({
    title: '', subtitle: '', category: 'Cultural', description: '', image: '',
    venue: '', address: '', city: '', startDate: '', time: '', entryFee: 'Free',
    contact: '', objectiveEn: '', programsEn: '', audienceEn: '', importantInfoEn: '', tags: '',
    isGlobal: true, communityId: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Data states
  const [events, setEvents] = useState([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [communities, setCommunities] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [logs, setLogs] = useState([]);

  // Loading & error states
  const [loading, setLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter states
  const [search, setSearch] = useState('');
  const [communityFilter, setCommunityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');

  // Modal / Drawer States
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '', subtitle: '', category: 'Cultural', description: '', venue: '', startDate: '', time: '', entryFee: '', contact: '',
    objectiveEn: '', audienceEn: '', importantInfoEn: '', tags: '', isFeatured: false, status: 'Upcoming'
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Show dynamic toast alert
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  // Fetch communities for filtering
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const res = await axiosPrivate.get('/admin/communities');
        setCommunities(res.data.data || []);
      } catch (err) {
        console.error('Failed to load communities', err);
      }
    };
    fetchCommunities();
  }, []);

  // Fetch events list
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search,
        communityId: communityFilter,
        category: categoryFilter,
        status: statusFilter,
        isFeatured: featuredFilter
      };
      const res = await adminEventService.getAllEvents(params);
      setEvents(res.data || []);
      setTotalEvents(res.total || 0);
      setTotalPages(res.pages || 1);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch events listing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'all' || activeTab === 'featured') {
      fetchEvents();
    }
  }, [currentPage, activeTab, communityFilter, categoryFilter, statusFilter, featuredFilter]);

  // Fetch analytics
  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await adminEventService.getAnalytics();
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab]);

  // Fetch logs
  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await adminEventService.getMonitoringLogs();
      setLogs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'monitoring') {
      fetchLogs();
    }
  }, [activeTab]);

  // Get single event details
  const viewEventDetails = async (id) => {
    try {
      setSelectedEventId(id);
      const res = await adminEventService.getEventById(id);
      setSelectedEventDetails(res.data);
      setDetailDrawerOpen(true);
    } catch (err) {
      showToast('Failed to load event details', 'error');
    }
  };

  // Open Edit Form
  const openEditModal = (eventItem) => {
    setEditForm({
      title: eventItem.title || '',
      subtitle: eventItem.titleEn || '',
      category: eventItem.category || 'Cultural',
      description: eventItem.description || '',
      venue: eventItem.venue || '',
      startDate: eventItem.date || '',
      time: eventItem.time || '',
      entryFee: eventItem.entryFee || 'Free',
      contact: eventItem.contact || '',
      objectiveEn: eventItem.objectiveEn || '',
      audienceEn: eventItem.audienceEn || '',
      importantInfoEn: eventItem.importantInfoEn || '',
      tags: Array.isArray(eventItem.tagsEn) ? eventItem.tagsEn.join(', ') : '',
      isFeatured: !!eventItem.isFeatured,
      status: eventItem.status || 'Upcoming'
    });
    setSelectedEventId(eventItem._id || eventItem.id);
    setEditModalOpen(true);
  };

  // Submit Create Form
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const mappedTags = formValues.tags.split(',').map(t => t.trim()).filter(Boolean);
      const payload = {
        ...formValues,
        tagsEn: mappedTags,
        titleEn: formValues.subtitle,
        communityId: formValues.isGlobal ? null : formValues.communityId
      };
      await adminEventService.createEvent(payload);
      showToast('Event created successfully');
      setFormValues({
        title: '', subtitle: '', category: 'Cultural', description: '', image: '',
        venue: '', address: '', city: '', startDate: '', time: '', entryFee: 'Free',
        contact: '', objectiveEn: '', programsEn: '', audienceEn: '', importantInfoEn: '', tags: '',
        isGlobal: true, communityId: ''
      });
      setWizardStep(1);
      setSearchParams({ tab: 'all' });
      fetchEvents();
      fetchAnalytics();
    } catch (err) {
      showToast('Failed to create event', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit Form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const mappedTags = editForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      const updatedData = {
        ...editForm,
        tagsEn: mappedTags,
        titleEn: editForm.subtitle,
      };
      await adminEventService.updateEvent(selectedEventId, updatedData);
      showToast('Event updated successfully');
      setEditModalOpen(false);
      fetchEvents();
      fetchAnalytics();
    } catch (err) {
      showToast('Failed to update event', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Featured Status
  const handleToggleFeatured = async (id, currentStatus) => {
    try {
      await adminEventService.toggleFeatured(id, !currentStatus);
      showToast(`Event successfully ${!currentStatus ? 'featured' : 'unfeatured'}`);
      fetchEvents();
      fetchAnalytics();
    } catch (err) {
      showToast('Failed to update featured status', 'error');
    }
  };

  // Change Event Status
  const handleChangeStatus = async (id, newStatus) => {
    try {
      await adminEventService.updateStatus(id, newStatus);
      showToast(`Event status updated to ${newStatus}`);
      fetchEvents();
      fetchAnalytics();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  // Delete Event
  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate/delete this event?')) return;
    try {
      await adminEventService.deleteEvent(id);
      showToast('Event deactivated successfully');
      fetchEvents();
      fetchAnalytics();
    } catch (err) {
      showToast('Failed to delete event', 'error');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* ─── TOAST NOTIFICATION ─── */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-white font-bold text-xs ${
              toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Event Management</h1>
          <p className="text-xs text-gray-500 font-semibold mt-1">Monitor, feature, and analyze events across all communities.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              fetchEvents();
              fetchAnalytics();
              fetchLogs();
            }}
            className="p-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 rounded-xl transition-all active:scale-95 shadow-sm"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Tabs list bar */}
      <div className="flex items-center overflow-x-auto gap-1 border-b border-gray-200 pb-px scrollbar-hide">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-black text-xs transition-all whitespace-nowrap ${
                isActive 
                  ? 'border-brand-primary text-brand-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content tabs */}
      <div className="space-y-6">
        
        {/* ─── TAB 1: OVERVIEW ─── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {analyticsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="h-28 bg-gray-100 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : analytics ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Events', val: analytics.totalEvents, color: 'text-purple-600 bg-purple-500/5 border-purple-100' },
                    { label: 'Featured Events', val: analytics.featuredEvents, color: 'text-amber-600 bg-amber-500/5 border-amber-100' },
                    { label: 'Total Attendees', val: analytics.totalAttendees, color: 'text-emerald-600 bg-emerald-500/5 border-emerald-100' },
                    { label: 'Interested Users', val: analytics.totalInterested, color: 'text-pink-600 bg-pink-500/5 border-pink-100' },
                    { label: 'Avg Attendees', val: `${analytics.avgAttendees} / Event`, color: 'text-blue-600 bg-blue-500/5 border-blue-100' },
                    { label: 'Created This Month', val: analytics.createdThisMonth, color: 'text-orange-600 bg-orange-500/5 border-orange-100' }
                  ].map((s, i) => (
                    <div key={i} className={`p-5 border rounded-3xl flex flex-col justify-between bg-white shadow-[0_2px_12px_rgba(0,0,0,0.01)] ${s.color}`}>
                      <span className="text-[10px] font-black uppercase tracking-wider opacity-80">{s.label}</span>
                      <span className="text-2xl font-black mt-2">{s.val}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Top Popular Events by RSVP Attendees */}
                  <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-xs font-black uppercase text-gray-500 tracking-wider mb-4">🏆 Most Attended Events</h3>
                    <div className="space-y-4">
                      {analytics.popularEvents?.map((e, idx) => (
                        <div key={e.id} className="flex items-center justify-between p-3 border border-gray-50 rounded-2xl hover:bg-gray-50/50 transition-all">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs">{idx + 1}</span>
                            <span className="text-xs font-bold text-gray-800">{e.title}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500">
                            <span className="flex items-center gap-1 text-emerald-600"><CheckSquare size={13} /> {e.attendees} Joined</span>
                            <span className="flex items-center gap-1 text-pink-600"><Heart size={13} /> {e.interested} Interested</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Popular Events by Interest */}
                  <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-xs font-black uppercase text-gray-500 tracking-wider mb-4">🔥 Most Interested Events</h3>
                    <div className="space-y-4">
                      {analytics.mostInterestedEvents?.map((e, idx) => (
                        <div key={e.id} className="flex items-center justify-between p-3 border border-gray-50 rounded-2xl hover:bg-gray-50/50 transition-all">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center font-black text-xs">{idx + 1}</span>
                            <span className="text-xs font-bold text-gray-800">{e.title}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500">
                            <span className="flex items-center gap-1 text-emerald-600"><CheckSquare size={13} /> {e.attendees} Joined</span>
                            <span className="flex items-center gap-1 text-pink-600"><Heart size={13} /> {e.interested} Interested</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-xs text-gray-400">No overview data available.</div>
            )}
          </div>
        )}

        {/* ─── TAB 2: ALL EVENTS ─── */}
        {activeTab === 'all' && (
          <div className="space-y-6">
            
            {/* Search & Advanced Filters */}
            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by title, organizer, or venue..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs outline-none focus:border-brand-primary focus:bg-white transition-all text-gray-800 font-semibold"
                  />
                </div>
                <button 
                  onClick={fetchEvents}
                  className="px-5 py-2.5 bg-brand-primary text-white font-black text-xs rounded-2xl active:scale-95 transition-all shadow-md shadow-purple-500/10"
                >
                  Search
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Community filter */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Community</label>
                  <select 
                    value={communityFilter} 
                    onChange={e => { setCommunityFilter(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none font-semibold text-gray-800"
                  >
                    <option value="all">All Communities</option>
                    {communities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Category filter */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Category</label>
                  <select 
                    value={categoryFilter} 
                    onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none font-semibold text-gray-800"
                  >
                    <option value="all">All Categories</option>
                    {Object.keys(categoryConfig).map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>

                {/* Status filter */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</label>
                  <select 
                    value={statusFilter} 
                    onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none font-semibold text-gray-800"
                  >
                    <option value="all">All Statuses</option>
                    {Object.keys(statusConfig).map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>

                {/* Featured filter */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Featured</label>
                  <select 
                    value={featuredFilter} 
                    onChange={e => { setFeaturedFilter(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none font-semibold text-gray-800"
                  >
                    <option value="all">All Featured</option>
                    <option value="true">Featured</option>
                    <option value="false">Non-Featured</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Events Grid/Table List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(n => <div key={n} className="h-16 bg-gray-50 rounded-2xl animate-pulse" />)}
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-white border border-rose-100 rounded-3xl">
                <p className="text-xs font-bold text-rose-600">{error}</p>
                <button onClick={fetchEvents} className="mt-4 px-4 py-2 bg-brand-primary text-white text-xs rounded-xl">Retry</button>
              </div>
            ) : events.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/70 border-b border-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-500">
                        <th className="px-6 py-4">Event Details</th>
                        <th className="px-6 py-4">Community</th>
                        <th className="px-6 py-4">Organizer</th>
                        <th className="px-6 py-4">RSVP Counts</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                      {events.map(ev => {
                        const cat = categoryConfig[ev.category] || categoryConfig.Cultural;
                        const stat = statusConfig[ev.status] || statusConfig.Upcoming;
                        return (
                          <tr key={ev._id || ev.id} className="hover:bg-gray-50/50 transition-all">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {ev.image ? (
                                  <img src={ev.image} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center font-bold text-base shrink-0">{cat.emoji}</div>
                                )}
                                <div>
                                  <h4 className="font-extrabold text-gray-900 line-clamp-1">{ev.title}</h4>
                                  <div className="flex items-center gap-2 mt-1 text-[10px] font-semibold text-gray-400">
                                    <span>{ev.date}</span>
                                    <span>•</span>
                                    <span>{ev.venue}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-900">{ev.communityId?.name || 'Global'}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Avatar initials={ev.organizer?.initials || 'SP'} size="xs" />
                                <span className="font-semibold text-gray-800">{ev.organizer?.name || 'Samaj Head'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500">
                                <span className="flex items-center gap-1 text-emerald-600"><CheckSquare size={13} /> {ev.attendees || 0} Joined</span>
                                <span className="flex items-center gap-1 text-pink-600"><Heart size={13} /> {ev.interested || 0} Interested</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${stat.color}`}>
                                {ev.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button 
                                  onClick={() => viewEventDetails(ev._id || ev.id)}
                                  className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                  <Eye size={14} />
                                </button>
                                <button 
                                  onClick={() => openEditModal(ev)}
                                  className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                  <Edit size={14} />
                                </button>
                                <button 
                                  onClick={() => handleToggleFeatured(ev._id || ev.id, ev.isFeatured)}
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                    ev.isFeatured ? 'bg-amber-50 text-amber-500 hover:bg-amber-100' : 'bg-gray-50 text-gray-400 hover:text-amber-500'
                                  }`}
                                >
                                  <Star size={14} fill={ev.isFeatured ? 'currentColor' : 'none'} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteEvent(ev._id || ev.id)}
                                  className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                    <p className="text-[11px] text-gray-400 font-bold">Page {currentPage} of {totalPages}</p>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-50"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-50"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 bg-white border border-gray-200 rounded-3xl">
                <p className="text-xs font-bold text-gray-400">No events found matching filters.</p>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: CREATE EVENT ─── */}
        {activeTab === 'create' && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-sm font-black uppercase text-gray-900">Create Event</h3>
                <p className="text-[10px] text-gray-400 mt-1">Admin Panel global event scheduler</p>
              </div>
              <span className="text-xs font-black text-brand-primary">Step {wizardStep} of 2</span>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-6 text-xs font-bold text-gray-700">
              {wizardStep === 1 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-gray-400 tracking-wider">Event Title *</label>
                      <input
                        type="text" required
                        value={formValues.title}
                        onChange={e => setFormValues({ ...formValues, title: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-55 border border-gray-200 rounded-xl outline-none text-xs font-semibold text-gray-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-gray-400 tracking-wider">Event Category *</label>
                      <select
                        value={formValues.category}
                        onChange={e => setFormValues({ ...formValues, category: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-55 border border-gray-200 rounded-xl outline-none text-xs font-semibold text-gray-800"
                      >
                        {Object.keys(categoryConfig).map(k => <option key={k} value={k}>{k}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-gray-400 tracking-wider">Banner/Image URL</label>
                    <input
                      type="text"
                      placeholder="e.g. https://images.unsplash.com/photo-..."
                      value={formValues.image}
                      onChange={e => setFormValues({ ...formValues, image: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-55 border border-gray-200 rounded-xl outline-none text-xs font-semibold text-gray-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-gray-400 tracking-wider">Description *</label>
                    <textarea
                      required rows={4}
                      value={formValues.description}
                      onChange={e => setFormValues({ ...formValues, description: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-55 border border-gray-200 rounded-xl outline-none text-xs font-medium text-gray-700"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-gray-400 tracking-wider">Start Date *</label>
                      <input
                        type="text" required placeholder="e.g. Jul 15, 2026"
                        value={formValues.startDate}
                        onChange={e => setFormValues({ ...formValues, startDate: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-55 border border-gray-200 rounded-xl outline-none text-xs font-semibold text-gray-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-gray-400 tracking-wider">Time *</label>
                      <input
                        type="text" required placeholder="e.g. 07:00 PM"
                        value={formValues.time}
                        onChange={e => setFormValues({ ...formValues, time: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-55 border border-gray-200 rounded-xl outline-none text-xs font-semibold text-gray-800"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="px-6 py-2.5 bg-brand-primary text-white text-xs font-black rounded-xl hover:bg-brand-primary/95 transition-all shadow-md shadow-purple-500/10"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Community & Scope Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-gray-400 tracking-wider">Global Visibility (Show to All Communities) *</label>
                      <select
                        value={formValues.isGlobal ? 'true' : 'false'}
                        onChange={e => setFormValues({ ...formValues, isGlobal: e.target.value === 'true' })}
                        className="w-full px-4 py-2.5 bg-gray-55 border border-gray-200 rounded-xl outline-none text-xs font-semibold text-gray-800"
                      >
                        <option value="true">Yes (Global Event)</option>
                        <option value="false">No (Specific Community Only)</option>
                      </select>
                    </div>

                    {!formValues.isGlobal && (
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-gray-400 tracking-wider">Target Community *</label>
                        <select
                          required
                          value={formValues.communityId}
                          onChange={e => setFormValues({ ...formValues, communityId: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-55 border border-gray-200 rounded-xl outline-none text-xs font-semibold text-gray-800"
                        >
                          <option value="">Select a community</option>
                          {communities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-gray-400 tracking-wider">Venue Name *</label>
                      <input
                        type="text" required
                        value={formValues.venue}
                        onChange={e => setFormValues({ ...formValues, venue: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-55 border border-gray-200 rounded-xl outline-none text-xs font-semibold text-gray-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-gray-400 tracking-wider">Address / Location</label>
                      <input
                        type="text"
                        value={formValues.address}
                        onChange={e => setFormValues({ ...formValues, address: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-55 border border-gray-200 rounded-xl outline-none text-xs font-semibold text-gray-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-gray-400 tracking-wider">Entry Fee</label>
                      <input
                        type="text"
                        value={formValues.entryFee}
                        onChange={e => setFormValues({ ...formValues, entryFee: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-55 border border-gray-200 rounded-xl outline-none text-xs font-semibold text-gray-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-gray-400 tracking-wider">Contact Number</label>
                      <input
                        type="text"
                        value={formValues.contact}
                        onChange={e => setFormValues({ ...formValues, contact: e.target.value })}
                        className="w-full px-4 py-2.5 bg-gray-55 border border-gray-200 rounded-xl outline-none text-xs font-semibold text-gray-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-gray-400 tracking-wider">Programs & Events Schedule</label>
                    <textarea
                      placeholder="List scheduled programs..." rows={3}
                      value={formValues.programsEn}
                      onChange={e => setFormValues({ ...formValues, programsEn: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-55 border border-gray-200 rounded-xl outline-none text-xs font-normal text-gray-700"
                    />
                  </div>

                  <div className="flex justify-between pt-4 gap-4">
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="px-6 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-505 text-xs rounded-xl"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 bg-brand-primary text-white text-xs font-black rounded-xl disabled:opacity-50 hover:bg-brand-primary/95 transition-all shadow-md shadow-purple-500/10"
                    >
                      {submitting ? 'Submitting...' : 'Submit Event'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}

        {/* ─── TAB 3: EVENT MONITORING (AUDIT LOGS) ─── */}
        {activeTab === 'monitoring' && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 mb-6">Activity Logs Timeline</h3>
            
            {logsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(n => <div key={n} className="h-12 bg-gray-50 rounded-2xl animate-pulse" />)}
              </div>
            ) : logs.length > 0 ? (
              <div className="relative border-l border-gray-200 pl-6 space-y-6">
                {logs.map((log) => (
                  <div key={log.id} className="relative">
                    {/* Circle marker */}
                    <span className="absolute left-[-30px] top-1 w-4 h-4 rounded-full border-2 border-brand-primary bg-white flex items-center justify-center" />
                    
                    <div className="bg-gray-50/50 p-4 border border-gray-100 rounded-2xl">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-gray-900">{log.actor}</span>
                          <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[8px] font-black uppercase text-gray-400">{log.role}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-semibold">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-xs font-bold text-brand-primary mt-2">{log.action}</p>
                      <p className="text-xs text-gray-600 mt-1 font-medium">{log.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] font-semibold text-gray-400">
                        <span>Event: {log.eventTitle}</span>
                        <span>•</span>
                        <span>Community: {log.communityName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-xs text-gray-400">No event activity logged yet.</div>
            )}
          </div>
        )}

        {/* ─── TAB 4: FEATURED EVENTS ─── */}
        {activeTab === 'featured' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
              <h3 className="text-sm font-black text-gray-900">Featured Events Registry</h3>
              <p className="text-xs text-gray-500 mt-1">Manage event priorities to adjust their sort ordering in the member panel.</p>
            </div>

            {loading ? (
              <div className="h-32 bg-gray-50 rounded-3xl animate-pulse" />
            ) : events.filter(e => e.isFeatured).length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/70 border-b border-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-500">
                        <th className="px-6 py-4">Event</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Featured Priority</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                      {events.filter(e => e.isFeatured).map(ev => (
                        <tr key={ev._id || ev.id} className="hover:bg-gray-50/50 transition-all">
                          <td className="px-6 py-4 font-bold text-gray-900">{ev.title}</td>
                          <td className="px-6 py-4 font-semibold text-gray-600">{ev.category}</td>
                          <td className="px-6 py-4 font-bold text-brand-primary">Priority Level {ev.featuredPriority || 0}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleToggleFeatured(ev._id || ev.id, true)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg border border-rose-100 transition-colors"
                            >
                              Remove Feature
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white border border-gray-200 rounded-3xl">
                <p className="text-xs font-bold text-gray-400">No featured events found.</p>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 5: EVENT ANALYTICS ─── */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {analyticsLoading ? (
              <div className="h-64 bg-gray-100 rounded-3xl animate-pulse" />
            ) : analytics ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category Distribution chart proxy */}
                  <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase text-gray-500 tracking-wider">🎭 Category-wise Event Distribution</h3>
                    <div className="space-y-3 pt-2">
                      {analytics.categoryDistribution?.map(c => (
                        <div key={c.category} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-gray-800">
                            <span>{c.category}</span>
                            <span>{c.count} Events</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-brand-primary rounded-full" 
                              style={{ width: `${Math.min(100, (c.count / analytics.totalEvents) * 100)}%` }} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Community Engagement comparison */}
                  <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase text-gray-500 tracking-wider">🏢 Community Event Engagement</h3>
                    <div className="space-y-3.5 pt-2">
                      {analytics.communityWise?.map(comm => (
                        <div key={comm.communityId} className="p-3 border border-gray-50 rounded-2xl hover:bg-gray-50/50 transition-all">
                          <div className="flex justify-between items-center text-xs font-bold text-gray-900 mb-1.5">
                            <span>{comm.communityName}</span>
                            <span className="text-[11px] text-gray-400 font-semibold">{comm.totalEvents} Events</span>
                          </div>
                          <div className="flex gap-4 text-[10px] font-bold text-gray-500">
                            <span className="text-emerald-600">Attendees: {comm.totalAttendees}</span>
                            <span className="text-pink-600">Interested: {comm.totalInterested}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-xs text-gray-400">No analytics data available.</div>
            )}
          </div>
        )}

      </div>

      {/* ─── DETAILED DRAWER (EVENT DETAIL & ATTENDEES VIEW) ─── */}
      <AnimatePresence>
        {detailDrawerOpen && selectedEventDetails && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailDrawerOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Event Details</h2>
                <button 
                  onClick={() => setDetailDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Drawer Body Scroll */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Event Cover Image */}
                {selectedEventDetails.image && (
                  <img src={selectedEventDetails.image} alt="" className="w-full h-44 rounded-3xl object-cover border border-gray-100 shadow-sm" />
                )}

                {/* Event Details Content */}
                <div className="space-y-4">
                  <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-100">
                    {selectedEventDetails.category}
                  </span>
                  <h3 className="text-lg font-black text-gray-900 leading-snug mt-1">{selectedEventDetails.title}</h3>
                  
                  <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-50 py-4 text-xs font-bold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Clock size={15} className="text-gray-400" />
                      <span>{selectedEventDetails.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={15} className="text-gray-400" />
                      <span>{selectedEventDetails.venue}</span>
                    </div>
                  </div>
                </div>

                {/* About event description */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-wider">About the Event</h4>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">{selectedEventDetails.description}</p>
                </div>

                {/* Organizer details */}
                <div className="space-y-3 bg-gray-50/50 p-4 border border-gray-100 rounded-3xl">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Organizer</h4>
                  <div className="flex items-center gap-3">
                    <Avatar initials={selectedEventDetails.organizer?.initials || 'SP'} size="md" />
                    <div>
                      <p className="text-xs font-black text-gray-900">{selectedEventDetails.organizer?.name || 'Samaj Head'}</p>
                      <p className="text-[9px] font-semibold text-gray-400 uppercase mt-0.5">{selectedEventDetails.organizer?.role || 'Community Head'}</p>
                    </div>
                  </div>
                </div>

                {/* Detailed Attendees List */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Joined Attendees ({selectedEventDetails.attendeeProfiles?.length || 0})</h4>
                  {selectedEventDetails.attendeeProfiles && selectedEventDetails.attendeeProfiles.length > 0 ? (
                    <div className="space-y-3.5">
                      {selectedEventDetails.attendeeProfiles.map(att => (
                        <div key={att.id} className="flex items-center justify-between p-3 border border-gray-50 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <Avatar imageUrl={att.avatar} initials={att.initials} size="sm" />
                            <div>
                              <p className="text-xs font-extrabold text-gray-900">{att.name}</p>
                              <p className="text-[9px] font-semibold text-gray-400 mt-0.5">Gotra: {att.gotra}</p>
                            </div>
                          </div>
                          <div className="text-right text-[10px] font-bold text-gray-500">
                            <p>{att.phone}</p>
                            <p className="text-gray-400 font-semibold">{att.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No attendees registered yet.</p>
                  )}
                </div>

                {/* Detailed Interested Users List */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Interested Users ({selectedEventDetails.interestedProfiles?.length || 0})</h4>
                  {selectedEventDetails.interestedProfiles && selectedEventDetails.interestedProfiles.length > 0 ? (
                    <div className="space-y-3.5">
                      {selectedEventDetails.interestedProfiles.map(att => (
                        <div key={att.id} className="flex items-center justify-between p-3 border border-gray-50 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <Avatar imageUrl={att.avatar} initials={att.initials} size="sm" />
                            <div>
                              <p className="text-xs font-extrabold text-gray-900">{att.name}</p>
                              <p className="text-[9px] font-semibold text-gray-400 mt-0.5">Gotra: {att.gotra}</p>
                            </div>
                          </div>
                          <div className="text-right text-[10px] font-bold text-gray-500">
                            <p>{att.phone}</p>
                            <p className="text-gray-400 font-semibold">{att.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No interested users logged.</p>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── EDIT MODAL ─── */}
      <AnimatePresence>
        {editModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Edit Event Details</h3>
                <button onClick={() => setEditModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
                  <X size={15} />
                </button>
              </div>

              {/* Form Scroll */}
              <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-bold text-gray-700">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gray-400">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-xs font-semibold text-gray-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gray-400">Subtitle / Title En</label>
                  <input
                    type="text"
                    value={editForm.subtitle}
                    onChange={e => setEditForm({ ...editForm, subtitle: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-xs font-semibold text-gray-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gray-400">Category *</label>
                    <select
                      value={editForm.category}
                      onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-semibold text-gray-800"
                    >
                      {Object.keys(categoryConfig).map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gray-400">Status *</label>
                    <select
                      value={editForm.status}
                      onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-semibold text-gray-800"
                    >
                      {Object.keys(statusConfig).map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gray-400">Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={editForm.description}
                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-brand-primary text-xs font-medium text-gray-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gray-400">Venue *</label>
                    <input
                      type="text"
                      required
                      value={editForm.venue}
                      onChange={e => setEditForm({ ...editForm, venue: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-semibold text-gray-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gray-400">Date *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Jul 15, 2026"
                      value={editForm.startDate}
                      onChange={e => setEditForm({ ...editForm, startDate: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-semibold text-gray-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gray-400">Time</label>
                    <input
                      type="text"
                      placeholder="e.g., 07:00 PM"
                      value={editForm.time}
                      onChange={e => setEditForm({ ...editForm, time: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-semibold text-gray-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gray-400">Entry Fee</label>
                    <input
                      type="text"
                      value={editForm.entryFee}
                      onChange={e => setEditForm({ ...editForm, entryFee: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-semibold text-gray-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-gray-400">Contact Number</label>
                  <input
                    type="text"
                    value={editForm.contact}
                    onChange={e => setEditForm({ ...editForm, contact: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-semibold text-gray-800"
                  />
                </div>

                {/* Action buttons */}
                <div className="border-t border-gray-100 pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-3 rounded-xl bg-brand-primary text-white transition-all disabled:opacity-50 shadow-md shadow-purple-500/10"
                  >
                    {actionLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default EventsDesk;
