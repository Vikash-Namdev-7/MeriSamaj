import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Search, Filter, Edit, Trash2, X, ChevronLeft, ChevronRight, 
  Clock, MapPin, Users, Heart, Plus, Eye, AlertTriangle, CheckCircle, 
  XCircle, RefreshCw, Globe, Shield, UserCheck, Layers
} from 'lucide-react';
import { adminEventService } from '../../../../core/api/adminEventService';
import { axiosPrivate } from '../../../../core/api/axiosPrivate';

export const EventsDesk = () => {
  // Data states
  const [events, setEvents] = useState([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [analytics, setAnalytics] = useState(null);
  const [communities, setCommunities] = useState([]);

  // Filter states
  const [search, setSearch] = useState('');
  const [communityFilter, setCommunityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Loading & error
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Modal / Drawer States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);
  const [responseFilterTab, setResponseFilterTab] = useState('ALL'); // 'ALL' | 'INTERESTED' | 'GOING' | 'NOT_GOING'

  // Form State
  const [formValues, setFormValues] = useState({
    title: '', description: '', category: 'Cultural', venue: '', address: '',
    startDate: '', startTime: '', endTime: '', contact: '', entryFee: 'Free',
    capacity: 0, registrationRequired: false, isFeatured: false,
    visibility: 'GLOBAL', communityId: '', status: 'Published', image: ''
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch Communities for filtering
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

  // Fetch Real Analytics
  const fetchAnalytics = async () => {
    try {
      const res = await adminEventService.getAnalytics();
      setAnalytics(res.data);
    } catch (err) {
      console.error('Analytics load error', err);
    }
  };

  // Fetch Events Listing
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
        status: statusFilter
      };
      const res = await adminEventService.getAllEvents(params);
      setEvents(res.data || []);
      setTotalEvents(res.total || 0);
      setTotalPages(res.pages || 1);
    } catch (err) {
      console.error(err);
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchAnalytics();
  }, [currentPage, communityFilter, categoryFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEvents();
  };

  // Create Event Handler
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formValues.title || !formValues.description || !formValues.venue || !formValues.startDate) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const payload = {
        ...formValues,
        communityId: formValues.visibility === 'COMMUNITY' && formValues.communityId ? formValues.communityId : null
      };
      await adminEventService.createEvent(payload);
      showToast('Event created successfully!');
      setCreateModalOpen(false);
      resetForm();
      fetchEvents();
      fetchAnalytics();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create event.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Edit Event Handler
  const openEditModal = (event) => {
    setSelectedEventId(event._id || event.id);
    setFormValues({
      title: event.title || '',
      description: event.description || '',
      category: event.category || 'Cultural',
      venue: event.venue || '',
      address: event.address || '',
      startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : (event.date || ''),
      startTime: event.startTime || event.time || '',
      endTime: event.endTime || '',
      contact: event.contact || '',
      entryFee: event.entryFee || 'Free',
      capacity: event.capacity || 0,
      registrationRequired: !!event.registrationRequired,
      isFeatured: !!event.isFeatured,
      visibility: event.visibility || 'GLOBAL',
      communityId: event.communityId?._id || event.communityId || '',
      status: event.status || 'Published',
      image: event.image || ''
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...formValues,
        communityId: formValues.visibility === 'COMMUNITY' && formValues.communityId ? formValues.communityId : null
      };
      await adminEventService.updateEvent(selectedEventId, payload);
      showToast('Event updated successfully!');
      setEditModalOpen(false);
      resetForm();
      fetchEvents();
      fetchAnalytics();
    } catch (err) {
      showToast('Failed to update event.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Actions
  const handleCancelEvent = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this event?')) return;
    try {
      await adminEventService.cancelEvent(id);
      showToast('Event marked as Cancelled.');
      fetchEvents();
      fetchAnalytics();
    } catch (err) {
      showToast('Failed to cancel event.', 'error');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event? This action is irreversible.')) return;
    try {
      await adminEventService.deleteEvent(id);
      showToast('Event deleted successfully.');
      fetchEvents();
      fetchAnalytics();
    } catch (err) {
      showToast('Failed to delete event.', 'error');
    }
  };

  const handleToggleStatus = async (event) => {
    const nextStatus = event.status === 'Published' ? 'Draft' : 'Published';
    try {
      await adminEventService.updateStatus(event._id || event.id, nextStatus);
      showToast(`Event status updated to ${nextStatus}.`);
      fetchEvents();
    } catch (err) {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleViewDetails = async (id) => {
    if (!id) return;
    const strId = id.toString();
    setSelectedEventId(strId);
    setDetailDrawerOpen(true);
    setEventDetails(null);
    setResponseFilterTab('ALL');

    const matched = events.find(e => (e._id?.toString() || e.id?.toString()) === strId);
    try {
      const res = await adminEventService.getEventById(strId);
      const data = res.data || matched || { _id: strId, title: 'Event Details' };
      const responsesList = data?.memberResponses || [];
      const calcInterested = responsesList.filter(r => r.isInterested || r.response === 'Interested').length;
      const calcGoing = responsesList.filter(r => r.isGoing || r.registered || r.response === 'Going').length;

      setEventDetails({
        ...data,
        interestedCount: calcInterested,
        goingCount: calcGoing,
        memberResponses: responsesList
      });
    } catch (err) {
      console.error('Failed to load event details:', err);
      showToast('Failed to load event details.', 'error');
      if (matched) {
        setEventDetails({
          ...matched,
          interestedCount: matched.interestedCount || 0,
          goingCount: matched.goingCount || matched.attendees || 0,
          memberResponses: []
        });
      }
    }
  };

  const resetForm = () => {
    setFormValues({
      title: '', description: '', category: 'Cultural', venue: '', address: '',
      startDate: '', startTime: '', endTime: '', contact: '', entryFee: 'Free',
      capacity: 0, registrationRequired: false, isFeatured: false,
      visibility: 'GLOBAL', communityId: '', status: 'Published', image: ''
    });
    setSelectedEventId(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-white font-medium text-sm flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.type === 'error' ? <XCircle size={18} /> : <CheckCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Calendar className="text-brand-primary" /> Event Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage global and community events across the entire platform.</p>
        </div>
        <button
          onClick={() => { resetForm(); setCreateModalOpen(true); }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-sm rounded-xl transition shadow-md shadow-brand-primary/20"
        >
          <Plus size={18} /> Create Event
        </button>
      </div>

      {/* REAL DASHBOARD METRICS */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs text-center">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Events</p>
            <p className="text-xl font-black text-slate-800 mt-1">{analytics.totalEvents}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-blue-50 bg-blue-50/20 text-center">
            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Upcoming</p>
            <p className="text-xl font-black text-blue-700 mt-1">{analytics.upcomingEvents}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-amber-50 bg-amber-50/20 text-center">
            <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Ongoing</p>
            <p className="text-xl font-black text-amber-700 mt-1">{analytics.ongoingEvents}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-emerald-50 bg-emerald-50/20 text-center">
            <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Completed</p>
            <p className="text-xl font-black text-emerald-700 mt-1">{analytics.completedEvents}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-rose-50 bg-rose-50/20 text-center">
            <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Cancelled</p>
            <p className="text-xl font-black text-rose-700 mt-1">{analytics.cancelledEvents}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-purple-50 bg-purple-50/20 text-center">
            <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Interested</p>
            <p className="text-xl font-black text-purple-700 mt-1">{analytics.totalInterested}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-emerald-50 bg-emerald-50/20 text-center">
            <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Going</p>
            <p className="text-xl font-black text-emerald-700 mt-1">{analytics.totalGoing}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-indigo-50 bg-indigo-50/20 text-center">
            <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Registrations</p>
            <p className="text-xl font-black text-indigo-700 mt-1">{analytics.totalRegistrations}</p>
          </div>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search events by title, venue, organizer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-primary"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={communityFilter}
            onChange={(e) => { setCommunityFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700"
          >
            <option value="all">All Communities</option>
            <option value="global">Global (Admin Only)</option>
            {communities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700"
          >
            <option value="all">All Categories</option>
            {['Cultural', 'Education', 'Matrimonial', 'Health', 'Sports'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700"
          >
            <option value="all">All Statuses</option>
            {['Draft', 'Published', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled', 'Archived'].map(st => <option key={st} value={st}>{st}</option>)}
          </select>

          <button
            onClick={() => { setSearch(''); setCommunityFilter('all'); setCategoryFilter('all'); setStatusFilter('all'); setCurrentPage(1); }}
            className="p-2.5 text-slate-400 hover:text-slate-600 rounded-xl border border-slate-200"
            title="Reset Filters"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* EVENT TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading events data...</div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No events found matching your criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-4 px-4">Banner</th>
                  <th className="py-4 px-4">Event Name</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Created By</th>
                  <th className="py-4 px-4">Community</th>
                  <th className="py-4 px-4">Event Date</th>
                  <th className="py-4 px-4 text-center">Interested</th>
                  <th className="py-4 px-4 text-center">Going</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {events.map((ev) => {
                  const createdByRole = ev.createdByRole || 'ADMIN';
                  const isGlobal = ev.visibility === 'GLOBAL' || ev.isGlobal;
                  return (
                    <tr key={ev._id || ev.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                          {ev.image ? (
                            <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Img</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {ev.title}
                        <p className="text-xs text-slate-400 font-normal">{ev.venue}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                          {ev.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-700">{ev.createdBy?.name || ev.organizer?.name || 'Admin'}</p>
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase ${createdByRole === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                          {createdByRole}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {isGlobal ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                            <Globe size={12} /> Global
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {ev.communityId?.name || 'Community'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600">
                        {ev.date || 'TBA'}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-purple-600">
                        {ev.interestedCount || 0}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">
                        {ev.goingCount || 0}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          ev.status === 'Published' ? 'bg-emerald-50 text-emerald-700' :
                          ev.status === 'Cancelled' ? 'bg-rose-50 text-rose-700' :
                          ev.status === 'Completed' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {ev.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewDetails(ev._id || ev.id)}
                            className="p-1.5 text-slate-500 hover:text-brand-primary hover:bg-slate-100 rounded-lg"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => openEditModal(ev)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit Event"
                          >
                            <Edit size={16} />
                          </button>
                          {ev.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleCancelEvent(ev._id || ev.id)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                              title="Cancel Event"
                            >
                              <AlertTriangle size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteEvent(ev._id || ev.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Delete Event"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION FOOTER */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing page {currentPage} of {totalPages} ({totalEvents} events)</span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-2 border border-slate-200 rounded-lg disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-2 border border-slate-200 rounded-lg disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT EVENT MODAL */}
      <AnimatePresence>
        {(createModalOpen || editModalOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">{createModalOpen ? 'Create New Event' : 'Edit Event'}</h3>
                <button onClick={() => { setCreateModalOpen(false); setEditModalOpen(false); }} className="p-1 text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              <form onSubmit={createModalOpen ? handleCreateSubmit : handleEditSubmit} className="p-6 overflow-y-auto space-y-4 text-sm flex-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Event Title *</label>
                  <input type="text" required value={formValues.title} onChange={e => setFormValues({...formValues, title: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                    <select value={formValues.category} onChange={e => setFormValues({...formValues, category: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl">
                      {['Cultural', 'Education', 'Matrimonial', 'Health', 'Sports'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Visibility</label>
                    <select value={formValues.visibility} onChange={e => setFormValues({...formValues, visibility: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl">
                      <option value="GLOBAL">GLOBAL (All Members)</option>
                      <option value="COMMUNITY">COMMUNITY (Specific Community)</option>
                    </select>
                  </div>
                </div>
                {formValues.visibility === 'COMMUNITY' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Community</label>
                    <select value={formValues.communityId} onChange={e => setFormValues({...formValues, communityId: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl">
                      <option value="">Select Community</option>
                      {communities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Venue *</label>
                    <input type="text" required value={formValues.venue} onChange={e => setFormValues({...formValues, venue: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Event Date *</label>
                    <input type="date" required value={formValues.startDate} onChange={e => setFormValues({...formValues, startDate: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
                    <input type="text" placeholder="e.g. 10:00 AM" value={formValues.startTime} onChange={e => setFormValues({...formValues, startTime: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Entry Fee</label>
                    <input type="text" value={formValues.entryFee} onChange={e => setFormValues({...formValues, entryFee: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Banner Image URL</label>
                  <input type="url" placeholder="https://..." value={formValues.image} onChange={e => setFormValues({...formValues, image: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description *</label>
                  <textarea rows={4} required value={formValues.description} onChange={e => setFormValues({...formValues, description: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
                </div>
                <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-700">Status</span>
                  <select value={formValues.status} onChange={e => setFormValues({...formValues, status: e.target.value})} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs">
                    {['Draft', 'Published', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'].map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => { setCreateModalOpen(false); setEditModalOpen(false); }} className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600">Cancel</button>
                  <button type="submit" disabled={actionLoading} className="px-5 py-2 bg-brand-primary text-white rounded-xl font-bold">{actionLoading ? 'Saving...' : 'Save Event'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EVENT DETAILS DRAWER */}
      <AnimatePresence>
        {detailDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="bg-white w-full max-w-xl h-full shadow-2xl overflow-y-auto flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-lg font-bold text-slate-800">Event Details & Responses</h3>
                <button onClick={() => setDetailDrawerOpen(false)} className="p-1 text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              {eventDetails ? (
                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                  {/* Banner Image */}
                  {eventDetails.image && (
                    <img src={eventDetails.image} alt={eventDetails.title} className="w-full h-52 object-cover rounded-2xl border border-slate-200 shadow-xs" />
                  )}
                  
                  {/* Header Title & Badges */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-bold text-xs">
                        🏷️ {eventDetails.category || 'Cultural'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                        eventDetails.status === 'Draft' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        ● {eventDetails.status || 'Published'}
                      </span>
                      {eventDetails.isFeatured && (
                        <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 rounded-full font-bold text-xs">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-black text-slate-900">{eventDetails.title}</h2>
                  </div>

                  {/* Metadata Grid (Venue, Date, Time, Contact) */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5 text-xs text-slate-700">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span><strong>Date & Time:</strong> {eventDetails.startDate || eventDetails.date} {eventDetails.startTime || eventDetails.time ? `at ${eventDetails.startTime || eventDetails.time}` : ''}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span><strong>Venue:</strong> {eventDetails.venue || 'N/A'} {eventDetails.address ? `(${eventDetails.address})` : ''}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-amber-500 shrink-0" />
                      <span><strong>Entry Fee:</strong> {eventDetails.entryFee || 'Free'} {eventDetails.capacity ? `• Capacity: ${eventDetails.capacity}` : ''}</span>
                    </div>
                    {eventDetails.contact && (
                      <div className="flex items-center gap-2.5">
                        <UserCheck className="w-4 h-4 text-purple-500 shrink-0" />
                        <span><strong>Contact Person:</strong> {eventDetails.contact}</span>
                      </div>
                    )}
                  </div>

                  {/* Event Description */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">About Event</h4>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                      {eventDetails.description || 'No detailed description provided for this event.'}
                    </div>
                  </div>

                  {/* Live Engagement Counters & Clickable Filters */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">Participation Stats (Click to Filter)</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setResponseFilterTab(responseFilterTab === 'INTERESTED' ? 'ALL' : 'INTERESTED')}
                        className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          responseFilterTab === 'INTERESTED'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-md scale-[1.02]'
                            : 'bg-purple-50/70 border-purple-100 text-purple-900 hover:bg-purple-100/70'
                        }`}
                      >
                        <p className={`text-[11px] font-bold ${responseFilterTab === 'INTERESTED' ? 'text-purple-100' : 'text-purple-600'}`}>Interested</p>
                        <p className="text-xl font-black mt-0.5">{eventDetails.interestedCount || 0}</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setResponseFilterTab(responseFilterTab === 'GOING' ? 'ALL' : 'GOING')}
                        className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          responseFilterTab === 'GOING'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.02]'
                            : 'bg-emerald-50/70 border-emerald-100 text-emerald-900 hover:bg-emerald-100/70'
                        }`}
                      >
                        <p className={`text-[11px] font-bold ${responseFilterTab === 'GOING' ? 'text-emerald-100' : 'text-emerald-600'}`}>Going / Joined</p>
                        <p className="text-xl font-black mt-0.5">{eventDetails.goingCount || 0}</p>
                      </button>
                    </div>
                  </div>

                  {/* Member Responses List */}
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                        Member List ({eventDetails.memberResponses?.filter(mr => {
                          if (responseFilterTab === 'INTERESTED') return mr.isInterested || mr.response === 'Interested';
                          if (responseFilterTab === 'GOING') return mr.isGoing || mr.response === 'Going';
                          return true;
                        }).length || 0})
                      </h4>
                      {responseFilterTab !== 'ALL' && (
                        <button
                          type="button"
                          onClick={() => setResponseFilterTab('ALL')}
                          className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                        >
                          Clear Filter (Show All)
                        </button>
                      )}
                    </div>

                    {/* Responses List */}
                    {(() => {
                      const filtered = (eventDetails.memberResponses || []).filter(mr => {
                        if (responseFilterTab === 'INTERESTED') return mr.isInterested || mr.response === 'Interested';
                        if (responseFilterTab === 'GOING') return mr.isGoing || mr.response === 'Going';
                        return true;
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="p-8 bg-slate-50/60 rounded-2xl border border-slate-100 text-center space-y-1">
                            <p className="text-xs font-bold text-slate-600">No members found for this response status</p>
                            <p className="text-[11px] text-slate-400">
                              {responseFilterTab === 'INTERESTED' ? 'No members have marked Interested yet.' :
                               responseFilterTab === 'GOING' ? 'No members have Joined/Going yet.' : 'No member responses recorded.'}
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-2.5">
                          {filtered.map((mr) => (
                            <div 
                              key={mr.id} 
                              className="p-3.5 rounded-2xl border border-slate-100 bg-white shadow-2xs hover:border-indigo-100 transition-all flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                {mr.avatar ? (
                                  <img src={mr.avatar} alt={mr.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                                ) : (
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs text-white ${
                                    mr.response === 'Going' ? 'bg-emerald-600' :
                                    mr.response === 'Interested' ? 'bg-purple-600' : 'bg-slate-600'
                                  }`}>
                                    {mr.initials || mr.name?.charAt(0) || 'M'}
                                  </div>
                                )}
                                <div>
                                  <p className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                                    {mr.name}
                                    {mr.gotra && mr.gotra !== 'N/A' && (
                                      <span className="text-[10px] font-semibold text-slate-400">({mr.gotra})</span>
                                    )}
                                  </p>
                                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                    {mr.communityName !== 'N/A' ? mr.communityName : ''} {mr.cityName !== 'N/A' ? `• ${mr.cityName}` : ''}
                                  </p>
                                  {(mr.phone !== 'N/A' || mr.email !== 'N/A') && (
                                    <div className="flex items-center gap-2 text-[10.5px] text-slate-400 font-semibold mt-1">
                                      {mr.phone !== 'N/A' && <span>📞 {mr.phone}</span>}
                                      {mr.email !== 'N/A' && <span>• ✉️ {mr.email}</span>}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className={`px-3 py-1 rounded-full font-extrabold text-[10.5px] inline-block ${
                                  mr.response === 'Going' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/50' :
                                  mr.response === 'Interested' ? 'bg-purple-100 text-purple-800 border border-purple-200/50' :
                                  'bg-slate-100 text-slate-600 border border-slate-200/50'
                                }`}>
                                  {mr.response === 'Going' ? '✓ Joined / Going' : mr.response === 'Interested' ? '⭐ Interested' : mr.response}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 font-semibold">Loading complete event details...</div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventsDesk;
