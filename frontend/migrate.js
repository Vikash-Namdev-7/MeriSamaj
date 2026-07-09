const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, 'src/modules/head/pages'),
];

// Map of dark mode Tailwind classes/colors to Light mode Bootstrap-style classes
const replacements = [
  // Backgrounds
  { regex: /bg-\[\#0c0533\]/g, replacement: 'bg-white' },
  { regex: /bg-\[\#120739\]/g, replacement: 'bg-white' },
  { regex: /bg-\[\#1a0f4c\]/g, replacement: 'bg-gray-50' },
  { regex: /bg-\[\#20134f\]/g, replacement: 'bg-gray-100' },
  { regex: /bg-white\/5/g, replacement: 'bg-gray-50' },
  { regex: /bg-white\/10/g, replacement: 'bg-gray-100' },
  { regex: /bg-white\/2/g, replacement: 'bg-white' },
  
  // Borders
  { regex: /border-white\/5/g, replacement: 'border-gray-100' },
  { regex: /border-white\/10/g, replacement: 'border-gray-200' },
  { regex: /border-white\/20/g, replacement: 'border-gray-300' },
  { regex: /border-purple-500\/30/g, replacement: 'border-gray-200' },
  
  // Text
  { regex: /text-text-muted/g, replacement: 'text-gray-500' },
  { regex: /text-purple-200/g, replacement: 'text-gray-700' },
  { regex: /text-purple-250/g, replacement: 'text-gray-700' },
  { regex: /text-purple-300/g, replacement: 'text-gray-600' },
  { regex: /text-white\/90/g, replacement: 'text-gray-700' },
  { regex: /text-white\/70/g, replacement: 'text-gray-600' },
  
  // Specific gradients that shouldn't be dark
  { regex: /from-white via-purple-200 to-purple-400/g, replacement: 'from-gray-900 via-gray-700 to-gray-800' },
  { regex: /text-white/g, replacement: 'text-gray-800' }, // This is aggressive, might need manual touchups for buttons.
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const rule of replacements) {
        content = content.replace(rule.regex, rule.replacement);
      }
      
      // Fix buttons that got text-gray-800 instead of text-white
      content = content.replace(/bg-brand-primary text-gray-800/g, 'bg-brand-primary text-white');
      content = content.replace(/bg-purple-500 text-gray-800/g, 'bg-purple-500 text-white');
      content = content.replace(/bg-emerald-500 text-gray-800/g, 'bg-emerald-500 text-white');
      content = content.replace(/bg-rose-500 text-gray-800/g, 'bg-rose-500 text-white');
      content = content.replace(/bg-amber-500 text-gray-800/g, 'bg-amber-500 text-white');
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

targetDirs.forEach(processDirectory);
console.log('Migration complete.');
