import React from 'react';
import { Laptop, Smartphone, Monitor, Globe, LogOut } from 'lucide-react';

export const SessionManagement = ({ sessions, terminateSession }) => {
  if (!sessions) return null;

  const getDeviceIcon = (device) => {
    if (device.toLowerCase().includes('iphone') || device.toLowerCase().includes('android')) return <Smartphone size={20} />;
    if (device.toLowerCase().includes('mac') || device.toLowerCase().includes('windows')) return <Laptop size={20} />;
    return <Monitor size={20} />;
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="card-neo p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
              <Laptop size={16} className="text-brand-primary" />
              Active Sessions
            </h3>
            <p className="text-xs text-gray-500 mt-1">Review devices that are currently logged into your account.</p>
          </div>
          <button className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
            <LogOut size={14} /> Terminate All Other Sessions
          </button>
        </div>

        <div className="space-y-4">
          {sessions.map(session => (
            <div key={session.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${session.isCurrent ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-gray-400 shadow-sm'}`}>
                  {getDeviceIcon(session.device)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    {session.device}
                    {session.isCurrent && <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] uppercase tracking-wider font-black">Current</span>}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 mt-1 font-medium">
                    <span className="flex items-center gap-1"><Globe size={10} /> {session.browser} on {session.os}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>{session.ip}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>{session.location}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Last active: {formatDate(session.time)}</p>
                </div>
              </div>
              
              {!session.isCurrent && (
                <button 
                  onClick={() => terminateSession(session.id)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-xs font-bold transition-all"
                >
                  Log Out
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
