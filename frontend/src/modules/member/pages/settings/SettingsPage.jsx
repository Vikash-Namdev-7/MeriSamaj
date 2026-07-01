import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { ChevronRight, Bell, Lock, User, Shield, Info, LogOut, Globe, Smartphone } from 'lucide-react';
import { useData } from '../../context/DataProvider';

const SettingsPage = () => {
  const { logoutUser } = useData();

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { id: 'profile', icon: User, label: 'Personal Information', color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'privacy', icon: Lock, label: 'Privacy & Security', color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { id: 'notifications', icon: Bell, label: 'Notifications', color: 'text-amber-500', bg: 'bg-amber-50' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { id: 'language', icon: Globe, label: 'Language', color: 'text-indigo-500', bg: 'bg-indigo-50', extra: 'English / Hindi' },
        { id: 'appearance', icon: Smartphone, label: 'App Appearance', color: 'text-purple-500', bg: 'bg-purple-50' },
      ]
    },
    {
      title: 'Support & About',
      items: [
        { id: 'help', icon: Shield, label: 'Help & Support', color: 'text-rose-500', bg: 'bg-rose-50' },
        { id: 'about', icon: Info, label: 'About MeriSamaj', color: 'text-slate-500', bg: 'bg-slate-100' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      <PageHeader title="Settings" />

      <div className="p-4 space-y-6 max-w-md mx-auto w-full">
        {settingsGroups.map((group, idx) => (
          <div key={idx} className="animate-stagger-fade-in" style={{ animationDelay: `${idx * 60}ms` }}>
            <h3 className="text-[12px] font-bold text-text-secondary uppercase tracking-wider mb-2.5 px-2">
              {group.title}
            </h3>
            <div className="card-neo overflow-hidden">
              {group.items.map((item, i) => (
                <div 
                  key={item.id} 
                  className={`flex items-center justify-between p-4 press-scale cursor-pointer transition-all hover:bg-purple-50/20 ${i !== group.items.length - 1 ? 'border-b border-purple-100/10' : ''}`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center border border-purple-150/15`}>
                      <item.icon size={18} className={item.color} />
                    </div>
                    <span className="text-[14px] font-bold text-text-primary">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.extra && <span className="text-[12px] font-semibold text-text-muted">{item.extra}</span>}
                    <ChevronRight size={18} className="text-purple-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Section */}
        <div className="mt-8 mb-4 animate-stagger-fade-in" style={{ animationDelay: '180ms' }}>
          <button 
            onClick={logoutUser}
            className="w-full bg-white border border-rose-100/60 shadow-sm p-4 flex items-center justify-center gap-2 rounded-2xl press-scale cursor-pointer hover:bg-rose-50/40 transition-colors"
          >
            <LogOut size={18} className="text-rose-600" />
            <span className="text-[14px] font-bold text-rose-600">Log out</span>
          </button>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">MeriSamaj App Version 1.2.0</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
