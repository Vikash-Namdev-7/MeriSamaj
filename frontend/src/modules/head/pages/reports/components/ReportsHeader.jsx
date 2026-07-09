import React from 'react';
import { motion } from 'framer-motion';
import { Avatar } from '../../../../member/components/common/Avatar';
import { RefreshCw, FileText, Download, Calendar, Activity } from 'lucide-react';

export const ReportsHeader = ({ currentUser, onRefresh, onGenerate, onExport, onSchedule }) => {
  return (
    <section className="card-neo p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full filter blur-3xl pointer-events-none" />
      
      {/* Identity & Context */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar 
            initials="RA" 
            size="lg" 
            imageUrl={currentUser?.avatar}
            color="bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-black text-xl shadow-lg border border-purple-400/20"
          />
          <div className="absolute -bottom-1 -right-1 bg-amber-500 border border-surface text-[8px] font-black text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">
            Analytics
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-secondary tracking-widest uppercase">Community Reports</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight mt-0.5">
            {currentUser?.community || 'Assigned Community'}
          </h2>
          <p className="text-xs text-text-muted mt-1 font-medium flex items-center gap-2">
            <span>Report Period: Year-to-Date</span>
            <span>•</span>
            <span className="text-purple-600">Last Updated: Just Now</span>
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-2.5 md:ml-auto">
        <button 
          onClick={onRefresh}
          className="p-2.5 rounded-xl bg-gray-700 hover:bg-gray-800 text-white active:scale-95 transition-all shadow-md flex items-center gap-2 tooltip-trigger relative group"
        >
          <RefreshCw size={16} />
          {/* Tooltip */}
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
            Refresh Data
          </div>
        </button>
        <button 
          onClick={onGenerate}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20 text-xs font-bold uppercase tracking-wider press-scale flex items-center gap-2 transition-colors"
        >
          <FileText size={14} /> Generate
        </button>
        <button 
          onClick={onExport}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 text-xs font-bold uppercase tracking-wider press-scale flex items-center gap-2 transition-colors"
        >
          <Download size={14} /> Export
        </button>
        <button 
          onClick={onSchedule}
          className="px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold uppercase tracking-wider press-scale flex items-center gap-2 shadow-lg shadow-purple-500/25"
        >
          <Calendar size={14} /> Schedule
        </button>
      </div>
    </section>
  );
};
