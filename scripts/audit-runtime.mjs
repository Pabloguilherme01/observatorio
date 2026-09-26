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
  'src/components/DataExportActions.tsx',
  'src/components/sections/BudgetImpact.tsx',
  'src/components/sections/DemographicDynamic.tsx',
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
if (
  app.includes('function DeferredBlock') &&
  app.includes('<SectionErrorBoundary label={errorLabel}>') &&
  app.includes('readonly errorLabel: string;')
) pass('blocos lazy possuem ErrorBoundary por domínio e rótulo de recuperação.');
else fail('blocos lazy não possuem isolamento de erro por domínio.');
if (app.includes('IntersectionObserver') && app.includes('rootMargin: \'320px 0px\'')) pass('carregamento diferido mantém margem de pré-carregamento otimizada.');
else fail('carregamento diferido perdeu proteção de pré-carregamento.');
if (app.includes("window.addEventListener('hashchange', navigateFromLocation)") && !app.includes("window.addEventListener('popstate', navigateFromLocation)")) pass('sincronização de histórico evita listeners redundantes para a mesma mudança de hash.');
else fail('sincronização de histórico possui listeners redundantes ou perdeu hashchange.');

const header = read('src/components/layout/Header.tsx');
if (header.includes('copiedTimerRef') && header.includes('window.clearTimeout(copiedTimerRef.current)')) pass('feedback de cópia do cabeçalho limpa timer pendente.');
else fail('feedback de cópia do cabeçalho pode deixar timer pendente.');

const experience = read('src/components/ExperienceShell.tsx');
if (
  experience.includes("window.addEventListener('scroll'")
  && experience.includes("window.removeEventListener('scroll'")
  && experience.includes("window.removeEventListener('keydown'")
  && !experience.includes("window.addEventListener('observatorio:command'")
  && !experience.includes("window.removeEventListener('observatorio:command'")
  && experience.includes("window.cancelAnimationFrame")
) pass('Experiência possui cleanup dos listeners e do RAF de leitura.');
else fail('Experiência perdeu cleanup de listeners ou RAF.');

{
  const source = read('src/components/DataExportActions.tsx');
  if (source.includes('statusTimerRef') && source.includes('clearTimeout') && source.includes('flash(')) pass('exportação possui cleanup de timer de status.');
  else fail('exportação possui timer de status sem cleanup.');
}

const bootstrap = read('src/main.tsx');
if (
  bootstrap.includes("import.meta.env.DEV")
  && bootstrap.includes("const publicMessage")
  && bootstrap.includes("sessionStorage.setItem(key, JSON.stringify(payload))")
  && !bootstrap.includes("sessionStorage.setItem(key, JSON.stringify({ errorId, message, source, at")
) pass('bootstrap não persiste nem exibe mensagem técnica bruta em produção.');
else fail('bootstrap ainda pode expor ou persistir detalhes técnicos de exceções em produção.');

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
if (
  summary.includes('populationPoint?.referenceDate')
  && summary.includes('sanitationSource?.label')
  && summary.includes('budgetSource?.referenceDate')
) pass('Resumo executivo protege referências opcionais com optional chaining.');
else fail('Resumo executivo possui referência opcional sem proteção.');

if (failures.length) {
  console.error('FAIL ' + failures.length + ' regra(s)');
  for (const failure of failures) console.error(' - ' + failure);
  process.exit(1);
}
console.log('PASS auditoria runtime concluída');
