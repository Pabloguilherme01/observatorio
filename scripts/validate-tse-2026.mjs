import { existsSync, readFileSync } from 'node:fs';

const path = new URL('../src/data/generated/tse2026-candidates.json', import.meta.url);
if (!existsSync(path)) throw new Error('Snapshot TSE ausente.');

const payload = JSON.parse(readFileSync(path, 'utf8'));
const errors = [];
const warnings = [];

if (payload.schemaVersion !== 2) errors.push('schemaVersion deve ser 2.');
if (payload.coverage !== 'watchlist') errors.push('coverage deve ser watchlist neste sincronizador.');
if (!payload.meta?.snapshotId) errors.push('snapshotId ausente.');
const requireSynced = process.env.REQUIRE_TSE_SYNC === 'true';
const state = payload.meta?.state;
const sha = payload.meta?.sourceFileSha256;
const allowedStates = new Set(['not_synced', 'first_capture', 'unchanged', 'changed']);
if (!allowedStates.has(state)) errors.push('state do snapshot inválido: ' + String(state));
const validSha = typeof sha === 'string' && /^[a-f0-9]{64}$/i.test(sha);

if (state === 'not_synced') {
  if (sha !== null && !validSha) errors.push('Placeholder não sincronizado deve usar SHA nulo ou um SHA-256 válido.');
  if (requireSynced) errors.push('Placeholder não pode passar quando REQUIRE_TSE_SYNC=true.');
} else if (!validSha) {
  errors.push('SHA-256 da fonte ausente ou inválido.');
}

if (!Number.isInteger(payload.meta?.sourceRows) || (requireSynced && payload.meta.sourceRows <= 0)) errors.push('sourceRows inválido.');
if (!Array.isArray(payload.watchlist) || payload.watchlist.length !== 10) errors.push('watchlist deve conter exatamente 10 nomes monitorados.');
if (!Array.isArray(payload.matched)) errors.push('matched deve ser array.');

const ids = new Set();
for (const candidate of payload.matched ?? []) {
  if (!candidate.sqCandidate) errors.push('Candidato sem SQ_CANDIDATO.');
  if (ids.has(candidate.sqCandidate)) errors.push('SQ_CANDIDATO duplicado: ' + candidate.sqCandidate);
  ids.add(candidate.sqCandidate);
  if (!candidate.name) errors.push('Candidato sem nome: ' + candidate.sqCandidate);
}

if (state === 'not_synced' && !requireSynced) {
  warnings.push('Snapshot TSE ainda não sincronizado; qualidade estrutural validada sem promover o placeholder a dado eleitoral.');
}
if (payload.meta?.matchedRows !== payload.matched.length) errors.push('matchedRows diverge do tamanho de matched.');

if (state !== 'not_synced') {
  const allowedRetrievalMethods = new Set(['official_tse_open_data_csv', 'official_tse_divulgacandcontas_api']);
  if (!allowedRetrievalMethods.has(payload.meta?.retrievalMethod)) errors.push('retrievalMethod do snapshot TSE inválido ou ausente.');
  if (typeof payload.meta?.resourceUrl !== 'string') errors.push('resourceUrl oficial do TSE ausente.');
  if (payload.meta?.retrievalMethod === 'official_tse_open_data_csv' && !payload.meta.resourceUrl.includes('cdn.tse.jus.br')) errors.push('resourceUrl do pacote CSV oficial do TSE ausente.');
  if (payload.meta?.retrievalMethod === 'official_tse_divulgacandcontas_api' && !payload.meta.resourceUrl.includes('divulgacandcontas.tse.jus.br/divulga/rest/')) errors.push('resourceUrl da API oficial DivulgaCandContas ausente.');
  for (const expected of payload.watchlist ?? []) {
    if (!payload.matched.some(candidate => candidate.watchlistName === expected)) errors.push('Watchlist sem correspondência TSE: ' + expected);
  }
  for (const candidate of payload.matched ?? []) {
    if (!candidate.watchlistName) errors.push('Registro TSE sem watchlistName: ' + candidate.sqCandidate);
  }
}
if (!payload.meta?.workflowRunId && process.env.CI) warnings.push('workflowRunId não informado; execução manual detectada.');

if (errors.length) {
  console.error(JSON.stringify({ valid: false, errors, warnings }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ valid: true, errors: [], warnings }, null, 2));
