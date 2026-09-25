import { existsSync, readFileSync } from 'node:fs';

const path = new URL('../src/data/generated/tse2026-candidates.json', import.meta.url);
if (!existsSync(path)) throw new Error('Snapshot TSE ausente.');

const payload = JSON.parse(readFileSync(path, 'utf8'));
const errors = [];
const warnings = [];

const isStateWatchlistSnapshot = payload.schemaVersion === 3 && payload.coverage === 'state_watchlist';
const state = payload.meta?.state;

if (payload.schemaVersion !== 3) errors.push('O contrato atual do TSE exige schemaVersion 3.');
if (!isStateWatchlistSnapshot) errors.push('O contrato atual exige coverage=state_watchlist; snapshots municipais não são aceitos pelo pipeline editorial atual.');
if (payload.meta?.localFilter !== 'Águas Lindas de Goiás') errors.push('localFilter local ausente ou divergente.');
if (payload.meta?.candidateUniverseScope !== 'GO') errors.push('candidateUniverseScope deve ser GO.');
if (payload.meta?.localFilterType !== 'local_evidence') errors.push('localFilterType deve ser local_evidence.');
if (payload.meta?.selection !== 'local_evidence_watchlist') errors.push('selection deve ser local_evidence_watchlist.');
if (!payload.meta?.snapshotId) errors.push('snapshotId ausente.');
const complementaryFile = payload.meta?.complementaryFile;
if (complementaryFile && (!complementaryFile.name || !/^[a-f0-9]{64}$/i.test(String(complementaryFile.sha256 || '')))) {
  errors.push('complementaryFile, quando presente, deve conter SHA-256 válido.');
}

const allowedStates = new Set(['first_capture', 'synced', 'unchanged', 'changed', 'stale', 'failed', 'not_synced', 'local_filter_pending']);
if (!allowedStates.has(state)) errors.push('state do snapshot inválido: ' + String(state));

const requireSynced = process.env.REQUIRE_TSE_SYNC === 'true';
const allowUpstreamUnavailable = process.env.ALLOW_UPSTREAM_UNAVAILABLE === 'true';
const sha = payload.meta?.sourceFileSha256;
const validSha = typeof sha === 'string' && /^[a-f0-9]{64}$/i.test(sha);
const downloadedAt = payload.meta?.downloadedAt;
const parsedDownloadedAt = downloadedAt ? Date.parse(downloadedAt) : NaN;
const freshnessCheckedAt = process.env.TSE_FRESHNESS_CHECKED_AT || downloadedAt;
const parsedFreshnessCheckedAt = freshnessCheckedAt ? Date.parse(freshnessCheckedAt) : NaN;
const maxAgeHours = Number(process.env.TSE_MAX_AGE_HOURS || 36);
const ageHours = Number.isFinite(parsedFreshnessCheckedAt)
  ? Math.max(0, (Date.now() - parsedFreshnessCheckedAt) / 3_600_000)
  : Infinity;
const requireFresh = process.env.REQUIRE_TSE_FRESH === 'true';
if (!downloadedAt || !Number.isFinite(parsedDownloadedAt)) errors.push('downloadedAt ausente ou inválido.');
if (!Number.isFinite(parsedFreshnessCheckedAt)) errors.push('marcador de verificação de frescor do TSE ausente ou inválido.');
if (Number.isFinite(ageHours) && ageHours > maxAgeHours) {
  if (requireFresh) errors.push(`Verificação TSE fora da janela de frescor de ${maxAgeHours}h (idade: ${ageHours.toFixed(1)}h).`);
  else warnings.push(`Verificação TSE fora da janela recomendada de ${maxAgeHours}h (idade: ${ageHours.toFixed(1)}h).`);
}

if (state === 'not_synced' || state === 'local_filter_pending') {
  if (sha !== null && !validSha) errors.push('Snapshot não sincronizado deve usar SHA nulo ou SHA-256 válido.');
  if (requireSynced && !allowUpstreamUnavailable) errors.push('Snapshot TSE não sincronizado não pode passar com REQUIRE_TSE_SYNC=true.');
  if (allowUpstreamUnavailable) warnings.push('Origem oficial TSE indisponível; snapshot anterior validado foi preservado.');
} else if (!validSha) {
  errors.push('SHA-256 da fonte ausente ou inválido.');
}

if (!Number.isInteger(payload.meta?.sourceRows) || (requireSynced && payload.meta.sourceRows <= 0)) errors.push('sourceRows inválido.');
if (!Array.isArray(payload.watchlist) || payload.watchlist.length < 1 || payload.watchlist.length > 10) errors.push('watchlist deve conter entre 1 e 10 nomes.');
if (!Array.isArray(payload.matched)) errors.push('matched deve ser array.');
if (payload.meta?.matchedRows !== payload.matched.length) errors.push('matchedRows diverge do tamanho de matched.');

const ids = new Set();
for (const candidate of payload.matched ?? []) {
  if (!candidate.sqCandidate) errors.push('Candidato sem SQ_CANDIDATO.');
  if (ids.has(candidate.sqCandidate)) errors.push('SQ_CANDIDATO duplicado: ' + candidate.sqCandidate);
  ids.add(candidate.sqCandidate);
  if (!candidate.name) errors.push('Candidato sem nome: ' + candidate.sqCandidate);
  if (!candidate.watchlistName) errors.push('Registro TSE sem watchlistName: ' + candidate.sqCandidate);
  if (!candidate.localEvidence) errors.push('Registro TSE sem evidência local: ' + candidate.sqCandidate);
  if (!Array.isArray(candidate.evidenceSourceUrls) || candidate.evidenceSourceUrls.length === 0) {
    errors.push('Registro TSE sem URL de evidência local: ' + candidate.sqCandidate);
  } else if (candidate.evidenceSourceUrls.some(url => typeof url !== 'string' || !/^https:\/\//i.test(url))) {
    errors.push('Registro TSE possui URL de evidência local inválida: ' + candidate.sqCandidate);
  }
}

const normalize = value => String(value ?? '').trim().toLocaleLowerCase('pt-BR');
for (const expected of payload.watchlist ?? []) {
  if (!payload.matched.some(candidate => normalize(candidate.watchlistName) === normalize(expected))) {
    errors.push('Watchlist sem correspondência validada: ' + expected);
  }
}

if (state !== 'not_synced' && state !== 'local_filter_pending') {
  const allowedRetrievalMethods = new Set([
    'official_tse_open_data_csv',
    'official_tse_zip_csv',
    'official_tse_divulgacandcontas_api',
    'official_tse_divulgacandcontas_api_via_reader_proxy',
  ]);
  if (!allowedRetrievalMethods.has(payload.meta?.retrievalMethod)) errors.push('retrievalMethod TSE inválido ou ausente.');
  if (typeof payload.meta?.resourceUrl !== 'string') errors.push('resourceUrl oficial do TSE ausente.');
  if (payload.meta?.retrievalMethod === 'official_tse_zip_csv' && !payload.meta.resourceUrl.includes('tse.jus.br/')) errors.push('resourceUrl do pacote oficial do TSE ausente.');
  if (payload.meta?.captureTransport !== 'official_tse_snapshot_plus_documentary_local_evidence') errors.push('captureTransport deve registrar snapshot TSE + evidência documental local.');
}

if (!payload.meta?.workflowRunId && process.env.CI) warnings.push('workflowRunId não informado; execução manual detectada.');

if (errors.length) {
  console.error(JSON.stringify({ valid: false, errors, warnings }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ valid: true, errors: [], warnings }, null, 2));
