import React, { useState } from 'react';
import { Search, Filter, MoreVertical, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export const SubscribersTable = ({ data }) => {
  const { subscribers } = data;
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSubs = subscribers.filter(sub => 
    sub.communityName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sub.headName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search communities or heads..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-primary"
          />
        </div>
        <button className="btn-secondary py-2 px-4 flex items-center justify-center gap-2 text-sm">
          <Filter size={16} /> Filters
        </button>
      </div>

      <div className="card-neo overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Community</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Plan</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Renewal Date</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Usage</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubs.map((sub, idx) => (
                <motion.tr 
                  key={sub.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <td className="p-4">
                    <p className="text-sm font-bold text-white">{sub.communityName}</p>
                    <p className="text-xs text-gray-500">{sub.headName}</p>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-brand-primary/20 text-brand-primary rounded-md text-xs font-bold">
                      {sub.planName}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md w-max ${
                      sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                      sub.status === 'grace_period' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-rose-500/10 text-rose-400'
                    }`}>
                      {sub.status === 'grace_period' && <ShieldAlert size={12} />}
                      {sub.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-300">{new Date(sub.renewalDate).toLocaleDateString()}</p>
                    <p className="text-[10px] text-gray-500 uppercase">{sub.autoRenewal ? 'Auto' : 'Manual'}</p>
                  </td>
                  <td className="p-4">
                    <div className="w-full max-w-[120px] space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-gray-400">Storage</span>
                        <span className="text-gray-300 font-medium">{sub.usage.storageUsed}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredSubs.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No subscribers found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscribersTable;
