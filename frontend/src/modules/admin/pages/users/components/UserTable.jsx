import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Eye, ShieldAlert, Edit, Trash2, CheckCircle2, ShieldBan, X, RotateCcw, Clock } from 'lucide-react';
import { Avatar } from '../../../../member/components/common/Avatar';

export const UserTable = ({ users, onStatusChange, onViewProfile }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'Inactive': return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      case 'Suspended': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'Soft Deleted': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Community & Location</th>
              <th className="px-6 py-4">Verification</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-400 font-medium">
                  No users found matching the current filters.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar 
                        initials={user.name.charAt(0)} 
                        imageUrl={user.avatar} 
                        size="md" 
                        color="bg-purple-100 text-purple-600"
                      />
                      <div>
                        <p className="font-bold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">{user.memberId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-700">{user.phone}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-700">{user.communityName}</p>
                    <p className="text-xs text-gray-500">{user.city}, {user.state}</p>
                  </td>
                  <td className="px-6 py-4">
                    {user.isVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100 text-xs font-bold">
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-600 border border-amber-100 text-xs font-bold">
                        <Clock size={12} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wide ${getStatusColor(user.accountStatus)}`}>
                      {user.accountStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 relative">
                      <button 
                        onClick={() => onViewProfile(user)}
                        className="p-2 !text-black hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Profile"
                      >
                        <Eye size={18} />
                      </button>
                      
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                        className="p-2 !text-black hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {activeDropdown === user.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-[calc(100%+4px)] w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden"
                          >
                            <div className="px-3 py-2 border-b border-gray-100">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quick Actions</p>
                            </div>
                            
                            <button 
                              onClick={(e) => { e.stopPropagation(); }}
                              className="w-full text-left px-4 py-2 text-sm !text-black hover:bg-gray-50 flex items-center gap-2 font-medium"
                            >
                              <Edit size={14} className="text-blue-500" /> Edit User
                            </button>
                            
                            {user.accountStatus !== 'Suspended' && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStatusChange(user.id, 'Suspended');
                                  setActiveDropdown(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm !text-black hover:bg-amber-50 flex items-center gap-2 font-medium"
                              >
                                <ShieldAlert size={14} className="text-amber-500" /> Suspend User
                              </button>
                            )}

                            {user.accountStatus === 'Suspended' && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStatusChange(user.id, 'Active');
                                  setActiveDropdown(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm !text-black hover:bg-emerald-50 flex items-center gap-2 font-medium"
                              >
                                <ShieldBan size={14} className="text-emerald-500" /> Activate User
                              </button>
                            )}

                            <div className="my-1 border-t border-gray-100"></div>

                            {user.accountStatus !== 'Soft Deleted' ? (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStatusChange(user.id, 'Soft Deleted');
                                  setActiveDropdown(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm !text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                              >
                                <Trash2 size={14} /> Soft Delete
                              </button>
                            ) : (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStatusChange(user.id, 'Active');
                                  setActiveDropdown(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm !text-emerald-600 hover:bg-emerald-50 flex items-center gap-2 font-medium"
                              >
                                <RotateCcw size={14} /> Restore User
                              </button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
