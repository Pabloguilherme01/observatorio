import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const files = [
  'src/main.tsx',
  'src/app/App.tsx',
  'src/components/sections/ExecutiveSummary.tsx',
  'src/components/sections/HeroCountdown.tsx',
  'src/components/layout/MobileBottomNav.tsx',
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

const tseSync = read('scripts/sync-tse-2026.mjs');
if (
  tseSync.includes('function parseCsv')
  && tseSync.includes("MUNICIPALITY_CODE = '92737'")
  && tseSync.includes("coverage: 'municipality_required'")
  && tseSync.includes("retrievalMethod: 'official_tse_zip_csv'")
) pass('captura TSE é autocontida, municipal e baseada no pacote oficial.');
else fail('captura TSE perdeu filtro municipal ou contrato oficial direto.');

if (!fs.existsSync(path.join(root, 'scripts/tse/ingest-candidates-local.ts'))) pass('pipeline municipal legado inexistente não pode voltar a falhar em produção.');
else fail('pipeline municipal legado ainda está presente.');

const summary = read('src/components/sections/ExecutiveSummary.tsx');
if (summary.includes('brasiliaRoute?.fareBrl') && summary.includes('poll?.')) pass('Resumo executivo protege dependências opcionais.');
else fail('Resumo executivo ainda possui dependências opcionais sem proteção.');

if (failures.length) {
  console.error('FAIL ' + failures.length + ' regra(s)');
  for (const failure of failures) console.error(' - ' + failure);
  process.exit(1);
}
console.log('PASS auditoria runtime concluída');
