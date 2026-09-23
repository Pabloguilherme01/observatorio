import { existsSync, readFileSync } from 'node:fs';

const path = new URL('../src/data/generated/tse2026-candidates.json', import.meta.url);
if (!existsSync(path)) throw new Error('Snapshot TSE ausente.');

const payload = JSON.parse(readFileSync(path, 'utf8'));
const errors = [];
const warnings = [];

if (payload.schemaVersion !== 2) errors.push('schemaVersion deve ser 2.');
if (!payload.meta?.snapshotId) errors.push('snapshotId ausente.');
if (!payload.meta?.sourceFileSha256 || !/^[a-f0-9]{64}$/i.test(payload.meta.sourceFileSha256)) errors.push('SHA-256 da fonte ausente ou inválido.');
if (!Number.isInteger(payload.meta?.sourceRows) || payload.meta.sourceRows <= 0) errors.push('sourceRows inválido.');
if (!Array.isArray(payload.matched)) errors.push('matched deve ser array.');

const ids = new Set();
for (const candidate of payload.matched ?? []) {
  if (!candidate.sqCandidate) errors.push('Candidato sem SQ_CANDIDATO.');
  if (ids.has(candidate.sqCandidate)) errors.push('SQ_CANDIDATO duplicado: ' + candidate.sqCandidate);
  ids.add(candidate.sqCandidate);
  if (!candidate.name) errors.push('Candidato sem nome: ' + candidate.sqCandidate);
}

if (payload.meta?.state === 'not_synced') errors.push('Placeholder não pode passar como snapshot de produção.');
if (payload.meta?.matchedRows !== payload.matched.length) errors.push('matchedRows diverge do tamanho de matched.');
if (!payload.meta?.workflowRunId && process.env.CI) warnings.push('workflowRunId não informado; execução manual detectada.');

if (errors.length) {
  console.error(JSON.stringify({ valid: false, errors, warnings }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ valid: true, errors: [], warnings }, null, 2));
