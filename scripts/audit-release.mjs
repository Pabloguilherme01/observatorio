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

function parseMajorMinorPatch(value) {
  const match = /^([0-9]+)\\.([0-9]+)\\.([0-9]+)/.exec(String(value ?? ''));
  return match ? match.slice(1).map(Number) : null;
}

function atLeast(version, minimum) {
  const current = parseMajorMinorPatch(version);
  const target = parseMajorMinorPatch(minimum);
  if (!current || !target) return false;
  for (let index = 0; index < 3; index += 1) {
    if (current[index] !== target[index]) return current[index] > target[index];
  }
  return true;
}


if (packageJson.version === appVersion) pass('package.json e APP_VERSION estão sincronizados.');
else fail('versão divergente entre package.json e src/config/version.ts.');

if (packageJson.version === packageLock.version && packageJson.version === packageLock.packages?.['']?.version) pass('package-lock.json está sincronizado.');
else fail('package-lock.json está fora de sincronia com package.json.');

if (edition === 'V' + major) pass('EDITION está alinhada ao major da versão.');
else fail('EDITION não corresponde ao major da versão.');

const lockEsToolkitVersion = packageLock.packages?.['node_modules/es-toolkit']?.version ?? null;
const rechartsMajor = parseMajorMinorPatch(packageJson.dependencies?.recharts)?.[0] ?? null;
const viteMajor = parseMajorMinorPatch(packageJson.devDependencies?.vite)?.[0] ?? null;
if (rechartsMajor !== null && viteMajor !== null && viteMajor >= 8 && rechartsMajor >= 3) {
  if (lockEsToolkitVersion && atLeast(lockEsToolkitVersion, '1.47.1')) {
    pass('Vite 8 + Recharts 3 usam es-toolkit >= 1.47.1, que possui resolução ESM corrigida para compat/*.');
  } else {
    fail('Vite 8 + Recharts 3 exigem es-toolkit >= 1.47.1 para evitar a resolução CJS problemática de compat/*.');
  }
}

const requiredFiles = [
  'tests/a11y.spec.mjs',
  'tests/public-api-contract.spec.mjs',
  'tests/public-entry-flows.spec.mjs',
  'tests/mobile-core.spec.mjs',

  '.github/workflows/ci.yml',
  '.github/workflows/ci.yml',
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
  'scripts/test-post-election-transition.mjs',
  'src/assets/styles/index.css',
  'src/hooks/useDialogFocus.ts',
  '.github/workflows/cleanup-tse-automation.yml',
];

for (const file of requiredFiles) {
  if (exists(file)) pass('artefato obrigatório presente: ' + file);
  else fail('artefato obrigatório ausente: ' + file);
}

const ci = read('.github/workflows/ci.yml');
const deploy = read('.github/workflows/deploy-pages.yml');
const syncTse = read('.github/workflows/sync-tse-2026.yml');
const syncResults = read('.github/workflows/sync-results-2026.yml');
const workflowText = [ci, read('.github/workflows/codeql.yml'), deploy, read('.github/workflows/source-health.yml'), syncTse, syncResults].join('\n');

if (ci.includes('npm run audit:release')) pass('CI inclui o release gate consolidado.');
else fail('CI não inclui o release gate consolidado.');
if (ci.includes('npm run check:main-provenance') && ci.includes("github.event_name == 'push'") && ci.includes("github.ref == 'refs/heads/main'")) pass('CI bloqueia publicação de commits diretos em main.');
else fail('CI não possui guard de proveniência para commits em main.');
if (ci.includes('npm run audit:workflows') && ci.includes('npm run audit:styles') && ci.includes('npm run audit:performance')) pass('CI executa os novos gates estruturais, de estilos e performance.');
else fail('CI não executa todos os novos gates de manutenção.');
if (ci.includes('npm run audit:provenance') && ci.includes('npm run audit:candidate-snapshot')) pass('CI consolidado cobre proveniência e snapshot TSE.');
else fail('CI consolidado não cobre proveniência e snapshot TSE.');
if (
  deploy.includes('workflows: ["CI", "Browser compatibility", "CodeQL"]')
  && deploy.includes("github.event.workflow_run.conclusion == 'success'")
  && deploy.includes("github.event.workflow_run.event == 'push'")
  && deploy.includes('ref: ${{ env.DEPLOY_SHA }}')
  && deploy.includes('Require all release gates for exact SHA')
  && deploy.includes('ci.yml browser.yml codeql.yml')
  && deploy.includes('sort_by(.created_at) | reverse | .[0]')
  && deploy.includes('Ensure main still points to validated SHA')
  && deploy.includes('git/ref/heads/main')
) pass('Deploy preserva a cadeia completa CI + Browser + CodeQL -> SHA -> publicação.');
else fail('Deploy não exige todos os gates de release no mesmo SHA.');
if (syncTse.includes('node-version: 24') && syncResults.includes('node-version: 24')) pass('sincronizações TSE usam Node 24.');
else fail('sincronizações TSE usam Node divergente do CI.');
if (syncTse.includes('gh pr list --state open --base main --head') && syncResults.includes('gh pr list --state open --base main --head')) pass('automação TSE evita PRs duplicadas para a mesma branch.');
else fail('automação TSE não possui guarda idempotente de PR.');
const syncNeedsReconcile = [syncTse, syncResults].every(workflow =>
  workflow.includes('git fetch origin main')
  && workflow.includes('git rebase origin/main')
  && workflow.includes('git push --force-with-lease')
  && workflow.includes('gh run watch "$run_id" --exit-status'),
);
if (syncNeedsReconcile) pass('sincronizações TSE reconciliam a branch com a main atual antes da PR.');
else fail('alguma sincronização TSE pode abrir PR a partir de uma main desatualizada.');
const unsafePendingIssueTemplates = [syncTse, syncResults].some(workflow =>
  workflow.includes('`$branch`') || workflow.includes('`main`; revisão') || workflow.includes('`main`. A publicação'),
);
if (!unsafePendingIssueTemplates) pass('fallbacks de issue TSE não usam substituição de comando acidental do shell.');
else fail('fallback de issue TSE contém sintaxe de shell perigosa nos dados da branch/main.');
if (exists('src/assets/styles/index.css') && read('src/main.tsx').includes("./assets/styles/index.css")) pass('aplicação usa um entrypoint canônico de estilos compartilhados.');
else fail('entrypoint canônico de estilos não está integrado ao bootstrap.');
const viteConfig = read('vite.config.ts');
const healthRouteIndex = viteConfig.indexOf("url.pathname === '/observatorio/api/v1/health.json'");
const genericApiRouteIndex = viteConfig.indexOf("url.pathname.startsWith('/observatorio/api/v1/')");
if (
  viteConfig.includes("globIgnores: ['**/data/tse-results.json']")
  && viteConfig.includes("cacheName: `observatorio-results-v${RUNTIME_CACHE_VERSION}`")
  && viteConfig.includes("handler: 'NetworkOnly'")
  && healthRouteIndex >= 0
  && genericApiRouteIndex >= 0
  && healthRouteIndex < genericApiRouteIndex
) pass('feed de resultados permanece dinâmico e o healthcheck público fica sempre em rede antes da regra genérica.');
else fail('Service Worker pode congelar resultados públicos ou interceptar o healthcheck pela regra genérica.');
if (
  read('tests/accessibility-smoke.spec.mjs').includes('@axe-core/playwright')
  && !read('tests/a11y.spec.mjs').includes('@axe-core/playwright')
  && read('tests/a11y.spec.mjs').includes('fluxos principais continuam acessíveis por teclado')
  && read('.github/workflows/browser.yml').includes('chrome-a11y')
) pass('suíte Axe está integrada ao gate cross-browser e a suíte separada mantém o fluxo de teclado.');
else fail('contrato de acessibilidade cross-browser está inconsistente com a suíte deduplicada.');
if (
  read('tests/public-api-contract.spec.mjs').includes('./api/v1/sources.json')
  && read('tests/public-api-contract.spec.mjs').includes('lastCheckedAt')
) pass('contrato da API pública possui cobertura automatizada.');
else fail('contrato da API pública está sem cobertura automatizada.');
if (
  read('playwright.config.mjs').includes("npm run preview -- --host 127.0.0.1 --port 4173")
  && !read('playwright.config.mjs').includes("npm run build && npm run preview")
  && read('.github/workflows/browser.yml').includes('name: Browser · build production')
  && read('.github/workflows/browser.yml').includes('actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a')
  && read('.github/workflows/browser.yml').includes('actions/download-artifact@37930b1c2abaa49bbe596cd826c3c89aef350131')
  && read('.github/workflows/browser.yml').includes('needs: build')
  && read('.github/workflows/browser.yml').includes('safari-desktop')
  && read('.github/workflows/browser.yml').includes('non_blocking: false')
  && read('playwright.config.mjs').includes('mobile-core')
) pass('browser gate usa um único build de produção compartilhado, mantém Safari desktop bloqueante e cobre o mobile-core nos dispositivos móveis.');
else fail('browser gate ainda não compartilha um artefato de produção ou perdeu cobertura crítica.');

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
