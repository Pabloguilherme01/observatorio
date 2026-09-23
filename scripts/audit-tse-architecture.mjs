import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const forbiddenProxyTokens = [
  'r.jina.ai',
  'jina.ai/http',
  'API_PROXY_URL',
];

const scanRoots = [
  '.github/workflows',
  'src',
  'vite.config.ts',
];

function collectFiles(target) {
  const absolute = join(ROOT, target);
  if (!existsSync(absolute)) return [];
    const entries = readdirSync(absolute, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(absolute, entry.name);
    if (entry.isDirectory()) files.push(...collectFiles(relative(ROOT, full)));
    else if (/\.(mjs|js|ts|tsx|yml|yaml)$/.test(entry.name)) files.push(full);
  }
  return files;
}

const files = [];
for (const root of scanRoots) {
  if (root.endsWith('.ts') && existsSync(join(ROOT, root))) files.push(join(ROOT, root));
  else files.push(...collectFiles(root));
}

const violations = [];
for (const file of files) {
  const content = readFileSync(file, 'utf8');
  for (const token of forbiddenProxyTokens) {
    if (content.includes(token)) {
      violations.push({ file: relative(ROOT, file), token });
    }
  }
}

const syncScript = join(ROOT, 'scripts/sync-tse-2026.mjs');
if (existsSync(syncScript)) {
  const content = readFileSync(syncScript, 'utf8');
  for (const token of ['r.jina.ai', 'jina.ai/http', 'API_PROXY_URL', 'proxy']) {
    if (content.toLowerCase().includes(token.toLowerCase())) violations.push({ file: 'scripts/sync-tse-2026.mjs', token });
  }
}

const deployWorkflow = join(ROOT, '.github/workflows/deploy-pages.yml');
if (existsSync(deployWorkflow)) {
  const content = readFileSync(deployWorkflow, 'utf8');
  for (const token of ['sync:tse', 'REQUIRE_TSE_SYNC', 'r.jina.ai', 'jina.ai/http']) {
    if (content.includes(token)) violations.push({ file: '.github/workflows/deploy-pages.yml', token });
  }
}

const syncWorkflow = join(ROOT, '.github/workflows/sync-tse-candidates.yml');
if (existsSync(syncWorkflow)) {
  const content = readFileSync(syncWorkflow, 'utf8');
  if (!content.includes('workflow_dispatch:')) {
    violations.push({ file: '.github/workflows/sync-tse-candidates.yml', token: 'workflow_dispatch ausente' });
  }
  if (/^\s+schedule:/m.test(content) || /^\s+push:/m.test(content)) {
    violations.push({ file: '.github/workflows/sync-tse-candidates.yml', token: 'sync automática por push/cron' });
  }
}

if (violations.length) {
  console.error(JSON.stringify({
    valid: false,
    message: 'A arquitetura TSE voltou a depender de transporte intermediário ou bloqueador de produção.',
    violations,
  }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  valid: true,
  proxyRuntimeDependency: false,
  deployDependsOnTseNetwork: false,
  tseRefreshMode: 'manual-direct-official-source',
  scannedFiles: files.length,
}, null, 2));
