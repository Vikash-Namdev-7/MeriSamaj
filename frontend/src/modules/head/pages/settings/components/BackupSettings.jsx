import React, { useState } from 'react';
import { HardDrive, Download, Upload, RefreshCw } from 'lucide-react';
import { triggerManualBackup } from '../services/backupService';
import { exportToJson } from '../utils/exporters';

export const BackupSettings = ({ settings }) => {
  const [loading, setLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState('2 hours ago');

  const handleBackup = async () => {
    setLoading(true);
    await triggerManualBackup('cm_123');
    setLastBackup('Just now');
    setLoading(false);
  };

  const handleExport = () => {
    exportToJson(settings, 'merisamaj_community_settings.json');
  };

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <HardDrive size={20} className="text-brand-primary" />
          Backup & Restore
        </h2>
        <p className="text-xs text-white/50">Safeguard your configuration and export data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-neo p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Manual Backup</h3>
            <p className="text-[10px] text-white/50 mt-1">Create an instant snapshot of your current settings.</p>
            <p className="text-[10px] font-bold text-brand-primary mt-4">Last backup: {lastBackup}</p>
          </div>
          <button 
            onClick={handleBackup}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white transition-all rounded-xl text-xs font-bold"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <HardDrive size={14} />}
            {loading ? 'Creating Snapshot...' : 'Create Backup Now'}
          </button>
        </div>

        <div className="card-neo p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Export Configuration</h3>
            <p className="text-[10px] text-white/50 mt-1">Download settings as a JSON file for local safekeeping.</p>
          </div>
          <button 
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 text-white hover:bg-white/10 transition-all rounded-xl border border-white/10 text-xs font-bold"
          >
            <Download size={14} /> Download JSON
          </button>
        </div>

        <div className="card-neo p-6 space-y-4 md:col-span-2 border-dashed border-2 border-white/20 bg-transparent flex flex-col items-center justify-center min-h-[200px]">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/50">
            <Upload size={24} />
          </div>
          <div className="text-center">
            <h3 className="text-sm font-bold text-white">Restore from Backup</h3>
            <p className="text-[10px] text-white/50 mt-1">Upload a previously exported JSON file to restore settings.</p>
          </div>
          <button className="px-6 py-2 bg-white text-black hover:bg-white/90 transition-all rounded-xl text-xs font-bold shadow-xl">
            Select JSON File
          </button>
        </div>
      </div>
    </div>
  );
};
