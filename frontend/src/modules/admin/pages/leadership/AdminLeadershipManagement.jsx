import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, Shield, Users, Plus, Edit, Trash2, Loader, CheckCircle2, 
  XCircle, Lock, Mail, Phone, MapPin, User, Settings, RefreshCw, Key, 
  Building2, Globe, Search, Filter, Sparkles, Landmark
} from 'lucide-react';
import { axiosPrivate } from '../../../../core/api/axiosPrivate';

export const AdminLeadershipManagement = () => {
  const [leadershipData, setLeadershipData] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    isAppUser: true,
    roleType: 'sub_head', // head (President) or sub_head
    communityId: '',
    name: '', email: '', phone: '', password: '',
    designation: 'Vice President', department: 'Executive Governance',
    city: 'Indore', state: 'Madhya Pradesh', termYears: '2024-2027'
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch Communities for Admin Dropdown
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const res = await axiosPrivate.get('/admin/communities');
        setCommunities(res.data.data || []);
      } catch (err) {
        console.error('Failed to load communities for admin leadership', err);
      }
    };
    fetchCommunities();
  }, []);

  // Fetch Global Leadership Data
  const fetchGlobalLeadership = async (commId = selectedCommunity) => {
    setLoading(true);
    try {
      let url = '/admin/leadership';
      const params = [];
      if (commId !== 'all') params.push(`communityId=${commId}`);
      if (selectedDesignation !== 'all') params.push(`designation=${encodeURIComponent(selectedDesignation)}`);
      if (searchQuery.trim()) params.push(`search=${encodeURIComponent(searchQuery.trim())}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await axiosPrivate.get(url);
      if (res.data && res.data.data) {
        setLeadershipData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load global leadership:', err);
      showToast(err.response?.data?.message || err.message || 'Failed to load leadership data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalLeadership(selectedCommunity);
  }, [selectedCommunity, selectedDesignation]);

  const openCreateModal = () => {
    setEditId(null);
    setForm({
      isAppUser: true,
      roleType: 'sub_head',
      communityId: communities[0]?._id || '',
      name: '', email: '', phone: '', password: '',
      designation: 'Vice President', department: 'Executive Governance',
      city: 'Indore', state: 'Madhya Pradesh', termYears: '2024-2027'
    });
    setShowModal(true);
  };

  const openEditModal = (leader) => {
    setEditId(leader._id);
    setForm({
      isAppUser: leader.isAppUser !== false,
      roleType: leader.userRole === 'head' ? 'head' : 'sub_head',
      communityId: leader.communityId || '',
      name: leader.name || '',
      email: leader.email || '',
      phone: leader.phone || '',
      password: '',
      designation: leader.designation || 'Vice President',
      department: leader.department || 'Executive Governance',
      city: leader.city || 'Indore',
      state: leader.state || 'Madhya Pradesh',
      termYears: leader.termYears || '2024-2027'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!form.communityId) {
        showToast('Please select a target community.', 'error');
        return;
      }

      const payload = {
        ...form,
        role: form.roleType === 'head' ? 'President' : form.designation
      };

      let res;
      if (editId) {
        res = await axiosPrivate.put(`/head/leadership/sub-leaders/${editId}`, payload);
      } else {
        res = await axiosPrivate.post('/admin/leadership', payload);
      }

      if (res.data) {
        setShowModal(false);
        showToast(editId ? 'Leader updated successfully' : 'New Leader appointed successfully');
        fetchGlobalLeadership(selectedCommunity);
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to save leader', 'error');
    }
  };

  const handleToggleStatus = async (leader) => {
    try {
      const isAppUser = leader.isAppUser !== false;
      const res = await axiosPrivate.patch(`/admin/leadership/${leader._id}/status`, { isAppUser });
      if (res.data) {
        showToast(`Leader status updated to ${res.data.data.status || (res.data.data.isActive ? 'active' : 'inactive')}`);
        fetchGlobalLeadership(selectedCommunity);
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Status toggle failed', 'error');
    }
  };

  const handleDelete = async (leader) => {
    if (!window.confirm(`Are you sure you want to deactivate ${leader.name} from leadership?`)) return;
    try {
      const isAppUser = leader.isAppUser !== false;
      const res = await axiosPrivate.delete(`/admin/leadership/${leader._id}?isAppUser=${isAppUser}`);
      if (res.data) {
        showToast('Leader account deactivated successfully');
        fetchGlobalLeadership(selectedCommunity);
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Deactivation failed', 'error');
    }
  };

  const summary = leadershipData?.summary || {};
  const leadersList = leadershipData?.leaders || [];

  const filteredLeaders = useMemo(() => {
    return leadersList.filter(l => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = l.name?.toLowerCase().includes(q);
        const matchPhone = l.phone?.includes(q);
        const matchCity = l.city?.toLowerCase().includes(q);
        const matchDesig = l.designation?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchCity && !matchDesig) return false;
      }
      return true;
    });
  }, [leadersList, searchQuery]);

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-xl text-white font-bold text-xs flex items-center gap-2 ${
              toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
            }`}
          >
            <Sparkles size={16} />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600">
            <Crown size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Master Admin Global Leadership Desk</h1>
            <p className="text-xs text-slate-500 font-medium">Cross-community governance, President appointments & board supervision across India</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Community Filter Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-2xl">
            <Building2 size={16} className="text-slate-400" />
            <select
              value={selectedCommunity}
              onChange={(e) => setSelectedCommunity(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Communities (India)</option>
              {communities.map(c => (
                <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-2xl shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> Appoint Leader
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Leaders</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{summary.totalLeaders || 0}</h3>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">Platform Scope</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">App Sub-Heads</span>
          <h3 className="text-2xl font-black text-indigo-600 mt-1">{summary.appUserLeadersCount || 0}</h3>
          <span className="text-[10px] text-slate-500 font-medium mt-1 inline-block">With Mobile Login</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Offline Board Members</span>
          <h3 className="text-2xl font-black text-amber-600 mt-1">{summary.offlineBoardLeadersCount || 0}</h3>
          <span className="text-[10px] text-slate-500 font-medium mt-1 inline-block">Honorary Committee</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Status</span>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{summary.activeCount || 0}</h3>
          <span className="text-[10px] text-slate-500 font-medium mt-1 inline-block">{summary.inactiveCount || 0} Inactive</span>
        </div>
      </div>

      {/* Directory Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search leader name, designation or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedDesignation}
              onChange={(e) => setSelectedDesignation(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Designations</option>
              <option value="President">President (अध्यक्ष)</option>
              <option value="Vice President">Vice President (उपाध्यक्ष)</option>
              <option value="Secretary">Secretary (सचिव)</option>
              <option value="Treasurer">Treasurer (कोषाध्यक्ष)</option>
              <option value="Committee Member">Committee Member</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Leader Name</th>
                <th className="p-3">Community</th>
                <th className="p-3">Designation</th>
                <th className="p-3">City / State</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Leader Type</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeaders.length > 0 ? (
                filteredLeaders.map(l => (
                  <tr key={l._id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                      {l.userRole === 'head' && <Crown size={14} className="text-amber-500 shrink-0" />}
                      {l.name}
                    </td>
                    <td className="p-3 font-semibold text-indigo-700">{l.community}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        l.userRole === 'head' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {l.designation}
                      </span>
                    </td>
                    <td className="p-3">{l.city}, {l.state}</td>
                    <td className="p-3 font-mono">{l.phone || l.email || '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        l.isAppUser ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {l.isAppUser ? 'App User' : 'Offline Board'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        l.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1.5">
                      <button onClick={() => openEditModal(l)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-600" title="Edit Leader"><Edit size={14} /></button>
                      <button onClick={() => handleToggleStatus(l)} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-600" title="Toggle Active Status">
                        {l.isActive ? <XCircle size={14} className="text-rose-500" /> : <CheckCircle2 size={14} className="text-emerald-500" />}
                      </button>
                      <button onClick={() => handleDelete(l)} className="p-1.5 hover:bg-rose-50 rounded-xl text-rose-600" title="Deactivate Account"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-6 text-center text-slate-400 font-medium">No leaders found for selected criteria</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPOINT / EDIT LEADER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black text-slate-800">{editId ? 'Edit Leadership Details' : 'Appoint Platform Leader'}</h3>

            {/* Type Selector */}
            {!editId && (
              <div className="flex gap-3 p-1.5 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isAppUser: true })}
                  className={`flex-1 py-2 font-bold text-xs rounded-xl transition-all ${
                    form.isAppUser ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  App Leader (With Mobile Login)
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isAppUser: false })}
                  className={`flex-1 py-2 font-bold text-xs rounded-xl transition-all ${
                    !form.isAppUser ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Offline Board Member (No Login)
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Target Community *</label>
                  <select
                    value={form.communityId}
                    onChange={(e) => setForm({ ...form, communityId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    required
                  >
                    <option value="">Select Community</option>
                    {communities.map(c => (
                      <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Role Hierarchy *</label>
                  <select
                    value={form.roleType}
                    onChange={(e) => setForm({ ...form, roleType: e.target.value, designation: e.target.value === 'head' ? 'President' : 'Vice President' })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="sub_head">Executive Sub-Head</option>
                    <option value="head">Community Head / President</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                  <input 
                    type="text" required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number {form.isAppUser ? '*' : ''}</label>
                  <input 
                    type="text" required={form.isAppUser}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                  <input 
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                {form.isAppUser && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">{editId ? 'New Password (Optional)' : 'Login Password *'}</label>
                    <input 
                      type="text" required={!editId && form.isAppUser}
                      placeholder={editId ? 'Leave blank to keep unchanged' : 'Password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Designation *</label>
                  <input
                    type="text" required
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
                  <input 
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 font-bold text-xs text-slate-500">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-indigo-700">Save Leader</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
