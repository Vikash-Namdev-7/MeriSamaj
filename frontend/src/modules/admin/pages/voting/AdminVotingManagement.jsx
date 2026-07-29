import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, Search, Filter, CheckCircle, XCircle, Eye, Download, Users, 
  MapPin, Calendar, Clock, Sparkles, X, ChevronDown, Trash2, Globe, Award,
  AlertCircle, RefreshCw, Layers, BarChart3, User
} from 'lucide-react';
import { adminVotingService } from '../../services/adminVotingService';
import { axiosPrivate } from '../../../../core/api/axiosPrivate';

export const AdminVotingManagement = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalElections: 0,
    activeElections: 0,
    upcomingElections: 0,
    completedElections: 0,
    closedElections: 0,
    totalCandidates: 0,
    totalVotesCast: 0
  });

  const [communities, setCommunities] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [electionDetails, setElectionDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [communityFilter, setCommunityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (communityFilter !== 'all') params.communityId = communityFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const [elecRes, statsRes] = await Promise.all([
        adminVotingService.getAllElections(params),
        adminVotingService.getStats(params)
      ]);

      if (elecRes.success) setElections(elecRes.data || []);
      if (statsRes.success) setStats(statsRes.data || {});
    } catch (err) {
      console.error('Failed to load admin elections:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load voting & elections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [communityFilter, statusFilter]);

  // Fetch Communities for filter
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const res = await axiosPrivate.get('/admin/communities');
        setCommunities(res.data.data || []);
      } catch (err) {
        console.error('Failed to load communities for election filter', err);
      }
    };
    fetchCommunities();
  }, []);

  const handleViewDetails = async (election) => {
    setSelectedElection(election);
    setDetailsLoading(true);
    try {
      const res = await adminVotingService.getElectionById(election._id);
      if (res.success) {
        setElectionDetails(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load election details', 'error');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setActionLoading(true);
    try {
      await adminVotingService.updateStatus(id, newStatus);
      showToast(`Election status updated to ${newStatus}`);
      fetchData();
      if (selectedElection && selectedElection._id === id) {
        setSelectedElection(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      showToast(err.message || 'Failed to update election status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this election and all cast votes? This action cannot be undone.')) return;
    setActionLoading(true);
    try {
      await adminVotingService.deleteElection(id);
      showToast('Election deleted successfully');
      setSelectedElection(null);
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to delete election', 'error');
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
            className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 ${
              toast.type === 'error' ? 'bg-rose-500/90 text-white border-rose-600' : 'bg-emerald-500/90 text-white border-emerald-600'
            }`}
          >
            {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-950 via-indigo-900 to-purple-950 p-6 rounded-3xl border border-indigo-500/20 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-1">
            <CheckSquare size={14} className="text-indigo-400" /> Platform Governance Desk
          </div>
          <h1 className="text-2xl font-black tracking-tight">Voting & Elections Oversight</h1>
          <p className="text-xs text-indigo-200/75 mt-1">Platform-wide visibility, vote tallies, candidate profiles, and moderation for community elections & polls.</p>
        </div>

        <button 
          onClick={fetchData} 
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold flex items-center gap-2 transition-all active:scale-95 self-start md:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh List
        </button>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Elections</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalElections || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Active Polls</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.activeElections || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm">
          <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Upcoming</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.upcomingElections || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
          <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{stats.completedElections || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Closed</p>
          <p className="text-2xl font-black text-slate-600 mt-1">{stats.closedElections || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm">
          <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Candidates</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">{stats.totalCandidates || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm">
          <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Total Votes</p>
          <p className="text-2xl font-black text-purple-600 mt-1">{stats.totalVotesCast || 0}</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search election title, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchData()}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Community Filter */}
          <select
            value={communityFilter}
            onChange={(e) => setCommunityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Communities</option>
            {communities.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Table Data Container */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-100 flex flex-col items-center justify-center min-h-[300px]">
          <RefreshCw size={24} className="text-indigo-600 animate-spin mb-3" />
          <p className="text-xs font-bold text-slate-500">Loading election records...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 p-8 rounded-2xl text-center">
          <AlertCircle size={24} className="text-rose-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-rose-800">{error}</p>
          <button onClick={fetchData} className="mt-3 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold">Try Again</button>
        </div>
      ) : elections.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center">
          <CheckSquare size={32} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No elections or polls found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting search query or community filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-3.5 px-4">Election Title</th>
                  <th className="py-3.5 px-4">Community</th>
                  <th className="py-3.5 px-4">Candidates</th>
                  <th className="py-3.5 px-4">Total Votes</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {elections.map((elec) => (
                  <tr key={elec._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{elec.title}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{elec.description}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                        {elec.community}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      {elec.candidatesCount} Candidates
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                        {elec.totalVotesCast} votes
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                        elec.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                        elec.status === 'Upcoming' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        elec.status === 'Completed' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {elec.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewDetails(elec)}
                          className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                          title="View Vote Breakdown"
                        >
                          <BarChart3 size={14} />
                        </button>
                        {elec.status !== 'Closed' && (
                          <button
                            onClick={() => handleStatusChange(elec._id, 'Closed')}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                            title="Close Poll"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(elec._id)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                          title="Delete Election"
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

      {/* Election Detail Modal */}
      {selectedElection && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Election Audit & Vote Tally</p>
                <h3 className="text-lg font-black">{selectedElection.title}</h3>
              </div>
              <button 
                onClick={() => { setSelectedElection(null); setElectionDetails(null); }}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Description</p>
                <p className="font-semibold text-slate-800 leading-relaxed">{selectedElection.description}</p>
                <div className="pt-2 flex flex-wrap gap-4 text-[11px] text-slate-500 font-medium">
                  <span>Start: {new Date(selectedElection.startDate).toLocaleDateString()}</span>
                  <span>End: {new Date(selectedElection.endDate).toLocaleDateString()}</span>
                  <span>Community: {selectedElection.community}</span>
                </div>
              </div>

              {/* Candidate Vote Tally Breakdown */}
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
                  <Award size={16} className="text-indigo-600" /> Candidate Vote Breakdown
                </h4>

                {detailsLoading ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border">
                    <RefreshCw size={20} className="text-indigo-600 animate-spin mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-500">Calculating vote tallies...</p>
                  </div>
                ) : electionDetails && electionDetails.candidates ? (
                  <div className="space-y-3">
                    {electionDetails.candidates.map((cand, idx) => {
                      const totalCast = electionDetails.totalVotesCast || 1;
                      const percentage = Math.round(((cand.votesCount || 0) / totalCast) * 100);

                      return (
                        <div key={cand._id || idx} className="p-3 bg-white border border-slate-200 rounded-2xl space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-xs">
                                {cand.initials || cand.name?.[0] || 'C'}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{cand.name}</p>
                                <p className="text-[10px] text-slate-400">{cand.profession || 'Candidate'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-indigo-700 text-sm">{cand.votesCount || 0} votes</p>
                              <p className="text-[10px] font-bold text-slate-400">{percentage}%</p>
                            </div>
                          </div>

                          {/* Vote Progress Bar */}
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No candidate details available.</p>
                )}
              </div>

              {/* Moderation Status Controls */}
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-indigo-900">Change Election Status</p>
                  <p className="text-[10px] text-indigo-700 font-semibold uppercase">{selectedElection.status}</p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {['Active', 'Upcoming', 'Completed', 'Closed'].map(st => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedElection._id, st)}
                      disabled={selectedElection.status === st || actionLoading}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        selectedElection.status === st 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : 'bg-white text-slate-700 hover:bg-indigo-100 border border-indigo-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminVotingManagement;
