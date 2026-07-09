import React from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, TrendingUp } from 'lucide-react';

export const RevenueDashboard = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="card-neo p-5 flex flex-col h-full bg-gradient-to-br from-emerald-900/20 to-transparent"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-black text-white flex items-center gap-2">
            <IndianRupee size={16} className="text-emerald-400" />
            Financial Overview
          </h2>
        </div>
        <select className="bg-white/5 border border-white/10 text-xs text-white rounded-lg px-2 py-1 outline-none">
          <option value="this_month">This Month</option>
          <option value="last_month">Last Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="mb-6">
        <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-widest mb-1">Total Revenue</p>
        <div className="flex items-end gap-3">
          <h3 className="text-3xl font-black text-white leading-none">₹28.5L</h3>
          <span className="flex items-center text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
            <TrendingUp size={12} className="mr-1" />
            14.5%
          </span>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-gray-400">Subscriptions</span>
            <span className="text-white font-bold">₹15.2L</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 w-[55%]"></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-gray-400">Donations</span>
            <span className="text-white font-bold">₹8.5L</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 w-[30%]"></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-gray-400">Event Tickets</span>
            <span className="text-white font-bold">₹4.8L</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-pink-400 w-[15%]"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
