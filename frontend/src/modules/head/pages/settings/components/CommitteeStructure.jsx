import React from 'react';
import { Network, Plus, Users } from 'lucide-react';

export const CommitteeStructure = () => {
  const committees = [
    { id: 1, name: 'Executive Committee', role: 'Core Leadership', members: 12 },
    { id: 2, name: 'Youth Wing', role: 'Youth Engagement', members: 45 },
    { id: 3, name: 'Women Empowerment Cell', role: 'Women Welfare', members: 30 },
    { id: 4, name: 'Education & Trust Board', role: 'Scholarships & Grants', members: 8 }
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Network size={20} className="text-brand-primary" />
            Committee Structure
          </h2>
          <p className="text-xs text-white/50">Define the organizational hierarchy of your community.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl hover:bg-brand-primary/80 transition-all">
          <Plus size={14} /> Add Committee
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {committees.map(comm => (
          <div key={comm.id} className="card-neo p-5 space-y-4 hover:border-brand-primary/30 transition-all cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">{comm.name}</h4>
                <p className="text-[10px] font-bold tracking-wider uppercase text-brand-primary mt-1">{comm.role}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="flex items-center gap-1 text-xs text-white/70 font-bold">
                  <Users size={12} /> {comm.members}
                </span>
                <span className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">Members</span>
              </div>
            </div>
            
            <div className="flex gap-2 pt-4 border-t border-white/5">
              <button className="flex-1 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs font-bold text-white/70 transition-all">Edit Roles</button>
              <button className="flex-1 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs font-bold text-white/70 transition-all">Manage Hierarchy</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
