import React from 'react';
import { motion } from 'framer-motion';

export const CommunityHealthCard = () => {
  // Static visual representation of platform health
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className="card-neo p-6 flex flex-col items-center justify-center text-center relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none"></div>
      
      <h3 className="text-sm font-black text-white w-full text-left mb-6">Global Platform Health</h3>
      
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Outer Ring */}
        <svg className="w-full h-full transform -rotate-90">
          <circle 
            cx="80" cy="80" r="70" 
            className="stroke-white/5" 
            strokeWidth="12" fill="none" 
          />
          <circle 
            cx="80" cy="80" r="70" 
            className="stroke-emerald-400" 
            strokeWidth="12" fill="none" 
            strokeDasharray="440" 
            strokeDashoffset="60" 
            strokeLinecap="round" 
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-white">92</span>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Excellent</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 w-full mt-8">
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Server Uptime</p>
          <p className="text-lg font-black text-white">99.9%</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Error Rate</p>
          <p className="text-lg font-black text-white">0.02%</p>
        </div>
      </div>
    </motion.div>
  );
};
