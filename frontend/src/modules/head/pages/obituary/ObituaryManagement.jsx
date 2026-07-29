import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, Search, Filter, CheckCircle, XCircle, AlertCircle, Eye, Users, 
  MapPin, Calendar, Clock, X, Trash2, RefreshCw, Flame
} from 'lucide-react';
import headObituaryService from '../../services/headObituaryService';

export default function ObituaryManagement() {
  const [obituaries, setObituaries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedObituary, setSelectedObituary] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchObituariesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const [obRes, statsRes] = await Promise.all([
        headObituaryService.getAllObituaries(params),
        headObituaryService.getStats()
      ]);

      if (obRes.status === 'success') setObituaries(obRes.data || []);
      if (statsRes.status === 'success') setStats(statsRes.data || {});
    } catch (err) {
      console.error('Failed to load community obituaries:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load community obituaries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObituariesData();
  }, [statusFilter]);

  const handleStatusUpdate = async (id, newStatus) => {
    setActionLoading(true);
    try {
      await headObituaryService.updateStatus(id, newStatus);
      showToast(`Obituary status updated to ${newStatus}`);
      fetchObituariesData();
      if (selectedObituary && selectedObituary._id === id) {
        setSelectedObituary(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this obituary notice? This action cannot be undone.')) return;
    setActionLoading(true);
    try {
      await headObituaryService.deleteObituary(id);
      showToast('Obituary deleted successfully');
      setSelectedObituary(null);
      fetchObituariesData();
    } catch (err) {
      showToast(err.message || 'Failed to delete obituary', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold border ${
              toast.type === 'error' ? 'bg-rose-900 text-white border-rose-600' : 'bg-slate-900 text-white border-purple-500/30'
            }`}
          >
            {toast.type === 'error' ? <AlertCircle size={16} className="text-rose-400" /> : <CheckCircle size={16} className="text-emerald-400" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-purple-950 to-indigo-950 p-6 rounded-3xl border border-purple-500/20 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-widest mb-1">
            <Flame size={14} className="text-amber-400" /> Community Obituaries & Shradhanjali
          </div>
          <h1 className="text-2xl font-black tracking-tight">Community Obituary Desk</h1>
          <p className="text-xs text-purple-200/75 mt-1">Review, approve, and moderate obituary and condolence notices for your community.</p>
        </div>

        <button 
          onClick={fetchObituariesData} 
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold flex items-center gap-2 transition-all active:scale-95 self-start md:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Notices</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats?.totalObituaries || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm">
          <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Pending Approval</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats?.pendingApproval || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Approved</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats?.approvedCount || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm">
          <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Rejected</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{stats?.rejectedCount || 0}</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search deceased name, condolence message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchObituariesData()}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Content Table */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-100 flex flex-col items-center justify-center min-h-[300px]">
          <RefreshCw size={24} className="text-purple-600 animate-spin mb-3" />
          <p className="text-xs font-bold text-slate-500">Loading obituaries dataset...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 p-8 rounded-2xl text-center">
          <AlertCircle size={24} className="text-rose-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-rose-800">{error}</p>
          <button onClick={fetchObituariesData} className="mt-3 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold">Retry</button>
        </div>
      ) : obituaries.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center">
          <Flame size={32} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No obituary notices found for your community</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-3.5 px-4">Deceased & Age</th>
                  <th className="py-3.5 px-4">Date of Passing</th>
                  <th className="py-3.5 px-4">Posted By</th>
                  <th className="py-3.5 px-4">Condolences</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {obituaries.map((ob) => (
                  <tr key={ob._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{ob.deceasedName}</p>
                        <p className="text-[11px] text-slate-500 font-medium">{ob.age ? `${ob.age} Years` : 'Age N/A'}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800 flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400" /> {ob.dateOfPassing}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {ob.author?.name || 'Community Member'}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md inline-block">
                        {ob.haathJodeCount || 0} Condolences
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                        ob.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                        ob.status === 'Pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        'bg-rose-100 text-rose-700 border border-rose-200'
                      }`}>
                        {ob.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedObituary(ob)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        {ob.status !== 'Approved' && (
                          <button
                            onClick={() => handleStatusUpdate(ob._id, 'Approved')}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                        {ob.status !== 'Rejected' && (
                          <button
                            onClick={() => handleStatusUpdate(ob._id, 'Rejected')}
                            className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                            title="Reject"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(ob._id)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
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

      {/* Detail Modal */}
      {selectedObituary && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Obituary Notice Details</p>
                <h3 className="text-lg font-black">{selectedObituary.deceasedName}</h3>
              </div>
              <button 
                onClick={() => setSelectedObituary(null)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 transition-all"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Date of Passing</p>
                  <p className="font-bold text-slate-800">{selectedObituary.dateOfPassing}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Age</p>
                  <p className="font-bold text-slate-800">{selectedObituary.age || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Posted By</p>
                  <p className="font-bold text-slate-800">{selectedObituary.author?.name || 'Member'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Family Contact</p>
                  <p className="font-bold text-slate-800">{selectedObituary.familyContact || 'N/A'}</p>
                </div>
              </div>

              {selectedObituary.message && (
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Condolence Message</p>
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-medium text-slate-700 italic">"{selectedObituary.message}"</p>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                <div>
                  <p className="text-[11px] font-bold text-amber-900">Moderation Status</p>
                  <p className="text-[10px] text-amber-700 font-semibold uppercase">{selectedObituary.status}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusUpdate(selectedObituary._id, 'Approved')}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-[11px]"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedObituary._id, 'Rejected')}
                    className="px-3 py-1.5 bg-amber-600 text-white rounded-lg font-bold text-[11px]"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
