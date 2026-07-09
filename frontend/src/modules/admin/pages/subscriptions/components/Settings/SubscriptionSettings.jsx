import React from 'react';
import { Save, Globe, CreditCard, Shield } from 'lucide-react';

export const SubscriptionSettings = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg font-bold text-white">Global Settings</h2>
        <p className="text-xs text-gray-400">Configure core subscription behavior</p>
      </div>

      <div className="card-neo p-6 space-y-8">
        {/* Section 1 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Globe size={18} className="text-brand-primary" />
            <h3 className="text-sm font-bold text-white">Localization & Currency</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">Default Currency</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-brand-primary outline-none">
                <option>INR (₹)</option>
                <option>USD ($)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">Tax Rate (%)</label>
              <input type="number" defaultValue={18} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-brand-primary outline-none" />
            </div>
          </div>
        </div>

        <div className="h-[1px] w-full bg-white/5"></div>

        {/* Section 2 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={18} className="text-brand-primary" />
            <h3 className="text-sm font-bold text-white">Billing & Invoices</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">Invoice Prefix</label>
              <input type="text" defaultValue="INV-" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-brand-primary outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">Default Trial Days</label>
              <input type="number" defaultValue={14} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-brand-primary outline-none" />
            </div>
          </div>
        </div>

        <div className="h-[1px] w-full bg-white/5"></div>

        {/* Section 3 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-brand-primary" />
            <h3 className="text-sm font-bold text-white">Renewals & Grace Period</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400">Grace Period (Days)</label>
              <input type="number" defaultValue={7} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-brand-primary outline-none" />
              <p className="text-[10px] text-gray-500">Days to allow access after expiry before suspension.</p>
            </div>
            <div className="flex items-center gap-4 mt-6">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary peer-checked:after:bg-white"></div>
              </label>
              <div>
                <p className="text-sm font-bold text-white">Force Auto-Renewal</p>
                <p className="text-[10px] text-gray-500">Require payment method on file</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button className="btn-primary py-2 px-6 flex items-center gap-2">
            <Save size={16} /> Save Configurations
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSettings;
