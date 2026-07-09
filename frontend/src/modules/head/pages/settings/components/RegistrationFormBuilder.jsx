import React from 'react';
import { GripVertical, Plus } from 'lucide-react';

export const RegistrationFormBuilder = () => {
  // A visual dummy representation of a drag-and-drop form builder
  const fields = [
    { id: 1, name: 'Full Name', type: 'Text', required: true },
    { id: 2, name: 'Email Address', type: 'Email', required: true },
    { id: 3, name: 'Mobile Number', type: 'Phone', required: true },
    { id: 4, name: 'Date of Birth', type: 'Date', required: false },
    { id: 5, name: 'Blood Group', type: 'Dropdown', required: false }
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">Registration Form Builder</h2>
          <p className="text-xs text-white/50">Drag and drop fields to customize the onboarding flow.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl hover:bg-brand-primary/80 transition-all">
          <Plus size={14} /> Add Field
        </button>
      </div>

      <div className="card-neo p-5 space-y-3">
        {fields.map(f => (
          <div key={f.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl group cursor-move hover:border-white/20 transition-all">
            <div className="flex items-center gap-3">
              <GripVertical size={16} className="text-white/20 group-hover:text-white/50" />
              <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center text-[9px] font-bold text-white uppercase">
                {f.type}
              </div>
              <span className="text-sm font-bold text-white">{f.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-[10px] text-white/50 font-bold uppercase tracking-wider cursor-pointer">
                <input type="checkbox" checked={f.required} readOnly className="accent-brand-primary" /> Required
              </label>
              <button className="text-rose-400 hover:text-rose-300 text-xs font-bold">Remove</button>
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-[10px] text-white/40 text-center uppercase tracking-widest mt-4">
        * Drag to reorder. API saving triggers on drop.
      </p>
    </div>
  );
};
