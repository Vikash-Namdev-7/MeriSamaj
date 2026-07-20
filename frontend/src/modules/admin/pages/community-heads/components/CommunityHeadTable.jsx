import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '../../../../member/components/common/Avatar';
import { 
  MoreVertical, ShieldAlert, ShieldCheck, Clock, Settings, Search, Filter, Mail, Phone, ChevronRight, Trash2, Edit
} from 'lucide-react';

export const CommunityHeadTable = ({ heads, searchQuery, onStatusChange, onDelete, onEdit, onRowClick }) => {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  
  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'active':
        return <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 text-[11px] font-bold tracking-wide">Active</span>;
      case 'inactive':
      case 'suspended':
        return <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 text-[11px] font-bold tracking-wide">Inactive</span>;
      case 'pending verification':
        return <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 text-[11px] font-bold tracking-wide">Pending</span>;
      default:
        return <span className="px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 border border-gray-200 text-[11px] font-bold tracking-wide">{status || 'Unknown'}</span>;
    }
  };

  const filteredHeads = heads.filter(h => 
    h.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.community?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full overflow-x-auto min-h-[400px]">
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
          <tr>
            <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Head Profile</th>
            <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Contact Info</th>
            <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Assigned Communities</th>
            <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-center">Status</th>
            <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filteredHeads.map((head) => (
            <tr 
              key={head.id} 
              onClick={() => onRowClick && onRowClick(head.id)}
              className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <Avatar imageUrl={head.avatar} initials={head.name.charAt(0)} size="md" color="bg-gradient-to-br from-brand-primary to-indigo-600" />
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-brand-primary transition-colors">{head.name}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 font-mono">ID: {head.id.slice(-6).toUpperCase()}</p>
                  </div>
                </div>
              </td>
              
              <td className="px-6 py-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={12} className="text-gray-400" />
                    <span className="text-xs font-medium">{head.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={12} className="text-gray-400" />
                    <span className="text-xs font-medium">{head.phone || 'N/A'}</span>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4">
                {head.community && head.community !== 'None' ? (
                  <div>
                    <p className="text-[12px] font-bold text-gray-800 truncate max-w-[200px]">{head.community}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wide">{head.assignedCommunityIds?.length || 1} Communities</p>
                  </div>
                ) : (
                  <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-500 text-[10px] font-bold tracking-wide">UNASSIGNED</span>
                )}
              </td>
              
              <td className="px-6 py-4 text-center">
                {getStatusBadge(head.status)}
              </td>
              
              <td className="px-6 py-4 text-right relative">
                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(openDropdownId === head.id ? null : head.id);
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    >
                      <MoreVertical size={16} />
                    </button>
                    
                    <AnimatePresence>
                      {openDropdownId === head.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-10 w-48 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-50 origin-top-right"
                        >
                          <div className="py-1 min-w-[160px]">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onRowClick && onRowClick(head.id);
                                setOpenDropdownId(null);
                              }}
                              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-brand-primary/5 hover:text-brand-primary flex items-center gap-2 transition-colors"
                            >
                              <Settings size={14} /> View Details
                            </button>
                            {head.status !== 'Active' ? (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStatusChange(head.id, 'Active');
                                  setOpenDropdownId(null);
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 flex items-center gap-2 transition-colors"
                              >
                                <ShieldCheck size={14} /> Activate Account
                              </button>
                            ) : (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStatusChange(head.id, 'Suspended');
                                  setOpenDropdownId(null);
                                }}
                                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                              >
                                <ShieldAlert size={14} /> Suspend Account
                              </button>
                            )}
                            <div className="h-px bg-gray-100 my-1"></div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete && onDelete(head.id);
                                setOpenDropdownId(null);
                              }}
                              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                            >
                              <Trash2 size={14} /> Delete Account
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-brand-primary transition-colors" />
                </div>
              </td>
            </tr>
          ))}
          
          {filteredHeads.length === 0 && (
            <tr>
              <td colSpan="5" className="px-6 py-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-900 font-bold text-sm">No Community Heads Found</p>
                <p className="text-gray-500 text-xs mt-1">Try adjusting your search criteria or add a new head.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
