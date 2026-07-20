import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Search, Filter, Clock } from 'lucide-react';
import { communityHeadService } from '../../services/communityHeadService';
import { Avatar } from '../../../member/components/common/Avatar';

const HeadActivityMonitor = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await communityHeadService.getAuditLogs();
        setLogs(data);
      } catch (error) {
        console.error("Failed to load audit logs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-semibold mb-2">
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Activity className="text-brand-primary" /> Activity Monitor
          </h1>
          <p className="text-sm text-gray-500">Track all administrative actions performed by Community Heads in real-time.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3 w-full max-w-md">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Search logs..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            <button className="p-2 border border-gray-200 bg-white rounded-xl text-gray-500 hover:text-gray-900 transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-gray-500 font-medium">Loading activity logs...</div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <h3 className="text-gray-900 font-bold">No Activity Yet</h3>
              <p className="text-gray-500 text-sm">Community Heads haven't performed any logged actions.</p>
            </div>
          ) : (
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Timestamp</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Community Head</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Community</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Action</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{new Date(log.createdAt || log.timestamp).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{new Date(log.createdAt || log.timestamp).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar imageUrl={null} initials={log.performedBy?.charAt(0) || 'U'} size="sm" color="bg-indigo-500" />
                        <span className="text-sm font-bold text-gray-900">{log.performedBy || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">{log.target || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-brand-primary/10 text-brand-primary font-bold text-[11px] rounded-lg tracking-wide">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-[250px]">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeadActivityMonitor;
