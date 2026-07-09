import React, { useState, useEffect } from 'react';
import { Zap, Plus, ArrowRight } from 'lucide-react';
import { fetchAutomationRules, updateAutomationRules } from '../services/automationService';

export const AutomationRules = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAutomationRules('cm_123').then(res => {
      setRules(res);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-6 text-white text-sm">Loading automation rules...</div>;

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap size={20} className="text-amber-400" />
            Automation Workflow Builder
          </h2>
          <p className="text-xs text-white/50">Create API-ready workflows to automate community tasks.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl hover:bg-brand-primary/80 transition-all">
          <Plus size={14} /> New Workflow
        </button>
      </div>

      <div className="space-y-4">
        {rules.map(rule => (
          <div key={rule.id} className="card-neo p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-white">{rule.name}</h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={rule.active} readOnly />
                <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold">
                IF: {rule.trigger}
              </div>
              <ArrowRight size={14} className="text-white/30" />
              {rule.actions.map((action, idx) => (
                <React.Fragment key={idx}>
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                    THEN: {action}
                  </div>
                  {idx < rule.actions.length - 1 && <ArrowRight size={14} className="text-white/30" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
