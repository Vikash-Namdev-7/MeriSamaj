import React, { useState } from 'react';
import { Search, Filter, ShieldCheck, Eye, CheckCircle, XCircle, Loader2, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { matrimonialService } from '../../services/matrimonialService';

const STATUS_COLORS = {
  active:   'bg-emerald-500/20 text-emerald-400',
  inactive: 'bg-gray-500/20 text-gray-400',
  hidden:   'bg-amber-500/20 text-amber-400',
  banned:   'bg-red-500/20 text-red-400',
};

const VERIFY_COLORS = {
  verified:   'text-emerald-400',
  pending:    'text-amber-400',
  rejected:   'text-red-400',
  unverified: 'text-gray-400',
};

export const ProfilesDirectory = ({ data }) => {
  const { profiles = [], refreshProfiles } = data;
  const [search, setSearch]       = useState('');
  const [verifyFilter, setVerify] = useState('');
  const [actionId, setActionId]   = useState(null);
  const [toast, setToast]         = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const filtered = profiles.filter(p => {
    const name = p.personal?.fullName || p.userId?.name || '';
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.city?.toLowerCase().includes(search.toLowerCase());
    const matchVerify = !verifyFilter || p.verificationStatus === verifyFilter;
    return matchSearch && matchVerify;
  });

  const handleVerify = async (id, status) => {
    setActionId(id);
    try {
      await matrimonialService.verifyProfile(id, { status, adminNote: '' });
      showToast(`Profile ${status} ✅`);
      await refreshProfiles?.();
    } catch (err) {
      showToast(err?.message || 'Action failed');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text" placeholder="Search by name or city..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/50"
          />
        </div>
        <select value={verifyFilter} onChange={e => setVerify(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-rose-500/50">
          <option value="">All Verification</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="unverified">Unverified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <p className="text-xs text-gray-500 font-semibold">{filtered.length} profiles</p>

      {/* Table */}
      <div className="card-neo overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Profile', 'Location', 'Status', 'Verification', 'Subscription', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-600">No profiles found.</td></tr>
              ) : filtered.map(p => {
                const name = p.personal?.fullName || p.userId?.name || 'Unknown';
                const age  = p.age;
                const photo = p.photos?.find(ph => ph.isPrimary)?.url;
                const isLoading = actionId === p._id;

                return (
                  <tr key={p._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    {/* Profile */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500/30 to-pink-500/30 flex items-center justify-center font-bold text-rose-400 text-sm shrink-0 overflow-hidden border border-white/5">
                          {photo ? <img src={photo} alt={name} className="w-full h-full object-cover" /> : name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{name}{age ? `, ${age}` : ''}</p>
                          <p className="text-[10px] text-gray-500">{p.personal?.gender || ''} · {p.personal?.community || ''}</p>
                        </div>
                      </div>
                    </td>
                    {/* Location */}
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {[p.location?.city, p.location?.state].filter(Boolean).join(', ') || '—'}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${STATUS_COLORS[p.status] || STATUS_COLORS.inactive}`}>
                        {p.status}
                      </span>
                    </td>
                    {/* Verification */}
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold flex items-center gap-1 ${VERIFY_COLORS[p.verificationStatus] || VERIFY_COLORS.unverified}`}>
                        {p.verificationStatus === 'verified' ? <ShieldCheck size={12} /> : null}
                        {p.verificationStatus || 'unverified'}
                      </span>
                    </td>
                    {/* Subscription */}
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {p.subscription?.isActive ? (
                        <span className="text-amber-400 font-bold">Premium</span>
                      ) : 'Free'}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {p.verificationStatus !== 'verified' && (
                          <button onClick={() => handleVerify(p._id, 'verified')} disabled={isLoading}
                            className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 disabled:opacity-40 transition-colors">
                            {isLoading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                          </button>
                        )}
                        {p.verificationStatus !== 'rejected' && (
                          <button onClick={() => handleVerify(p._id, 'rejected')} disabled={isLoading}
                            className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 disabled:opacity-40 transition-colors">
                            <XCircle size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfilesDirectory;
