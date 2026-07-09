import React from 'react';
import { Bell, Mail, Smartphone, MessageSquare } from 'lucide-react';

export const NotificationPreferences = ({ preferences, togglePreference, savePreferences, saving }) => {
  if (!preferences) return null;

  const categories = Object.keys(preferences).map(key => ({
    id: key,
    label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  }));

  return (
    <div className="space-y-6">
      <div className="card-neo overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
              <Bell size={16} className="text-brand-primary" />
              Notification Settings
            </h3>
            <p className="text-xs text-gray-500 mt-1">Choose how and when you want to be notified.</p>
          </div>
          <button 
            onClick={savePreferences}
            disabled={saving}
            className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-bold hover:bg-brand-secondary transition-all"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="p-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Email</span>
                  </div>
                </th>
                <th className="p-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <MessageSquare size={16} className="text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase">SMS</span>
                  </div>
                </th>
                <th className="p-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Smartphone size={16} className="text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Push</span>
                  </div>
                </th>
                <th className="p-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Bell size={16} className="text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase">In-App</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, idx) => (
                <tr key={cat.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                  <td className="p-4 text-sm font-medium text-gray-900">{cat.label}</td>
                  <td className="p-4 text-center">
                    <ToggleSwitch 
                      checked={preferences[cat.id].email} 
                      onChange={() => togglePreference(cat.id, 'email')} 
                    />
                  </td>
                  <td className="p-4 text-center">
                    <ToggleSwitch 
                      checked={preferences[cat.id].sms} 
                      onChange={() => togglePreference(cat.id, 'sms')} 
                    />
                  </td>
                  <td className="p-4 text-center">
                    <ToggleSwitch 
                      checked={preferences[cat.id].push} 
                      onChange={() => togglePreference(cat.id, 'push')} 
                    />
                  </td>
                  <td className="p-4 text-center">
                    <ToggleSwitch 
                      checked={preferences[cat.id].inApp} 
                      onChange={() => togglePreference(cat.id, 'inApp')} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ToggleSwitch = ({ checked, onChange }) => (
  <button 
    className={`w-10 h-5 rounded-full relative transition-colors ${checked ? 'bg-brand-primary' : 'bg-gray-200'}`}
    onClick={onChange}
  >
    <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${checked ? 'translate-x-5.5' : 'translate-x-1'}`} />
  </button>
);
