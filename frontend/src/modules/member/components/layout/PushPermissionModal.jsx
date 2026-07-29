import React, { useState, useEffect } from 'react';
import { Bell, ShieldCheck, X, Sparkles } from 'lucide-react';
import { usePushNotifications } from '../../hooks/usePushNotifications';

export const PushPermissionModal = () => {
  const { isSupported, permission, loading, requestPushPermission } = usePushNotifications();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show prompt only if supported, permission is still default ('default'), and user hasn't dismissed prompt
    const dismissed = localStorage.getItem('merisamaj_push_prompt_dismissed');
    if (isSupported && permission === 'default' && !dismissed) {
      // Delay prompt by 3 seconds for better UX
      const timer = setTimeout(() => setIsOpen(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSupported, permission]);

  if (!isOpen || permission !== 'default') return null;

  const handleEnable = async () => {
    const success = await requestPushPermission();
    if (success || Notification.permission !== 'default') {
      setIsOpen(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('merisamaj_push_prompt_dismissed', 'true');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 left-5 sm:left-auto sm:max-w-md z-[9999] bg-slate-900/95 backdrop-blur-md text-white p-5 rounded-2xl shadow-2xl border border-slate-700/60 animate-in fade-in slide-in-from-bottom-5">
      <div className="flex items-start justify-between gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-rose-500 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-lg">
          <Bell size={22} className="animate-bounce" />
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 shrink-0 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
          <Sparkles size={13} /> Stay Connected
        </div>
        <h3 className="text-base font-bold text-white mt-1">
          Enable Mobile & Browser Alerts
        </h3>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          Get real-time push notifications for urgent community announcements, matrimonial interests, event venue updates, and donation receipts even when you're away!
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck size={14} className="text-emerald-400" /> Safe & Spam-Free
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Later
          </button>
          <button
            onClick={handleEnable}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Enabling...' : 'Enable Alerts'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PushPermissionModal;
