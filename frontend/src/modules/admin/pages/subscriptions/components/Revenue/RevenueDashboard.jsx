import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export const RevenueDashboard = ({ data }) => {
  const { stats } = data;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-white">Revenue Analytics</h2>
          <p className="text-xs text-gray-400">Enterprise financial tracking and forecasting</p>
        </div>
        <div className="flex gap-2">
          <select className="bg-white/5 border border-white/10 rounded-lg text-xs text-white px-3 py-1.5 focus:outline-none focus:border-brand-primary">
            <option>Last 6 Months</option>
            <option>This Year</option>
            <option>All Time</option>
          </select>
          <button className="btn-secondary py-1.5 px-4 text-xs">Export Report</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-neo p-5">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Monthly Recurring (MRR)</p>
          <h3 className="text-2xl font-black text-white mt-1">₹{(stats.mrr / 1000).toFixed(1)}k</h3>
          <div className="mt-2 flex items-center gap-1 text-emerald-400 text-xs font-bold">
            <TrendingUp size={14} /> +8.4%
          </div>
        </div>
        <div className="card-neo p-5">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Annual Recurring (ARR)</p>
          <h3 className="text-2xl font-black text-white mt-1">₹{(stats.arr / 100000).toFixed(1)}L</h3>
          <div className="mt-2 flex items-center gap-1 text-emerald-400 text-xs font-bold">
            <TrendingUp size={14} /> +12.1%
          </div>
        </div>
        <div className="card-neo p-5">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Average Revenue Per User</p>
          <h3 className="text-2xl font-black text-white mt-1">₹3,420</h3>
          <div className="mt-2 flex items-center gap-1 text-emerald-400 text-xs font-bold">
            <TrendingUp size={14} /> +2.4%
          </div>
        </div>
        <div className="card-neo p-5">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Revenue Churn</p>
          <h3 className="text-2xl font-black text-white mt-1">{stats.churnRate}%</h3>
          <div className="mt-2 flex items-center gap-1 text-rose-400 text-xs font-bold">
            <TrendingDown size={14} /> -0.5%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-neo p-6 min-h-[300px] flex flex-col">
          <h3 className="text-sm font-bold text-white mb-6">Revenue Trajectory</h3>
          <div className="flex-1 flex items-end gap-2">
            {stats.revenueTrend?.map((pt, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full relative flex items-end justify-center h-48 bg-white/5 rounded-t-lg overflow-hidden border-b border-white/10">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(pt.revenue / 500000) * 100}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="w-full bg-gradient-to-t from-brand-primary/20 to-brand-primary group-hover:opacity-80 transition-all rounded-t-lg"
                  ></motion.div>
                </div>
                <span className="text-[10px] text-gray-400 font-bold uppercase">{pt.month}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-1 card-neo p-6">
          <h3 className="text-sm font-bold text-white mb-6">Revenue by Plan</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">Enterprise Edition</span>
                <span className="text-white font-bold">65%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-brand-primary" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">Premium Edition</span>
                <span className="text-white font-bold">25%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-400" style={{ width: '25%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300">Basic Edition</span>
                <span className="text-white font-bold">10%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueDashboard;
