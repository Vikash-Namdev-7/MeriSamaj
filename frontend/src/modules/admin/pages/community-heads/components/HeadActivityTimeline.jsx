import React from 'react';
import { motion } from 'framer-motion';
import { Activity, UserPlus, ShieldAlert, Settings, FileText } from 'lucide-react';

export const HeadActivityTimeline = ({ logs }) => {
  
  const getActionIcon = (action) => {
    if (action.includes('Created')) return <UserPlus size={14} className="text-emerald-400" />;
    if (action.includes('Suspended')) return <ShieldAlert size={14} className="text-rose-400" />;
    if (action.includes('Permission') || action.includes('Role')) return <Settings size={14} className="text-purple-400" />;
    if (action.includes('Report') || action.includes('Audit')) return <FileText size={14} className="text-blue-400" />;
    return <Activity size={14} className="text-gray-400" />;
  };

  const getActionColor = (action) => {
    if (action.includes('Created')) return 'bg-emerald-500/10 border-emerald-500/20';
    if (action.includes('Suspended')) return 'bg-rose-500/10 border-rose-500/20';
    if (action.includes('Permission')) return 'bg-purple-500/10 border-purple-500/20';
    return 'bg-white/5 border-white/10';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="card-neo flex flex-col h-full bg-gradient-to-bl from-purple-900/10 to-transparent border-white/5"
    >
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-sm font-black text-white flex items-center gap-2">
          <Activity size={16} className="text-brand-primary" />
          Audit Logs
        </h2>
        <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider bg-brand-primary/10 px-2 py-0.5 rounded-full">
          Live
        </span>
      </div>

      <div className="p-5 flex-1 overflow-y-auto max-h-[400px]">
        {(!logs || logs.length === 0) ? (
          <div className="text-center text-gray-500 text-sm mt-10">No recent activity</div>
        ) : (
          <div className="relative border-l border-white/10 ml-3 space-y-6">
            {logs.map((log, idx) => (
              <div key={log.id} className="relative pl-6">
                {/* Timeline Dot */}
                <div className={`absolute -left-[11px] top-1 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center bg-[#1e1e2d] ${getActionColor(log.action)}`}>
                  {getActionIcon(log.action)}
                </div>

                <div className="mb-1 flex items-center justify-between gap-4">
                  <h4 className="text-[13px] font-bold text-white">{log.action}</h4>
                  <span className="text-[10px] text-gray-500 font-mono whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                  <span className="text-gray-300 font-semibold">{log.target}</span> • {log.details}
                </p>
                <p className="text-[10px] text-brand-primary/60 mt-1.5 font-medium">
                  By {log.performedBy}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-white/5 text-center">
        <button className="text-[11px] font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-wider">
          View All Logs
        </button>
      </div>
    </motion.div>
  );
};
