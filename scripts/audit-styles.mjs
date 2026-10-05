import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const styleRoot = path.join(root, 'src', 'assets', 'styles');

function listCssFiles(directory, base = directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...listCssFiles(full, base));
    else if (entry.name.endsWith('.css')) files.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return files;
}

const files = listCssFiles(styleRoot).sort();
const maxSourceKb = Number(process.env.STYLE_MAX_SOURCE_KB || 120);
const warnings = [];
const failures = [];
const selectorFiles = new Map();
const exactDuplicateBlocks = new Map();
const intraFileDuplicateBlocks = new Map();
const adjacentSelectorDuplicates = new Map();

function normalizeCss(value) {
  return value.trim().replace(/\s+/g, ' ');
}

function getAtRuleContext(css, position) {
  const stack = [];
  let segmentStart = 0;
  let quote = null;
  let comment = false;

  for (let i = 0; i < position; i += 1) {
    const char = css[i];
    const next = css[i + 1];

    if (comment) {
      if (char === '*' && next === '/') {
        comment = false;
        i += 1;
      }
      continue;
    }

    if (!quote && char === '/' && next === '*') {
      comment = true;
      i += 1;
      continue;
    }

    if (quote) {
      if (char === '\\' && i + 1 < position) {
        i += 1;
        continue;
      }
      if (char === quote) quote = null;
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (char === '{') {
      const header = css.slice(segmentStart, i).trim();
      stack.push({ header, isAtRule: header.startsWith('@') });
      segmentStart = i + 1;
    } else if (char === '}') {
      stack.pop();
      segmentStart = i + 1;
    }
  }

  return stack.filter(item => item.isAtRule).map(item => normalizeCss(item.header)).join(' > ');
}

for (const file of files) {
  const full = path.join(styleRoot, file);
  const css = fs.readFileSync(full, 'utf8');
  const bytes = Buffer.byteLength(css);
  const kb = Math.round(bytes / 1024 * 10) / 10;
  console.log(JSON.stringify({ file, kb }));
  if (bytes > maxSourceKb * 1024) failures.push(file + ' excede o teto de fonte de ' + maxSourceKb + ' KB.');
  let previousBlock = null;
  for (const match of css.matchAll(/(^|})\s*([^@}{][^{}]+)\{([^{}]*)\}/gm)) {
    const selector = normalizeCss(match[2]);
    const normalizedBody = normalizeCss(match[3]);
    if (!selector || selector.startsWith('--')) continue;
    const set = selectorFiles.get(selector) ?? new Set();
    set.add(file);
    selectorFiles.set(selector, set);
    if (normalizedBody) {
      const context = getAtRuleContext(css, match.index + (match[1]?.length ?? 0));
      const exactKey = context + '\n' + selector + '{' + normalizedBody + '}';
      const blocks = exactDuplicateBlocks.get(exactKey) ?? [];
      blocks.push(file);
      exactDuplicateBlocks.set(exactKey, blocks);
      const localBlocks = intraFileDuplicateBlocks.get(file) ?? new Map();
      localBlocks.set(exactKey, (localBlocks.get(exactKey) ?? 0) + 1);
      intraFileDuplicateBlocks.set(file, localBlocks);
    }
  }
}

const crossFileDuplicates = [...selectorFiles.entries()]
  .filter(([, set]) => set.size >= 2)
  .map(([selector, set]) => ({ selector, files: [...set] }));

const sameContextExactDuplicates = [...exactDuplicateBlocks.entries()]
  .filter(([, files]) => new Set(files).size >= 2)
  .map(([block, files]) => ({
    block: block.split('\n').slice(-1)[0].slice(0, 240),
    files: [...new Set(files)],
  }));
const repeatedExactBlocks = [...exactDuplicateBlocks.entries()]
  .filter(([, files]) => files.length >= 2)
  .map(([block, files]) => ({ block: block.split('\n').slice(-1)[0].slice(0, 240), files }))
  .sort((a, b) => b.files.length - a.files.length || b.block.length - a.block.length);
const intraFileDuplicates = [...intraFileDuplicateBlocks.entries()]
  .flatMap(([file, blocks]) => [...blocks.entries()].filter(([, count]) => count > 1).map(([block, count]) => ({ file, count, block: block.slice(0, 240) })));


console.log(JSON.stringify({
  cssFiles: files.length,
  crossFileDuplicateSelectors: crossFileDuplicates.length,
  exactDuplicateBlocks: repeatedExactBlocks.length,
  intraFileExactDuplicateBlocks: intraFileDuplicates.length,
  sameContextExactDuplicateBlocks: sameContextExactDuplicates.length,
  adjacentSelectorDuplicates: adjacentSelectorDuplicates.size,
  largestRepeatedSelectors: crossFileDuplicates.slice(0, 20),
}, null, 2));

if (crossFileDuplicates.length > 80) {
  warnings.push('Há ' + crossFileDuplicates.length + ' seletores repetidos entre arquivos; consolidação incremental recomendada.');
}
if (repeatedExactBlocks.length > 120) {
  warnings.push('Há ' + repeatedExactBlocks.length + ' blocos CSS exatamente repetidos; consolidar em rodadas pequenas e verificadas.');
}
if (intraFileDuplicates.length) {
  intraFileDuplicates.forEach(({ file, count }) => failures.push(file + ' possui ' + count + ' bloco(s) CSS exatamente repetido(s) dentro do mesmo arquivo.'));
}
if (adjacentSelectorDuplicates.size) {
  for (const [key, count] of adjacentSelectorDuplicates.entries()) {
    const [file, context, selector] = key.split('\\n');
    failures.push(file + ' possui regra CSS adjacente repetida no mesmo contexto (' + context + '): ' + selector + ' (' + count + ' ocorrências).');
  }
}
if (sameContextExactDuplicates.length) {
  sameContextExactDuplicates.forEach(({ block, files }) =>
    failures.push('bloco CSS exatamente duplicado no mesmo contexto entre arquivos: ' + files.join(', ') + ' :: ' + block),
  );
}
warnings.forEach(message => console.log('WARN ' + message));
if (failures.length) {
  failures.forEach(message => console.error('FAIL ' + message));
  process.exit(1);
}
console.log('PASS orçamento e inventário de estilos concluídos');
