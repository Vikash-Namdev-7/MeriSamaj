import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';

export const CommunityComparison = ({ data }) => {
  const { stats } = data;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-white">Community Performance & Comparison</h2>
          <p className="text-xs text-gray-400">Benchmark matrimonial metrics across different communities</p>
        </div>
        <select className="bg-white/5 border border-white/10 rounded-lg text-xs text-white px-3 py-1.5 focus:outline-none focus:border-brand-primary">
          <option>Sort by Profiles (High to Low)</option>
          <option>Sort by Success Rate</option>
          <option>Sort by Pending Reviews</option>
        </select>
      </div>

      <div className="card-neo overflow-hidden">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Community Name</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Total Profiles</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Approval Rate</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Match Success</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Pending Reviews</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Reports</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Global Maheshwari Samaj', profiles: 4200, approval: 92, match: 18.5, pending: 45, reports: 2 },
              { name: 'Agrawal Vikas Trust', profiles: 3800, approval: 88, match: 15.2, pending: 32, reports: 5 },
              { name: 'Jain Social Group', profiles: 2100, approval: 95, match: 22.1, pending: 12, reports: 0 },
              { name: 'Brahmin Global Forum', profiles: 1250, approval: 81, match: 10.4, pending: 65, reports: 12 },
              { name: 'Rajput Foundation', profiles: 940, approval: 75, match: 9.8, pending: 28, reports: 8 },
            ].map((c, idx) => (
              <motion.tr 
                key={c.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors group"
              >
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {idx < 3 && <Star size={14} className="text-amber-400" />}
                    <span className="text-sm font-bold text-white">{c.name}</span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <span className="text-sm text-gray-300 font-bold">{c.profiles.toLocaleString()}</span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden hidden sm:block">
                      <div className="h-full bg-emerald-400" style={{ width: `${c.approval}%` }}></div>
                    </div>
                    <span className="text-sm text-emerald-400 font-bold">{c.approval}%</span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <span className="text-sm text-brand-primary font-bold">{c.match}%</span>
                </td>
                <td className="p-4 text-right">
                  <span className={`text-sm font-bold px-2 py-1 rounded-md ${
                    c.pending > 50 ? 'bg-rose-500/10 text-rose-400' : 'text-amber-400'
                  }`}>
                    {c.pending}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <span className={`text-sm font-bold ${c.reports > 0 ? 'text-rose-400' : 'text-gray-500'}`}>
                    {c.reports}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommunityComparison;
