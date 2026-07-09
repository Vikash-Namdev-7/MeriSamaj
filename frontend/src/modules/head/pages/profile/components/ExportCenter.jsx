import React, { useState } from 'react';
import { Download, FileText, Database, Shield, Activity, Settings } from 'lucide-react';
import { exportData } from '../services/exportService';

export const ExportCenter = () => {
  const [exporting, setExporting] = useState(null);

  const handleExport = async (type, format) => {
    setExporting(`${type}-${format}`);
    try {
      await exportData(type, format);
      // In a real app, trigger the file download here
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(null);
    }
  };

  const exportOptions = [
    { id: 'profile', title: 'Profile Information', icon: FileText, desc: 'Your personal details, contact info, and community role.' },
    { id: 'activity', title: 'Activity Logs', icon: Activity, desc: 'Your complete history of actions within the community.' },
    { id: 'security', title: 'Security & Logins', icon: Shield, desc: 'Login history, trusted devices, and security events.' },
    { id: 'preferences', title: 'Account Settings', icon: Settings, desc: 'Your notification, theme, and application preferences.' },
    { id: 'all_data', title: 'Complete Account Archive', icon: Database, desc: 'A complete backup of all data associated with your account.' }
  ];

  return (
    <div className="space-y-6">
      <div className="card-neo p-6">
        <h3 className="text-sm font-black text-gray-900 mb-2 flex items-center gap-2">
          <Download size={16} className="text-brand-primary" />
          Export Center
        </h3>
        <p className="text-xs text-gray-500 mb-6">Download copies of your data in various formats.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {exportOptions.map(opt => (
            <div key={opt.id} className="p-5 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/5 text-brand-primary flex items-center justify-center shrink-0">
                  <opt.icon size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-900 mb-1">{opt.title}</h4>
                  <p className="text-[11px] text-gray-500 mb-4 line-clamp-2">{opt.desc}</p>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <button 
                      onClick={() => handleExport(opt.id, 'pdf')}
                      disabled={exporting !== null}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {exporting === `${opt.id}-pdf` ? 'Exporting...' : 'PDF'}
                    </button>
                    <button 
                      onClick={() => handleExport(opt.id, 'csv')}
                      disabled={exporting !== null}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {exporting === `${opt.id}-csv` ? 'Exporting...' : 'CSV'}
                    </button>
                    {opt.id === 'all_data' && (
                      <button 
                        onClick={() => handleExport(opt.id, 'json')}
                        disabled={exporting !== null}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                      >
                        {exporting === `${opt.id}-json` ? 'Exporting...' : 'JSON'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
