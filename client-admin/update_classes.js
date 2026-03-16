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
      
      // We will blindly replace text-white with text-slate-800 EXCEPT where we suspect it's on a dark background.
      // Easiest heuristic: look for "bg-primary", "btn-primary", "bg-secondary", "btn-secondary", "bg-danger", "bg-indigo"
      // If a line contains text-white and one of these, skip or manually fix.
      // But actually, replacing globally is safer with a function.
      
      content = content.replace(/(text-white)/g, (match, p1, offset, string) => {
          // get surrounding 100 chars context
          const start = Math.max(0, offset - 50);
          const end = Math.min(string.length, offset + 50);
          const context = string.substring(start, end);
          
          if (context.includes('bg-primary') || context.includes('bg-secondary') || context.includes('bg-danger') || context.includes('bg-indigo') || context.includes('btn-')) {
              return 'text-white'; // keep it white inside buttons/colored divs
          }
          return 'text-slate-800';
      });

      // Also replace text-slate-300 with text-slate-600
      content = content.replace(/text-slate-300/g, 'text-slate-600');
      content = content.replace(/text-slate-400/g, 'text-slate-500');

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
