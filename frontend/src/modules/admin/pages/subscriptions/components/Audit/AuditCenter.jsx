import React from 'react';
import { Download, Search, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export const AuditCenter = ({ data }) => {
  const { auditLogs } = data;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search audit logs..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-primary"
          />
        </div>
        <button className="btn-secondary py-2 px-4 flex items-center justify-center gap-2 text-sm">
          <Download size={16} /> Export Logs
        </button>
      </div>

      <div className="card-neo overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Timestamp</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Performed By</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log, idx) => (
              <motion.tr 
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock size={14} />
                    <span className="text-sm">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm font-bold text-white">{log.action}</span>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-white/10 text-gray-300 rounded text-xs">{log.performedBy}</span>
                </td>
                <td className="p-4">
                  <p className="text-sm text-gray-400">{log.details}</p>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditCenter;
