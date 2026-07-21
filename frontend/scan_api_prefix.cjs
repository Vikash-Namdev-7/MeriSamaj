const fs = require('fs');
const path = require('path');
function walk(dir, cb) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, cb);
    else if (f.endsWith('.js') || f.endsWith('.jsx')) cb(full);
  }
}
const hits = [];
walk('src', (file) => {
  const lines = fs.readFileSync(file,'utf8').split('\n');
  lines.forEach((line, i) => {
    if (line.includes("'/api/v1") && line.includes('BASE')) {
      hits.push(file + ' L' + (i+1) + ': ' + line.trim());
    }
  });
});
hits.forEach(h => console.log(h));
console.log('Total double-prefix:', hits.length);
