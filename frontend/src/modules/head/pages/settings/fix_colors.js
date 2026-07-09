const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.jsx'));
files.push('../CommunitySettings.jsx');

const replacements = [
  { from: /text-white\/70/g, to: 'text-gray-600' },
  { from: /text-white\/60/g, to: 'text-gray-500' },
  { from: /text-white\/50/g, to: 'text-gray-500' },
  { from: /text-white\/40/g, to: 'text-gray-400' },
  { from: /text-white\/30/g, to: 'text-gray-400' },
  { from: /text-white/g, to: 'text-gray-900' }, // This must be after the fractional ones!
  { from: /bg-white\/5/g, to: 'bg-white' },
  { from: /bg-white\/10/g, to: 'bg-gray-50' },
  { from: /bg-black\/40/g, to: 'bg-gray-50' },
  { from: /bg-black\/20/g, to: 'bg-gray-50' }, // Main background
  { from: /border-white\/5/g, to: 'border-gray-100' },
  { from: /border-white\/10/g, to: 'border-gray-200' },
  { from: /border-white\/20/g, to: 'border-gray-300' },
  { from: /text-gray-900 flex items-center justify-center pointer-events-none/g, to: 'text-white flex items-center justify-center pointer-events-none' }, // fix for absolute overlay
];

// Special cases
// In overlays, we want text-white
// e.g. <span className="text-xs font-bold text-gray-900 flex items-center gap-2"> inside bg-black/60
// We might just fix those manually if there are only a few. 
// BrandingTab has one.

for (const file of files) {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  for (const r of replacements) {
    content = content.replace(r.from, r.to);
  }

  // Restore text-white on brand primary buttons
  content = content.replace(/bg-brand-primary text-gray-900/g, 'bg-brand-primary text-white');
  content = content.replace(/text-gray-900 text-xs font-bold rounded-xl hover:bg-brand-primary\/80/g, 'text-white text-xs font-bold rounded-xl hover:bg-brand-primary/80');
  content = content.replace(/bg-brand-primary\/20 text-brand-primary hover:bg-brand-primary hover:text-gray-900/g, 'bg-brand-primary/20 text-brand-primary hover:bg-brand-primary hover:text-white');
  
  // Restore text-white in overlay
  content = content.replace(/text-xs font-bold text-gray-900 flex items-center gap-2/g, 'text-xs font-bold text-white flex items-center gap-2');
  
  // Restore text-white for ActiveTab
  content = content.replace(/activeTpl === tpl.id \? 'bg-brand-primary text-gray-900'/g, "activeTpl === tpl.id ? 'bg-brand-primary text-white'");
  
  // Replace dark bg classes on select/input
  content = content.replace(/bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-primary text-xs font-bold text-gray-900/g, 'bg-white border border-gray-200 rounded-lg outline-none focus:border-brand-primary text-xs font-bold text-gray-900');

  // Input background overrides
  content = content.replace(/bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-primary/g, 'bg-white border border-gray-200 rounded-xl outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20');

  // In ThemeSettings, restore text-white for the preview action button
  content = content.replace(/font-black text-gray-900 text-xl z-10/g, 'font-black text-white text-xl z-10');

  // DirectorySettings select options background
  content = content.replace(/className="bg-surface"/g, 'className="bg-white"');
  
  // ThemeSettings select options
  content = content.replace(/className="bg-surface text-gray-900"/g, 'className="bg-white text-gray-900"');

  fs.writeFileSync(filePath, content, 'utf8');
}

console.log('Colors replaced successfully!');
