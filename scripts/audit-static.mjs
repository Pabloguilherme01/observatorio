import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

const packageJson = JSON.parse(read('package.json'));
const versionSource = read('src/config/version.ts');
const dataSource = read('src/data/observatorioData.ts');
const index = read('index.html');
const vite = read('vite.config.ts');
const navigation = read('src/config/navigation.ts');
const app = read('src/app/App.tsx');
const candidates = JSON.parse(read('src/data/generated/tse2026-candidates.json'));
const robots = read('public/robots.txt');
const sitemap = read('public/sitemap.xml');
const syncWorkflow = read('.github/workflows/sync-tse-candidates.yml');
const deployWorkflow = read('.github/workflows/deploy-pages.yml');

const errors = [];
const pass = (message) => console.log('PASS', message);
const fail = (message) => errors.push(message);
const must = (condition, message) => condition ? pass(message) : fail(message);

const appVersion = versionSource.match(/APP_VERSION = '([^']+)'/)?.[1];
const edition = versionSource.match(/EDITION = '([^']+)'/)?.[1];
const namespace = versionSource.match(/STORAGE_NAMESPACE = '([^']+)'/)?.[1];
const updatedAt = dataSource.match(/updatedAt: '([^']+)'/)?.[1];
const dateModified = index.match(/"dateModified": "([^"]+)"/)?.[1];

must(packageJson.version === appVersion, 'package.json e APP_VERSION estão sincronizados');
must(edition === `V${appVersion?.split('.')[0]}`, 'EDITION acompanha o major da versão');
must(namespace === `observatorio-v${appVersion?.split('.')[0]}`, 'namespace de armazenamento identifica a edição');
must(dateModified === updatedAt, 'dateModified do documento coincide com updatedAt do dataset');
must(vite.includes("base: '/observatorio/'"), 'Vite usa base compatível com GitHub Pages');
must(vite.includes("start_url: '/observatorio/'") && vite.includes("scope: '/observatorio/'"), 'PWA mantém start_url e scope no subcaminho publicado');
 must(vite.includes("api/v1/observatorio.json") && vite.includes("api/v1/openapi.json") && vite.includes("api/v1/health.json") && vite.includes("api/v1/sources.json"), 'build gera API pública, healthcheck e registro de fontes a partir do dataset da interface');
must(robots.includes('https://pabloguilherme01.github.io/observatorio/sitemap.xml'), 'robots.txt aponta para o sitemap publicado');
must(sitemap.includes('https://pabloguilherme01.github.io/observatorio/'), 'sitemap aponta para a URL canônica');
must(index.includes('og-cover.svg') && index.includes('summary_large_image'), 'preview social usa imagem e cartão grande');
must(index.includes('maximum-scale=5') && index.includes('viewport-fit=cover'), 'viewport mobile preserva zoom e safe-area');
must(vite.includes('start_url: \'/observatorio/\'') && vite.includes('scope: \'/observatorio/\''), 'PWA está configurado para instalação no subcaminho publicado');
must(vite.includes("offline.html") && read('src/sw.ts').includes("request.mode === 'navigate'") && read('src/sw.ts').includes('OFFLINE_URL'), 'PWA possui página offline e cache NetworkFirst para navegação');
must(app.includes('election-mode') || read('src/components/ExperienceShell.tsx').includes('election-mode'), 'Modo Eleição possui estado persistente no shell de experiência');
must(read('src/components/sections/HeroCountdown.tsx').includes('DivulgaCandContas') && read('src/components/sections/HeroCountdown.tsx').includes('Pardal'), 'Modo Eleição expõe caminhos cívicos oficiais');

const pkgScripts = packageJson.scripts ?? {};
must(pkgScripts['audit:a11y'] === 'node scripts/audit-accessibility.mjs', 'package.json registra a auditoria de acessibilidade');
must(pkgScripts['audit:mobile'] === 'node scripts/audit-mobile.mjs', 'package.json registra a auditoria mobile');
must(syncWorkflow.includes('npm run sync:tse') && syncWorkflow.includes('npm run validate:tse'), 'workflow automatiza captura e validação do snapshot TSE');
must(syncWorkflow.includes("REQUIRE_TSE_SYNC: 'true'"), 'workflow TSE exige snapshot efetivamente sincronizado antes de validar');
must(!deployWorkflow.includes("REQUIRE_TSE_SYNC: 'true'") && !deployWorkflow.includes('sync:tse'), 'deploy de produção é independente da captura externa do TSE');
must(dataSource.includes("sourceId: 'qedu-ideb-2025'") && dataSource.includes('5.7, 6.2'), 'faixa Ideb 2025 está explicitamente separada como referência secundária');
must(deployWorkflow.includes('npm run audit:static') && deployWorkflow.includes('npm run audit:a11y') && deployWorkflow.includes('npm run audit:mobile'), 'deploy do Pages exige as três auditorias antes da publicação');
must(app.includes('DataQualityPanel') && app.includes('EvidenceChain'), 'camadas de qualidade e evidências estão montadas no App');
must(app.includes('CivicActionHub') && app.includes('<ContextComparison />') && app.includes('<LanguageModeProvider>'), 'camadas cívicas e modo de linguagem estão montados no App');
must(app.includes('<AudienceHub />') && app.includes('InstagramSyncHub') && app.includes('<ProjectTrustPanel />') && app.includes('<SnapshotChanges />'), 'descoberta, Instagram, confiança e radar estão montados no primeiro fluxo');
for (const id of ['descubra', 'instagram', 'principios', 'dashboard', 'contexto', 'acao', 'eleitoral360', 'dados', 'qualidade', 'evidencias', 'fontes']) {
  must(navigation.includes(`id: '${id}'`), `navegação contém #${id}`);
}
must(candidates.coverage === 'watchlist', 'snapshot de candidaturas deixa explícito o escopo watchlist');
must(['not_synced', 'synced', 'first_capture', 'unchanged', 'changed', 'stale', 'failed'].includes(candidates.meta.state), 'estado do snapshot de candidaturas pertence ao contrato conhecido');
must(candidates.meta.state === 'not_synced' || Number(candidates.meta.sourceRows) >= 0, 'captura TSE só é considerada material quando o estado não é not_synced');

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
  'src/data/contextualComparison.ts',
];
for (const file of runtimeFiles) {
  const content = read(file).toLowerCase();
  for (const legacy of ['v35', 'v36']) {
    if (content.includes(legacy)) fail(`${file} ainda contém referência legada ${legacy}`);
  }
}
if (!errors.length) {
  pass(`auditoria estática concluída para ${edition}`);
} else {
  console.error(`FAIL ${errors.length} regra(s)`);
  for (const error of errors) console.error(' -', error);
  process.exitCode = 1;
}
