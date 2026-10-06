import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const workflowDir = path.join(root, '.github', 'workflows');
const failures = [];
const pass = message => console.log('PASS', message);
const fail = message => failures.push(message);

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function outline(text) {
  return text.split(/\r?\n/).map((raw, index) => {
    const clean = raw.replace(/\s+#.*$/, '').trimEnd();
    if (!clean.trim() || clean.trim().startsWith('#')) return null;
    const indent = raw.match(/^\s*/)?.[0].length ?? 0;
    const trimmed = clean.trim();
    const keyMatch = trimmed.match(/^(?:-\s+)?([A-Za-z0-9_.-]+):(?:\s*(.*))?$/);
    return keyMatch ? { line: index + 1, indent, key: keyMatch[1], value: keyMatch[2] ?? '', raw: clean } : { line: index + 1, indent, key: null, value: '', raw: clean };
  }).filter(Boolean);
}

function hasTopLevel(text, key) {
  return outline(text).some(item => item.indent === 0 && item.key === key);
}

function jobBlock(text, job) {
  const lines = outline(text);
  const start = lines.findIndex(item => item.indent === 2 && item.key === job);
  if (start < 0) return [];
  const end = lines.slice(start + 1).findIndex(item => item.indent === 2 && item.key && item.key !== 'permissions');
  return end < 0 ? lines.slice(start) : lines.slice(start, start + 1 + end);
}

function stepNames(text, job) {
  return jobBlock(text, job).filter(item => item.indent >= 6 && item.key === 'name').map(item => item.value.replace(/^['"]|['"]$/g, ''));
}

const required = [
  '.github/workflows/ci.yml',
  '.github/workflows/browser.yml',
  '.github/workflows/codeql.yml',
  '.github/workflows/deploy-pages.yml',
  '.github/workflows/source-health.yml',
  '.github/workflows/sync-tse-2026.yml',
  '.github/workflows/sync-results-2026.yml',
  '.github/workflows/cleanup-branches.yml',
];

for (const file of required) {
  if (fs.existsSync(path.join(root, file))) pass('workflow presente: ' + file);
  else fail('workflow ausente: ' + file);
}
\nif (fs.existsSync(path.join(root, '.github/workflows/cleanup-tse-automation.yml'))) fail('workflow legado cleanup-tse-automation.yml ainda existe.');\nelse pass('workflow legado de limpeza não existe.');\n
const workflows = Object.fromEntries(required.filter(file => fs.existsSync(path.join(root, file))).map(file => [file, read(file)]));
for (const [file, text] of Object.entries(workflows)) {
  for (const key of ['on', 'permissions', 'jobs']) {
    if (hasTopLevel(text, key)) pass(file + ' possui bloco estrutural ' + key + '.');
    else fail(file + ' não possui bloco estrutural ' + key + '.');
  }
  const unpinned = [...text.matchAll(/uses:\s*[^\s#]+@([^\s#]+)/g)].filter(match => !/^[0-9a-f]{40}$/i.test(match[1]));
  if (unpinned.length) fail(file + ' possui ' + unpinned.length + ' Action(s) sem SHA imutável.');
}

const ci = workflows['.github/workflows/ci.yml'];
const ciSteps = stepNames(ci, 'quality');
for (const step of ['Guard main provenance', 'Release readiness contract', 'Audit workflow structure', 'Audit style source budget']) {
  if (ciSteps.includes(step)) pass('CI mantém etapa estrutural: ' + step);
  else fail('CI não possui etapa esperada: ' + step);
}

const browser = workflows['.github/workflows/browser.yml'];
const browserNames = ['chrome-desktop', 'firefox-desktop', 'safari-desktop', 'chrome-android', 'safari-iphone', 'safari-iphone-se'];
for (const name of browserNames) {
  if (browser.includes('project: ' + name)) pass('matriz de navegador contém ' + name);
  else fail('matriz de navegador perdeu ' + name);
}
if (/project: safari-desktop[\s\S]*?non_blocking:\s*false/.test(browser)) pass('Safari desktop é um gate bloqueante para regressões reais no WebKit.');
else fail('Safari desktop não está protegido como gate bloqueante.');
if (
  /jobs:\s*\n\s+build:\s*\n[\s\S]*?actions\/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a/.test(browser)
  && /jobs:[\s\S]*?browser:\s*\n[\s\S]*?needs:\s*build/.test(browser)
  && browser.includes('actions/download-artifact@37930b1c2abaa49bbe596cd826c3c89aef350131')
  && browser.includes('run: npm exec vite -- build')
  && !browser.includes('run: npm run build')
  && browser.includes('run: npm run audit:bundle')
  && browser.includes('run: npm run audit:performance')
  && browser.includes('run: npm run test:pwa')
) {
  pass('Browser constrói uma única vez, valida o artefato de produção e o compartilha entre os perfis.');
} else fail('Browser ainda recompila a aplicação por perfil ou não compartilha o artefato de produção.');


const ciRunCommands = [...ci.matchAll(/run:\s*npm run ([^\s]+)/g)].map(match => match[1]);
if (ciRunCommands.includes('audit:provenance') && ciRunCommands.includes('audit:candidate-snapshot')) {
  pass('CI consolidado preserva os gates de proveniência e snapshot TSE sem workflow paralelo.');
} else {
  fail('CI consolidado perdeu os contratos de proveniência ou snapshot TSE.');
}

const deploy = workflows['.github/workflows/deploy-pages.yml'];
if (/workflow_run/.test(deploy) && /conclusion == 'success'/.test(deploy) && /event.workflow_run.event == 'push'/.test(deploy) && /ref: \$\{\{ env.DEPLOY_SHA \}\}/.test(deploy)) {
  pass('Deploy preserva workflow_run sucesso + push + SHA exato.');
} else fail('Deploy não preserva integralmente a cadeia de proveniência.');

if (deploy.includes('gh run download "$BROWSER_RUN_ID" --name observatorio-browser-dist --dir dist') && !deploy.includes('run: npm run build:bundle')) {
  pass('Deploy reutiliza o artefato Browser validado do SHA exato em vez de recompilar a aplicação.');
} else fail('Deploy voltou a recompilar a aplicação ou deixou de reutilizar o artefato Browser validado.');

const tseRefreshDoc = read('docs/TSE-DATA-REFRESH.md');
if (tseRefreshDoc.includes('sync-tse-2026.yml') && !tseRefreshDoc.includes('sync-tse-candidates.yml') && tseRefreshDoc.includes('branch -> CI -> PR -> merge revisado')) {
  pass('documentação TSE acompanha o workflow atual e o fluxo branch -> CI -> PR.');
} else {
  fail('documentação TSE está divergente do workflow atual ou ainda cita o fluxo legado.');
}

for (const file of ['.github/workflows/sync-tse-2026.yml', '.github/workflows/sync-results-2026.yml']) {
  const text = workflows[file];
  if (/node-version:\s*24/.test(text)) pass(file + ' usa Node 24.');
  else fail(file + ' não usa Node 24.');
  if (/gh pr list --state open --base main --head/.test(text)) pass(file + ' evita PR duplicada.');
  else fail(file + ' não possui guarda idempotente de PR.');
}

if (failures.length) {
  console.error('FAIL ' + failures.length + ' regra(s) estruturais');
  failures.forEach(message => console.error(' - ' + message));
  process.exit(1);
}
console.log('PASS auditoria estrutural dos workflows concluída');
