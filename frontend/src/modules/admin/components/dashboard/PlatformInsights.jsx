import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';

export const PlatformInsights = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.9 }}
      className="card-neo overflow-hidden flex flex-col h-full bg-gradient-to-br from-brand-primary/10 to-transparent border-brand-primary/20"
    >
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-sm font-black text-white flex items-center gap-2">
          <Sparkles size={16} className="text-brand-primary" />
          AI Platform Insights
        </h2>
      </div>

      <div className="p-5 space-y-4">
        
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp size={14} />
          </div>
          <div>
            <h4 className="text-[12px] font-bold text-white">Top Performing Community</h4>
            <p className="text-[10px] text-gray-400 mt-0.5">Mumbai Central Samaj generated the highest revenue (₹1.2L) and member growth (+45) this week.</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle size={14} />
          </div>
          <div>
            <h4 className="text-[12px] font-bold text-white">Verification Bottleneck</h4>
            <p className="text-[10px] text-gray-400 mt-0.5">Surat Diamond Samaj has 28 pending member approvals exceeding the 24-hour SLA.</p>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
