import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

const packageJson = JSON.parse(read('package.json'));
const versionSource = read('src/config/version.ts');
const dataSource = read('src/data/observatorioData.ts');
const index = read('index.html');
const vite = read('vite.config.ts');
const navigation = read('src/config/navigation.ts');
const appSource = read('src/app/App.tsx');
const candidates = JSON.parse(read('src/data/generated/tse2026-candidates.json'));
const robots = read('public/robots.txt');
const sitemap = read('public/sitemap.xml');
const syncWorkflow = read('.github/workflows/sync-tse-2026.yml');
const deployWorkflow = read('.github/workflows/deploy-pages.yml');
const resultsWorkflow = read('.github/workflows/sync-results-2026.yml');
const viteSource = vite;
const deploySource = deployWorkflow;
const spaFallback = read('public/404.html');

const errors = [];
const pass = message => console.log('PASS', message);
const fail = message => errors.push(message);
const must = (condition, message) => condition ? pass(message) : fail(message);

const appVersion = versionSource.match(/APP_VERSION = '([^']+)'/)?.[1];
const edition = versionSource.match(/EDITION = '([^']+)'/)?.[1];
const namespace = versionSource.match(/STORAGE_NAMESPACE = '([^']+)'/)?.[1];
const updatedAt = dataSource.match(/updatedAt: '([^']+)'/)?.[1];
const dateModified = index.match(/"dateModified": "([^"]+)"/)?.[1];

must(packageJson.version === appVersion, 'package.json e APP_VERSION estão sincronizados');
must(packageJson.devDependencies?.['@playwright/test'] === '1.63.0' && packageJson.devDependencies?.['@axe-core/playwright'] === '4.13.0', 'Playwright e Axe estão fixados nas devDependencies');
const lockJson = JSON.parse(read('package-lock.json'));
must(lockJson.lockfileVersion === 3, 'package-lock usa lockfileVersion 3');
must(lockJson.packages?.['']?.version === packageJson.version, 'package.json e package-lock usam a mesma versão');
must(lockJson.packages?.['']?.dependencies && lockJson.packages?.['']?.devDependencies, 'package-lock registra as dependências diretas do projeto');
must(lockJson.packages?.['node_modules/@playwright/test']?.version === '1.63.0'
  && lockJson.packages?.['node_modules/@axe-core/playwright']?.version === '4.13.0'
  && lockJson.packages?.['node_modules/axe-core']?.version === '4.13.0'
  && lockJson.packages?.['node_modules/playwright-core']?.version === '1.63.0',
  'Playwright e Axe estão presentes e fixados no package-lock');
must(edition === `V${appVersion?.split('.')[0]}`, 'EDITION acompanha o major da versão');
must(namespace === `observatorio-v${appVersion?.split('.')[0]}`, 'namespace de armazenamento identifica a edição');
must(dateModified === updatedAt, 'dateModified do documento coincide com updatedAt do dataset');
must(vite.includes("const BASE_PATH = '/observatorio/'") && vite.includes('base: BASE_PATH'), 'Vite usa base compatível com GitHub Pages');
must(fs.existsSync(path.join(root, 'src/assets/styles/final-ui.css')) && appSource.includes("../assets/styles/final-ui.css"), 'camada visual final está consolidada em um único stylesheet global');
must(!fs.existsSync(path.join(root, 'src/assets/styles/premium-finish.css')) && !fs.existsSync(path.join(root, 'src/assets/styles/visual-final.css')) && !fs.existsSync(path.join(root, 'src/assets/styles/site-final.css')), 'camadas visuais globais antigas não permanecem duplicadas');
must(spaFallback.includes('obsSpaFallback') && spaFallback.includes('encodeURIComponent'), 'fallback 404 da SPA preserva a rota solicitada');
must(deploySource.includes("status=\"$(curl -sS --retry 3") && deploySource.includes('test "$status" = "404"'), 'deploy aceita explicitamente o 404 esperado do fallback SPA');
must(!vite.includes('allowedHosts: true'), 'Vite não aceita qualquer hostname no servidor de desenvolvimento');
const resultsConfig = read('src/data/resultsConfig.ts');
const dataExport = read('src/components/DataExportActions.tsx');
must(vite.includes("src: BASE_PATH + 'pwa-192.png'") && vite.includes("src: BASE_PATH + 'pwa-512.png'") && vite.includes('scope: BASE_PATH'), 'ícones PNG e escopo PWA respeitam o subcaminho publicado');
must(vite.includes("/^\\/observatorio\\/api\\//") && vite.includes("url.pathname.startsWith('/observatorio/api/v1/')"), 'Service Worker reconhece a API no subcaminho do GitHub Pages');
must(index.includes('href="%BASE_URL%manifest.webmanifest"') && index.includes('href="%BASE_URL%pwa-192.svg"') && index.includes('href="%BASE_URL%apple-touch-icon.png"') && index.includes('href="%BASE_URL%sitemap.xml"') && index.includes('href="%BASE_URL%api/v1/observatorio.json"'), 'HTML usa BASE_URL para recursos estáticos, ícones e API');
must(!fs.existsSync(path.join(root, 'public/manifest.webmanifest')), 'não existe manifesto PWA duplicado em public');
const pngSize = file => {
  const bytes = fs.readFileSync(path.join(root, 'public', file));
  return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    ? [bytes.readUInt32BE(16), bytes.readUInt32BE(20)]
    : null;
};
must(JSON.stringify(pngSize('pwa-192.png')) === '[192,192]'
  && JSON.stringify(pngSize('pwa-512.png')) === '[512,512]'
  && JSON.stringify(pngSize('apple-touch-icon.png')) === '[180,180]',
  'ícones PNG têm dimensões corretas para Android e iOS');
must(read('public/pwa-192.svg').includes('viewBox="0 0 512 512"')
  && read('public/pwa-512.svg').includes('viewBox="0 0 512 512"'),
  'vetores móveis usam a mesma composição escalável');

must(resultsConfig.includes('import.meta.env.BASE_URL') && resultsConfig.includes('tse-results.json'), 'feed de resultados TSE respeita o base path');
must(dataExport.includes('import.meta.env.BASE_URL + "api/v1/observatorio.json"'), 'link da API pública respeita o base path');
must(vite.includes('start_url: BASE_PATH') && vite.includes('scope: BASE_PATH'), 'PWA mantém start_url e scope no subcaminho publicado');
must(viteSource.includes('freshness') && viteSource.includes('maxAgeHours = 24') && viteSource.includes('tseCandidates'), 'API health expõe contrato de frescor TSE');
must(vite.includes("api/v1/observatorio.json") && vite.includes("api/v1/openapi.json") && vite.includes("api/v1/health.json") && vite.includes("api/v1/sources.json"), 'build gera API pública, healthcheck e registro de fontes');
must(robots.includes('https://pabloguilherme01.github.io/observatorio/sitemap.xml'), 'robots.txt aponta para o sitemap publicado');
must(sitemap.includes('https://pabloguilherme01.github.io/observatorio/'), 'sitemap aponta para a URL canônica');
must(index.includes('og-cover.svg') && index.includes('summary_large_image'), 'preview social usa imagem e cartão grande');
const searchModal = read('src/components/layout/SearchModal.tsx');
const publicServiceSearch = read('src/data/publicServiceSearch.ts');
const dashboardMetrics = read('src/components/sections/DashboardMetrics.tsx');
const historicalTrendChart = read('src/components/sections/HistoricalTrendChart.tsx');
const budgetSection = read('src/components/sections/BudgetSection.tsx');
const budgetImpact = read('src/components/sections/BudgetImpact.tsx');
must(budgetSection.includes('formatBudgetCurrency') && budgetImpact.includes('formatBudgetCurrency'), 'valores da LOA usam formatação sem casas decimais artificiais');
must(searchModal.includes("role=\"combobox\"") && searchModal.includes('aria-activedescendant') && searchModal.includes('filteredLengthRef'), 'busca usa semântica combobox e evita closure stale na navegação por teclado');
must((dashboardMetrics.includes('Ver dados em tabela') && dashboardMetrics.includes('<table')) || (historicalTrendChart.includes('Ver dados em tabela') && historicalTrendChart.includes('<table')), 'gráficos principais possuem alternativa explícita em tabela acessível');
must(index.includes('id="boot-fallback"') && index.includes('obs-skeleton') && index.includes('Recarregar'), 'fallback inicial combina skeleton e recuperação explícita');

must(index.includes('maximum-scale=5') && index.includes('viewport-fit=cover'), 'viewport mobile preserva zoom e safe-area');
const headerSource = read('src/components/layout/Header.tsx');
must((appSource.includes('skip-link') && appSource.includes('Pular para o conteúdo principal')) || (headerSource.includes('skip-link') && headerSource.includes('Pular para o conteúdo principal')), 'navegação por teclado possui atalho de salto para o conteúdo');
must(fs.existsSync(path.join(root, 'public/offline.html')), 'página offline personalizada está versionada');
must(vite.includes("'pwa-192.png', 'pwa-512.png', 'apple-touch-icon.png'") && vite.includes("navigateFallback: '/observatorio/index.html'"), 'VitePWA inclui ícones móveis e shell de navegação offline');
must(vite.includes("handler: 'StaleWhileRevalidate'") && vite.includes('NetworkFirst'), 'PWA possui cache rápido de documento e NetworkFirst para API');
must(!appSource.includes('election-mode') && !read('src/components/ExperienceShell.tsx').includes('election-mode') && !read('src/components/sections/HeroCountdown.tsx').includes('electionMode'), 'Modo Eleição cosmético removido do fluxo principal');
must(!read('src/components/sections/HeroCountdown.tsx').includes('observatorio-v43-election-mode'), 'Modo Eleição não usa namespace de armazenamento legado');

const pkgScripts = packageJson.scripts ?? {};
const workflowsDir = path.join(root, '.github/workflows');
const workflowFiles = fs.existsSync(workflowsDir)
  ? fs.readdirSync(workflowsDir).filter(file => file.endsWith('.yml') || file.endsWith('.yaml'))
  : [];
for (const file of workflowFiles) {
  const workflowSource = fs.readFileSync(path.join(workflowsDir, file), 'utf8');
  must(!/\bnpm install\b/.test(workflowSource), file + ' usa npm ci em vez de npm install');
  for (const match of workflowSource.matchAll(/^\s+uses:\s+actions\/[^@\s]+@([^\s#]+)/gm)) {
    must(/^[0-9a-f]{40}$/.test(match[1]), file + ' fixa Actions por SHA completo');
  }
}


must(pkgScripts['audit:a11y'] === 'node scripts/audit-accessibility.mjs', 'package.json registra auditoria de acessibilidade');
must(pkgScripts['audit:mobile'] === 'node scripts/audit-mobile.mjs', 'package.json registra auditoria mobile');
must(pkgScripts['audit:deps'] === 'npm audit --audit-level=high', 'package.json registra gate de vulnerabilidades de dependências');
must(pkgScripts['audit:browser']?.includes('playwright install --with-deps chromium') && !pkgScripts['test:browser:prepare'], 'CI usa Playwright instalado pelo lockfile, sem npm install dinâmico');
must(syncWorkflow.includes('npm run sync:tse') && syncWorkflow.includes('npm run validate:tse'), 'workflow TSE automatiza captura oficial e validação da watchlist');
must(syncWorkflow.includes("cron: '0 */4 * * *'") && syncWorkflow.includes('workflow_dispatch:'), 'workflow TSE possui atualização automática e acionamento manual');
must(syncWorkflow.includes('npm run validate:observatorio') && syncWorkflow.includes('npm run typecheck') && syncWorkflow.includes('npm run build'), 'workflow TSE só publica snapshot após validação, typecheck e build');
must(syncWorkflow.includes('pull-requests: write') && syncWorkflow.includes('gh pr create') && !/^\\s*git push\\s*$/m.test(syncWorkflow), 'workflow TSE não faz push direto para main');
must(resultsWorkflow.includes('pull-requests: write') && resultsWorkflow.includes('gh pr create') && !/^\\s*git push\\s*$/m.test(resultsWorkflow), 'workflow de resultados não faz push direto para main');
must(!fs.existsSync(path.join(root, '.github/workflows/sync-tse-candidates.yml')), 'não existem dois workflows concorrentes para a mesma captura TSE');
must(!fs.existsSync(path.join(root, 'scripts/tse/ingest-candidates-local.ts')), 'pipeline antigo de ingestão municipal removido após consolidação');
must(!deployWorkflow.includes("REQUIRE_TSE_SYNC: 'true'") && !deployWorkflow.includes('sync:tse'), 'deploy de produção é independente da captura externa TSE');
must(dataSource.includes("sourceId: 'qedu-ideb-2025'") && dataSource.includes('5.7, 6.2'), 'faixa Ideb 2025 está explicitamente separada');
must(!read('src/components/sections/PoliticalResearch.tsx').includes('computeTheoreticalMargin') && !read('src/components/sections/PoliticalResearch.tsx').includes('calculateMargin'), 'interface não calcula margem de erro teórica');
must(read('src/components/layout/Header.tsx').includes('Captura ') && read('src/components/layout/Header.tsx').includes('updatedAt'), 'cabeçalho exibe a data da captura local do conjunto principal');
must(
  deployWorkflow.includes('npm run audit:all')
    || (deployWorkflow.includes('npm run audit:static') && deployWorkflow.includes('npm run audit:a11y') && deployWorkflow.includes('npm run audit:mobile')),
  'deploy exige auditorias principais',
);

const mainSource = read('src/main.tsx');
must(mainSource.includes("import { App } from './app/App'") && mainSource.includes("import { ErrorBoundary } from './components/system/ErrorBoundary'"), 'bootstrap principal não depende de import dinâmico para montar o React');
must(mainSource.includes('BOOT_TIMEOUT_MS = 10000') && mainSource.includes('observatorioMounted'), 'bootstrap possui timeout de segurança e marcador de montagem');
must(mainSource.includes('[Observatório][boot] 1/4') && mainSource.includes('[Observatório][boot] 4/4'), 'bootstrap possui logs de diagnóstico por etapa');
must(mainSource.includes("observatorio:last-runtime-error") && mainSource.includes("observatorio:last-boot-error"), 'diagnóstico separa erros de boot e runtime');
must(mainSource.includes("observatorio:app-mounted") && mainSource.includes("import('virtual:pwa-register')"), 'PWA é registrado somente após a montagem principal');
must(index.includes('boot-fallback') && index.includes('10000') && index.includes('data-boot-timeout'), 'HTML possui watchdog independente para falha total do JavaScript');

const deferredGroups = ['DeferredContextGroup', 'DeferredCivicGroup', 'DeferredElectionGroup', 'DeferredPublicDataGroup', 'DeferredEvidenceGroup'];
for (const group of deferredGroups) must(appSource.includes(group), 'App registra ' + group);
must(appSource.includes('IntersectionObserver'), 'App usa carregamento diferido por visibilidade');
const contextSource = read('src/components/sections/DeferredContextGroup.tsx');
must(appSource.includes("'saude'") && appSource.includes("'transporte'") && appSource.includes("'quiz'") && contextSource.includes('SanitationHealthSection') && contextSource.includes('QuickQuiz'), 'deep links públicos preservam saúde, transporte e quiz');
must(appSource.includes('navigateToHash') && appSource.includes("window.dispatchEvent(new CustomEvent('observatorio:navigate'"), 'navegação profunda reativa ao hash');
must(appSource.includes('id="analise"') && appSource.includes('<DashboardMetrics />'), 'atalho legado #analise aponta para o dashboard montado diretamente');
const dashboardIdCount = (dashboardMetrics.match(/id=["']dashboard["']/g) ?? []).length;
const analiseIdCount = (appSource.match(/id=["']analise["']/g) ?? []).length;
must(dashboardIdCount === 1 && dashboardMetrics.includes('dashboard-shell'), '#dashboard possui uma única âncora pública no DashboardMetrics');
const audienceHub = read('src/components/AudienceHub.tsx');
must(/id:\s*['"]dashboard['"]/.test(audienceHub), 'atalho Cidade aponta para a âncora pública #dashboard');
must(!audienceHub.includes("dashboard: 'analise'"), 'atalho Cidade não depende da âncora legada #analise');
must(analiseIdCount === 1, '#analise possui uma única âncora legada');
must(dashboardMetrics.includes('id="dashboard"') && appSource.includes('id="analise"'), 'dashboard possui âncora pública e compatibilidade legada');
must(appSource.includes('<LanguageModeProvider>') && appSource.includes('<AudienceHub />') && read('src/components/sections/DeferredEvidenceGroup.tsx').includes('<ProjectTrustPanel />'), 'descoberta, confiança e modo de linguagem montados');

const allRuntimeText = [
  appSource,
  read('src/components/sections/DeferredContextGroup.tsx'),
  read('src/components/sections/DeferredCivicGroup.tsx'),
  read('src/components/sections/DeferredPublicDataGroup.tsx'),
  read('src/components/sections/DeferredEvidenceGroup.tsx'),
].join('\n');
must(allRuntimeText.includes('<DataQualityPanel />') && allRuntimeText.includes('<EvidenceChain />'), 'qualidade e evidências montadas');
must(allRuntimeText.includes('<CivicActionHub />') && allRuntimeText.includes('<DataExportActions />'), 'ação e exportação montadas');
must(allRuntimeText.includes('<PublicDataPulse />') && appSource.includes('<Footer />'), 'atualizações públicas e footer institucional montados');
must(allRuntimeText.includes('<PoliticalResearch />'), 'candidaturas montadas');

for (const id of ['descubra', 'dashboard', 'acao', 'eleitoral360', 'fontes']) {
  must(navigation.includes(`id: '${id}'`), `navegação pública contém #${id}`);
}
for (const id of ['principios', 'contexto', 'dados', 'qualidade', 'evidencias']) {
  must(!navigation.includes(`id: '${id}'`), `subcamada #${id} não polui a navegação pública`);
}
must(allRuntimeText.includes('<ProjectTrustPanel />') && allRuntimeText.includes('<DataQualityPanel />') && allRuntimeText.includes('<EvidenceChain />'), 'método, qualidade e evidências continuam disponíveis no conteúdo técnico');
must(allRuntimeText.includes('<ContextComparison />') && allRuntimeText.includes('<PublicDataPulse />'), 'contexto e atualizações públicas continuam disponíveis fora do menu principal');

must(candidates.schemaVersion === 3 && candidates.coverage === 'state_watchlist', 'snapshot atual usa exclusivamente o contrato estadual watchlist');
must(['not_synced', 'synced', 'first_capture', 'unchanged', 'changed', 'stale', 'failed', 'local_filter_pending'].includes(candidates.meta.state), 'estado do snapshot pertence ao contrato conhecido');
must(!read('scripts/sync-tse-2026.mjs').includes("coverage: 'municipality_required'") && !read('scripts/sync-tse-2026.mjs').includes('selection: \'all_municipality\''), 'sincronizador TSE não pode promover o snapshot para lista municipal');
must(candidates.meta.localFilter === 'Águas Lindas de Goiás' && (candidates.meta.state === 'local_filter_pending' || (['editorial_watchlist', 'local_evidence'].includes(candidates.meta.localFilterType) && candidates.meta.candidateUniverseScope === 'GO')), 'snapshot separa universo oficial de Goiás do recorte editorial local');
must(candidates.meta.state === 'local_filter_pending' || ['official_tse_zip_csv', 'official_tse_divulgacandcontas_api', 'official_tse_divulgacandcontas_api_via_reader_proxy'].includes(candidates.meta.retrievalMethod), 'snapshot TSE usa fonte oficial suportada quando sincronizado');

const runtimeFiles = [
  'src/app/App.tsx',
  'src/components/ExperienceShell.tsx',
  'src/components/sections/HeroCountdown.tsx',
  'src/components/sections/ContextComparison.tsx',
  'src/components/sections/CivicActionHub.tsx',
  'src/context/LanguageModeContext.tsx',
  'src/components/sections/EvidenceChain.tsx',
  'src/components/sections/DataQualityPanel.tsx',
  'src/data/observatorioData.ts',
  'src/data/sourceRegistry.ts',
  'src/config/navigation.ts',
  'src/config/version.ts',
  'src/components/sections/DeferredEvidenceGroup.tsx',
  'src/data/contextualComparison.ts',
];
for (const file of runtimeFiles) {
  const content = read(file).toLowerCase();
  for (const legacy of ['v35', 'v36']) if (content.includes(legacy)) fail(`${file} ainda contém referência legada ${legacy}`);
}


function collectFiles(target) {
  const absolute = path.join(root, target);
  if (!fs.existsSync(absolute)) return [];
  const entries = fs.readdirSync(absolute, { withFileTypes: true });
  const output = [];
  for (const entry of entries) {
    const full = path.join(absolute, entry.name);
    if (entry.isDirectory()) output.push(...collectFiles(path.relative(root, full)));
    else if (/\.(mjs|js|ts|tsx)$/.test(entry.name)) output.push(full);
  }
  return output;
}

const scriptFiles = collectFiles('scripts').filter(file => !/[/\\]audit-[^/]+\.mjs$/.test(file));
const missingLocalImports = [];
for (const file of scriptFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const imports = [
    ...source.matchAll(/from\s+['"]((?:\.\.?\/)[^'"]+)['"]/g),
    ...source.matchAll(/import\(\s*['"]((?:\.\.?\/)[^'"]+)['"]\s*\)/g),
  ].map(match => match[1]);

  for (const specifier of imports) {
    const base = path.resolve(path.dirname(file), specifier);
    const candidates = [
      base,
      base + '.mjs',
      base + '.js',
      base + '.ts',
      base + '.tsx',
      path.join(base, 'index.mjs'),
      path.join(base, 'index.js'),
      path.join(base, 'index.ts'),
    ];
    if (!candidates.some(fs.existsSync)) {
      missingLocalImports.push(path.relative(root, file) + ' -> ' + specifier);
    }
  }
}
if (missingLocalImports.length) {
  for (const item of missingLocalImports) fail('import local quebrado: ' + item);
} else {
  pass('scripts não possuem imports locais apontando para arquivos inexistentes');
}

let lockTracked = false;
try {
  execFileSync('git', ['ls-files', '--error-unmatch', 'package-lock.json'], { stdio: ['ignore', 'pipe', 'ignore'] });
  lockTracked = true;
} catch {}
if (!fs.existsSync(path.join(root, 'package-lock.json')) || !lockTracked) {
  fail('package-lock.json deve existir e estar versionado');
} else {
  pass('package-lock.json está versionado para instalações reprodutíveis');
}


const languageToggle = read('src/components/layout/LanguageModeToggle.tsx');
const sharing = [
  read('src/components/sections/ExecutiveSummary.tsx'),
  read('src/components/sections/QuickQuiz.tsx'),
  read('src/components/TransportCalculator.tsx'),
].join('\n');
must(languageToggle.includes('language-toggle-v3') && languageToggle.includes("id: 'summary'") && languageToggle.includes("id: 'simple'") && languageToggle.includes("id: 'technical'") && languageToggle.includes("setMode(id)"), 'modo Resumo/Simples/Técnico possui componente próprio');
must(sharing.includes('navigator.share') && sharing.includes('navigator.clipboard') && sharing.includes("document.createElement('textarea')"), 'compartilhamento nativo e fallback de cópia permanecem disponíveis');

if (!errors.length) {
  pass(`auditoria estática concluída para ${edition}`);
} else {
  console.error(`FAIL ${errors.length} regra(s)`);
  for (const error of errors) console.error(' -', error);
  process.exitCode = 1;
}
