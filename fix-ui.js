const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            content = content.replace(/text-\[#6B6E85\]/g, 'text-slate-700 dark:text-slate-300');
            content = content.replace(/text-\[#9599AD\]/g, 'text-slate-600 dark:text-slate-400');
            
            content = content.replace(/bg-\[rgba\\(255,255,255,0\.5\\)\]/g, 'bg-white/50 backdrop-blur-md');
            content = content.replace(/bg-\[rgba\\(255,255,255,0\.7\\)\]/g, 'bg-white/70 backdrop-blur-md');
            
            content = content.replace(/transition(?![a-zA-Z-])/g, 'transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none');
            
            content = content.replace(/p-6/g, 'p-4 sm:p-5');
            content = content.replace(/gap-6/g, 'gap-4 sm:gap-5');
            
            fs.writeFileSync(fullPath, content);
        }
    }
}

processDir('./components');
processDir('./app');
console.log('UI fixes applied.');
