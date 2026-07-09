import React from 'react';
import { History, User, Lock, ShieldAlert, FileText, CheckCircle, XCircle } from 'lucide-react';

export const AuditTimeline = ({ logs }) => {
  if (!logs || logs.length === 0) return (
    <div className="card-neo p-10 flex flex-col items-center justify-center text-center">
      <History size={48} className="text-gray-200 mb-4" />
      <p className="text-sm font-bold text-gray-500">No recent activity found.</p>
    </div>
  );

  const getIcon = (iconName, status) => {
    const colorClass = status === 'success' ? 'text-emerald-500' : status === 'failed' ? 'text-rose-500' : 'text-brand-primary';
    const bgClass = status === 'success' ? 'bg-emerald-100' : status === 'failed' ? 'bg-rose-100' : 'bg-brand-primary/10';
    
    let IconComp = FileText;
    if (iconName === 'User') IconComp = User;
    if (iconName === 'Lock') IconComp = Lock;
    if (iconName === 'ShieldAlert') IconComp = ShieldAlert;
    
    return (
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass} ${bgClass} shrink-0 ring-4 ring-white z-10`}>
        <IconComp size={16} />
      </div>
    );
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="card-neo p-6">
        <h3 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2">
          <History size={16} className="text-brand-primary" />
          Audit Timeline
        </h3>
        
        <div className="relative pl-4 md:pl-8 py-2">
          {/* Vertical line */}
          <div className="absolute left-9 md:left-[52px] top-4 bottom-4 w-[2px] bg-gray-100"></div>
          
          <div className="space-y-8">
            {logs.map((log, idx) => (
              <div key={log.id || idx} className="relative flex gap-4 md:gap-6 items-start">
                {getIcon(log.icon, log.status)}
                
                <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      {log.action}
                      {log.status === 'success' && <CheckCircle size={14} className="text-emerald-500" />}
                      {log.status === 'failed' && <XCircle size={14} className="text-rose-500" />}
                    </h4>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                      {formatDate(log.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{log.description}</p>
                  
                  {log.device && (
                    <div className="inline-block mt-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50 px-2 py-1 rounded border border-gray-100">
                      Device: {log.device}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
