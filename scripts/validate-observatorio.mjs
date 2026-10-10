import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dataPath = path.join(root, 'src/data/observatorioData.ts');
const sourcesPath = path.join(root, 'src/data/sourceRegistry.ts');
const text = readFileSync(dataPath, 'utf8');
const sourcesText = readFileSync(sourcesPath, 'utf8');
const checks = [];
const fail = message => checks.push({ ok: false, message });
const pass = message => checks.push({ ok: true, message });

if (!text.includes("export const observatorioData")) fail('observatorioData não encontrado.');
else pass('dataset principal encontrado.');

const sourceIds = [...text.matchAll(/(?:sourceId|consolidatedSourceId):\s*'([^']+)'/g)].map(match => match[1]);
const sourceIdsFromArrays = [...text.matchAll(/sourceIds:\s*\[([\s\S]*?)\]/g)]
  .flatMap(match => [...match[1].matchAll(/'([^']+)'/g)].map(item => item[1]));
const usedSourceIds = [...new Set([...sourceIds, ...sourceIdsFromArrays])];
const registryIds = new Set([...sourcesText.matchAll(/\bid:\s*'([^']+)'/g)].map(match => match[1]));
const missingSources = usedSourceIds.filter(id => !registryIds.has(id));
if (missingSources.length) fail('sourceId sem registro em sourceRegistry: ' + missingSources.join(', '));
else pass('todos os sourceId usados pelo dataset possuem registro de proveniência.');

const dateStrings = [...text.matchAll(/'((?:19|20)\d{2}-\d{2}-\d{2})'/g)].map(match => match[1]);
const invalidDates = dateStrings.filter(value => {
  const date = new Date(value + 'T00:00:00Z');
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value;
});
if (invalidDates.length) fail('datas ISO inválidas no dataset: ' + [...new Set(invalidDates)].join(', '));
else pass('datas ISO do dataset possuem formato e calendário válidos.');

const brasiliaFare = Number(text.match(/brasilia:\s*([0-9]+(?:\.[0-9]+)?)/)?.[1] ?? 0);
if (brasiliaFare === 11.45 && text.includes("fareBrl: TRANSPORT_FARES_BRL.brasilia")) pass('Tarifa Brasília está em R$ 11,45 e usa premissa centralizada.');
else fail('Tarifa Brasília não está em R$ 11,45 ou não usa a premissa centralizada.');

const numericChecks = [
  ['população 2026', Number(text.match(/year:\s*2026,\s*value:\s*([0-9]+)/)?.[1] ?? 0)],
  ['orçamento total 2026', Number(text.match(/totalBrl:\s*([0-9_\.]+)/)?.[1]?.replaceAll('_', '') ?? 0)],
  ['tarifa Brasília', brasiliaFare],
];
for (const [label, value] of numericChecks) {
  if (!Number.isFinite(value) || value <= 0) fail(label + ' possui valor numérico inválido: ' + value);
  else pass(label + ' possui valor numérico positivo.');
}

const healthBeds = [
  Number(text.match(/openingReportedBeds:\s*([0-9]+)/)?.[1] ?? 0),
  Number(text.match(/currentStatedWardBeds:\s*([0-9]+)/)?.[1] ?? 0),
  Number(text.match(/currentStatedIcuBeds:\s*([0-9]+)/)?.[1] ?? 0),
  Number(text.match(/plannedBeds:\s*([0-9]+)/)?.[1] ?? 0),
].filter(Boolean);
if (healthBeds.length === 4 && healthBeds[3] < healthBeds[1] + healthBeds[2]) {
  fail('capacidade planejada do HEAL está abaixo da soma das capacidades correntes declaradas.');
} else if (healthBeds.length === 4) {
  pass('capacidade planejada do HEAL é coerente com as capacidades correntes declaradas.');
}

const failed = checks.filter(check => !check.ok);
console.log(JSON.stringify({ valid: failed.length === 0, checks }, null, 2));
if (failed.length) process.exit(1);
