import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download } from 'lucide-react';

export const AuditLogs = ({ logs }) => {
  if (!logs || logs.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="card-neo overflow-hidden flex flex-col h-full"
    >
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-white flex items-center gap-2">
            <FileText size={16} className="text-indigo-400" />
            Recent Security Audits
          </h2>
        </div>
        <button className="flex items-center gap-1.5 text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-3 py-1.5 rounded-lg hover:bg-brand-primary hover:text-white transition-all">
          <Download size={14} />
          Export CSV
        </button>
      </div>

      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5">
              <th className="px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest text-gray-500">Action/Module</th>
              <th className="px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest text-gray-500">User</th>
              <th className="px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest text-gray-500">Time</th>
              <th className="px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3">
                  <p className="text-[12px] font-bold text-white">{log.action}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{log.module}</p>
                </td>
                <td className="px-5 py-3">
                  <p className="text-[11px] font-semibold text-gray-300">{log.user}</p>
                  <p className="text-[9px] text-brand-secondary font-bold uppercase tracking-wider">{log.role}</p>
                </td>
                <td className="px-5 py-3 text-[11px] text-gray-400">{log.timestamp}</td>
                <td className="px-5 py-3">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
