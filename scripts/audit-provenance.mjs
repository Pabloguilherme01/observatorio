import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dataText = readFileSync(path.join(root, 'src/data/observatorioData.ts'), 'utf8').replaceAll('\r\n', '\n');
const sourceText = readFileSync(path.join(root, 'src/data/sourceRegistry.ts'), 'utf8').replaceAll('\r\n', '\n');
const snapshotText = readFileSync(path.join(root, 'src/data/generated/tse2026-candidates.json'), 'utf8').replaceAll('\r\n', '\n');

const errors = [];
const warnings = [];
const pass = message => console.log('PASS', message);
const fail = message => errors.push(message);

const sourceBlocks = [...sourceText.matchAll(/\{\n\s*id:\s*'([^']+)'[\s\S]*?\n\s*\},/g)]
  .map(match => ({ id: match[1], block: match[0] }));
const sourceIds = new Set(sourceBlocks.map(source => source.id));

if (!sourceBlocks.length) fail('sourceRegistry não pode ficar vazio.');
else pass('sourceRegistry contém ' + sourceBlocks.length + ' fontes.');

const duplicateSourceIds = sourceBlocks
  .map(source => source.id)
  .filter((id, index, ids) => ids.indexOf(id) !== index);
if (duplicateSourceIds.length) fail('sourceRegistry possui IDs duplicados: ' + [...new Set(duplicateSourceIds)].join(', '));
else pass('sourceRegistry possui IDs únicos.');

const missingChecked = sourceBlocks.filter(source => !/\blastCheckedAt:\s*'\d{4}-\d{2}-\d{2}'/.test(source.block));
if (missingChecked.length) fail('fontes sem lastCheckedAt válido: ' + missingChecked.map(source => source.id).join(', '));
else pass('todas as fontes possuem lastCheckedAt ISO.');

const invalidChecked = sourceBlocks
  .map(source => ({ id: source.id, value: source.block.match(/\blastCheckedAt:\s*'([^']+)'/)?.[1] }))
  .filter(source => source.value && !/^\d{4}-\d{2}-\d{2}$/.test(source.value));
if (invalidChecked.length) fail('lastCheckedAt inválido: ' + invalidChecked.map(source => source.id).join(', '));

const ibgeCities = sourceBlocks.find(source => source.id === 'ibge-cidades-2026');
if (!ibgeCities) fail('ibge-cidades-2026 ausente.');
else if (/\breferenceDate:/.test(ibgeCities.block)) fail('ibge-cidades-2026 não pode impor uma data de referência global.');
else pass('fonte ampla do IBGE não impõe uma data de referência global.');

const annualSources = new Set(['inep-ideb-2025', 'qedu-ideb-2025', 'pee-go-educacao-2025', 'pee-go-ept-2025']);
for (const source of sourceBlocks) {
  if (annualSources.has(source.id) && /\breferenceDate:\s*'\d{4}-12-31'/.test(source.block)) {
    fail(source.id + ' usa 31/12 como se fosse data exata; use o ano-base no note.');
  }
}

const used = [...dataText.matchAll(/(?:sourceId|consolidatedSourceId):\s*'([^']+)'/g)].map(match => match[1]);
for (const match of dataText.matchAll(/sourceIds:\s*\[([\s\S]*?)\]/g)) {
  for (const id of match[1].matchAll(/'([^']+)'/g)) used.push(id[1]);
}
const missing = [...new Set(used)].filter(id => !sourceIds.has(id));
if (missing.length) fail('sourceId sem registro: ' + missing.join(', '));
else pass('todos os sourceId possuem registro de proveniência.');

const indicatorSection = dataText.match(/indicators:\s*\[([\s\S]*?)\n  \],\n};/)?.[1] ?? '';
const indicators = indicatorSection.split('\n').filter(line => line.trim().startsWith('{ id:') && line.includes('status:'));
if (!indicators.length) fail('nenhum indicador foi encontrado para auditoria; verifique o parser.');

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
  fail('indicadores não podem usar 01/01 como referência exata sem justificativa: ' + suspiciousSyntheticDates.join(', '));
} else {
  pass('nenhuma referência diária artificial em 01/01 foi detectada no dataset.');
}

let snapshot;
try {
  snapshot = JSON.parse(snapshotText);
} catch {
  fail('snapshot TSE de candidatos não é JSON válido.');
  snapshot = null;
}

if (snapshot) {
  const meta = snapshot.meta;
  const isoTimestamp = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value);
  if (!meta || !isoTimestamp(meta.downloadedAt)) fail('snapshot TSE sem downloadedAt ISO UTC válido.');
  if (meta?.source !== 'TSE — Candidatos 2026') fail('snapshot TSE com source inesperado.');
  if (meta?.localFilter !== 'Águas Lindas de Goiás') fail('snapshot TSE sem filtro municipal editorial explícito.');
  if (meta?.localFilterType !== 'local_evidence') fail('snapshot TSE precisa declarar localFilterType=local_evidence.');
  if (!Number.isSafeInteger(meta?.sourceRows) || meta.sourceRows < 1) fail('snapshot TSE com sourceRows inválido.');
  if (!Number.isSafeInteger(meta?.matchedRows) || meta.matchedRows < 1) fail('snapshot TSE sem candidatos acompanhados no snapshot.');
  if (!Array.isArray(snapshot.matched) || snapshot.matched.length !== meta.matchedRows) fail('matchedRows não coincide com matched[].length.');
  if (!Array.isArray(snapshot.watchlist) || snapshot.watchlist.length < meta.matchedRows) fail('watchlist deveria cobrir ao menos os candidatos acompanhados.');
  const snapshotDate = meta.downloadedAt?.slice(0, 10);
  if (snapshotDate !== '2026-10-05') warnings.push('snapshot TSE foi capturado em ' + snapshotDate + '; atualizar a data do dataset antes de publicar um novo corte.');
  pass('snapshot TSE contém metadados suficientes para rastrear captura e recorte editorial.');
}

console.log(JSON.stringify({
  valid: errors.length === 0,
  sources: sourceBlocks.length,
  indicators: indicators.length,
  indicatorsWithoutExactReference: withoutReference.length,
  warnings,
  errors,
}, null, 2));

if (errors.length) process.exit(1);
