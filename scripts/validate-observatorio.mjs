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

const pollBlock = text.match(/polls:\s*\[([\s\S]*?)\],\n\n  candidates:/)?.[1] ?? '';
const pollParts = [...pollBlock.matchAll(/percentage:\s*([0-9]+(?:\.[0-9]+)?)/g)].map(match => Number(match[1]));
for (const key of ['nonePct', 'notSurePct', 'unclassifiedPct']) {
  const value = pollBlock.match(new RegExp(key + ':\\s*([0-9]+(?:\\.[0-9]+)?)'));
  if (value) pollParts.push(Number(value[1]));
}
if (pollParts.length) {
  const sum = pollParts.reduce((a, b) => a + b, 0);
  if (sum > 100.001) fail('categorias da pesquisa ultrapassam 100%: ' + sum.toFixed(3));
  else if (Math.abs(sum - 100) > 0.05) fail('categorias da pesquisa não fecham 100%: ' + sum.toFixed(3));
  else pass('categorias publicadas da pesquisa fecham 100% dentro da tolerância.');
}

const ageBlock = text.match(/ageGroups:\s*\[([\s\S]*?)\],\n\s+womenPct:/)?.[1] ?? '';
const ageVoters = [...ageBlock.matchAll(/voters:\s*([0-9]+)/g)].map(match => Number(match[1]));
const ageShares = [...ageBlock.matchAll(/sharePct:\s*([0-9]+(?:\.[0-9]+)?)/g)].map(match => Number(match[1]));
const electorate = Number(text.match(/electorate:\s*([0-9]+)/)?.[1] ?? 0);
if (ageVoters.length && ageShares.length && electorate) {
  const voterSum = ageVoters.reduce((a, b) => a + b, 0);
  const shareSum = ageShares.reduce((a, b) => a + b, 0);
  if (voterSum !== electorate) fail('grupos etários não fecham o eleitorado: ' + voterSum + ' != ' + electorate);
  else pass('grupos etários fecham exatamente o eleitorado do snapshot.');
  if (Math.abs(shareSum - 100) > 0.2) fail('percentuais etários não fecham 100%: ' + shareSum.toFixed(2));
  else pass('percentuais etários fecham aproximadamente 100%.');
}

if (text.includes("interviews: 400") && text.includes("theoreticalMarginErrorPct: 4.9")) {
  pass('Pesquisa mantém margem teórica explicitamente marcada.');
} else {
  fail('Pesquisa perdeu a marcação de margem teórica.');
}

if (text.includes("fareBrl: 11.45")) pass('Tarifa Brasília está em R$ 11,45.');
else fail('Tarifa Brasília não está em R$ 11,45.');

if (text.includes("state: 'not_synced'")) pass('Snapshot TSE local continua explícito como não sincronizado.');
else pass('Snapshot TSE local já não está em placeholder.');


const numericChecks = [
  ['eleitorado atual', electorate],
  ['população 2026', Number(text.match(/year:\s*2026,\s*value:\s*([0-9]+)/)?.[1] ?? 0)],
  ['orçamento total 2026', Number(text.match(/totalBrl:\s*([0-9_\.]+)/)?.[1]?.replaceAll('_', '') ?? 0)],
  ['tarifa Brasília', Number(text.match(/id:\s*'brasilia'[\\s\\S]*?fareBrl:\s*([0-9.]+)/)?.[1] ?? text.match(/fareBrl:\s*11\.45/) ? 11.45 : 0)],
];
for (const [label, value] of numericChecks) {
  if (!Number.isFinite(value) || value <= 0) fail(label + ' possui valor numérico inválido: ' + value);
  else pass(label + ' possui valor numérico positivo.');
}

const electorate2024 = Number(text.match(/electorate2024:\s*([0-9]+)/)?.[1] ?? 0);
const electorate2026 = electorate;
if (electorate2024 && electorate2026 && electorate2026 < electorate2024) {
  fail('eleitorado 2026 ficou abaixo do snapshot 2024 sem justificativa no contrato.');
} else if (electorate2024 && electorate2026) {
  pass('evolução do eleitorado 2024 → 2026 não apresenta regressão estrutural.');
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
