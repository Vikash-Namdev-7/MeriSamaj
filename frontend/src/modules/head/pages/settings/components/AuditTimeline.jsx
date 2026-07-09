import React, { useState, useEffect } from 'react';
import { Clock, Activity } from 'lucide-react';
import { fetchAuditLogs } from '../services/backupService';

export const AuditTimeline = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs('cm_123').then(res => {
      setLogs(res);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-6 text-white text-sm">Loading audit logs...</div>;

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock size={20} className="text-brand-primary" />
          Audit Timeline
        </h2>
        <p className="text-xs text-white/50">Comprehensive log of all configuration and security changes.</p>
      </div>

      <div className="relative pl-6 border-l border-white/10 space-y-8">
        {logs.map((log, idx) => (
          <div key={log.id} className="relative">
            {/* Timeline Dot */}
            <div className="absolute -left-[30px] top-1 w-4 h-4 rounded-full bg-brand-primary/20 border-2 border-brand-primary flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity size={14} className="text-brand-primary" />
                  {log.action}
                </h4>
                <span className="text-[10px] text-white/40">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-white/70 mb-2">{log.detail}</p>
              <div className="text-[9px] font-bold uppercase tracking-widest text-brand-primary/70">
                Performed by: {log.user}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
