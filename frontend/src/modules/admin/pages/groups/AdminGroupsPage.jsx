import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, CheckCircle2, Search, Plus, 
  Eye, ShieldCheck, Grid, List, 
  AlertCircle, ChevronDown, Download
} from 'lucide-react';
import { adminGroupApi } from '../../services/adminGroupApi';
import { Avatar } from '../../../member/components/common/Avatar';

export const AdminGroupsPage = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [stats, setStats] = useState({ total: 0, pending: 0, active: 0, archived: 0 });
  const [viewMode, setViewMode] = useState('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ status: 'all', category: 'all', community: 'all' });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await adminGroupApi.getGroups();
      const data = res.data.groups || [];
      setGroups(data);
      
      setStats({
        total: data.length,
        pending: data.filter(g => g.approvalStatus === 'pending').length,
        active: data.filter(g => g.approvalStatus === 'approved' && !g.isArchived).length,
        archived: data.filter(g => g.isArchived).length
      });
    } catch (err) {
      console.error(err);
      // Mock data fallback
      const mockData = [
        { _id: '1', name: 'Global Tech Network', description: 'Tech professionals', category: 'Professional', type: 'public', approvalStatus: 'approved', memberCount: 152, adminCount: 5, isArchived: false, communityId: { name: 'Jain Samaj' }, createdAt: new Date().toISOString() },
        { _id: '2', name: 'Youth Organization', description: 'National youth', category: 'Social', type: 'invite_only', approvalStatus: 'pending', memberCount: 12, adminCount: 2, isArchived: false, communityId: { name: 'Agrawal Samaj' }, createdAt: new Date().toISOString() },
      ];
      setGroups(mockData);
      setStats({ total: 2, pending: 1, active: 1, archived: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const filteredGroups = useMemo(() => {
    return groups.filter(g => {
      const matchSearch = !searchQuery || g.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filters.status === 'all' || g.approvalStatus === filters.status;
      const matchCategory = filters.category === 'all' || g.category === filters.category;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [groups, searchQuery, filters]);

  const handleApprove = async (id, name) => {
    try {
      await adminGroupApi.updateGroupStatus(id, 'approved');
      showToast(`${name} approved successfully`);
      fetchGroups();
    } catch (err) {
      showToast(`Approved ${name} (Mocked)`);
      setGroups(prev => prev.map(g => g._id === id ? { ...g, approvalStatus: 'approved' } : g));
    }
  };

  return (
    <div className="space-y-6 pb-16 relative">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border bg-emerald-50 border-emerald-200 text-emerald-700 text-xs font-semibold"
          >
            <CheckCircle2 size={16} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <section className="bg-white p-6 border border-slate-100 rounded-2xl shadow-sm relative overflow-hidden flex flex-col gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <Globe size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                Global Groups Governance
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Master moderation across all communities</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex bg-slate-50 border border-slate-200/80 rounded-lg p-0.5">
              <button 
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'table' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={14} />
              </button>
              <button 
                onClick={() => setViewMode('directory')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'directory' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Grid size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Groups</span>
            <h3 className="text-xl font-bold text-slate-800 mt-1">{stats.total}</h3>
          </div>
          <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100">
            <span className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider">Pending Approval</span>
            <h3 className="text-xl font-bold text-amber-600 mt-1">{stats.pending}</h3>
          </div>
          <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100">
            <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">Active Groups</span>
            <h3 className="text-xl font-bold text-emerald-600 mt-1">{stats.active}</h3>
          </div>
          <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Archived</span>
            <h3 className="text-xl font-bold text-slate-600 mt-1">{stats.archived}</h3>
          </div>
        </div>
      </section>

      <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search globally by group name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50/50 border border-slate-200/80 rounded-lg text-xs text-slate-850 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
          <div className="flex gap-3">
            <select 
              value={filters.community}
              onChange={(e) => setFilters({...filters, community: e.target.value})}
              className="bg-slate-50/50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs text-slate-600 outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">All Communities</option>
              <option value="jain">Jain Samaj</option>
              <option value="agrawal">Agrawal Samaj</option>
            </select>
            <select 
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="bg-slate-50/50 border border-slate-200/80 rounded-lg px-3 py-2 text-xs text-slate-600 outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="p-10 text-center text-slate-400 text-sm">Loading groups...</div>
      ) : viewMode === 'table' ? (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs text-slate-700">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider bg-slate-50/50">
                <th className="p-3.5">Group Info</th>
                <th className="p-3.5">Community</th>
                <th className="p-3.5">Members</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredGroups.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-slate-400">No groups found</td></tr>}
              {filteredGroups.map(group => (
                <tr key={group._id} className="hover:bg-slate-50/40 transition-all">
                  <td className="p-3.5 flex items-center gap-3">
                    <Avatar initials={group.name?.substring(0,2).toUpperCase()} size="sm" />
                    <div>
                      <p className="font-bold text-slate-800">{group.name}</p>
                      <p className="text-[10px] text-slate-400">{group.type === 'invite_only' ? 'Private' : 'Public'} • {group.category}</p>
                    </div>
                  </td>
                  <td className="p-3.5 font-semibold text-indigo-600">{group.communityId?.name || 'Unknown'}</td>
                  <td className="p-3.5">{group.memberCount}</td>
                  <td className="p-3.5">
                    {group.approvalStatus === 'approved' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100">Approved</span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-amber-50 text-amber-600 border border-amber-100">Pending</span>
                    )}
                  </td>
                  <td className="p-3.5 text-right flex items-center justify-end gap-2">
                    {group.approvalStatus === 'pending' && (
                      <button onClick={() => handleApprove(group._id, group.name)} className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[10px] font-semibold border border-indigo-100">Approve</button>
                    )}
                    <button onClick={() => navigate(`/admin/groups/${group._id}`)} className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded border border-slate-200/80"><Eye size={12} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredGroups.map(group => (
            <div key={group._id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <Avatar initials={group.name?.substring(0,2).toUpperCase()} size="md" />
                {group.approvalStatus === 'approved' ? (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-600">Approved</span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-50 text-amber-600">Pending</span>
                )}
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{group.name}</h4>
                <p className="text-xs text-indigo-600 font-semibold">{group.communityId?.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{group.memberCount} Members • {group.type}</p>
              </div>
              <div className="mt-auto pt-3 border-t border-slate-50 flex gap-2">
                <button onClick={() => navigate(`/admin/groups/${group._id}`)} className="flex-1 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-semibold text-slate-600 hover:bg-slate-100">Manage</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
