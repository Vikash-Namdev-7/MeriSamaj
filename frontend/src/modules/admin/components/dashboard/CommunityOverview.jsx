import React from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Settings, Activity } from 'lucide-react';

export const CommunityOverview = ({ communities }) => {
  if (!communities || communities.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card-neo overflow-hidden flex flex-col h-full"
    >
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div>
          <h2 className="text-sm font-black text-white flex items-center gap-2">
            <Activity size={16} className="text-brand-primary" />
            Community Health Overview
          </h2>
          <p className="text-[11px] text-text-muted mt-0.5">Real-time performance across active domains</p>
        </div>
        <button className="text-gray-400 hover:text-white transition-colors">
          <Settings size={16} />
        </button>
      </div>

      <div className="p-0 overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Community Name</th>
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Council Head</th>
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Members</th>
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Verification</th>
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {communities.map((community, idx) => (
              <tr key={community.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-5 py-3.5">
                  <p className="text-[13px] font-bold text-white group-hover:text-brand-primary transition-colors">{community.name}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{community.city}</p>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-[12px] font-medium text-gray-300">{community.head}</span>
                </td>
                <td className="px-5 py-3.5 text-center">
                  <span className="text-[12px] font-bold text-white bg-white/5 px-2.5 py-1 rounded-md">{community.members}</span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${community.verificationPct > 85 ? 'bg-emerald-400' : community.verificationPct > 70 ? 'bg-amber-400' : 'bg-rose-400'}`} 
                        style={{ width: `${community.verificationPct}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 w-6">{community.verificationPct}%</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                    community.health === 'Excellent' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                    community.health === 'Good' ? 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary' :
                    'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  }`}>
                    {community.health}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button className="text-gray-500 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors">
                    <MoreVertical size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
