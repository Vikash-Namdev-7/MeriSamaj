import React from 'react';
import { motion } from 'framer-motion';
import { Shield, MoreHorizontal, UserCheck, AlertCircle } from 'lucide-react';
import { Avatar } from '../../../member/components/common/Avatar';

export const HeadControlCenter = ({ heads }) => {
  if (!heads || heads.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="card-neo overflow-hidden flex flex-col h-full"
    >
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div>
          <h2 className="text-sm font-black text-white flex items-center gap-2">
            <Shield size={16} className="text-amber-400" />
            Council Head Access Control
          </h2>
          <p className="text-[11px] text-text-muted mt-0.5">Manage permissions and monitor activity of community heads</p>
        </div>
      </div>

      <div className="p-0 overflow-y-auto max-h-[400px]">
        {heads.map((head, idx) => (
          <div key={head.id} className="p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors flex items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar initials={head.name.substring(0, 2).toUpperCase()} size="md" color="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold" />
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#1e1e2d] ${head.status === 'Online' ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
              </div>
              
              <div>
                <h4 className="text-[13px] font-bold text-white">{head.name}</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">{head.community}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">Council Head</span>
                  <span className="text-[10px] text-gray-600">• Last seen: {head.lastLogin}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {head.pendingRequests > 0 && (
                <div className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">
                  <AlertCircle size={14} />
                  <span className="text-[11px] font-bold">{head.pendingRequests} pending</span>
                </div>
              )}
              
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] font-bold text-white hover:bg-brand-primary hover:border-brand-primary transition-all">
                  Manage
                </button>
                <button className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all">
                  <MoreHorizontal size={14} />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>
    </motion.div>
  );
};
