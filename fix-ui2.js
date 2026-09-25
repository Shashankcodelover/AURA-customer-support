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
            
            content = content.replace(/transition focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none: /g, 'transition: ');
            
            fs.writeFileSync(fullPath, content);
        }
    }
}

processDir('./components');
processDir('./app');
console.log('UI fixes reverted.');
