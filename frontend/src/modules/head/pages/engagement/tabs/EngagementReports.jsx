import React, { useState } from 'react';
import { engagementExportService } from '../services/engagementExportService';
import { FileText, Download } from 'lucide-react';
import { useData } from '../../../../member/context/DataProvider';

export const EngagementReports = () => {
  const { currentUser } = useData();
  const [exporting, setExporting] = useState(null);

  const handleExport = async (type, format) => {
    if (!currentUser?.communityId) return;
    setExporting(`${type}_${format}`);
    
    if (format === 'pdf') {
      await engagementExportService.exportToPDF(currentUser.communityId, type, {}, []);
    } else {
      await engagementExportService.exportToExcel(currentUser.communityId, type, {}, []);
    }
    
    setExporting(null);
  };

  const reports = [
    { id: 'daily_activity', title: 'Daily Activity Report', desc: 'Summary of all activities in the last 24 hours.' },
    { id: 'top_contributors', title: 'Top Contributors', desc: 'List of members with the highest engagement scores.' },
    { id: 'inactive_members', title: 'Inactive Members', desc: 'Members who have not engaged in over 30 days.' },
    { id: 'event_attendance', title: 'Event Attendance Report', desc: 'Historical attendance data for all community events.' }
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800">Engagement Reports</h3>
        <p className="text-sm text-gray-500">Generate and export comprehensive activity reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <div key={report.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                <FileText size={20} />
              </div>
              <h4 className="font-bold text-gray-800 flex-1 leading-tight">{report.title}</h4>
            </div>
            <p className="text-[13px] text-gray-500 mb-6 flex-1">{report.desc}</p>
            
            <div className="flex gap-2 mt-auto">
              <button 
                onClick={() => handleExport(report.id, 'pdf')}
                disabled={exporting !== null}
                className="flex-1 flex justify-center items-center gap-2 py-2 rounded-xl bg-gray-50 text-gray-700 text-[12px] font-bold hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <Download size={14} /> PDF
              </button>
              <button 
                onClick={() => handleExport(report.id, 'excel')}
                disabled={exporting !== null}
                className="flex-1 flex justify-center items-center gap-2 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-[12px] font-bold hover:bg-emerald-100 transition-colors border border-emerald-200"
              >
                <Download size={14} /> Excel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
