const fs = require('fs');
const path = require('path');

function processDir(dir) {
  let count = 0;
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      count += processDir(p);
    } else if (p.endsWith('.jsx') || p.endsWith('.js')) {
      let content = fs.readFileSync(p, 'utf8');
      let originalContent = content;
      
      // text-slate-800 points to #f1f5f9 (light). text-slate-200 points to #1e293b (dark).
      content = content.replace(/text-slate-800/g, 'text-slate-200');
      
      // text-slate-600 points to #cbd5e1 (lightish). text-slate-500 is #64748b (good for muted).
      content = content.replace(/text-slate-600/g, 'text-slate-500');

      // Catch any remaining text-white outside buttons
      content = content.replace(/(text-white)/g, (match, p1, offset, string) => {
          const start = Math.max(0, offset - 50);
          const end = Math.min(string.length, offset + 50);
          const context = string.substring(start, end);
          if (context.includes('bg-primary') || context.includes('bg-secondary') || context.includes('bg-danger') || context.includes('bg-indigo') || context.includes('btn-')) {
              return 'text-white';
          }
          return 'text-slate-200';
      });

      if (content !== originalContent) {
        fs.writeFileSync(p, content, 'utf8');
        count++;
      }
    }
  });
  return count;
}

const modified = processDir('./src/components');
console.log(`Modified ${modified} files.`);
