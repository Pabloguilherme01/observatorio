import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const styleRoot = path.join(root, 'src', 'assets', 'styles');
const files = fs.readdirSync(styleRoot).filter(file => file.endsWith('.css'));
const maxSourceKb = Number(process.env.STYLE_MAX_SOURCE_KB || 210);
const warnings = [];
const failures = [];
const selectorFiles = new Map();
const exactDuplicateBlocks = new Map();

for (const file of files) {
  const full = path.join(styleRoot, file);
  const css = fs.readFileSync(full, 'utf8');
  const bytes = Buffer.byteLength(css);
  const kb = Math.round(bytes / 1024 * 10) / 10;
  console.log(JSON.stringify({ file, kb }));
  if (bytes > maxSourceKb * 1024) failures.push(file + ' excede o teto de fonte de ' + maxSourceKb + ' KB.');
  for (const match of css.matchAll(/(^|})\s*([^@}{][^{}]+)\{/gm)) {
    const selector = match[2].trim().replace(/\s+/g, ' ');
    if (!selector || selector.startsWith('--')) continue;
    const set = selectorFiles.get(selector) ?? new Set();
    set.add(file);
    selectorFiles.set(selector, set);
    const normalizedBody = match[0].slice(match[0].indexOf('{') + 1, match[0].lastIndexOf('}')).trim().replace(/\s+/g, ' ');
    const exactKey = selector + '{' + normalizedBody + '}';
    const blocks = exactDuplicateBlocks.get(exactKey) ?? [];
    blocks.push(file);
    exactDuplicateBlocks.set(exactKey, blocks);
  }
}

const crossFileDuplicates = [...selectorFiles.entries()]
  .filter(([, set]) => set.size >= 2)
  .map(([selector, set]) => ({ selector, files: [...set] }));
const repeatedExactBlocks = [...exactDuplicateBlocks.entries()]
  .filter(([, files]) => files.length >= 2)
  .map(([block, files]) => ({ block: block.slice(0, 240), files }));
  .sort((a, b) => b.files.length - a.files.length || b.selector.length - a.selector.length);

console.log(JSON.stringify({
  cssFiles: files.length,
  crossFileDuplicateSelectors: crossFileDuplicates.length,
  exactDuplicateBlocks: repeatedExactBlocks.length,
  largestRepeatedSelectors: crossFileDuplicates.slice(0, 20),
}, null, 2));

if (crossFileDuplicates.length > 80) {
  warnings.push('Há ' + crossFileDuplicates.length + ' seletores repetidos entre arquivos; consolidação incremental recomendada.');
}
if (repeatedExactBlocks.length > 120) {
  warnings.push('Há ' + repeatedExactBlocks.length + ' blocos CSS exatamente repetidos; consolidar em rodadas pequenas e verificadas.');
}
warnings.forEach(message => console.log('WARN ' + message));
if (failures.length) {
  failures.forEach(message => console.error('FAIL ' + message));
  process.exit(1);
}
console.log('PASS orçamento e inventário de estilos concluídos');
