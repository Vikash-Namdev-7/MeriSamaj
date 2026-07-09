import React from 'react';

export const ThemeSettings = ({ settings, updateDraft }) => {
  const theme = settings?.theme || {};

  const handleColorChange = (e) => {
    updateDraft('theme', e.target.name, e.target.value);
  };

  const handleSelectChange = (e) => {
    updateDraft('theme', e.target.name, e.target.value);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-gray-900">Theme Customization</h2>
        <p className="text-xs text-gray-500">Personalize colors, radius, and glassmorphism intensity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Colors */}
        <div className="card-neo p-5 space-y-4 bg-white border border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 mb-2">Color Palette</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Primary Color</label>
              <input 
                type="color" 
                name="primaryColor"
                value={theme.primaryColor || '#7e22ce'}
                onChange={handleColorChange}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Secondary Color</label>
              <input 
                type="color" 
                name="secondaryColor"
                value={theme.secondaryColor || '#db2777'}
                onChange={handleColorChange}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Accent Color</label>
              <input 
                type="color" 
                name="accentColor"
                value={theme.accentColor || '#fbbf24'}
                onChange={handleColorChange}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
              />
            </div>
          </div>
        </div>

        {/* UI Elements */}
        <div className="card-neo p-5 space-y-4 bg-white border border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 mb-2">UI Elements</h3>
          
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Card Border Radius</label>
              <select 
                name="cardRadius"
                value={theme.cardRadius || 'large'}
                onChange={handleSelectChange}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-brand-primary text-xs text-gray-900 focus:ring-2 focus:ring-brand-primary/20"
              >
                <option value="none">Square</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large (Default)</option>
                <option value="full">Fully Rounded</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Glass Intensity</label>
              <select 
                name="glassIntensity"
                value={theme.glassIntensity || 'medium'}
                onChange={handleSelectChange}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-brand-primary text-xs text-gray-900 focus:ring-2 focus:ring-brand-primary/20"
              >
                <option value="none">Solid (No Glass)</option>
                <option value="light">Light Blur</option>
                <option value="medium">Medium Blur (Default)</option>
                <option value="heavy">Heavy Blur</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live Preview Dummy */}
        <div className="card-neo p-5 flex flex-col items-center justify-center space-y-3 relative overflow-hidden bg-white border border-gray-200">
          <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`}} />
          <div 
            className="w-20 h-20 flex items-center justify-center font-black text-xl z-10 shadow-2xl"
            style={{ 
              backgroundColor: theme.primaryColor,
              color: '#ffffff',
              borderRadius: theme.cardRadius === 'full' ? '9999px' : theme.cardRadius === 'large' ? '1rem' : theme.cardRadius === 'medium' ? '0.5rem' : '0'
            }}
          >
            M
          </div>
          <button 
            className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider z-10"
            style={{ 
              backgroundColor: theme.accentColor,
              borderRadius: theme.cardRadius === 'full' ? '9999px' : theme.cardRadius === 'large' ? '0.5rem' : '0'
            }}
          >
            Action Button
          </button>
        </div>
      </div>
    </div>
  );
};
