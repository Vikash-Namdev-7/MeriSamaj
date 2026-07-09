import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck, Heart, Users, Calendar } from 'lucide-react';
import { useData } from '../../../member/context/DataProvider';

export const CouncilSettings = () => {
  const { currentUser, updateProfile } = useData();
  const [toast, setToast] = useState(null);

  // Initial State of Council Features
  const [features, setFeatures] = useState({
    matrimonial: true,
    donations: true,
    dharmashala: true,
    professional: true,
    elections: true
  });

  const [communityName, setCommunityName] = useState(currentUser?.community || 'Agrawal Samaj Indore');
  const [councilEmail, setCouncilEmail] = useState('council.head@samaj.org');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({ community: communityName });
    showToast('Council configurations updated successfully!');
  };

  return (
    <div className="space-y-6 pb-10">
      
      {/* ─── TOAST ─── */}
      {toast && (
        <div className="fixed top-6 right-6 z-55 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 backdrop-blur-md">
          <CheckCircle2 size={18} />
          <span className="text-sm font-bold tracking-wide">{toast}</span>
        </div>
      )}

      {/* ─── HEADER ─── */}
      <section>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Settings className="text-purple-400" />
          Executive Council Settings
        </h2>
        <p className="text-xs text-text-muted mt-0.5">Configure global portal parameters, active modules, and council credentials</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Forms */}
        <div className="card-neo p-5 lg:col-span-2 space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck size={16} className="text-purple-400" />
            General Council Parameters
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Samaj Association Name</label>
              <input 
                type="text" 
                required
                value={communityName}
                onChange={(e) => setCommunityName(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Official Council Contact Email</label>
              <input 
                type="email" 
                required
                value={councilEmail}
                onChange={(e) => setCouncilEmail(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
              />
            </div>

            <button 
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold uppercase tracking-wider press-scale flex items-center gap-1.5 shadow"
            >
              <Save size={12} /> Save Configurations
            </button>
          </form>
        </div>

        {/* Right Side: Toggle desk features */}
        <div className="card-neo p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">Active Portal Modules</h3>
          <p className="text-[11px] text-text-muted">Enable/disable features globally across member dashboards</p>

          <div className="space-y-3 pt-2">
            {Object.keys(features).map((feat) => (
              <label 
                key={feat} 
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/3 border border-white/5 cursor-pointer hover:bg-white/5 transition-all text-xs font-bold text-white uppercase tracking-wider"
              >
                <span>{feat} Desk</span>
                <input 
                  type="checkbox" 
                  checked={features[feat]}
                  onChange={() => {
                    const updated = { ...features, [feat]: !features[feat] };
                    setFeatures(updated);
                    showToast(`${updated[feat] ? 'Enabled' : 'Disabled'} ${feat} desk globally!`);
                  }}
                  className="w-4 h-4 text-purple-600 rounded bg-white/5 border-white/10 accent-purple-600"
                />
              </label>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default CouncilSettings;
