import React from 'react';
import { FileText, Upload, Download, Trash2 } from 'lucide-react';

export const CommunityDocuments = () => {
  const docs = [
    { id: 1, name: 'Community Bylaws & Constitution', format: 'PDF', size: '2.4 MB', date: 'Oct 12, 2024' },
    { id: 2, name: 'Membership Application Form', format: 'PDF', size: '1.1 MB', date: 'Sep 05, 2024' },
    { id: 3, name: 'Event Hall Booking Rules', format: 'PDF', size: '0.8 MB', date: 'Nov 20, 2024' },
    { id: 4, name: 'Official Letterhead Template', format: 'DOCX', size: '500 KB', date: 'Jan 15, 2025' }
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText size={20} className="text-brand-primary" />
            Community Documents
          </h2>
          <p className="text-xs text-white/50">Manage official forms, policies, and templates.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl hover:bg-brand-primary/80 transition-all">
          <Upload size={14} /> Upload New
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {docs.map(doc => (
          <div key={doc.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center text-[10px] font-black text-brand-primary uppercase">
                {doc.format}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-0.5">{doc.name}</h4>
                <p className="text-[10px] text-white/50">{doc.size} • Uploaded {doc.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all">
                <Download size={14} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-rose-500/20 text-rose-400 transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
