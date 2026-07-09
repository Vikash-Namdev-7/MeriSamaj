import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { fetchPermissions, updatePermissions } from '../services/permissionService';

export const PermissionMatrix = () => {
  const [perms, setPerms] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPermissions('cm_123').then(res => {
      setPerms(res);
      setLoading(false);
    });
  }, []);

  const handleToggle = (role, action) => {
    setPerms(prev => ({
      ...prev,
      [role]: { ...prev[role], [action]: !prev[role][action] }
    }));
  };

  const actions = ['view', 'create', 'edit', 'delete', 'approve', 'export'];

  if (loading) return <div className="p-6 text-white text-sm">Loading permission matrix...</div>;

  return (
    <div className="p-6 space-y-8 overflow-x-auto">
      <div className="space-y-1 min-w-[600px]">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck size={20} className="text-brand-primary" />
          Internal Permissions Matrix
        </h2>
        <p className="text-xs text-white/50">Define granular access control for your community sub-admins.</p>
      </div>

      <div className="bg-black/40 rounded-xl border border-white/10 overflow-hidden min-w-[600px]">
        <table className="w-full text-left text-sm text-white">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-4 py-3 font-bold text-white/70 uppercase tracking-wider text-[10px]">Role</th>
              {actions.map(a => (
                <th key={a} className="px-4 py-3 font-bold text-white/70 uppercase tracking-wider text-[10px] text-center">{a}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {Object.keys(perms).map(role => (
              <tr key={role} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-bold text-brand-primary text-xs">{role.replace(/([A-Z])/g, ' $1').trim()}</td>
                {actions.map(action => (
                  <td key={action} className="px-4 py-3 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={perms[role][action]}
                        onChange={() => handleToggle(role, action)}
                      />
                      <div className="w-8 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-end min-w-[600px]">
        <button 
          onClick={() => updatePermissions('cm_123', perms)}
          className="px-6 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl hover:bg-brand-primary/80 transition-all shadow-lg"
        >
          Save Permissions Matrix
        </button>
      </div>
    </div>
  );
};
