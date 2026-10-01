import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const failures = [];
const warnings = [];
const pass = (message) => console.log('PASS', message);
const warn = (message) => warnings.push(message);
const fail = (message) => failures.push(message);

const packageJson = JSON.parse(read('package.json'));
const packageLock = JSON.parse(read('package-lock.json'));
const versionSource = read('src/config/version.ts');
const appVersion = versionSource.match(/APP_VERSION = '([^']+)'/)?.[1] ?? null;
const edition = versionSource.match(/EDITION = '([^']+)'/)?.[1] ?? null;
const major = packageJson.version?.split('.')[0] ?? null;

if (packageJson.version === appVersion) pass('package.json e APP_VERSION estão sincronizados.');
else fail('versão divergente entre package.json e src/config/version.ts.');

if (packageJson.version === packageLock.version && packageJson.version === packageLock.packages?.['']?.version) pass('package-lock.json está sincronizado.');
else fail('package-lock.json está fora de sincronia com package.json.');

if (edition === 'V' + major) pass('EDITION está alinhada ao major da versão.');
else fail('EDITION não corresponde ao major da versão.');

const requiredFiles = [
  '.github/workflows/ci.yml',
  '.github/workflows/quality.yml',
  '.github/workflows/codeql.yml',
  '.github/workflows/deploy-pages.yml',
  '.github/workflows/source-health.yml',
  '.github/workflows/sync-tse-2026.yml',
  '.github/workflows/sync-results-2026.yml',
  'scripts/audit-release.mjs',
  'scripts/assert-main-provenance.mjs',
  'scripts/audit-workflows.mjs',
  'scripts/audit-styles.mjs',
  'scripts/audit-performance.mjs',
  'scripts/cleanup-tse-automation.mjs',
  'src/assets/styles/index.css',
  'src/hooks/useDialogFocus.ts',
  '.github/workflows/cleanup-tse-automation.yml',
];

for (const file of requiredFiles) {
  if (exists(file)) pass('artefato obrigatório presente: ' + file);
  else fail('artefato obrigatório ausente: ' + file);
}

const ci = read('.github/workflows/ci.yml');
const quality = read('.github/workflows/quality.yml');
const deploy = read('.github/workflows/deploy-pages.yml');
const syncTse = read('.github/workflows/sync-tse-2026.yml');
const syncResults = read('.github/workflows/sync-results-2026.yml');
const workflowText = [ci, quality, read('.github/workflows/codeql.yml'), deploy, read('.github/workflows/source-health.yml'), syncTse, syncResults, exists('.github/workflows/verify-tse-simulation.yml') ? read('.github/workflows/verify-tse-simulation.yml') : ''].join('\n');

if (ci.includes('npm run audit:release')) pass('CI inclui o release gate consolidado.');
else fail('CI não inclui o release gate consolidado.');
if (quality.includes('npm run audit:release')) pass('Quality inclui o release gate consolidado.');
else fail('Quality não inclui o release gate consolidado.');
if (ci.includes('npm run check:main-provenance') && ci.includes("github.event_name == 'push'") && ci.includes("github.ref == 'refs/heads/main'")) pass('CI bloqueia publicação de commits diretos em main.');
else fail('CI não possui guard de proveniência para commits em main.');
if (ci.includes('npm run audit:workflows') && ci.includes('npm run audit:styles') && ci.includes('npm run audit:performance')) pass('CI executa os novos gates estruturais, de estilos e performance.');
else fail('CI não executa todos os novos gates de manutenção.');
if (quality.includes('npm run audit:workflows') && quality.includes('npm run audit:styles') && quality.includes('npm run audit:performance')) pass('Quality executa os novos gates estruturais, de estilos e performance.');
else fail('Quality não executa todos os novos gates de manutenção.');
if (deploy.includes('workflows: ["CI"]') && deploy.includes("github.event.workflow_run.conclusion == 'success'") && deploy.includes("github.event.workflow_run.event == 'push'") && deploy.includes('ref: ${{ env.DEPLOY_SHA }}')) pass('Deploy preserva a cadeia CI -> SHA -> publicação.');
else fail('Deploy perdeu a cadeia de paridade com o CI.');
if (syncTse.includes('node-version: 24') && syncResults.includes('node-version: 24')) pass('sincronizações TSE usam Node 24.');
else fail('sincronizações TSE usam Node divergente do CI.');
if (syncTse.includes('gh pr list --state open --base main --head') && syncResults.includes('gh pr list --state open --base main --head')) pass('automação TSE evita PRs duplicadas para a mesma branch.');
if (exists('src/assets/styles/index.css') && read('src/main.tsx').includes("./assets/styles/index.css")) pass('aplicação usa um entrypoint canônico de estilos compartilhados.');
else fail('entrypoint canônico de estilos não está integrado ao bootstrap.');
else fail('automação TSE não possui guarda idempotente de PR.');

const actionRefs = [...workflowText.matchAll(/uses:\s*[^\s#]+@([^\s#]+)/g)].map(match => match[1]);
const unpinned = actionRefs.filter(ref => !/^[0-9a-f]{40}$/i.test(ref));
if (unpinned.length === 0) pass('Actions estão fixadas por SHA imutável.');
else fail('há ' + unpinned.length + ' Action(s) sem SHA imutável.');

const ciHasWrite = /permissions:\s*\n[\s\S]*?\n\s+(actions|contents|issues|pull-requests):\s+write/.test(ci);
const qualityHasWrite = /permissions:\s*\n[\s\S]*?\n\s+(actions|contents|issues|pull-requests):\s+write/.test(quality);
if (!ciHasWrite && !qualityHasWrite) pass('CI e Quality mantêm permissões mínimas.');
else fail('CI/Quality possuem permissões de escrita inesperadas.');

if (!workflowText.includes('pwa-512.svg') && !workflowText.includes('observatorio-static-v13')) pass('nenhum artefato/cache legado conhecido está referenciado.');
else fail('há referência a artefato/cache legado conhecido.');

const testFiles = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.git'].includes(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (full.includes(path.sep + 'tests' + path.sep) && /\.(?:spec|test)\.[cm]?[jt]s$/.test(entry.name)) testFiles.push(full);
  }
}
if (exists('tests')) walk(path.join(root, 'tests'));
if (testFiles.length >= 10) pass('suíte possui ' + testFiles.length + ' arquivos de teste.');
else warn('suíte possui apenas ' + testFiles.length + ' arquivos de teste.');

const largestTest = [...testFiles].map(file => ({ file, bytes: fs.statSync(file).size })).sort((a, b) => b.bytes - a.bytes)[0];
if (largestTest && largestTest.bytes <= 140 * 1024) pass('maior arquivo de teste está abaixo de 140 KB.');
else if (largestTest) fail('maior arquivo de teste excede 140 KB: ' + path.relative(root, largestTest.file) + '.');

try {
  const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  const expected = process.env.RELEASE_EXPECTED_SHA || process.env.GITHUB_SHA;
  if (expected && expected !== sha) fail('SHA do checkout diverge do esperado: checkout=' + sha + ', esperado=' + expected + '.');
  else pass('checkout SHA verificado: ' + sha.slice(0, 12));
} catch (error) {
  warn('não foi possível identificar o SHA local: ' + (error instanceof Error ? error.message : String(error)));
}

if (warnings.length) {
  console.log('WARN ' + warnings.length + ' observação(ões)');
  warnings.forEach(message => console.log(' - ' + message));
}
if (failures.length) {
  console.error('FAIL ' + failures.length + ' regra(s)');
  failures.forEach(message => console.error(' - ' + message));
  process.exit(1);
}
console.log('PASS release readiness contract concluído');
