import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, Search, Filter, CheckCircle, XCircle, AlertTriangle, Eye, Download, Users, 
  MapPin, Calendar, Clock, Sparkles, X, ChevronLeft, ChevronRight, ChevronDown,
  Trash2, Edit, Check, Settings, EyeOff
} from 'lucide-react';
import { useData } from '../../../member/context/DataProvider';
import { useNavigate } from 'react-router-dom';

export default function ObituaryManagement() {
  const {
    currentUser,
    obituaries = [],
    updateObituary,
    deleteObituary,
    obituariesLoading,
    obituariesError
  } = useData();

  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [selectedObituary, setSelectedObituary] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid | table
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ceremonyFilter, setCeremonyFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Local settings simulation using communityId
  const communityId = useMemo(() => {
    const comName = currentUser?.community;
    return comName ? comName.toLowerCase().replace(/\s/g, '_') : 'cm_123';
  }, [currentUser]);

  const [settings, setLocalSettings] = useState(() => {
    const saved = localStorage.getItem(`community_settings_${communityId}`);
    const defaults = {
      enabled: true,
      memberSubmissionEnabled: true,
      requireApproval: true,
      fieldConfig: {
        ceremonyType: { enabled: true, label: 'Ceremony Type' },
        date: { enabled: true, label: 'Date' },
        time: { enabled: true, label: 'Time' },
        venueAddress: { enabled: true, label: 'Venue Address' },
        showLocation: { enabled: true, label: 'Show Location' }
      }
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.shradhanjali) {
          return {
            ...defaults,
            ...parsed.shradhanjali,
            fieldConfig: {
              ...defaults.fieldConfig,
              ...(parsed.shradhanjali.fieldConfig || {})
            }
          };
        }
      } catch (e) {}
    }
    return defaults;
  });

  const updateSetting = (key, val) => {
    const saved = localStorage.getItem(`community_settings_${communityId}`);
    let fullSettings = {};
    if (saved) {
      try {
        fullSettings = JSON.parse(saved);
      } catch (e) {}
    }
    const updatedShradh = { ...settings, [key]: val };
    setLocalSettings(updatedShradh);
    fullSettings.shradhanjali = updatedShradh;
    localStorage.setItem(`community_settings_${communityId}`, JSON.stringify(fullSettings));
    triggerToast('Settings updated successfully');
  };

  const updateFieldSetting = (fieldKey, configKey, val) => {
    const updatedFields = {
      ...settings.fieldConfig,
      [fieldKey]: {
        ...settings.fieldConfig[fieldKey],
        [configKey]: val
      }
    };
    updateSetting('fieldConfig', updatedFields);
  };

  const triggerToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Filter obituaries by community
  const myObituaries = useMemo(() => {
    return obituaries; // DataProvider already scopes them to the user's community
  }, [obituaries]);

  // Derived Analytics Stats
  const stats = useMemo(() => {
    const total = myObituaries.length;
    const pending = myObituaries.filter(o => o.status === 'Pending').length;
    const approved = myObituaries.filter(o => o.status === 'Approved').length;
    
    // Upcoming ceremonies (rites date >= today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = myObituaries.filter(o => {
      if (!o.funeralDetails?.date) return false;
      const ritesDate = new Date(o.funeralDetails.date);
      return ritesDate >= today;
    }).length;

    const totalViews = myObituaries.reduce((sum, o) => sum + (o.views || 0), 0);

    return { total, pending, approved, upcoming, totalViews };
  }, [myObituaries]);

  // Filters Pipeline
  const filteredObituaries = useMemo(() => {
    let result = [...myObituaries];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.deceasedName?.toLowerCase().includes(q) ||
        o.deceasedNameEn?.toLowerCase().includes(q) ||
        o.author?.name?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(o => o.status === statusFilter);
    }

    if (ceremonyFilter !== 'all') {
      result = result.filter(o => o.funeralDetails?.type === ceremonyFilter);
    }

    return result;
  }, [myObituaries, searchQuery, statusFilter, ceremonyFilter]);

  const paginatedObituaries = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredObituaries.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredObituaries, currentPage]);

  const totalPages = Math.ceil(filteredObituaries.length / itemsPerPage);

  // Moderation Handler
  const handleStatusChange = async (id, newStatus) => {
    try {
      // Call updateObituary but only change the status field
      const obituary = myObituaries.find(o => o.id === id);
      if (!obituary) return;
      
      const formData = new FormData();
      formData.append('status', newStatus);
      
      await updateObituary(id, formData);
      triggerToast(`Tribute status updated to ${newStatus}`);
      if (selectedObituary && selectedObituary.id === id) {
        setSelectedObituary(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      triggerToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('क्या आप सचमुच इस श्रद्धांजलि पोस्ट को हटाना चाहते हैं? Are you sure you want to delete this tribute?')) {
      try {
        await deleteObituary(id);
        triggerToast('Tribute post deleted successfully');
        setSelectedObituary(null);
      } catch (err) {
        triggerToast('Failed to delete tribute', 'error');
      }
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Deceased Name', 'Age', 'Passing Date', 'Ceremony Type', 'Ceremony Venue', 'Views', 'Status'];
    const rows = filteredObituaries.map(o => [
      o.id,
      `"${o.deceasedName}"`,
      o.age,
      o.dateOfPassing,
      `"${o.funeralDetails?.type || ''}"`,
      `"${o.funeralDetails?.venue || ''}"`,
      o.views || 0,
      o.status || 'Approved'
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Obituaries_Export_${currentUser?.community || 'Samaj'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('List exported successfully');
  };

  const renderToggleField = (label, key, desc) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/85 border border-slate-150 rounded-2xl transition-all duration-200">
      <div>
        <h5 className="text-[13px] font-bold text-slate-800">{label}</h5>
        <p className="text-[10px] text-slate-500 mt-0.5">{desc}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer shrink-0">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={!!settings[key]}
          onChange={() => updateSetting(key, !settings[key])}
        />
        <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
      </label>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 text-slate-800 relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl flex items-center gap-2.5 font-bold text-xs ${
              toast.type === 'error' ? 'bg-rose-500/25 border-rose-500/40 text-rose-200' : 'bg-emerald-500/25 border-emerald-500/40 text-emerald-250'
            }`}
          >
            {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle size={16} />}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── PREMIUM PAGE HEADER ─── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 p-6 md:p-8 shadow-xl shadow-indigo-600/10">
        {/* Background decorative blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Award className="text-amber-300 animate-pulse" size={32} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                Obituary Management
              </h1>
              <p className="text-[13px] text-indigo-100/90 font-medium mt-1">
                Moderate condolences, ceremonies, and public tributes for your community.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={exportCSV}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all flex items-center gap-2 active:scale-95 shadow-md backdrop-blur-md cursor-pointer"
            >
              <Download size={14} /> Export Active List
            </button>
          </div>
        </div>
      </div>

      {/* ─── SYSTEM CONFIG CARD ─── */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm shadow-slate-100/50">
        <div className="flex items-center gap-2.5 mb-4 text-indigo-600">
          <Settings size={18} className="animate-spin-slow" />
          <h4 className="text-xs font-black uppercase tracking-wider">Obituary Module Controls</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderToggleField('Enable Obituary Section', 'enabled', 'Toggle condolences portal for members')}
          {renderToggleField('Member Submissions', 'memberSubmissionEnabled', 'Let members create obituary posts')}
          {renderToggleField('Moderation Pre-Approval', 'requireApproval', 'Member posts stay pending until approved')}
        </div>
      </section>

      {/* ─── SUMMARY METRICS ─── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Tributes', val: stats.total, sub: 'Samaj Memorial Posts', icon: Users, gradient: 'from-blue-550 to-indigo-600', shadow: 'shadow-indigo-500/5' },
          { title: 'Pending Moderation', val: stats.pending, sub: 'Requires Review', icon: AlertTriangle, gradient: stats.pending > 0 ? 'from-amber-450 to-orange-500' : 'from-slate-400 to-slate-500', shadow: stats.pending > 0 ? 'shadow-orange-500/10' : 'shadow-slate-500/5', alert: stats.pending > 0 },
          { title: 'Upcoming Ceremonies', val: stats.upcoming, sub: 'Last Ceremony Rites', icon: Calendar, gradient: 'from-purple-500 to-violet-600', shadow: 'shadow-purple-500/5' },
          { title: 'Total Views', val: stats.totalViews, sub: 'Tribute views count', icon: Sparkles, gradient: 'from-emerald-400 to-teal-600', shadow: 'shadow-emerald-500/5' }
        ].map((w, idx) => (
          <div 
            key={idx} 
            className="relative overflow-hidden bg-white rounded-3xl border border-slate-200/80 p-5 flex flex-col justify-between h-[115px] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-350 cursor-pointer group"
          >
            {/* Background design accents */}
            <div className={`absolute top-0 right-0 -mr-6 -mt-6 w-16 h-16 bg-gradient-to-br ${w.gradient} rounded-full opacity-10 group-hover:scale-125 transition-transform duration-300`} />
            
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">{w.title}</p>
                <h3 className="text-2xl font-black text-slate-800 mt-1">{w.val}</h3>
              </div>
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${w.gradient} flex items-center justify-center text-white shadow-md`}>
                <w.icon size={16} className={`${w.alert ? 'animate-pulse' : ''}`} />
              </div>
            </div>
            <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wide relative z-10">{w.sub}</span>
          </div>
        ))}
      </section>

      {/* ─── FILTERS TOOLBAR ─── */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm shadow-slate-100/50 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-450">
              <Search size={15} />
            </span>
            <input 
              type="text" 
              placeholder="Search by deceased name, relation, or member name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 focus:border-indigo-500 rounded-2xl py-3 pl-11 pr-4 text-[13px] text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all duration-200"
            />
          </div>
          
          <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shrink-0">
            {[{ id: 'grid', label: 'Grid View' }, { id: 'table', label: 'Table View' }].map(m => (
              <button 
                key={m.id} onClick={() => setViewMode(m.id)}
                className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase transition-all duration-200 cursor-pointer ${viewMode === m.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/15' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-150'}`}
              >{m.label}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wider pl-1">Moderation Status</label>
            <div className="relative">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-100 focus:border-indigo-500 rounded-2xl px-4 py-3 text-[12px] font-bold focus:outline-none appearance-none cursor-pointer text-slate-700">
                <option value="all">All Tributes</option>
                <option value="Approved">Approved / Live</option>
                <option value="Pending">Pending Review</option>
                <option value="Rejected">Rejected</option>
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wider pl-1">Ceremony Type</label>
            <div className="relative">
              <select value={ceremonyFilter} onChange={(e) => setCeremonyFilter(e.target.value)} className="w-full bg-slate-50 border border-slate-100 focus:border-indigo-500 rounded-2xl px-4 py-3 text-[12px] font-bold focus:outline-none appearance-none cursor-pointer text-slate-700">
                <option value="all">All Ceremony Types</option>
                <option value="Funeral / Last Rites">Funeral / Last Rites</option>
                <option value="Uthawna / Chautha">Uthawna / Chautha</option>
                <option value="Tehravi / Prayers">Tehravi / Prayers</option>
                <option value="Besna">Besna</option>
                <option value="Memorial / Rasam Pagri">Memorial / Rasam Pagri</option>
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── DATA CONTAINER ─── */}
      <section>
        {obituariesLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin" />
            <p className="text-[12px] text-slate-450">Fetching community obituaries...</p>
          </div>
        ) : obituariesError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
            <span className="text-[32px]">⚠️</span>
            <p className="text-[12px] text-rose-500 font-bold">{obituariesError}</p>
          </div>
        ) : paginatedObituaries.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl border border-slate-200/80 text-center text-slate-400 font-bold text-[12px] uppercase tracking-wider">
            No obituary posts found matching filter settings.
          </div>
        ) : (
          <>
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {paginatedObituaries.map(o => (
                  <div key={o.id} className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group h-full cursor-pointer">
                    <div className="relative h-52 bg-slate-100 overflow-hidden" onClick={() => setSelectedObituary(o)}>
                      <img src={o.image || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'} alt={o.deceasedName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />
                      
                      {/* Submitter details pill */}
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 text-[9px] font-bold uppercase text-white tracking-widest">
                        {o.prefix || 'Late'}
                      </div>
                      
                      <div className="absolute bottom-3 left-4 right-4">
                        <h4 className="text-[15px] font-bold text-white tracking-tight drop-shadow-sm">{o.deceasedName}</h4>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] font-semibold text-slate-200/90">
                          <span>Age: {o.age} Yrs</span>
                          <span>•</span>
                          <span className="truncate">{o.funeralDetails?.type}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-white flex-1 flex flex-col justify-between gap-4">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                        <span className={`px-2.5 py-0.5 rounded-full border ${
                          o.status === 'Approved' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                            : o.status === 'Pending' 
                              ? 'bg-amber-50 text-amber-600 border-amber-200' 
                              : 'bg-rose-50 text-rose-600 border-rose-200'
                        }`}>
                          {o.status || 'Approved'}
                        </span>
                        <span className="text-slate-450 font-semibold">{o.views || 0} Views</span>
                      </div>
                      
                      <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
                        <button onClick={() => setSelectedObituary(o)} className="flex-1 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[11px] font-bold uppercase transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer">
                          <Eye size={12} /> Review
                        </button>
                        <button onClick={() => handleDelete(o.id)} className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-500 border border-rose-150 text-rose-500 hover:text-white transition-all duration-200 cursor-pointer text-[11px] font-bold uppercase" title="Delete record">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'table' && (
              <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm shadow-slate-100/50">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-slate-200/80 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      <tr>
                        <th className="p-4 pl-6">Deceased Profile</th>
                        <th className="p-4">Demographics</th>
                        <th className="p-4">Ceremony details</th>
                        <th className="p-4">Author Member</th>
                        <th className="p-4">Views</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 pr-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-650">
                      {paginatedObituaries.map(o => (
                        <tr key={o.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                                <img src={o.image || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=100'} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <span className="font-bold text-slate-800 block text-[13px]">{o.deceasedName}</span>
                                <span className="text-[10px] text-slate-450 block font-normal mt-0.5">Passed: {o.dateOfPassing}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-[12px] text-slate-600 font-semibold">{o.age} Years</td>
                          <td className="p-4 truncate max-w-xs">
                            <div className="font-bold text-slate-700 text-[12px]">{o.funeralDetails?.type}</div>
                            <div className="text-[10px] text-slate-450 mt-0.5">{o.funeralDetails?.venue}</div>
                          </td>
                          <td className="p-4 text-[12px]">
                            <div className="font-semibold text-slate-700">{o.author?.name}</div>
                            <div className="text-[10px] text-slate-450 mt-0.5">Relation: {o.author?.relation}</div>
                          </td>
                          <td className="p-4 text-indigo-650 font-bold text-[12px]">{o.views || 0}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                              o.status === 'Approved' 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                : o.status === 'Pending' 
                                  ? 'bg-amber-50 text-amber-600 border-amber-200' 
                                  : 'bg-rose-50 text-rose-600 border-rose-200'
                            }`}>{o.status || 'Approved'}</span>
                          </td>
                          <td className="p-4 pr-6 text-right space-x-1.5">
                            <button onClick={() => setSelectedObituary(o)} className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold transition-all text-[10px] uppercase cursor-pointer">Open</button>
                            <button onClick={() => handleDelete(o.id)} className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-500 font-bold transition-all text-[10px] uppercase border border-rose-200 cursor-pointer">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <footer className="flex items-center justify-between border-t border-slate-200/60 pt-4 mt-6">
                <span className="text-[10px] text-slate-450 font-bold uppercase">Page {currentPage} of {totalPages} ({filteredObituaries.length} records)</span>
                <div className="flex items-center gap-1">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-30 cursor-pointer"><ChevronLeft size={14} /></button>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-30 cursor-pointer"><ChevronRight size={14} /></button>
                </div>
              </footer>
            )}
          </>
        )}
      </section>

      {/* ─── CONDOLENCE FORM FIELDS CUSTOMISATION ─── */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm shadow-slate-100/50 space-y-6">
        <div className="flex items-center gap-2.5 text-indigo-600 border-b border-slate-100 pb-3">
          <Settings size={18} className="animate-spin-slow" />
          <div>
            <h4 className="text-[13px] font-black uppercase tracking-wider">Condolence Post Form Customization</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Dynamically enable/disable and rename input fields on the member condolence creation screen</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { key: 'ceremonyType', defaultLabel: 'Ceremony Type', desc: 'Dropdown to pick ceremony type (Besna, Uthawna, etc.)' },
            { key: 'date', defaultLabel: 'Date', desc: 'Date selection input box' },
            { key: 'time', defaultLabel: 'Time', desc: 'Time selection input box' },
            { key: 'venueAddress', defaultLabel: 'Venue Address', desc: 'Input box for entering the address details' },
            { key: 'showLocation', defaultLabel: 'Show Location', desc: 'Toggle to enable/disable maps display' }
          ].map(field => {
            const fieldConfig = settings.fieldConfig?.[field.key] || { enabled: true, label: field.defaultLabel };
            return (
              <div 
                key={field.key} 
                className="p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-150 rounded-2xl transition-all duration-200 flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-[12px] font-bold text-slate-800">{field.defaultLabel} Configuration</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">{field.desc}</p>
                  </div>
                  
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={!!fieldConfig.enabled}
                      onChange={() => updateFieldSetting(field.key, 'enabled', !fieldConfig.enabled)}
                    />
                    <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide shrink-0">Label Text:</span>
                  <input 
                    type="text"
                    value={fieldConfig.label || ''}
                    onChange={(e) => updateFieldSetting(field.key, 'label', e.target.value)}
                    placeholder={field.defaultLabel}
                    className="flex-1 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-1.5 text-[11px] text-slate-800 focus:outline-none transition-all"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── REVIEW DRAWER MODAL ─── */}
      <AnimatePresence>
        {selectedObituary && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} onClick={() => setSelectedObituary(null)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40" />
            <motion.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }} transition={{ type: 'spring', damping: 26, stiffness: 220 }} className="fixed inset-y-0 right-0 w-full max-w-xl bg-white z-55 flex flex-col shadow-2xl">
              
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full border border-slate-200 overflow-hidden bg-slate-100 shadow-sm shrink-0">
                    <img src={selectedObituary.image || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=100'} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800 leading-tight">{selectedObituary.deceasedName}</h3>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mt-1 flex items-center gap-1.5">
                      <span>Status: {selectedObituary.status || 'Approved'}</span>
                      <span>•</span>
                      <span>{selectedObituary.views || 0} Views</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedObituary(null)} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"><X size={16} /></button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Date of Passing</span>
                    <p className="text-xs font-bold text-slate-800 mt-1">{selectedObituary.dateOfPassing}</p>
                  </div>
                  <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Age at Passing</span>
                    <p className="text-xs font-bold text-slate-800 mt-1">{selectedObituary.age} Years</p>
                  </div>
                  <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Author Relation</span>
                    <p className="text-xs font-bold text-slate-800 mt-1">{selectedObituary.author?.relation || 'Family'}</p>
                  </div>
                  <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Submitted By</span>
                    <p className="text-xs font-bold text-slate-800 mt-1">{selectedObituary.author?.name}</p>
                  </div>
                </div>

                {/* Ceremony Details */}
                {(settings.fieldConfig?.ceremonyType?.enabled || 
                  settings.fieldConfig?.date?.enabled || 
                  settings.fieldConfig?.time?.enabled || 
                  settings.fieldConfig?.venueAddress?.enabled) && (
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-indigo-700 border-b border-indigo-100 pb-2">
                      <Clock size={12} /> Funeral & Ceremony Details
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-[12px] font-medium text-slate-650">
                      {settings.fieldConfig?.ceremonyType?.enabled && (
                        <div>{settings.fieldConfig.ceremonyType.label}: <span className="text-slate-800 font-bold">{selectedObituary.funeralDetails?.type}</span></div>
                      )}
                      {(settings.fieldConfig?.date?.enabled || settings.fieldConfig?.time?.enabled) && (
                        <div>
                          {settings.fieldConfig?.date?.enabled && settings.fieldConfig?.date?.label} 
                          {settings.fieldConfig?.date?.enabled && settings.fieldConfig?.time?.enabled && ' & '} 
                          {settings.fieldConfig?.time?.enabled && settings.fieldConfig?.time?.label}:{' '}
                          <span className="text-slate-800 font-bold">
                            {settings.fieldConfig?.date?.enabled && selectedObituary.funeralDetails?.date} 
                            {settings.fieldConfig?.date?.enabled && settings.fieldConfig?.time?.enabled && ' • '} 
                            {settings.fieldConfig?.time?.enabled && (selectedObituary.funeralDetails?.time || 'Not specified')}
                          </span>
                        </div>
                      )}
                      {settings.fieldConfig?.venueAddress?.enabled && (
                        <div>{settings.fieldConfig.venueAddress.label}: <span className="text-slate-800 font-bold">{selectedObituary.funeralDetails?.venue}</span></div>
                      )}
                    </div>
                  </div>
                )}

                {/* Submitter Details */}
                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-600 border-b border-slate-200/80 pb-2">
                    <Users size={12} /> Submitter Member Details
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[12px] font-medium text-slate-650">
                    <div>Name: <span className="text-slate-800 font-bold">{selectedObituary.author?.name || 'Unknown'}</span></div>
                    <div>Relation: <span className="text-slate-800 font-bold">{selectedObituary.author?.relation || 'Not specified'}</span></div>
                    {selectedObituary.author?.email && (
                      <div className="col-span-2">Email: <span className="text-slate-850 font-bold">{selectedObituary.author?.email}</span></div>
                    )}
                    {selectedObituary.author?.phone && (
                      <div className="col-span-2">Phone: <span className="text-slate-850 font-bold">{selectedObituary.author?.phone}</span></div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Condolence Message</span>
                  <p className="text-[12px] text-slate-700 leading-relaxed italic bg-purple-50/30 p-4 rounded-2xl border border-purple-100">
                    "{selectedObituary.message}"
                  </p>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { handleStatusChange(selectedObituary.id, 'Approved'); }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                  >
                    Approve / Live
                  </button>
                  <button 
                    onClick={() => { handleStatusChange(selectedObituary.id, 'Rejected'); }}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[11px] font-bold uppercase border border-rose-200 transition-all cursor-pointer"
                  >
                    Reject Post
                  </button>
                </div>
                <button 
                  onClick={() => handleDelete(selectedObituary.id)}
                  className="p-2.5 bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white rounded-xl transition-all border border-rose-100 cursor-pointer"
                  title="Delete Obituary"
                >
                  <Trash2 size={16} />
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
