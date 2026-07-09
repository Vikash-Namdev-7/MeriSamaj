import React from 'react';
import { Palette, Layout, Type, Accessibility, Moon, Sun, Monitor } from 'lucide-react';
import { THEME_OPTIONS } from '../utils/constants';

export const ThemePreferences = ({ themePrefs, updatePreference, savePreferences, saving }) => {
  if (!themePrefs) return null;

  return (
    <div className="space-y-6">
      <div className="card-neo overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
              <Palette size={16} className="text-brand-primary" />
              Display & Personalization
            </h3>
            <p className="text-xs text-gray-500 mt-1">Customize the appearance of your dashboard.</p>
          </div>
          <button 
            onClick={savePreferences}
            disabled={saving}
            className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-bold hover:bg-brand-secondary transition-all"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Theme Selection */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Color Theme</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {THEME_OPTIONS.map(option => (
                <button
                  key={option.id}
                  onClick={() => updatePreference('theme', option.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${themePrefs.theme === option.id ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${themePrefs.theme === option.id ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {option.id === 'light' && <Sun size={16} />}
                      {option.id === 'dark' && <Moon size={16} />}
                      {option.id === 'system' && <Monitor size={16} />}
                      {option.id === 'purple' && <Palette size={16} />}
                    </div>
                  </div>
                  <span className={`block text-sm font-bold ${themePrefs.theme === option.id ? 'text-brand-primary' : 'text-gray-700'}`}>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Layout Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2"><Layout size={14}/> Layout Density</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white cursor-pointer hover:border-gray-200">
                  <div>
                    <span className="block text-sm font-bold text-gray-900 mb-1">Standard Mode</span>
                    <span className="text-[11px] text-gray-500">Comfortable spacing for better readability</span>
                  </div>
                  <input type="radio" name="compactMode" className="w-4 h-4 text-brand-primary focus:ring-brand-primary" checked={!themePrefs.compactMode} onChange={() => updatePreference('compactMode', false)} />
                </label>
                <label className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white cursor-pointer hover:border-gray-200">
                  <div>
                    <span className="block text-sm font-bold text-gray-900 mb-1">Compact Mode</span>
                    <span className="text-[11px] text-gray-500">Fit more content on the screen</span>
                  </div>
                  <input type="radio" name="compactMode" className="w-4 h-4 text-brand-primary focus:ring-brand-primary" checked={themePrefs.compactMode} onChange={() => updatePreference('compactMode', true)} />
                </label>
              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2"><Accessibility size={14}/> Accessibility</h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white cursor-pointer hover:border-gray-200">
                  <div>
                    <span className="block text-sm font-bold text-gray-900 mb-1">Reduced Motion</span>
                    <span className="text-[11px] text-gray-500">Minimize animations and transitions</span>
                  </div>
                  <input type="checkbox" className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary" checked={themePrefs.reducedMotion} onChange={(e) => updatePreference('reducedMotion', e.target.checked)} />
                </label>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
