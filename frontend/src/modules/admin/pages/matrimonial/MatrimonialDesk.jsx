import React, { useState } from 'react';
import { Heart, Search, CheckCircle2, AlertCircle, ShieldAlert, Trash2, Check, Sparkles } from 'lucide-react';
import { useData } from '../../../member/context/DataProvider';
import { Avatar } from '../../../member/components/common/Avatar';

export const MatrimonialDesk = () => {
  const { matrimonialProfiles } = useData();
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
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
          <Heart className="text-pink-400" />
          Matrimonial Registry Moderation Desk
        </h2>
        <p className="text-xs text-text-muted mt-0.5">Audit new profiles, verify horoscopes, and manage matrimonial subscription tiers</p>
      </section>

      {/* ─── LISTING ─── */}
      <div className="card-neo p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2"><Sparkles size={16} className="text-pink-400" /> Active Registry Profiles</h3>

        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
          {matrimonialProfiles.map((p) => (
            <div key={p.id} className="p-3.5 rounded-2xl bg-white/3 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/5 transition-all">
              <div className="flex items-center gap-3">
                <Avatar initials={p.initials} size="md" color="bg-gradient-to-br from-pink-400 to-rose-600 text-white font-bold" />
                <div>
                  <h4 className="text-xs font-bold text-white">{p.name}</h4>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    {p.age} Yrs • {p.profession || 'CA'} • {p.city} • Religion: {p.community || 'Samaj'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <button onClick={() => showToast(`Flagged matrimonial profile for ${p.name}`)} className="px-3 py-1.5 rounded-lg text-rose-350 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-[10px] font-bold transition-all shrink-0">
                  Flag/Hide
                </button>
                <button onClick={() => showToast(`Verified horoscope for ${p.name}!`)} className="px-3 py-1.5 rounded-lg text-white bg-brand-primary hover:bg-purple-600 text-[10px] font-bold transition-all shadow shrink-0">
                  Verify Registry
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default MatrimonialDesk;
