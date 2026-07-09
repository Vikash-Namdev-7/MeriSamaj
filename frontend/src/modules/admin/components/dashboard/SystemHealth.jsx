import React from 'react';
import { motion } from 'framer-motion';
import { Server, Database, CloudRain, HardDrive } from 'lucide-react';

export const SystemHealth = ({ health }) => {
  if (!health) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="card-neo p-5 flex flex-col h-full"
    >
      <div className="mb-4">
        <h2 className="text-sm font-black text-white flex items-center gap-2">
          <Server size={16} className="text-cyan-400" />
          Infrastructure Health
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-1">
        
        {/* API */}
        <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex flex-col justify-between hover:bg-white/10 transition-colors">
          <div className="flex justify-between items-start">
            <div className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg"><Server size={14} /></div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
          </div>
          <div className="mt-2">
            <h4 className="text-[12px] font-bold text-white">Core API</h4>
            <p className="text-[10px] text-gray-500">{health.api.latency} latency</p>
          </div>
        </div>

        {/* Database */}
        <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex flex-col justify-between hover:bg-white/10 transition-colors">
          <div className="flex justify-between items-start">
            <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg"><Database size={14} /></div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
          </div>
          <div className="mt-2">
            <h4 className="text-[12px] font-bold text-white">Database</h4>
            <p className="text-[10px] text-gray-500">{health.database.load} load</p>
          </div>
        </div>

        {/* Cache */}
        <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex flex-col justify-between hover:bg-white/10 transition-colors">
          <div className="flex justify-between items-start">
            <div className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg"><CloudRain size={14} /></div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
          </div>
          <div className="mt-2">
            <h4 className="text-[12px] font-bold text-white">Redis Cache</h4>
            <p className="text-[10px] text-gray-500">{health.redis.hitRate} hit rate</p>
          </div>
        </div>

        {/* Storage */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg"><HardDrive size={14} /></div>
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse"></span>
          </div>
          <div className="mt-2 relative z-10">
            <h4 className="text-[12px] font-bold text-white">Storage</h4>
            <p className="text-[10px] text-amber-200/70 font-semibold">{health.storage.used} used</p>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
