import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar } from '../../../../member/components/common/Avatar';
import { 
  MoreVertical, ShieldAlert, ShieldCheck, Clock, Settings, Search, Filter 
} from 'lucide-react';

export const CommunityHeadTable = ({ heads, searchQuery, setSearchQuery, onStatusChange }) => {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  
  const getStatusBadge = (status) => {
    switch(status) {
      case 'Active':
        return <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">Active</span>;
      case 'Suspended':
        return <span className="px-2 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold uppercase tracking-wider">Suspended</span>;
      case 'Pending Verification':
        return <span className="px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">Pending</span>;
      default:
        return <span className="px-2 py-1 rounded-md bg-gray-500/10 text-gray-400 border border-gray-500/20 text-[10px] font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  const filteredHeads = heads.filter(h => 
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (h.community && h.community.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-neo flex flex-col h-full bg-gradient-to-br from-brand-primary/5 to-transparent border-brand-primary/20"
    >
      {/* ─── TOOLBAR ─── */}
      <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-sm font-black text-white flex items-center gap-2">
          Head Roster
          <span className="px-2 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary text-[10px]">{heads.length}</span>
        </h2>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search heads, ID, community..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[12px] text-white focus:outline-none focus:border-brand-primary/50 w-full sm:w-[250px] transition-colors"
            />
          </div>
          <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
            <Filter size={16} />
          </button>
        </div>
      </div>

      {/* ─── TABLE ─── */}
      <div className="flex-1 overflow-x-auto overflow-y-auto min-h-[400px]">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="bg-white/[0.02] sticky top-0 z-10 backdrop-blur-md">
            <tr>
              <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/5">Profile</th>
              <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/5">Community</th>
              <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/5">Role</th>
              <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/5">Status</th>
              <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/5 text-center">Performance</th>
              <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredHeads.map((head, idx) => (
              <tr key={head.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar imageUrl={head.avatar} initials={head.name.charAt(0)} size="sm" color="bg-gradient-to-br from-indigo-500 to-purple-600" />
                    <div>
                      <p className="text-[13px] font-bold text-white leading-none">{head.name}</p>
                      <p className="text-[10px] text-gray-500 mt-1 font-mono">{head.id} • {head.memberId}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {head.community ? (
                    <div>
                      <p className="text-[12px] font-semibold text-gray-200">{head.community}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{head.city}</p>
                    </div>
                  ) : (
                    <span className="text-[11px] text-gray-500 italic">Unassigned</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Settings size={12} className="text-purple-400" />
                    <span className="text-[12px] font-medium text-gray-300">{head.role}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(head.status)}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center">
                    <span className={`text-[12px] font-black ${head.performanceScore >= 80 ? 'text-emerald-400' : head.performanceScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {head.performanceScore}%
                    </span>
                    <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden mt-1">
                      <div 
                        className={`h-full rounded-full ${head.performanceScore >= 80 ? 'bg-emerald-500' : head.performanceScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${head.performanceScore}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2 !opacity-100 transition-opacity">
                    {head.status === 'Active' ? (
                      <button 
                        onClick={() => onStatusChange(head.id, 'Suspended')}
                        className="p-1.5 rounded-lg !text-rose-600 hover:bg-rose-50 transition-colors" title="Suspend Head"
                      >
                        <ShieldAlert size={14} />
                      </button>
                    ) : head.status === 'Suspended' ? (
                      <button 
                        onClick={() => onStatusChange(head.id, 'Active')}
                        className="p-1.5 rounded-lg !text-emerald-600 hover:bg-emerald-50 transition-colors" title="Activate Head"
                      >
                        <ShieldCheck size={14} />
                      </button>
                    ) : null}
                    
                    <div className="relative">
                      <button 
                        onClick={() => setOpenDropdownId(openDropdownId === head.id ? null : head.id)}
                        className="p-1.5 rounded-lg !text-black hover:bg-gray-200 transition-colors" title="Options"
                      >
                        <MoreVertical size={14} />
                      </button>
                      
                      {openDropdownId === head.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)} />
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                            <button onClick={() => setOpenDropdownId(null)} className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50">Edit Profile</button>
                            <button onClick={() => setOpenDropdownId(null)} className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50">Manage Access</button>
                            <button onClick={() => { setOpenDropdownId(null); onStatusChange(head.id, 'Removed'); }} className="w-full text-left px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50">Delete Head</button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            
            {filteredHeads.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Search size={24} className="mb-2 opacity-50" />
                    <p className="text-[13px] font-medium">No community heads found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
