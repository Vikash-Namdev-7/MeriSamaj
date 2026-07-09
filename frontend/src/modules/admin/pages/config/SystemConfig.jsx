import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, Sliders, ShieldCheck } from 'lucide-react';

export const SystemConfig = () => {
  const [toast, setToast] = useState(null);

  // Initial State of operational systems
  const [systemState, setSystemState] = useState({
    memberSelfEdit: true,
    verificationVerificationEmails: false,
    dharmashalaWeekendSurge: true,
    matrimonialGroomBrideCombo: true
  });

  const [tariff, setTariff] = useState({
    hallAc: '5,000',
    suiteRoom: '1,800',
    standardRoom: '1,200'
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    showToast('Operational system configs saved successfully!');
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
          Global System Config panel
        </h2>
        <p className="text-xs text-text-muted mt-0.5">Configure operations tariffs, room surcharges and moderator system parameters</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Tariff */}
        <div className="card-neo p-5 lg:col-span-2 space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders size={16} className="text-purple-400" />
            Dharmashala Tariff Configuration
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Hall A (AC) Reservation Price per Day (INR)</label>
              <input 
                type="text" 
                required
                value={tariff.hallAc}
                onChange={(e) => setTariff({...tariff, hallAc: e.target.value})}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Suite Room Price per Day (INR)</label>
              <input 
                type="text" 
                required
                value={tariff.suiteRoom}
                onChange={(e) => setTariff({...tariff, suiteRoom: e.target.value})}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Standard Room Price per Day (INR)</label>
              <input 
                type="text" 
                required
                value={tariff.standardRoom}
                onChange={(e) => setTariff({...tariff, standardRoom: e.target.value})}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-brand-primary text-xs text-white"
              />
            </div>

            <button 
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold uppercase tracking-wider press-scale flex items-center gap-1.5 shadow"
            >
              <Save size={12} /> Save Tariffs
            </button>
          </form>
        </div>

        {/* Right Side: Operational toggles */}
        <div className="card-neo p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck size={16} className="text-purple-400" />
            Operations Toggles
          </h3>

          <div className="space-y-3.5">
            {Object.keys(systemState).map((item) => (
              <label 
                key={item} 
                className="flex items-center justify-between p-2 rounded-xl bg-white/3 border border-white/5 cursor-pointer hover:bg-white/5 transition-all text-[11px] font-bold text-white uppercase tracking-wider"
              >
                <span>{item.replace(/([A-Z])/g, ' $1').trim()}</span>
                <input 
                  type="checkbox" 
                  checked={systemState[item]}
                  onChange={() => {
                    const updated = { ...systemState, [item]: !systemState[item] };
                    setSystemState(updated);
                    showToast(`Updated: ${item.replace(/([A-Z])/g, ' $1').trim()}`);
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

export default SystemConfig;
