const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'components', 'CommandPalette.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace rgba(109,74,235, opacity) with color-mix
content = content.replace(/rgba\(109,\s*74,\s*235,\s*([0-9.]+)\)/g, (match, op) => {
    return `color-mix(in_srgb,var(--violet)_${parseFloat(op) * 100}%,transparent)`;
});

fs.writeFileSync(file, content, 'utf8');
console.log('CommandPalette refactored.');
