import React from 'react';
import { ShieldAlert, CheckCircle, Trash2, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export const ReportsComplaints = ({ data }) => {
  const { reports } = data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-white">Reports & Complaints</h2>
          <p className="text-xs text-gray-400">Manage user-reported profiles and moderation escalations</p>
        </div>
      </div>

      <div className="space-y-4">
        {reports.map((report, idx) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="card-neo p-5 flex flex-col md:flex-row gap-6 border-l-4 border-l-rose-500"
          >
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-wider">
                  {report.priority} Priority
                </span>
                <span className="text-xs text-gray-500">Reported {new Date(report.date).toLocaleDateString()}</span>
              </div>
              
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Reason: {report.reason}</h3>
                <p className="text-xs text-gray-400">{report.evidence}</p>
              </div>
              
              <div className="flex items-center gap-4 text-xs">
                <div className="text-gray-500">
                  Profile: <span className="text-gray-300 font-bold">{report.profileName}</span> ({report.profileId})
                </div>
                <div className="w-px h-3 bg-white/10"></div>
                <div className="text-gray-500">
                  Reporter: <span className="text-gray-300">{report.reporterName}</span>
                </div>
                <div className="w-px h-3 bg-white/10"></div>
                <div className="text-gray-500">
                  Community: <span className="text-brand-primary font-medium">{report.community}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-row md:flex-col gap-2 min-w-[140px] shrink-0 justify-center">
              <button className="flex-1 md:flex-none btn-secondary py-2 text-xs flex items-center justify-center gap-2">
                <MessageSquare size={14} /> Contact
              </button>
              <button className="flex-1 md:flex-none py-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 text-xs font-bold transition-all flex items-center justify-center gap-1">
                <CheckCircle size={14} /> Resolve
              </button>
              <button className="flex-1 md:flex-none py-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-xs font-bold transition-all flex items-center justify-center gap-1">
                <Trash2 size={14} /> Suspend
              </button>
            </div>
          </motion.div>
        ))}

        {reports.length === 0 && (
          <div className="card-neo p-12 flex flex-col items-center justify-center text-center">
            <ShieldAlert size={48} className="text-gray-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-300 mb-2">No Active Reports</h3>
            <p className="text-sm text-gray-500 max-w-sm">There are currently no user-reported profiles in the moderation queue.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsComplaints;
