import React from 'react';
import { Activity } from 'lucide-react';

export const AuditLogs = ({ data }) => {
  // Derive audit-like activity from profiles (in lieu of a real audit endpoint)
  const { profiles = [], reports = [] } = data;

  const events = [
    ...profiles.slice(0, 20).map(p => ({
      id: p._id,
      type: 'profile_created',
      user: p.personal?.fullName || p.userId?.name || 'Unknown',
      description: `Matrimonial profile created`,
      time: p.createdAt,
    })),
    ...reports.slice(0, 10).map(r => ({
      id: r._id,
      type: 'report_filed',
      user: r.reporterName || 'Anonymous',
      description: `Report filed: ${r.reason}`,
      time: r.createdAt,
    })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time));

  const TYPE_COLORS = {
    profile_created: 'text-blue-400',
    report_filed:    'text-amber-400',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Activity size={16} className="text-gray-400" />
        <h3 className="text-base font-black text-white">Recent Activity Log</h3>
      </div>

      {events.length === 0 ? (
        <div className="card-neo p-12 text-center text-gray-600 font-semibold">No activity yet.</div>
      ) : (
        <div className="card-neo divide-y divide-white/5">
          {events.map(ev => (
            <div key={ev.id + ev.type} className="flex items-start gap-4 px-5 py-3.5 hover:bg-white/3 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{ev.user}</p>
                <p className={`text-xs font-semibold mt-0.5 ${TYPE_COLORS[ev.type] || 'text-gray-400'}`}>{ev.description}</p>
              </div>
              <p className="text-[10px] text-gray-600 font-semibold shrink-0 mt-1">
                {ev.time ? new Date(ev.time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
