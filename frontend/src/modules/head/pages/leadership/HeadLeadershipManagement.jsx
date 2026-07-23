import React, { useState, useEffect } from 'react';
import { 
  Crown, Shield, Users, Plus, Edit, Trash2, Loader, CheckCircle2, 
  XCircle, Lock, Mail, Phone, MapPin, User, Settings, RefreshCw, Key
} from 'lucide-react';
import headLeadershipService from '../../../../core/api/headLeadershipService';
import { useData } from '../../../member/context/DataProvider';

export default function HeadLeadershipManagement() {
  const { user } = useData();
  const [subLeaders, setSubLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', designation: 'Vice President',
    department: 'Executive Governance', termYears: '2024-2027',
    headPermissions: {
      canViewDashboard: true,
      canViewMembers: true,
      canViewEvents: true,
      canCreateEvents: false,
      canViewDonations: true,
      canCreateDonationCampaigns: false,
      canViewFunds: true,
      canViewLeadership: true,
      canViewDharmashala: true,
      canViewSocial: true,
      canViewInvitations: true,
      canSendNotifications: false
    }
  });

  const availableModules = [
    { key: 'canViewDashboard', label: 'Dashboard Access' },
    { key: 'canViewMembers', label: 'Members Directory' },
    { key: 'canViewEvents', label: 'Events Module' },
    { key: 'canCreateEvents', label: 'Create Events' },
    { key: 'canViewDonations', label: 'Donations Module' },
    { key: 'canCreateDonationCampaigns', label: 'Create Campaigns' },
    { key: 'canViewFunds', label: 'Community Funds' },
    { key: 'canViewLeadership', label: 'Leadership' },
    { key: 'canViewDharmashala', label: 'Dharmashala Booking' },
    { key: 'canViewSocial', label: 'Social Feed' },
    { key: 'canViewInvitations', label: 'Invitations' },
    { key: 'canSendNotifications', label: 'Send Notifications' }
  ];

  // Head's own permissions granted by Admin
  const headGrantedPermissions = user?.headPermissions || {};

  const fetchSubLeaders = async () => {
    setLoading(true);
    try {
      const res = await headLeadershipService.getSubLeaders();
      if (res.status === 'success') {
        setSubLeaders(res.data);
      }
    } catch (err) {
      console.error("Failed to load sub-leaders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubLeaders();
  }, []);

  const openCreateModal = () => {
    setEditId(null);
    setForm({
      name: '', email: '', phone: '', password: '', designation: 'Vice President',
      department: 'Executive Governance', termYears: '2024-2027',
      headPermissions: {
        canViewDashboard: true,
        canViewMembers: true,
        canViewEvents: true,
        canViewDonations: true,
        canViewFunds: true,
        canViewLeadership: true,
        canViewDharmashala: true,
        canViewSocial: true
      }
    });
    setShowModal(true);
  };

  const openEditModal = (leader) => {
    setEditId(leader._id);
    setForm({
      name: leader.name || '',
      email: leader.email || '',
      phone: leader.phone || '',
      password: '',
      designation: leader.designation || 'Vice President',
      department: leader.department || 'Executive Governance',
      termYears: leader.termYears || '2024-2027',
      headPermissions: leader.headPermissions || {}
    });
    setShowModal(true);
  };

  const handleTogglePermission = (permKey) => {
    // Inheritance safeguard check: If Head doesn't have it, block
    if (user?.role !== 'admin' && !headGrantedPermissions[permKey]) {
      alert(`Cannot grant '${permKey}' permission because Master Admin has not granted it to your Head account.`);
      return;
    }

    setForm(prev => ({
      ...prev,
      headPermissions: {
        ...prev.headPermissions,
        [permKey]: !prev.headPermissions[permKey]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editId) {
        res = await headLeadershipService.updateSubLeader(editId, form);
      } else {
        res = await headLeadershipService.createSubLeader(form);
      }

      if (res.status === 'success') {
        setShowModal(false);
        fetchSubLeaders();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save sub-leader");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await headLeadershipService.toggleSubLeaderStatus(id);
      if (res.status === 'success') {
        fetchSubLeaders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this team member?")) return;
    try {
      const res = await headLeadershipService.deleteSubLeader(id);
      if (res.status === 'success') {
        fetchSubLeaders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Head Profile Header Card */}
      <div className="bg-gradient-to-r from-[#120b32] via-[#1e1145] to-[#2e1a6c] p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-purple-500/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-400 font-bold text-2xl shrink-0">
            <Crown size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-purple-200 mb-1">
              <Shield size={14} className="text-amber-400" /> Community Head Governance
            </div>
            <h1 className="text-2xl font-black text-white leading-tight">{user?.name || 'Community President'}</h1>
            <p className="text-xs font-semibold text-purple-200/90 mt-0.5">{user?.community || 'Agrawal Samaj'} • {user?.city || 'Indore'}</p>
          </div>
        </div>

        <button 
          onClick={openCreateModal}
          className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 shrink-0"
        >
          <Plus size={16} /> Add Team Sub-Leader
        </button>
      </div>

      {/* Sub-Leaders Table Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black text-slate-800">Team Members & Sub-Leaders</h2>
            <p className="text-xs text-slate-500">Subordinate leaders appointed to manage specific community modules.</p>
          </div>
          <button onClick={fetchSubLeaders} className="p-2 text-slate-400 hover:text-indigo-600">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400">
                <th className="p-4">Member Name</th>
                <th className="p-4">Designation</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Granted Modules</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center"><Loader className="animate-spin text-indigo-600 inline" /></td></tr>
              ) : subLeaders.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400 font-bold">No subordinate leaders appointed yet. Click "Add Team Sub-Leader" to assign roles.</td></tr>
              ) : (
                subLeaders.map(sl => {
                  const activePermsCount = Object.values(sl.headPermissions || {}).filter(Boolean).length;
                  return (
                    <tr key={sl._id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                            {sl.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{sl.name}</p>
                            <p className="text-[10px] text-slate-400">Joined: {sl.joiningDate ? new Date(sl.joiningDate).toLocaleDateString() : 'Recent'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-[11px]">
                          {sl.designation}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{sl.department}</span>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-slate-800">{sl.phone}</p>
                        <p className="text-[10px] text-slate-400">{sl.email || 'No email'}</p>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-bold rounded-lg text-[10px]">
                          {activePermsCount} Modules Enabled
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${sl.accountStatus === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {sl.accountStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => openEditModal(sl)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"><Edit size={14} /></button>
                        <button onClick={() => handleToggleStatus(sl._id)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600">
                          {sl.accountStatus === 'active' ? <XCircle size={14} className="text-rose-500" /> : <CheckCircle2 size={14} className="text-emerald-500" />}
                        </button>
                        <button onClick={() => handleDelete(sl._id)} className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT SUB-LEADER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black text-slate-800">{editId ? 'Edit Sub-Leader Permissions' : 'Appoint Sub-Leader'}</h3>
            <p className="text-xs text-slate-500">Sub-leaders will log in via Head Panel. Permissions can ONLY be selected from modules granted to you by Master Admin.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number *</label>
                  <input 
                    type="text" required
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

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{editId ? 'New Password (Optional)' : 'Login Password *'}</label>
                  <input 
                    type="text" required={!editId}
                    placeholder={editId ? 'Leave blank to keep unchanged' : 'Password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Designation *</label>
                  <select 
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="Vice President">Vice President (उपाध्यक्ष)</option>
                    <option value="Secretary">Secretary (सचिव)</option>
                    <option value="Treasurer">Treasurer (कोषाध्यक्ष)</option>
                    <option value="Coordinator">Coordinator (संयोजक)</option>
                    <option value="Executive Member">Executive Member (कार्यकारिणी सदस्य)</option>
                    <option value="Committee Member">Committee Member (समिति सदस्य)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Department</label>
                  <input 
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              {/* PERMISSION CHECKBOX MATRIX WITH INHERITANCE SAFEGUARD */}
              <div className="pt-3 border-t border-slate-100">
                <label className="text-xs font-black text-slate-800 block mb-2">Module Permission Matrix</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {availableModules.map(m => {
                    const isGrantedToHead = user?.role === 'admin' || headGrantedPermissions[m.key] === true;
                    const isChecked = form.headPermissions[m.key] === true;

                    return (
                      <div 
                        key={m.key} 
                        onClick={() => handleTogglePermission(m.key)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${!isGrantedToHead ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed' : isChecked ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                      >
                        <span className="text-xs font-bold">{m.label}</span>
                        {!isGrantedToHead ? (
                          <Lock size={14} className="text-slate-400" />
                        ) : (
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-indigo-600 focus:ring-0"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 font-bold text-xs text-slate-500">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-indigo-700">Save Sub-Leader</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
