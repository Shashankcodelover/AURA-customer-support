const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'components', 'ContextCapsuleCard.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace specific rgbas
// rose: 225,29,72
// amber: 201,122,0
// mint: 14,156,116
// violet: 109,74,235

const replacements = [
  { rgb: '225,29,72', varName: '--rose' },
  { rgb: '201,122,0', varName: '--amber' },
  { rgb: '14,156,116', varName: '--mint' },
  { rgb: '109,74,235', varName: '--violet' },
];

replacements.forEach(({ rgb, varName }) => {
  const regex = new RegExp(`rgba\\(${rgb.replace(/,/g, ',\\s*')},\\s*([0-9.]+)\\)`, 'g');
  content = content.replace(regex, (match, op) => {
    return `color-mix(in_srgb,var(${varName})_${parseFloat(op) * 100}%,transparent)`;
  });
});

fs.writeFileSync(file, content, 'utf8');
console.log('ContextCapsuleCard refactored.');
