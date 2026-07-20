import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Plus, Search, Filter, Edit, Trash2, CheckCircle, XCircle, 
  UploadCloud, X, ChevronLeft, ChevronRight, Download, Printer, 
  Clock, MapPin, Users, Check, Share2, FileText, Settings, AlertCircle, 
  Eye, Video, Image, File, History, Sparkles, TrendingUp, BarChart3, 
  HelpCircle, ShieldAlert, ListFilter, Copy, Play, Info, Heart, Star,
  BookOpen, CalendarDays, BarChart2
} from 'lucide-react';
import { headEventService } from '../../../../core/api/headEventService';
import { Avatar } from '../../../member/components/common/Avatar';

// Configuration presets for categories
const categoryConfig = {
  Cultural: { label: 'Cultural', emoji: '🎭', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', gradient: 'from-purple-500/20 to-indigo-500/10' },
  Education: { label: 'Education', emoji: '📚', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', gradient: 'from-blue-500/20 to-cyan-500/10' },
  Matrimonial: { label: 'Matrimonial', emoji: '💍', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', gradient: 'from-pink-500/20 to-rose-500/10' },
  Health: { label: 'Health', emoji: '🏥', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', gradient: 'from-emerald-500/20 to-teal-500/10' },
  Sports: { label: 'Sports', emoji: '🏆', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', gradient: 'from-orange-500/20 to-amber-500/10' },
};

const statusConfig = {
  Draft: { label: 'Draft', color: 'bg-amber-500/10 text-amber-450 border border-amber-500/20' },
  Published: { label: 'Published', color: 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' },
  'Registration Open': { label: 'Registration Open', color: 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' },
  'Registration Closed': { label: 'Registration Closed', color: 'bg-rose-500/10 text-rose-455 border border-rose-500/20' },
  'Event Live': { label: 'Event Live', color: 'bg-blue-500/10 text-blue-450 border border-blue-500/20' },
  Completed: { label: 'Completed', color: 'bg-gray-500/10 text-gray-400 border border-white/5' },
  Cancelled: { label: 'Cancelled', color: 'bg-rose-500/10 text-rose-455 border border-rose-500/20' }
};

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'all', label: 'All Events', icon: CalendarDays },
  { id: 'create', label: 'Create Event', icon: Plus },
  { id: 'monitoring', label: 'Event Monitoring', icon: ShieldAlert },
  { id: 'analytics', label: 'Event Analytics', icon: TrendingUp }
];

export const EventManagement = () => {
  // Localized user state from session storage / window
  const currentUser = useMemo(() => {
    try {
      const stored = sessionStorage.getItem('user');
      return stored ? JSON.parse(stored) : { name: 'Community Head', community: 'My Community' };
    } catch {
      return { name: 'Community Head', community: 'My Community' };
    }
  }, []);

  // Primary State Flags
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') || 'overview';
  const activeTab = ['overview', 'all', 'create', 'monitoring', 'analytics'].includes(rawTab) ? rawTab : 'overview';
  const [toast, setToast] = useState(null);
  
  // Data states
  const [events, setEvents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Attendees list drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [interested, setInterested] = useState([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);

  // Create wizard fields
  const [wizardStep, setWizardStep] = useState(1);
  const [formValues, setFormValues] = useState({
    title: '', subtitle: '', category: 'Cultural', description: '', image: '',
    venue: '', address: '', city: '', startDate: '', time: '', entryFee: 'Free',
    contact: '', objectiveEn: '', programsEn: '', audienceEn: '', importantInfoEn: '', tags: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const triggerToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Fetch events list
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await headEventService.getEvents();
      setEvents(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch events.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch monitoring logs
  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await headEventService.getMonitoringLogs();
      setLogs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await headEventService.getAnalytics();
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchAnalytics();
    fetchLogs();
  }, []);

  useEffect(() => {
    if (activeTab === 'all') fetchEvents();
    if (activeTab === 'monitoring') fetchLogs();
    if (activeTab === 'analytics') fetchAnalytics();
  }, [activeTab]);

  // Handle Tab changes
  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  // Fetch attendees detail drawer
  const openAttendeesDrawer = async (evt) => {
    setSelectedEventDetails(evt);
    setDrawerOpen(true);
    setAttendeesLoading(true);
    try {
      const resAttendees = await headEventService.getAttendees(evt._id || evt.id);
      const resInterested = await headEventService.getInterested(evt._id || evt.id);
      setAttendees(resAttendees.data || []);
      setInterested(resInterested.data || []);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to load attendees', 'error');
    } finally {
      setAttendeesLoading(false);
    }
  };

  // Create event submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await headEventService.createEvent(formValues);
      triggerToast('Event created successfully');
      setFormValues({
        title: '', subtitle: '', category: 'Cultural', description: '', image: '',
        venue: '', address: '', city: '', startDate: '', time: '', entryFee: 'Free',
        contact: '', objectiveEn: '', programsEn: '', audienceEn: '', importantInfoEn: '', tags: ''
      });
      setWizardStep(1);
      setActiveTab('all');
      fetchEvents();
      fetchAnalytics();
    } catch (err) {
      console.error(err);
      triggerToast('Failed to create event', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete event
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate/delete this event?')) return;
    try {
      await headEventService.deleteEvent(id);
      triggerToast('Event deleted successfully');
      fetchEvents();
      fetchAnalytics();
    } catch (err) {
      triggerToast('Failed to delete event', 'error');
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (id) => {
    try {
      await headEventService.toggleFeatured(id);
      triggerToast('Featured status updated successfully');
      fetchEvents();
      fetchAnalytics();
    } catch (err) {
      triggerToast('Failed to update featured status', 'error');
    }
  };

  // Change Status
  const handleStatusChange = async (id, status) => {
    try {
      await headEventService.updateStatus(id, status);
      triggerToast(`Status updated to ${status}`);
      fetchEvents();
      fetchAnalytics();
    } catch (err) {
      triggerToast('Failed to update status', 'error');
    }
  };

  // Filters computed events
  const filteredEvents = useMemo(() => {
    let list = [...events];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e => 
        e.title?.toLowerCase().includes(q) ||
        e.venue?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== 'all') {
      list = list.filter(e => e.category === categoryFilter);
    }
    if (statusFilter !== 'all') {
      list = list.filter(e => e.status === statusFilter);
    }
    return list;
  }, [events, searchQuery, categoryFilter, statusFilter]);

  const paginatedEvents = useMemo(() => {
    const itemsPerPage = 8;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEvents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEvents, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / 8));

  return (
    <div className="space-y-6 pb-12 text-slate-100 max-w-7xl mx-auto p-4 md:p-6">
      
      {/* ─── TOAST NOTIFICATION ─── */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-55 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border backdrop-blur-md ${
              toast.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            <CheckCircle size={18} />
            <span className="text-xs font-black tracking-wide">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header widget */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-6 rounded-3xl border border-white/10">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Calendar className="text-brand-primary" />
            Event Management
          </h1>
          <p className="text-xs text-purple-200/60 font-semibold mt-1">
            Community isolation active. Managing events for: <span className="text-white font-bold">{currentUser.community}</span>
          </p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center overflow-x-auto gap-1 border-b border-white/10 pb-px scrollbar-hide">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-black text-xs transition-all whitespace-nowrap ${
                isActive 
                  ? 'border-brand-primary text-brand-primary' 
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        
        {/* ─── OVERVIEW TAB ─── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {analyticsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(n => <div key={n} className="h-28 bg-white/5 rounded-3xl animate-pulse" />)}
              </div>
            ) : analytics ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Events', val: analytics.totalEvents, icon: Calendar },
                    { label: 'Upcoming Events', val: analytics.upcomingEvents, icon: Clock },
                    { label: 'Featured Events', val: analytics.featuredEvents, icon: Star },
                    { label: 'Total Attendees', val: analytics.totalAttendees, icon: Users },
                    { label: 'Total Interested', val: analytics.totalInterested, icon: Heart },
                    { label: 'Created by This Head', val: analytics.createdByThisHead, icon: Plus }
                  ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <div key={i} className="p-5 border border-white/10 rounded-3xl bg-white/5 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase text-purple-200/60 tracking-wider">{s.label}</span>
                          <h3 className="text-2xl font-black mt-2 text-white">{s.val}</h3>
                        </div>
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                          <Icon className="text-brand-primary" size={20} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Popular rankings */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-xs font-black uppercase text-purple-200 tracking-wider mb-4">🏆 Most Attended Community Events</h3>
                  {analytics.popularEvents?.length > 0 ? (
                    <div className="space-y-3.5">
                      {analytics.popularEvents.map((e, idx) => (
                        <div key={e.id} className="flex items-center justify-between p-3 border border-white/5 bg-white/3 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-purple-500/10 text-brand-primary border border-purple-500/20 flex items-center justify-center font-black text-xs">{idx + 1}</span>
                            <span className="text-xs font-bold text-white">{e.title}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] font-bold text-purple-200">
                            <span className="text-emerald-400">{e.attendees} Attending</span>
                            <span className="text-pink-400">{e.interested} Interested</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-white/40 italic">No events recorded.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-xs text-white/40">No statistics logged.</div>
            )}
          </div>
        )}

        {/* ─── ALL EVENTS TAB ─── */}
        {activeTab === 'all' && (
          <div className="space-y-6">
            {/* Search & filters bar */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search community events..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs outline-none focus:border-brand-primary focus:bg-white/10 transition-all text-white font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs outline-none text-white font-semibold focus:border-brand-primary"
                >
                  <option value="all" className="bg-[#160b37]">All Categories</option>
                  {Object.keys(categoryConfig).map(k => <option key={k} value={k} className="bg-[#160b37]">{k}</option>)}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs outline-none text-white font-semibold focus:border-brand-primary"
                >
                  <option value="all" className="bg-[#160b37]">All Statuses</option>
                  {Object.keys(statusConfig).map(k => <option key={k} value={k} className="bg-[#160b37]">{k}</option>)}
                </select>
              </div>
            </div>

            {/* List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(n => <div key={n} className="h-16 bg-white/5 rounded-2xl animate-pulse" />)}
              </div>
            ) : filteredEvents.length > 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/3 border-b border-white/5 text-[10px] font-black uppercase tracking-wider text-purple-200">
                        <th className="px-6 py-4">Event Details</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Engagement</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs text-purple-200">
                      {paginatedEvents.map(ev => {
                        const cat = categoryConfig[ev.category] || categoryConfig.Cultural;
                        const stat = statusConfig[ev.status] || statusConfig.Draft;
                        return (
                          <tr key={ev._id} className="hover:bg-white/3 transition-all">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {ev.image ? (
                                  <img src={ev.image} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center font-bold text-base shrink-0">{cat.emoji}</div>
                                )}
                                <div>
                                  <h4 className="font-extrabold text-white line-clamp-1">{ev.title}</h4>
                                  <div className="flex items-center gap-2 mt-1 text-[10px] text-white/40">
                                    <span>{ev.date}</span>
                                    <span>•</span>
                                    <span>{ev.venue}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${stat.color}`}>
                                {ev.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3 text-[10px] font-bold text-purple-200/60">
                                <span className="text-emerald-400">Attendees: {ev.attendees?.length || 0}</span>
                                <span className="text-pink-400">Interested: {ev.interested?.length || 0}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => openAttendeesDrawer(ev)}
                                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-purple-200 hover:text-white"
                                  title="View Attendees Roster"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  onClick={() => handleToggleFeatured(ev._id)}
                                  className={`w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center transition-colors ${
                                    ev.isFeatured ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-white/40 hover:text-amber-400'
                                  }`}
                                  title="Toggle Featured"
                                >
                                  <Star size={14} fill={ev.isFeatured ? 'currentColor' : 'none'} />
                                </button>
                                <select
                                  value={ev.status}
                                  onChange={(e) => handleStatusChange(ev._id, e.target.value)}
                                  className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] outline-none font-bold text-purple-200"
                                >
                                  {Object.keys(statusConfig).map(k => <option key={k} value={k} className="bg-[#160b37]">{k}</option>)}
                                </select>
                                <button
                                  onClick={() => handleDelete(ev._id)}
                                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-rose-400 hover:bg-rose-500/10"
                                  title="Delete Event"
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

                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between bg-white/2">
                    <span className="text-[10px] text-white/40 font-bold">Page {currentPage} of {totalPages}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(c => c - 1)}
                        className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center disabled:opacity-50"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(c => c + 1)}
                        className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center disabled:opacity-50"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 bg-white/5 border border-white/10 rounded-3xl">
                <p className="text-xs text-white/40">No events found matching current filter sets.</p>
              </div>
            )}
          </div>
        )}

        {/* ─── CREATE EVENT TAB ─── */}
        {activeTab === 'create' && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="text-sm font-black uppercase text-purple-200">Scheduled Event Form</h3>
                <p className="text-[10px] text-purple-200/50 mt-1">Automatic binding to community: {currentUser.community}</p>
              </div>
              <span className="text-xs font-black text-brand-primary">Wizard Step {wizardStep} of 2</span>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-6 text-xs font-bold text-purple-200">
              {wizardStep === 1 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-purple-200/60 tracking-wider">Event Title *</label>
                      <input
                        type="text" required
                        value={formValues.title}
                        onChange={e => setFormValues({ ...formValues, title: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none text-white focus:border-brand-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-purple-200/60 tracking-wider">Event Category *</label>
                      <select
                        value={formValues.category}
                        onChange={e => setFormValues({ ...formValues, category: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none text-white focus:border-brand-primary"
                      >
                        {Object.keys(categoryConfig).map(k => <option key={k} value={k} className="bg-[#160b37]">{k}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-purple-200/60 tracking-wider">Banner/Image URL</label>
                    <input
                      type="text"
                      placeholder="e.g. https://images.unsplash.com/photo-..."
                      value={formValues.image}
                      onChange={e => setFormValues({ ...formValues, image: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none text-white focus:border-brand-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-purple-200/60 tracking-wider">Description *</label>
                    <textarea
                      required rows={4}
                      value={formValues.description}
                      onChange={e => setFormValues({ ...formValues, description: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none text-white focus:border-brand-primary text-xs font-normal"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-purple-200/60 tracking-wider">Start Date *</label>
                      <input
                        type="text" required placeholder="e.g. Jul 15, 2026"
                        value={formValues.startDate}
                        onChange={e => setFormValues({ ...formValues, startDate: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none text-white focus:border-brand-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-purple-200/60 tracking-wider">Time *</label>
                      <input
                        type="text" required placeholder="e.g. 07:00 PM"
                        value={formValues.time}
                        onChange={e => setFormValues({ ...formValues, time: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none text-white focus:border-brand-primary"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="px-6 py-2.5 bg-brand-primary text-white text-xs font-black rounded-xl"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-purple-200/60 tracking-wider">Venue Name *</label>
                      <input
                        type="text" required
                        value={formValues.venue}
                        onChange={e => setFormValues({ ...formValues, venue: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none text-white focus:border-brand-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-purple-200/60 tracking-wider">Address / Location</label>
                      <input
                        type="text"
                        value={formValues.address}
                        onChange={e => setFormValues({ ...formValues, address: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none text-white focus:border-brand-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-purple-200/60 tracking-wider">Entry Fee</label>
                      <input
                        type="text"
                        value={formValues.entryFee}
                        onChange={e => setFormValues({ ...formValues, entryFee: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none text-white focus:border-brand-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-purple-200/60 tracking-wider">Contact Number</label>
                      <input
                        type="text"
                        value={formValues.contact}
                        onChange={e => setFormValues({ ...formValues, contact: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none text-white focus:border-brand-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-purple-200/60 tracking-wider">Programs & Events Schedule</label>
                    <textarea
                      placeholder="List scheduled programs..." rows={3}
                      value={formValues.programsEn}
                      onChange={e => setFormValues({ ...formValues, programsEn: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none text-white focus:border-brand-primary text-xs font-normal"
                    />
                  </div>

                  <div className="flex justify-between pt-4 gap-4">
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="px-6 py-2.5 border border-white/10 text-white text-xs rounded-xl"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 bg-brand-primary text-white text-xs font-black rounded-xl disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Submit Event'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}

        {/* ─── EVENT MONITORING TAB ─── */}
        {activeTab === 'monitoring' && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h3 className="text-sm font-black text-white mb-6">Activity Timeline</h3>
            {logsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(n => <div key={n} className="h-12 bg-white/5 rounded-2xl animate-pulse" />)}
              </div>
            ) : logs.length > 0 ? (
              <div className="relative border-l border-white/10 pl-6 space-y-6">
                {logs.map(log => (
                  <div key={log.id} className="relative">
                    <span className="absolute left-[-30px] top-1 w-4 h-4 rounded-full border-2 border-brand-primary bg-[#160b37]" />
                    <div className="bg-white/3 p-4 border border-white/5 rounded-2xl">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-white">{log.actor}</span>
                          <span className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] font-black uppercase text-purple-200/50">{log.role}</span>
                        </div>
                        <span className="text-[10px] text-white/40 font-semibold">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-xs font-bold text-brand-primary mt-2">{log.action}</p>
                      <p className="text-xs text-purple-200 mt-1 font-medium">{log.description}</p>
                      <p className="text-[10px] text-white/40 mt-2 font-semibold">Event: {log.eventTitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-xs text-white/40">No activity logged for your community events.</div>
            )}
          </div>
        )}

        {/* ─── EVENT ANALYTICS TAB ─── */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {analyticsLoading ? (
              <div className="h-64 bg-white/5 rounded-3xl animate-pulse" />
            ) : analytics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category counts */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                  <h3 className="text-xs font-black uppercase text-purple-200 tracking-wider">🎭 Category-wise Event Counts</h3>
                  <div className="space-y-3 pt-2">
                    {analytics.categoryDistribution?.map(c => (
                      <div key={c.category} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-white">
                          <span>{c.category}</span>
                          <span>{c.count} Events</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-brand-primary rounded-full" 
                            style={{ width: `${Math.min(100, (c.count / analytics.totalEvents) * 100)}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular listings details */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                  <h3 className="text-xs font-black uppercase text-purple-200 tracking-wider">🌟 Popularity Statistics</h3>
                  <div className="space-y-3">
                    {analytics.popularEvents?.map((pe, i) => (
                      <div key={pe.id} className="p-3 border border-white/5 bg-white/2 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-white">{pe.title}</p>
                          <p className="text-[10px] text-white/40 mt-0.5">Attendee Conversion Rate</p>
                        </div>
                        <span className="text-xs font-black text-brand-primary">{pe.attendees} Joined</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-xs text-white/40">No analytics aggregated.</div>
            )}
          </div>
        )}

      </div>

      {/* ─── ATTENDEES ROSTER DRAWER ─── */}
      <AnimatePresence>
        {drawerOpen && selectedEventDetails && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-[#160b37] border-l border-white/10 h-full shadow-2xl flex flex-col z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/2">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Attendees Roster</h3>
                  <p className="text-[10px] text-white/40 mt-0.5">{selectedEventDetails.title}</p>
                </div>
                <button 
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Drawer Body Scroll */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {attendeesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(n => <div key={n} className="h-12 bg-white/5 rounded-2xl animate-pulse" />)}
                  </div>
                ) : (
                  <>
                    {/* Attending roster */}
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-black uppercase text-purple-200 tracking-wider">Attending Members ({attendees.length})</h4>
                      {attendees.length > 0 ? (
                        <div className="space-y-3">
                          {attendees.map(a => (
                            <div key={a.id} className="flex items-center justify-between p-3 border border-white/5 bg-white/2 rounded-2xl">
                              <div className="flex items-center gap-3">
                                <Avatar imageUrl={a.avatar} initials={a.initials} size="sm" />
                                <div>
                                  <p className="text-xs font-extrabold text-white">{a.name}</p>
                                  <p className="text-[9px] text-white/40 mt-0.5">Gotra: {a.gotra}</p>
                                </div>
                              </div>
                              <div className="text-right text-[10px] font-bold text-purple-200">
                                <p>{a.phone}</p>
                                <p className="text-white/40 font-semibold">{a.email}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-white/40 italic">No attendees signed up yet.</p>
                      )}
                    </div>

                    {/* Interested roster */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <h4 className="text-[11px] font-black uppercase text-purple-200 tracking-wider">Interested Members ({interested.length})</h4>
                      {interested.length > 0 ? (
                        <div className="space-y-3">
                          {interested.map(a => (
                            <div key={a.id} className="flex items-center justify-between p-3 border border-white/5 bg-white/2 rounded-2xl">
                              <div className="flex items-center gap-3">
                                <Avatar imageUrl={a.avatar} initials={a.initials} size="sm" />
                                <div>
                                  <p className="text-xs font-extrabold text-white">{a.name}</p>
                                  <p className="text-[9px] text-white/40 mt-0.5">Gotra: {a.gotra}</p>
                                </div>
                              </div>
                              <div className="text-right text-[10px] font-bold text-purple-200">
                                <p>{a.phone}</p>
                                <p className="text-white/40 font-semibold">{a.email}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-white/40 italic">No interested members logged.</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default EventManagement;
