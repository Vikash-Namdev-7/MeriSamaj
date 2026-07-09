import React from 'react';
import { 
  Bell, Search, Moon, Sun, MonitorSmartphone, 
  ShieldCheck, Server, Clock, Database, ChevronDown
} from 'lucide-react';
import { Avatar } from '../../../member/components/common/Avatar';
import { motion } from 'framer-motion';

export const DashboardHeader = ({ adminName = "Master Admin", adminRole = "Platform Owner", onMenuClick }) => {
  // Current time state could be added here, static for demo
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mb-8"
    >
      <div className="card-neo p-4 px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left Side: Brand & Status */}
        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="text-purple-400" size={24} />
              Platform Command Center
            </h1>
            <p className="text-[11px] text-text-muted mt-0.5 uppercase tracking-widest font-bold">
              v2.4.0 • Production Env
            </p>
          </div>
        </div>

        {/* Center: Global Search (Hidden on small screens) */}
        <div className="hidden lg:flex flex-1 max-w-md mx-6">
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400 group-focus-within:text-brand-primary transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Search across platform (Cmd+K)..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Right Side: Tools & Profile */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          
          <div className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-lg bg-white/5 border border-white/5">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-300 font-bold uppercase tracking-wider">
              <Server size={12} className="text-emerald-400" />
              <span>API OK</span>
            </div>
            <div className="w-[1px] h-3 bg-white/10" />
            <div className="flex items-center gap-1.5 text-[10px] text-gray-300 font-bold uppercase tracking-wider">
              <Database size={12} className="text-emerald-400" />
              <span>DB Sync</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
            </button>
            <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
              <MonitorSmartphone size={18} />
            </button>
          </div>

          <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>

          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="text-right hidden md:block">
              <p className="text-[13px] font-bold text-white leading-none">{adminName}</p>
              <p className="text-[10px] text-brand-secondary mt-1 uppercase tracking-wider font-bold">{adminRole}</p>
            </div>
            <Avatar initials="MA" color="bg-gradient-to-br from-brand-primary to-purple-600 text-white font-black border-2 border-white/10 group-hover:border-brand-primary transition-all" size="md" />
            <ChevronDown size={14} className="text-gray-400 group-hover:text-white transition-colors hidden md:block" />
          </div>

        </div>
      </div>
    </motion.header>
  );
};
