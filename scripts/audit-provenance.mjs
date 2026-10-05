import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dataText = readFileSync(path.join(root, 'src/data/observatorioData.ts'), 'utf8');
const sourceText = readFileSync(path.join(root, 'src/data/sourceRegistry.ts'), 'utf8');

const errors = [];
const warnings = [];
const pass = message => console.log('PASS', message);
const fail = message => errors.push(message);

const sourceIdsList = [...sourceText.matchAll(/\bid:\s*'([^']+)'/g)].map(match => match[1]);
const checkedDates = [...sourceText.matchAll(/\blastCheckedAt:\s*'([^']+)'/g)].map(match => match[1]);
const sourceIds = new Set(sourceIdsList);

if (sourceIdsList.length !== 68) fail('sourceRegistry deveria conter 68 fontes; encontrado: ' + sourceIdsList.length);
else pass('sourceRegistry contém 68 fontes.');

if (checkedDates.length !== sourceIdsList.length) {
  fail('fontes com lastCheckedAt incompleto: ' + checkedDates.length + '/' + sourceIdsList.length);
} else {
  pass('todas as fontes possuem data explícita de verificação.');
}

const invalidChecked = checkedDates.filter(value => {
  const date = new Date(value + 'T00:00:00Z');
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value;
});
if (invalidChecked.length) fail('lastCheckedAt inválido: ' + invalidChecked.join(', '));
else pass('datas de verificação das fontes são ISO válidas.');

const ibgeStart = sourceText.indexOf("id: 'ibge-cidades-2026'");
const ibgeEnd = ibgeStart >= 0 ? sourceText.indexOf('\n  },', ibgeStart) : -1;
const ibgeCitiesBlock = ibgeStart >= 0 && ibgeEnd > ibgeStart ? sourceText.slice(ibgeStart, ibgeEnd) : '';
if (/referenceDate:/.test(ibgeCitiesBlock)) fail('ibge-cidades-2026 não pode impor uma data de referência global.');
else pass('fonte ampla do IBGE não impõe uma data de referência global.');

const used = [
  ...dataText.matchAll(/(?:sourceId|consolidatedSourceId):\s*'([^']+)'/g),
].map(match => match[1]);
for (const match of dataText.matchAll(/sourceIds:\s*\[([\s\S]*?)\]/g)) {
  for (const id of match[1].matchAll(/'([^']+)'/g)) used.push(id[1]);
}
const missing = [...new Set(used)].filter(id => !sourceIds.has(id));
if (missing.length) fail('sourceId sem registro: ' + missing.join(', '));
else pass('todos os sourceId possuem registro de proveniência.');

const indicatorSection = dataText.match(/indicators:\s*\[([\s\S]*?)\n  \],\n};/)?.[1] ?? '';
const indicators = indicatorSection.split('\n').filter(line => line.trim().startsWith('{ id:') && line.includes('status:'));
const withoutReference = indicators
  .filter(line => !line.includes('referenceDate:'))
  .map(line => line.match(/id:\s*'([^']+)'/)?.[1])
  .filter(Boolean);

if (withoutReference.length) {
  warnings.push(...withoutReference);
  console.log('WARN indicadores sem data diária exata: ' + withoutReference.length + '. Isso é permitido quando a fonte informa apenas ano, período ou atualização.');
} else {
  pass('todos os indicadores possuem referência temporal estruturada.');
}

const suspiciousSyntheticDates = indicators
  .filter(line => /referenceDate:\s*'\d{4}-01-01'/.test(line))
  .map(line => line.match(/id:\s*'([^']+)'/)?.[1])
  .filter(Boolean);
if (suspiciousSyntheticDates.length) {
  warnings.push(...suspiciousSyntheticDates);
  console.log('WARN referências em 01/01 exigem revisão semântica: ' + suspiciousSyntheticDates.join(', '));
} else {
  pass('nenhuma referência diária artificial em 01/01 foi detectada no dataset.');
}

console.log(JSON.stringify({
  valid: errors.length === 0,
  sources: sourceIdsList.length,
  indicators: indicators.length,
  indicatorsWithoutExactReference: withoutReference.length,
  warnings,
  errors,
}, null, 2));

if (errors.length) process.exit(1);
