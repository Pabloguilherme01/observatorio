import { existsSync, readFileSync } from 'node:fs';

const path = new URL('../src/data/generated/tse2026-candidates.json', import.meta.url);
if (!existsSync(path)) throw new Error('Snapshot TSE ausente.');

const payload = JSON.parse(readFileSync(path, 'utf8'));
const errors = [];
const warnings = [];

const isMunicipalitySnapshot = payload.schemaVersion === 3 && payload.coverage === 'municipality_required';
const isStateWatchlistSnapshot = payload.schemaVersion === 3 && payload.coverage === 'state_watchlist';
const state = payload.meta?.state;
if (payload.schemaVersion !== 2 && payload.schemaVersion !== 3) errors.push('schemaVersion deve ser 2 ou 3.');
if (isMunicipalitySnapshot || isStateWatchlistSnapshot) {
  if (payload.meta?.localFilter !== 'Águas Lindas de Goiás') errors.push('localFilter local ausente ou divergente.');
  if (isMunicipalitySnapshot && state !== 'local_filter_pending' && payload.meta?.municipalityCodeTse !== '5200258') errors.push('municipalityCodeTse inválido para Águas Lindas de Goiás.');
  if (state !== 'local_filter_pending' && !new Set(['official_tse_zip_csv', 'official_tse_divulgacandcontas_api', 'official_tse_divulgacandcontas_api_via_reader_proxy']).has(payload.meta?.retrievalMethod)) errors.push('snapshot TSE sincronizado deve usar uma fonte oficial TSE suportada.');
  if (state !== 'local_filter_pending' && payload.meta?.selection !== 'watchlist_only') warnings.push('selection do snapshot não informa explicitamente o recorte monitorado.');
}

if (payload.schemaVersion === 2 && payload.coverage !== 'watchlist') errors.push('coverage deve ser watchlist no contrato estadual antigo.');
if (payload.schemaVersion === 3 && !isMunicipalitySnapshot && !isStateWatchlistSnapshot) errors.push('coverage inválido no contrato TSE.');
if (!payload.meta?.snapshotId) errors.push('snapshotId ausente.');
const requireSynced = process.env.REQUIRE_TSE_SYNC === 'true';
const allowUpstreamUnavailable = process.env.ALLOW_UPSTREAM_UNAVAILABLE === 'true';
const sha = payload.meta?.sourceFileSha256;
const allowedStates = new Set(['not_synced', 'first_capture', 'unchanged', 'changed', 'local_filter_pending', 'synced']);
if (!allowedStates.has(state)) errors.push('state do snapshot inválido: ' + String(state));
const validSha = typeof sha === 'string' && /^[a-f0-9]{64}$/i.test(sha);

if (state === 'not_synced' || state === 'local_filter_pending') {
  if (sha !== null && !validSha) errors.push('Placeholder não sincronizado deve usar SHA nulo ou um SHA-256 válido.');
  if (requireSynced && !isMunicipalitySnapshot) errors.push('Placeholder estadual não pode passar quando REQUIRE_TSE_SYNC=true.');
  if (requireSynced && isMunicipalitySnapshot && state === 'local_filter_pending' && !allowUpstreamUnavailable) errors.push('Snapshot municipal ainda pendente; sincronização oficial municipal é necessária antes da publicação de novos registros de candidatura.');
  if (requireSynced && isStateWatchlistSnapshot && !payload.matched.length && !allowUpstreamUnavailable) errors.push('Snapshot estadual sincronizado sem correspondências da watchlist.');
  if (allowUpstreamUnavailable && state === 'local_filter_pending') warnings.push('Origem oficial TSE indisponível no runner; snapshot anterior foi preservado sem promover novos registros.');
} else if (!validSha) {
  errors.push('SHA-256 da fonte ausente ou inválido.');
}

if (!Number.isInteger(payload.meta?.sourceRows) || (requireSynced && payload.meta.sourceRows <= 0)) errors.push('sourceRows inválido.');
if (!Array.isArray(payload.watchlist)) errors.push('watchlist deve ser array.');
if (!isMunicipalitySnapshot && (payload.watchlist.length < 1 || payload.watchlist.length > 10)) errors.push('watchlist deve conter entre 1 e 10 nomes no recorte editorial TSE.');
if (!Array.isArray(payload.matched)) errors.push('matched deve ser array.');
if (isStateWatchlistSnapshot && payload.meta?.candidateUniverseScope !== 'GO') errors.push('candidateUniverseScope deve ser GO no snapshot estadual.');
if (isStateWatchlistSnapshot && payload.meta?.localFilterType !== 'editorial_watchlist') errors.push('localFilterType deve identificar o recorte editorial.');

const ids = new Set();
for (const candidate of payload.matched ?? []) {
  if (!candidate.sqCandidate) errors.push('Candidato sem SQ_CANDIDATO.');
  if (ids.has(candidate.sqCandidate)) errors.push('SQ_CANDIDATO duplicado: ' + candidate.sqCandidate);
  ids.add(candidate.sqCandidate);
  if (!candidate.name) errors.push('Candidato sem nome: ' + candidate.sqCandidate);
  if (isMunicipalitySnapshot && state !== 'local_filter_pending') {
    if (candidate.municipality !== 'Águas Lindas de Goiás') errors.push('Candidato municipal sem município validado: ' + candidate.sqCandidate);
    if (candidate.municipalityCodeTse !== '5200258') errors.push('Candidato municipal sem código TSE validado: ' + candidate.sqCandidate);
  }
}

if ((state === 'not_synced' || state === 'local_filter_pending') && !requireSynced) {
  warnings.push('Snapshot TSE ainda não sincronizado; qualidade estrutural validada sem promover o placeholder a dado eleitoral.');
}
if (payload.meta?.matchedRows !== payload.matched.length) errors.push('matchedRows diverge do tamanho de matched.');

if (state !== 'not_synced' && state !== 'local_filter_pending' && state !== 'synced') {
  const allowedRetrievalMethods = new Set(['official_tse_open_data_csv', 'official_tse_zip_csv', 'official_tse_divulgacandcontas_api', 'official_tse_divulgacandcontas_api_via_reader_proxy']);
  if (!allowedRetrievalMethods.has(payload.meta?.retrievalMethod)) errors.push('retrievalMethod do snapshot TSE inválido ou ausente.');
  if (typeof payload.meta?.resourceUrl !== 'string') errors.push('resourceUrl oficial do TSE ausente.');
  if ((payload.meta?.retrievalMethod === 'official_tse_open_data_csv' || payload.meta?.retrievalMethod === 'official_tse_zip_csv') && !payload.meta.resourceUrl.includes('tse.jus.br/')) errors.push('resourceUrl do pacote CSV oficial do TSE ausente.');
  if ((payload.meta?.retrievalMethod === 'official_tse_divulgacandcontas_api' || payload.meta?.retrievalMethod === 'official_tse_divulgacandcontas_api_via_reader_proxy') && !payload.meta.resourceUrl.includes('divulgacandcontas.tse.jus.br/divulga/rest/')) errors.push('resourceUrl da API oficial DivulgaCandContas ausente.');
  if (payload.meta?.captureTransport && !new Set(['historical_third_party_reader', 'direct_official', 'reader_proxy']).has(payload.meta.captureTransport)) {
    errors.push('captureTransport do snapshot TSE inválido.');
  }
  if (payload.meta?.captureTransport === 'historical_third_party_reader') warnings.push('Snapshot registra transporte histórico intermediado; esse transporte não participa da produção atual.');
  if (payload.meta?.captureTransport === 'reader_proxy') warnings.push('Snapshot foi obtido do endpoint oficial TSE por transporte intermediado devido a bloqueio HTTP do runner; o endpoint de origem permanece oficial e o transporte está explicitamente registrado.');
  if (isStateWatchlistSnapshot || !isMunicipalitySnapshot) {
    for (const expected of payload.watchlist ?? []) {
      if (!payload.matched.some(candidate => candidate.watchlistName === expected)) errors.push('Watchlist sem correspondência TSE: ' + expected);
    }
    for (const candidate of payload.matched ?? []) {
      if (!candidate.watchlistName) errors.push('Registro TSE sem watchlistName: ' + candidate.sqCandidate);
    }
  }
}
if (!payload.meta?.workflowRunId && process.env.CI) warnings.push('workflowRunId não informado; execução manual detectada.');

if (errors.length) {
  console.error(JSON.stringify({ valid: false, errors, warnings }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ valid: true, errors: [], warnings }, null, 2));
