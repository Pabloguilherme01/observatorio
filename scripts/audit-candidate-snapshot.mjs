import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const snapshotPath = path.join(root, 'src/data/generated/tse2026-candidates.json');
const raw = readFileSync(snapshotPath, 'utf8');
const data = JSON.parse(raw);
const errors = [];
const meta = data?.meta;

const fail = message => errors.push(message);
const pass = message => console.log('PASS', message);

if (!meta || typeof meta !== 'object') fail('metadados do snapshot ausentes.');
if (meta?.source !== 'TSE — Candidatos 2026') fail('fonte do snapshot não corresponde ao catálogo oficial do TSE.');
if (meta?.retrievalMethod !== 'official_tse_zip_csv') fail('método de captura do snapshot não é o ZIP/CSV oficial do TSE.');
if (meta?.candidateUniverseScope !== 'GO') fail('escopo estadual do snapshot não está declarado como GO.');
if (meta?.localFilterType !== 'local_evidence') fail('o recorte precisa declarar localFilterType=local_evidence.');
if (meta?.localFilter !== 'Águas Lindas de Goiás') fail('filtro municipal do snapshot não corresponde a Águas Lindas de Goiás.');
if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(meta?.downloadedAt ?? '')) fail('downloadedAt precisa ser ISO UTC.');
if (!Number.isSafeInteger(meta?.sourceRows) || meta.sourceRows <= 0) fail('sourceRows inválido.');
if (!Number.isSafeInteger(meta?.originalMatchedRows) || meta.originalMatchedRows < 0) fail('originalMatchedRows inválido.');
if (!Number.isSafeInteger(meta?.matchedRows) || meta.matchedRows <= 0) fail('matchedRows inválido.');
if (!Array.isArray(data.watchlist) || data.watchlist.length !== meta.matchedRows) fail('watchlist deve ter o mesmo tamanho do recorte acompanhado.');
if (!Array.isArray(data.matched) || data.matched.length !== meta.matchedRows) fail('matchedRows não coincide com matched[].length.');
if (meta.sourceRows < meta.matchedRows) fail('matchedRows não pode superar sourceRows.');

const diff = data?.diff;
const volatileCandidateFields = new Set(['generationDate', 'generationTime']);
if (!diff || typeof diff !== 'object') {
  fail('diff do snapshot ausente.');
} else {
  const records = Array.isArray(diff.records) ? diff.records : [];
  const forbidden = records.flatMap(record =>
    Array.isArray(record?.changedFields)
      ? record.changedFields.filter(field => volatileCandidateFields.has(field))
      : [],
  );
  if (forbidden.length) fail('diff contém mudanças voláteis que não podem ser apresentadas como alteração eleitoral: ' + [...new Set(forbidden)].join(', '));
  if (diff.added !== records.filter(record => record.type === 'added').length) fail('contador added divergente do diff.');
  if (diff.removed !== records.filter(record => record.type === 'removed').length) fail('contador removed divergente do diff.');
  if (diff.changed !== records.filter(record => record.type === 'changed').length) fail('contador changed divergente do diff.');
  if (diff.state !== (diff.records.length ? 'changed' : 'unchanged')) fail('estado do diff não corresponde aos registros persistidos.');
  if (meta.state !== diff.state) fail('estado do snapshot diverge do estado do diff.');
}

for (const candidate of data.matched ?? []) {
  if (!candidate?.sqCandidate) fail('candidato sem sqCandidate.');
  if (!candidate?.name) fail('candidato sem nome oficial.');
  if (!candidate?.office) fail(candidate?.name + ': candidatura sem cargo.');
  if (!candidate?.party) fail(candidate?.name + ': candidatura sem partido.');
  if (!candidate?.localEvidence) fail(candidate?.name + ': vínculo local sem evidência textual.');
  if (!Array.isArray(candidate?.evidenceSourceUrls) || candidate.evidenceSourceUrls.length === 0) {
    fail(candidate?.name + ': vínculo local sem URL de evidência.');
  }
  if (!candidate?.sourceResource?.includes('dadosabertos.tse.jus.br')) {
    fail(candidate?.name + ': resource do TSE ausente ou não oficial.');
  }
}

if (errors.length === 0) pass('snapshot de candidatos possui contrato oficial + recorte editorial explícito e evidenciado.');

console.log(JSON.stringify({ valid: errors.length === 0, matchedRows: meta?.matchedRows ?? 0, sourceRows: meta?.sourceRows ?? 0, errors }, null, 2));
if (errors.length) process.exit(1);
