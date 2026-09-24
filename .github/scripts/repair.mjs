import { readFileSync, writeFileSync } from 'node:fs';
const p = 'src/assets/styles/globals.css';
let s = readFileSync(p, 'utf8');
const fixes = [
  [/--surface-st\s+rong/g, '--surface-strong'],
  [/\bov\s+erflow\b/g, 'overflow'],
  [/--obs-fon\s+t-sans/g, '--obs-font-sans'],
  [/\bmin-widt\s+h\b/g, 'min-width'],
  [/\bdis\s+play\b/g, 'display'],
];
const counts = [];
for (const [re, b] of fixes) {
  const m = s.match(re);
  counts.push(String(re) + ' -> ' + b + ' (' + (m ? m.length : 0) + 'x)');
  s = s.replace(re, b);
}
writeFileSync(p, s);
const log = 'CORRIGIDOS:\n' + counts.join('\n');
writeFileSync('repair-report.txt', log);
console.log(log);
