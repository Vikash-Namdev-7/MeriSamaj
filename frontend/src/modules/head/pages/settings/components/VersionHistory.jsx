import React, { useState, useEffect } from 'react';
import { History, GitBranch, RotateCcw } from 'lucide-react';
import { fetchVersionHistory } from '../services/backupService';

export const VersionHistory = () => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVersionHistory('cm_123').then(res => {
      setVersions(res);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-6 text-white text-sm">Loading version history...</div>;

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <History size={20} className="text-brand-primary" />
          Configuration Versioning
        </h2>
        <p className="text-xs text-white/50">Track major changes and roll back to previous stable states.</p>
      </div>

      <div className="space-y-4">
        {versions.map(v => (
          <div key={v.version} className={`card-neo p-5 flex items-center justify-between transition-all ${v.active ? 'border-brand-primary bg-brand-primary/5' : 'hover:bg-white/5'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${v.active ? 'bg-brand-primary text-white' : 'bg-white/5 text-white/40'}`}>
                <GitBranch size={16} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  {v.version}
                  {v.active && <span className="px-2 py-0.5 rounded text-[8px] uppercase tracking-widest font-black bg-brand-primary/20 text-brand-primary">Active</span>}
                </h4>
                <p className="text-[10px] text-white/50">Published on {new Date(v.date).toLocaleDateString()} by {v.author}</p>
              </div>
            </div>
            
            {!v.active && (
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-xs font-bold transition-all">
                  Compare
                </button>
                <button className="px-3 py-1.5 flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs font-bold transition-all">
                  <RotateCcw size={12} /> Rollback
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
