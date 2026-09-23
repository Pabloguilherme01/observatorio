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

const summary = read('src/components/sections/ExecutiveSummary.tsx');
if (summary.includes('brasiliaRoute?.fareBrl') && summary.includes('poll?.')) pass('Resumo executivo protege dependências opcionais.');
else fail('Resumo executivo ainda possui dependências opcionais sem proteção.');

if (failures.length) {
  console.error('FAIL ' + failures.length + ' regra(s)');
  for (const failure of failures) console.error(' - ' + failure);
  process.exit(1);
}
console.log('PASS auditoria runtime concluída');
