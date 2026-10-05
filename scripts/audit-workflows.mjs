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
  '.github/workflows/quality.yml',
  '.github/workflows/codeql.yml',
  '.github/workflows/deploy-pages.yml',
  '.github/workflows/source-health.yml',
  '.github/workflows/sync-tse-2026.yml',
  '.github/workflows/sync-results-2026.yml',
  '.github/workflows/cleanup-tse-automation.yml',
];

for (const file of required) {
  if (fs.existsSync(path.join(root, file))) pass('workflow presente: ' + file);
  else fail('workflow ausente: ' + file);
}

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
if (/jobs:\s*\n\s+build:\s*\n[\s\S]*?actions\/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a/.test(browser)
  && /jobs:[\s\S]*?browser:\s*\n[\s\S]*?needs:\s*build/.test(browser)
  && browser.includes('actions/download-artifact@018cc2cf5baa6db3ef3c5f8a56943fffe632ef53')) {
  pass('Browser constrói uma única vez e compartilha o artefato de produção entre os perfis.');
} else fail('Browser ainda recompila a aplicação por perfil ou não compartilha o artefato de produção.');


const quality = workflows['.github/workflows/quality.yml'];
const ciRunCommands = [...ci.matchAll(/run:\s*npm run ([^\\s]+)/g)].map(match => match[1]);
const qualityRunCommands = [...quality.matchAll(/run:\s*npm run ([^\\s]+)/g)].map(match => match[1]);
const duplicatedQualityCommands = qualityRunCommands.filter(command => ciRunCommands.includes(command));
if (qualityRunCommands.length === 2 && qualityRunCommands.includes('audit:provenance') && qualityRunCommands.includes('audit:candidate-snapshot') && duplicatedQualityCommands.length === 0) {
  pass('Quality mantém apenas gates independentes de proveniência e snapshot TSE, sem duplicar comandos do CI.');
} else {
  fail('Quality voltou a duplicar gates do CI ou perdeu seus dois contratos independentes.');
}

const deploy = workflows['.github/workflows/deploy-pages.yml'];
if (/workflow_run/.test(deploy) && /conclusion == 'success'/.test(deploy) && /event.workflow_run.event == 'push'/.test(deploy) && /ref: \$\{\{ env.DEPLOY_SHA \}\}/.test(deploy)) {
  pass('Deploy preserva workflow_run sucesso + push + SHA exato.');
} else fail('Deploy não preserva integralmente a cadeia de proveniência.');

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
