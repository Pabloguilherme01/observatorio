import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const files = [
  'src/main.tsx',
  'src/app/App.tsx',
  'src/components/sections/ExecutiveSummary.tsx',
  'src/components/sections/HeroCountdown.tsx',
  'src/components/layout/MobileBottomNav.tsx',
  'src/components/ExperienceShell.tsx',
  'src/components/ShareDataButton.tsx',
  'src/components/DataExportActions.tsx',
  'src/components/InstagramSyncHub.tsx',
];

const failures = [];
const pass = message => console.log('PASS', message);
const fail = message => failures.push(message);

for (const file of files) {
  const source = read(file);
  const nonNullAssertions = (source.match(/\b[A-Za-z_$][\w$]*\s*!\s*(?:[.;,)\]])/g) ?? []).length;
  if (nonNullAssertions) fail(file + ' possui ' + nonNullAssertions + ' asserção(ões) não-nulas potencialmente inseguras.');
  else pass(file + ' não possui asserção não-nula simples.');
}

const app = read('src/app/App.tsx');
if (app.includes('IntersectionObserver') && app.includes('rootMargin: \'320px 0px\'')) pass('carregamento diferido mantém margem de pré-carregamento otimizada.');
else fail('carregamento diferido perdeu proteção de pré-carregamento.');

const experience = read('src/components/ExperienceShell.tsx');
if (
  experience.includes('pendingGTimerRef')
  && experience.includes('focusTimerRef')
  && experience.includes('writeStorage')
  && experience.includes('readStorage')
  && experience.includes('clearTimeout')
) pass('Experiência protege timers de foco/atalho e storage opcional.');
else fail('Experiência possui timer ou acesso ao storage sem hardening suficiente.');

for (const [file, label] of [
  ['src/components/ShareDataButton.tsx', 'compartilhamento'],
  ['src/components/DataExportActions.tsx', 'exportação'],
  ['src/components/InstagramSyncHub.tsx', 'estúdio social'],
]) {
  const source = read(file);
  if (source.includes('statusTimerRef') && source.includes('clearTimeout') && source.includes('flash(')) pass(label + ' possui cleanup de timer de status.');
  else fail(label + ' possui timer de status sem cleanup.');
}

const main = read('src/main.tsx');
if (main.includes('observatorioMounted') && main.includes('observatorio:last-runtime-error')) pass('bootstrap possui marcador de montagem e diagnóstico runtime.');
else fail('bootstrap perdeu marcadores de resiliência.');
const mountWrites = (main.match(/document\.documentElement\.dataset\.observatorioMounted = 'true'/g) ?? []).length;
if (mountWrites === 1) pass('marcador de montagem é escrito apenas no efeito React pós-commit.');
else fail('marcador de montagem possui escrita duplicada ou fora do MountSignal.');
const mountSignalBlock = main.match(/function MountSignal\(\) \{[\s\S]*?\n\}/)?.[0] ?? '';
if (
  main.includes('<MountSignal />')
  && mountSignalBlock.includes("document.documentElement.dataset.observatorioMounted = 'true'")
  && mountSignalBlock.includes("window.dispatchEvent(new CustomEvent('observatorio:app-mounted'))")
  && main.includes('window.addEventListener(\'observatorio:app-mounted\', registerPwa')
) pass('sinal de montagem React é emitido por efeito pós-commit antes do PWA.');
else fail('sinal de montagem React não está protegido por efeito pós-commit.');

try {
  execFileSync(process.execPath, ['--check', path.join(root, 'scripts/sync-tse-2026.mjs')], { stdio: 'pipe' });
  pass('script de sincronização TSE passa no parser do Node.');
} catch (error) {
  fail('script de sincronização TSE falhou no parser do Node: ' + (error instanceof Error ? error.message : String(error)));
}

const tseSync = read('scripts/sync-tse-2026.mjs');
if (
  tseSync.includes('function parseCsv')
  && tseSync.includes("const ZIP_URLS = [")
  && tseSync.includes("const SOURCE_URL = 'https://dadosabertos.tse.jus.br/dataset/candidatos-2026'")
  && tseSync.includes("coverage: 'state_watchlist'")
  && tseSync.includes("selection: 'local_evidence_watchlist'")
  && tseSync.includes("candidateUniverseScope: 'GO'")
  && tseSync.includes("localFilterType: 'local_evidence'")
  && tseSync.includes("retrievalMethod: 'official_tse_zip_csv'")
) pass('captura TSE preserva a watchlist estadual, evidência local e origem oficial.');
else fail('captura TSE perdeu filtro municipal ou contrato oficial direto.');

if (!fs.existsSync(path.join(root, 'scripts/tse/ingest-candidates-local.ts'))) pass('pipeline municipal legado inexistente não pode voltar a falhar em produção.');
else fail('pipeline municipal legado ainda está presente.');

const summary = read('src/components/sections/ExecutiveSummary.tsx');
if (summary.includes('poll?.nonePct') && summary.includes('poll?.notSurePct') && summary.includes('poll?.registrationNumber')) pass('Resumo executivo protege dependências opcionais.');
else fail('Resumo executivo ainda possui dependências opcionais sem proteção.');

if (failures.length) {
  console.error('FAIL ' + failures.length + ' regra(s)');
  for (const failure of failures) console.error(' - ' + failure);
  process.exit(1);
}
console.log('PASS auditoria runtime concluída');
