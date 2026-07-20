import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Search, Filter, CheckCircle, XCircle, AlertTriangle, Eye, Download, Users, 
  MapPin, Briefcase, GraduationCap, Calendar, Clock, Lock, Sparkles, X, ChevronRight, ChevronLeft, ChevronDown,
  ShieldCheck, FileText, Image as ImageIcon, MessageSquare, TrendingUp, Grid, List, Layout, UserPlus, FileSearch, HelpCircle,
  Trash2, Check
} from 'lucide-react';
import { useData } from '../../../member/context/DataProvider';

export default function MatrimonialManagement() {
  const {
    currentUser,
    rawMatrimonialProfiles = [],
    updateMatrimonialProfileStatus,
    updateMatrimonialProfileDocumentStatus,
    resolveMatrimonialComplaint,
    updateMatrimonialProfile
  } = useData();

  const [toast, setToast] = useState(null);
  const triggerToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 1. RBAC: Head's active community scoping bounds
  const activeCommunityId = currentUser?.communityId || 'c1';
  const myProfiles = useMemo(() => {
    return rawMatrimonialProfiles.filter(p => p.communityId === activeCommunityId);
  }, [rawMatrimonialProfiles, activeCommunityId]);

  // Layout & Filter states
  const [viewMode, setViewMode] = useState('grid'); // grid | table | compact
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedRows, setSelectedRows] = useState([]);

  // Drawer review states
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [drawerTab, setDrawerTab] = useState('personal'); // personal | education | family | partner | audit
  
  // Complaint resolution modal
  const [resolvingComplaint, setResolvingComplaint] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Auto suggestions
  const suggestions = useMemo(() => {
    if (!searchQuery) return [];
    return myProfiles
      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5)
      .map(p => p.name);
  }, [searchQuery, myProfiles]);

  // Derived Analytics Stats
  const stats = useMemo(() => {
    const total = myProfiles.length;
    const grooms = myProfiles.filter(p => p.gender === 'Male').length;
    const brides = myProfiles.filter(p => p.gender === 'Female').length;
    const pendingVer = myProfiles.filter(p => p.verificationStatus === 'Pending' || p.verificationStatus === 'Under Review').length;
    const reported = myProfiles.filter(p => (p.complaints || []).some(c => c.status === 'Pending')).length;
    const matched = myProfiles.filter(p => p.status === 'Matched').length;
    const avgAge = total > 0 ? (myProfiles.reduce((acc, p) => acc + parseInt(p.age || 0), 0) / total).toFixed(0) : 0;

    return { total, grooms, brides, pendingVer, reported, matched, avgAge };
  }, [myProfiles]);

  // Filter pipeline
  const filteredProfiles = useMemo(() => {
    let result = [...myProfiles];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.city && p.city.toLowerCase().includes(q)) ||
        (p.profession && p.profession.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'all') result = result.filter(p => p.status === statusFilter);
    if (genderFilter !== 'all') result = result.filter(p => p.gender === genderFilter);
    if (verificationFilter !== 'all') result = result.filter(p => p.verificationStatus === verificationFilter);

    // Default sort: newest created/first array elements (simplified)
    return result;
  }, [myProfiles, searchQuery, statusFilter, genderFilter, verificationFilter]);

  const paginatedProfiles = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredProfiles.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredProfiles, currentPage]);
  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);

  // Handlers
  const toggleSelectRow = (id) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]);
  };
  const toggleSelectAll = () => {
    const pageIds = paginatedProfiles.map(p => p.id);
    const allSelected = pageIds.every(id => selectedRows.includes(id));
    if (allSelected) setSelectedRows(prev => prev.filter(id => !pageIds.includes(id)));
    else setSelectedRows(prev => [...new Set([...prev, ...pageIds])]);
  };

  const handleBulkApprove = () => {
    selectedRows.forEach(id => updateMatrimonialProfileStatus(id, 'Published', 'Bulk Approved'));
    triggerToast(`Approved ${selectedRows.length} profiles.`);
    setSelectedRows([]);
  };

  const handleBulkReject = () => {
    selectedRows.forEach(id => updateMatrimonialProfileStatus(id, 'Rejected', 'Bulk Rejected'));
    triggerToast(`Rejected ${selectedRows.length} profiles.`);
    setSelectedRows([]);
  };

  const exportCSV = (dataList = myProfiles) => {
    const headers = ['ID', 'Name', 'Gender', 'Age', 'City', 'Profession', 'Status', 'Verification'];
    const rows = dataList.map(p => [
      p.id, `"${p.name}"`, p.gender, p.age, `"${p.city}"`, `"${p.profession}"`, p.status, p.verificationStatus
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Matrimonial_Export_${activeCommunityId}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Directory exported to CSV.');
  };

  const handleDocumentAction = (profileId, docId, actionStr, notes) => {
    updateMatrimonialProfileDocumentStatus(profileId, docId, actionStr, notes);
    triggerToast(`Document ${actionStr}.`);
  };

  return (
    <div className="space-y-6 pb-20 text-slate-800 relative">
      
      {/* Toast Overlay */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl flex items-center gap-2.5 font-bold text-xs ${
              toast.type === 'error' ? 'bg-rose-500/25 border-rose-500/40 text-rose-200' : 'bg-emerald-500/25 border-emerald-500/40 text-emerald-200'
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
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider text-slate-900 flex items-center gap-2.5">
            <Heart className="text-brand-primary" size={26} /> Matrimonial Management
          </h1>
          <p className="text-[10px] md:text-xs text-slate-500 mt-1 uppercase font-bold tracking-widest">
            Profile Validations • Match Metrics • Document Audits • Moderation Desk
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => exportCSV(filteredProfiles)}
            className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all flex items-center gap-2 uppercase"
          >
            <Download size={13} /> Export Active List
          </button>
        </div>
      </header>

      {/* ─── SUMMARY DASHBOARD CARDS ─── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Profiles', val: stats.total, sub: `${stats.grooms} Grooms • ${stats.brides} Brides`, icon: Users, color: 'from-purple-500/20 to-indigo-500/20 text-purple-300' },
          { title: 'Successful Matches', val: stats.matched, sub: 'Couples formed', icon: Sparkles, color: 'from-amber-500/20 to-orange-500/20 text-amber-300' },
          { title: 'Pending Verifications', val: stats.pendingVer, sub: 'Requires admin audit', icon: FileSearch, color: 'from-sky-500/20 to-blue-500/20 text-sky-300' },
          { title: 'Reported Grievances', val: stats.reported, sub: 'Complaints to resolve', icon: AlertTriangle, color: 'from-rose-500/20 to-red-500/20 text-rose-300' }
        ].map((w, idx) => (
          <div key={idx} className={`card-neo bg-gradient-to-br ${w.color} border-white/5 p-4 flex flex-col justify-between h-[110px] transition-all hover:scale-[1.02] duration-300`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{w.title}</p>
                <h3 className="text-2xl font-black mt-1">{w.val}</h3>
              </div>
              <w.icon size={18} className="opacity-80" />
            </div>
            <span className="text-[9px] text-white/70 font-bold uppercase">{w.sub}</span>
          </div>
        ))}
      </section>

      {/* ─── ADVANCED FILTERS BAR ─── */}
      <section className="card-neo p-4 bg-white/2 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted"><Search size={14} /></span>
            <input 
              type="text" 
              placeholder="Search by Name, City, Profession..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#120739]/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-text-muted focus:outline-none"
            />
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-[#1a0f4c] border border-white/10 rounded-xl overflow-hidden z-20 shadow-2xl font-bold">
                {suggestions.map((s, i) => (
                  <div key={i} onClick={() => setSearchQuery(s)} className="px-3.5 py-2 hover:bg-white/5 text-[10px] text-purple-200 cursor-pointer">{s}</div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 bg-[#120739]/60 p-1 rounded-xl border border-white/5 shrink-0">
            {[{ id: 'grid', icon: Grid }, { id: 'table', icon: List }, { id: 'compact', icon: Layout }].map(m => (
              <button 
                key={m.id} onClick={() => setViewMode(m.id)}
                className={`p-2 rounded-lg transition-all ${viewMode === m.id ? 'bg-purple-500 text-white' : 'text-purple-300 hover:bg-white/5'}`}
              ><m.icon size={13} /></button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Status', val: statusFilter, set: setStatusFilter, opts: ['Published', 'Draft', 'Submitted', 'Under Review', 'Matched', 'Hidden', 'Archived', 'Rejected'] },
            { label: 'Gender', val: genderFilter, set: setGenderFilter, opts: ['Male', 'Female'] },
            { label: 'Verification', val: verificationFilter, set: setVerificationFilter, opts: ['Pending', 'Under Review', 'Verified', 'Rejected'] }
          ].map((f, i) => (
            <div key={i} className="space-y-1">
              <label className="text-[9px] font-bold text-text-muted uppercase tracking-wider">{f.label}</label>
              <div className="relative">
                <select value={f.val} onChange={(e) => f.set(e.target.value)} className="w-full bg-[#120739]/50 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold focus:outline-none appearance-none cursor-pointer text-purple-200">
                  <option value="all">All {f.label}s</option>
                  {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-3 top-2.5 text-purple-300 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── LISTINGS RENDERER ─── */}
      <section>
        {paginatedProfiles.length === 0 ? (
          <div className="p-12 card-neo bg-white/2 text-center text-text-muted font-bold text-[11px] uppercase tracking-wider border border-white/5">
            No profiles found matching your filters in this community bound.
          </div>
        ) : (
          <>
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {paginatedProfiles.map(p => (
                  <div key={p.id} className="card-neo overflow-hidden bg-white/2 hover:bg-white/5 transition-all border border-white/5 group">
                    <div className="relative h-48 bg-[#0c0533]">
                      <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#120739] via-transparent to-transparent" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase text-white tracking-widest">{p.id}</div>
                      <div className="absolute top-2 right-2">
                        <input type="checkbox" checked={selectedRows.includes(p.id)} onChange={() => toggleSelectRow(p.id)} className="w-4 h-4 rounded accent-purple-500 cursor-pointer" />
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <h4 className="text-sm font-black text-white truncate drop-shadow-md">{p.name}, {p.age}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[9px] font-bold text-white/90">
                          <span className="flex items-center gap-0.5"><MapPin size={9} /> {p.city}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5"><Briefcase size={9} /> {p.profession}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3.5 space-y-3 bg-[#120739]/80">
                      <div className="flex items-center justify-between text-[9px] font-bold uppercase">
                        <span className={`px-2 py-0.5 rounded border ${p.verificationStatus === 'Verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                          {p.verificationStatus}
                        </span>
                        <span className={`px-2 py-0.5 rounded border ${p.status === 'Published' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' : 'bg-white/5 text-text-muted border-white/10'}`}>
                          {p.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedProfile(p)} className="flex-1 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-[10px] font-bold uppercase transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-1.5">
                          <Eye size={12} /> Review Desk
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'table' && (
              <div className="card-neo overflow-hidden bg-white/2 border border-white/5">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-white/3 border-b border-white/5 text-[9px] uppercase font-black text-purple-200 tracking-wider">
                      <tr>
                        <th className="p-4 w-12 text-center"><input type="checkbox" checked={paginatedProfiles.length > 0 && paginatedProfiles.every(e => selectedRows.includes(e.id))} onChange={toggleSelectAll} className="rounded accent-purple-500 cursor-pointer" /></th>
                        <th className="p-4">Profile</th>
                        <th className="p-4">Demographics</th>
                        <th className="p-4">Profession</th>
                        <th className="p-4">Verification</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium">
                      {paginatedProfiles.map(p => (
                        <tr key={p.id} className="hover:bg-white/2 transition-colors duration-150">
                          <td className="p-4 text-center"><input type="checkbox" checked={selectedRows.includes(p.id)} onChange={() => toggleSelectRow(p.id)} className="rounded accent-purple-500 cursor-pointer" /></td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0"><img src={p.images?.[0] || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100'} alt="" className="w-full h-full object-cover" /></div>
                              <div>
                                <span className="font-bold text-white block truncate">{p.name}</span>
                                <span className="text-[9px] text-text-muted mt-0.5 block truncate font-normal">ID: {p.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">{p.age} Yrs • {p.gender} • {p.city}</td>
                          <td className="p-4 text-purple-200">{p.profession}</td>
                          <td className="p-4"><span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${p.verificationStatus === 'Verified' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'}`}>{p.verificationStatus}</span></td>
                          <td className="p-4"><span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase bg-white/5 text-purple-200 border border-white/10`}>{p.status}</span></td>
                          <td className="p-4 text-right">
                            <button onClick={() => setSelectedProfile(p)} className="px-3 py-1 rounded bg-[#20134f] hover:bg-[#2e1c70] text-purple-250 font-bold transition-all text-[9px] uppercase border border-white/5">Open Desk</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <footer className="flex items-center justify-between border-t border-white/5 pt-4 mt-6">
                <span className="text-[10px] text-text-muted font-bold uppercase">Page {currentPage} of {totalPages} ({filteredProfiles.length} entries)</span>
                <div className="flex items-center gap-1">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30"><ChevronLeft size={14} /></button>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30"><ChevronRight size={14} /></button>
                </div>
              </footer>
            )}
          </>
        )}
      </section>

      {/* ─── STICKY BULK ACTION BAR ─── */}
      {selectedRows.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 md:left-64 md:right-8 z-40 bg-[#120739]/90 border border-purple-500/30 px-4 py-3 rounded-2xl backdrop-blur-md shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase text-purple-250 tracking-wider">{selectedRows.length} Profiles Selected</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase">
            <button onClick={handleBulkApprove} className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 border border-emerald-500/30 text-emerald-300 hover:text-white rounded-lg transition-all">Publish Batch</button>
            <button onClick={handleBulkReject} className="px-3 py-1.5 bg-rose-600/30 hover:bg-rose-600 border border-rose-600/40 text-rose-350 hover:text-white rounded-lg transition-all">Reject Batch</button>
            <button onClick={() => setSelectedRows([])} className="px-3 py-1.5 text-text-muted hover:text-white transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* ─── PROFILE REVIEW DRAWER MODAL ─── */}
      <AnimatePresence>
        {selectedProfile && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setSelectedProfile(null)} className="fixed inset-0 bg-black z-40" />
            <motion.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 w-full max-w-2xl bg-[#0c0533] border-l border-white/10 z-50 flex flex-col shadow-2xl">
              
              {/* Drawer Header */}
              <div className="p-4 border-b border-white/10 bg-[#120739]/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-purple-500/30 overflow-hidden"><img src={selectedProfile.images?.[0] || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100'} alt="" className="w-full h-full object-cover" /></div>
                  <div>
                    <h3 className="text-sm font-black text-white">{selectedProfile.name} <span className="text-[10px] text-text-muted font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10 ml-1">{selectedProfile.id}</span></h3>
                    <div className="text-[9px] text-purple-300 font-bold uppercase tracking-wider mt-0.5">{selectedProfile.status} • {selectedProfile.verificationStatus}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedProfile(null)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"><X size={16} /></button>
              </div>

              {/* Drawer Tabs */}
              <div className="flex items-center border-b border-white/5 bg-[#120739]/30 overflow-x-auto no-scrollbar shrink-0 px-2 pt-2">
                {[
                  { id: 'personal', label: 'Personal', icon: UserPlus },
                  { id: 'education', label: 'Edu & Career', icon: GraduationCap },
                  { id: 'family', label: 'Family', icon: Users },
                  { id: 'partner', label: 'Partner Pref', icon: Heart },
                  { id: 'audit', label: 'Verification & Audit', icon: ShieldCheck }
                ].map(t => (
                  <button 
                    key={t.id} onClick={() => setDrawerTab(t.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all border-b-2 ${drawerTab === t.id ? 'border-purple-500 text-purple-300 bg-purple-500/5 rounded-t-xl' : 'border-transparent text-text-muted hover:text-white'}`}
                  >
                    <t.icon size={12} /> {t.label}
                  </button>
                ))}
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                
                {drawerTab === 'personal' && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1"><span className="text-[9px] text-text-muted font-bold uppercase">Date of Birth</span><p className="text-xs font-bold text-white">{selectedProfile.dob || '01 Jan 1995'} ({selectedProfile.age} Yrs)</p></div>
                      <div className="space-y-1"><span className="text-[9px] text-text-muted font-bold uppercase">Height</span><p className="text-xs font-bold text-white">{selectedProfile.height || '5 ft 6 in'}</p></div>
                      <div className="space-y-1"><span className="text-[9px] text-text-muted font-bold uppercase">Gotra / Caste</span><p className="text-xs font-bold text-white">{selectedProfile.gotra || 'Garg'} • {selectedProfile.communityId}</p></div>
                      <div className="space-y-1"><span className="text-[9px] text-text-muted font-bold uppercase">Manglik</span><p className="text-xs font-bold text-white">{selectedProfile.manglik || 'Non-Manglik'}</p></div>
                    </div>
                    <div className="space-y-1 pt-4 border-t border-white/5"><span className="text-[9px] text-text-muted font-bold uppercase">About Self</span><p className="text-[11px] text-purple-200 leading-relaxed italic">"{selectedProfile.about || 'A simple, family-oriented individual looking for a compatible partner.'}"</p></div>
                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <span className="text-[10px] text-text-muted font-black uppercase tracking-wider">Photo Gallery</span>
                      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-24 h-24 rounded-xl border border-white/10 overflow-hidden shrink-0 bg-[#1a0f4c] flex items-center justify-center">
                            <ImageIcon size={20} className="text-white/20" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {drawerTab === 'education' && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1"><span className="text-[9px] text-text-muted font-bold uppercase">Highest Education</span><p className="text-xs font-bold text-white">{selectedProfile.education || 'B.Tech + MBA'}</p></div>
                      <div className="space-y-1"><span className="text-[9px] text-text-muted font-bold uppercase">Profession</span><p className="text-xs font-bold text-white">{selectedProfile.profession || 'Software Engineer'}</p></div>
                      <div className="space-y-1"><span className="text-[9px] text-text-muted font-bold uppercase">Current City</span><p className="text-xs font-bold text-white">{selectedProfile.city || 'Indore, MP'}</p></div>
                      <div className="space-y-1"><span className="text-[9px] text-text-muted font-bold uppercase">Annual Income</span><p className="text-xs font-bold text-emerald-400">{selectedProfile.income || 'Not Specified'}</p></div>
                    </div>
                  </div>
                )}

                {drawerTab === 'family' && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="p-3.5 bg-white/2 border border-white/5 rounded-xl space-y-1"><span className="text-[9px] text-text-muted font-bold uppercase">Family Background</span><p className="text-xs font-bold text-white leading-relaxed">{selectedProfile.familyBackground || 'Respectable family based out of Indore.'}</p></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1"><span className="text-[9px] text-text-muted font-bold uppercase">Father's Name & Occupation</span><p className="text-[11px] font-bold text-purple-200">Mr. Agrawal • Businessman</p></div>
                      <div className="space-y-1"><span className="text-[9px] text-text-muted font-bold uppercase">Mother's Name & Occupation</span><p className="text-[11px] font-bold text-purple-200">Mrs. Agrawal • Homemaker</p></div>
                      <div className="space-y-1"><span className="text-[9px] text-text-muted font-bold uppercase">Siblings</span><p className="text-[11px] font-bold text-white">1 Brother, 1 Sister</p></div>
                      <div className="space-y-1"><span className="text-[9px] text-text-muted font-bold uppercase">Family Affluence</span><p className="text-[11px] font-bold text-white">Upper Middle Class</p></div>
                    </div>
                  </div>
                )}

                {drawerTab === 'partner' && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="p-4 bg-purple-950/20 border border-purple-500/20 rounded-xl space-y-4">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-purple-300 border-b border-purple-500/20 pb-2"><Heart size={14} /> Partner Preferences</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><span className="text-[9px] text-text-muted font-bold uppercase">Age Range</span><p className="text-[11px] font-bold text-white">25 - 30 Years</p></div>
                        <div className="space-y-1"><span className="text-[9px] text-text-muted font-bold uppercase">Min Height</span><p className="text-[11px] font-bold text-white">5 ft 2 in</p></div>
                        <div className="space-y-1"><span className="text-[9px] text-text-muted font-bold uppercase">Preferred Education</span><p className="text-[11px] font-bold text-white">Graduate & Above</p></div>
                        <div className="space-y-1"><span className="text-[9px] text-text-muted font-bold uppercase">Marital Status</span><p className="text-[11px] font-bold text-white">Never Married</p></div>
                      </div>
                    </div>
                  </div>
                )}

                {drawerTab === 'audit' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    
                    {/* Documents List */}
                    <div className="space-y-3">
                      <span className="text-[10px] text-text-muted font-black uppercase tracking-widest block">Verification Documents</span>
                      <div className="space-y-2">
                        {selectedProfile.documents?.map(doc => (
                          <div key={doc.id} className="p-3 bg-[#120739]/50 border border-white/5 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white/5 rounded-lg"><FileText size={14} className="text-purple-300" /></div>
                              <div>
                                <span className="text-[10px] font-bold text-white block">{doc.type}</span>
                                <span className="text-[8px] text-text-muted font-bold">{doc.fileName}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${doc.status === 'Verified' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>{doc.status}</span>
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleDocumentAction(selectedProfile.id, doc.id, 'Verified', 'Looks good')} className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors" title="Approve Doc"><Check size={12} /></button>
                                <button onClick={() => handleDocumentAction(selectedProfile.id, doc.id, 'Rejected', 'Blurry image')} className="p-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors" title="Reject Doc"><X size={12} /></button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reported Complaints */}
                    {selectedProfile.complaints?.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-white/5">
                        <span className="text-[10px] text-rose-400 font-black uppercase tracking-widest block flex items-center gap-1.5"><AlertTriangle size={12} /> Reported Grievances</span>
                        <div className="space-y-3">
                          {selectedProfile.complaints.map(comp => (
                            <div key={comp.id} className="p-3 border border-rose-500/30 bg-rose-950/20 rounded-xl">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold text-white uppercase">{comp.type}</span>
                                <span className="text-[8px] px-1.5 py-0.5 bg-rose-500 text-white font-black uppercase rounded">{comp.status}</span>
                              </div>
                              <p className="text-[10px] text-rose-200 mt-1.5 italic">"{comp.evidence}"</p>
                              {comp.status === 'Pending' && (
                                <button 
                                  onClick={() => { setResolvingComplaint(comp); setResolutionNotes(''); }}
                                  className="mt-3 px-3 py-1 bg-rose-500/20 hover:bg-rose-500 text-rose-200 hover:text-white text-[9px] font-bold uppercase rounded-lg transition-colors border border-rose-500/30 w-full"
                                >
                                  Resolve Issue
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Transition Audit Timeline */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <span className="text-[10px] text-text-muted font-black uppercase tracking-widest block">Audit Timeline</span>
                      <div className="relative pl-3 border-l border-white/10 space-y-4">
                        {selectedProfile.auditLogs?.map(log => (
                          <div key={log.id} className="relative">
                            <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-purple-500 ring-4 ring-[#0c0533]" />
                            <span className="text-[8px] text-text-muted font-bold block">{new Date(log.timestamp).toLocaleString()} • {log.performedBy}</span>
                            <span className="text-[10px] font-bold text-white mt-0.5 block">{log.action}</span>
                            <span className="text-[9px] text-purple-200 block italic">"{log.reason}"</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-white/10 bg-[#120739]/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { updateMatrimonialProfileStatus(selectedProfile.id, 'Published', 'Admin manual publish'); triggerToast('Profile Published'); setSelectedProfile(null); }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    Publish Profile
                  </button>
                  <button 
                    onClick={() => { updateMatrimonialProfileStatus(selectedProfile.id, 'Correction Requested', 'Needs updates'); triggerToast('Correction requested'); setSelectedProfile(null); }}
                    className="px-3 py-2 bg-[#20134f] border border-white/10 hover:border-purple-500/30 text-purple-200 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors"
                  >
                    Request Corrections
                  </button>
                </div>
                <button 
                  onClick={() => { updateMatrimonialProfileStatus(selectedProfile.id, 'Rejected', 'Policy violation'); triggerToast('Profile Rejected', 'error'); setSelectedProfile(null); }}
                  className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-colors border border-rose-500/20"
                  title="Reject and hide profile"
                >
                  <Trash2 size={15} />
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── COMPLAINT RESOLUTION SUB-MODAL ─── */}
      <AnimatePresence>
        {resolvingComplaint && selectedProfile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md bg-[#120739] border border-rose-500/30 rounded-2xl overflow-hidden shadow-2xl text-white">
              <div className="p-4 bg-rose-500/10 border-b border-rose-500/20 flex items-center gap-2 text-rose-300">
                <AlertTriangle size={16} /> <span className="text-xs font-black uppercase tracking-wider">Resolve Grievance</span>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] text-text-muted font-bold uppercase">Complaint Type</span>
                  <p className="text-xs font-bold">{resolvingComplaint.type}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-text-muted font-bold uppercase">Resolution Action & Notes</label>
                  <textarea 
                    value={resolutionNotes} 
                    onChange={e => setResolutionNotes(e.target.value)} 
                    placeholder="E.g., Warned member to update their profession details immediately." 
                    className="w-full bg-[#0c0533] border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-rose-500" 
                    rows={3} 
                  />
                </div>
              </div>
              <div className="p-4 border-t border-white/10 flex items-center justify-end gap-2">
                <button onClick={() => setResolvingComplaint(null)} className="px-4 py-2 text-[10px] font-bold uppercase text-text-muted hover:text-white transition-colors">Cancel</button>
                <button 
                  onClick={() => {
                    resolveMatrimonialComplaint(selectedProfile.id, resolvingComplaint.id, 'Resolved', resolutionNotes);
                    triggerToast('Complaint marked as resolved.');
                    setResolvingComplaint(null);
                  }}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors shadow-lg shadow-rose-500/20"
                >
                  Confirm Resolution
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
