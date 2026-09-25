// Mantém este arquivo como gatilho operacional da captura oficial em recuperações de frescor.
import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const OUTPUT_DIR = join(ROOT, 'src', 'data', 'generated');
const OUTPUT = join(OUTPUT_DIR, 'tse2026-candidates.json');
const DIFF_OUTPUT = join(OUTPUT_DIR, 'tse2026-diff.json');
const HISTORY_DIR = join(OUTPUT_DIR, 'history');

const ZIP_URLS = [
  'https://dadosabertos.tse.jus.br/dataset/candidatos-2026/resource/7748de82-a23b-47c4-9ec1-35535d945e5b/download/consulta_cand_2026.zip',
  'https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2026.zip',
];
const API_URL = 'https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura/listar/2026/GO/20322002026/7/candidatos';

const SOURCE_URL = 'https://dadosabertos.tse.jus.br/dataset/candidatos-2026';
const PHOTO_ARCHIVE_URL = 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2026/fotos/foto_cand2026_GO_div.zip';
const MAX_ZIP_BYTES = 150 * 1024 * 1024;
const MAX_ARCHIVE_ENTRIES = 200;
const MAX_ARCHIVE_FILE_BYTES = 250 * 1024 * 1024;
const MAX_ARCHIVE_UNCOMPRESSED_BYTES = 1 * 1024 * 1024 * 1024;

function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('pt-BR');
}

function headerMap(headerRow) {
  return Object.fromEntries(
    headerRow.map((name, index) => [String(name).replace(/^\uFEFF/, '').trim(), index]),
  );
}

function valueOf(row, header, keys) {
  for (const key of keys) {
    const index = header[key];
    if (index === undefined) continue;
    const value = String(row[index] ?? '').trim();
    if (value) return value;
  }
  return '';
}

function parseCsv(content) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const next = content[i + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') quoted = true;
    else if (char === ',') { row.push(field); field = ''; }
    else if (char === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (char !== '\r') field += char;
  }

  if (field.length || row.length) {
    row.push(field);
    if (row.some(value => value.length)) rows.push(row);
  }
  return rows;
}

function toTseRecord(row, header, previousRecord) {
  const sqCandidate = valueOf(row, header, ['SQ_CANDIDATO']);
  const ballotValue = valueOf(row, header, ['NR_CANDIDATO', 'NR_CANDIDATURA']);
  const name = valueOf(row, header, ['NM_URNA_CANDIDATO', 'NM_URNA']) || valueOf(row, header, ['NM_CANDIDATO']);

  return {
    sqCandidate,
    ballotNumber: ballotValue ? Number(ballotValue) : null,
    name,
    fullName: valueOf(row, header, ['NM_CANDIDATO']) || null,
    party: valueOf(row, header, ['SG_PARTIDO']) || null,
    office: valueOf(row, header, ['DS_CARGO', 'NM_CARGO']) || null,
    status: valueOf(row, header, ['DS_SITUACAO_CANDIDATURA', 'DS_SITUACAO']) || null,
    federation: valueOf(row, header, ['NM_FEDERACAO', 'SG_FEDERACAO']) || null,
    generationDate: valueOf(row, header, ['DT_GERACAO']) || null,
    generationTime: valueOf(row, header, ['HH_GERACAO']) || null,
    candidateIdKind: 'tse_csv_sq_candidate',
    municipality: null,
    municipalityCodeTse: null,
    photoUrl: previousRecord?.photoUrl ?? null,
    instagramUrl: previousRecord?.instagramUrl ?? null,
    photoAvailableInTseArchive: previousRecord?.photoAvailableInTseArchive ?? false,
    photoArchiveUrl: previousRecord?.photoArchiveUrl ?? PHOTO_ARCHIVE_URL,
    watchlistName: previousRecord?.watchlistName ?? null,
    localEvidence: previousRecord?.localEvidence ?? null,
    evidenceSourceUrls: previousRecord?.evidenceSourceUrls ?? [],
    sourceResource: selectedSourceUrl,
  };
}

function validateZipArchive(zipPath) {
  const compressedBytes = readFileSync(zipPath).length;
  if (compressedBytes > MAX_ZIP_BYTES) {
    throw new Error('Pacote TSE excede o limite de tamanho compactado permitido.');
  }

  execFileSync('unzip', ['-t', zipPath], { stdio: 'ignore' });

  const names = execFileSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' })
    .split(/\r?\n/)
    .map(name => name.trim())
    .filter(Boolean);

  if (names.length === 0 || names.length > MAX_ARCHIVE_ENTRIES) {
    throw new Error('Pacote TSE possui quantidade de entradas fora do limite esperado.');
  }

  const invalidNames = names.filter(name => {
    const normalized = name.replaceAll('\\', '/');
    const segments = normalized.split('/');
    const extensionAllowed = normalized.endsWith('/') || /\.(csv|txt)$/i.test(normalized);
    return normalized.startsWith('/')
      || normalized.includes('\\0')
      || segments.includes('..')
      || !extensionAllowed;
  });
  if (invalidNames.length) {
    throw new Error('Pacote TSE contém caminhos/arquivos fora da política de ingestão: ' + invalidNames.slice(0, 5).join(', '));
  }

  const listing = execFileSync('unzip', ['-l', zipPath], { encoding: 'utf8' });
  let totalUncompressed = 0;
  let largestFile = 0;
  for (const line of listing.split(/\r?\n/)) {
    const match = line.match(/^\s*(\d+)\s+\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}\s+(.+)$/);
    if (!match) continue;
    const size = Number(match[1]);
    largestFile = Math.max(largestFile, size);
    totalUncompressed += size;
    if (largestFile > MAX_ARCHIVE_FILE_BYTES || totalUncompressed > MAX_ARCHIVE_UNCOMPRESSED_BYTES) {
      throw new Error('Pacote TSE excede o limite de expansão permitido.');
    }
  }

  if (!names.some(name => /[^/]+_GO\.csv$/i.test(name))) {
    throw new Error('Pacote TSE não contém o CSV estadual de Goiás esperado.');
  }
}

function sha256(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function markWorkflowStatus(status) {
  const envFile = process.env.GITHUB_ENV;
  if (!envFile) return;
  appendFileSync(envFile, `TSE_UPSTREAM_STATUS=${status}\n`, 'utf8');
}

function download(url, destination) {
  try {
    execFileSync('curl', [
      '--fail', '--location', '--http1.1', '--retry', '2', '--retry-delay', '2',
      '--retry-all-errors', '--connect-timeout', '20', '--max-time', '120',
      '--user-agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/153 Safari/537.36',
      '--header', 'Accept: application/zip, application/octet-stream;q=0.9, */*;q=0.8',
      '--header', 'Accept-Language: pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      '--referer', 'https://dadosabertos.tse.jus.br/dataset/candidatos-2026',
      '--header', 'Sec-Fetch-Dest: document', '--header', 'Sec-Fetch-Mode: navigate',
      '--header', 'Sec-Fetch-Site: same-site', '--output', destination, url,
    ], { stdio: 'inherit' });
  } catch (error) {
    rmSync(destination, { force: true });
    throw new Error('Falha ao baixar o pacote TSE: ' + (error instanceof Error ? error.message : String(error)));
  }
}

function downloadText(url, destination, attempt = 1) {
  try {
    execFileSync('curl', [
      '--fail', '--location', '--http1.1', '--retry', '2', '--retry-delay', '2',
      '--retry-all-errors', '--connect-timeout', '30', '--max-time', '120',
      '--user-agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/153 Safari/537.36',
      '--header', 'Accept: application/json, text/plain, */*',
      '--header', 'Referer: https://divulgacandcontas.tse.jus.br/divulga/',
      '--output', destination, url,
    ], { stdio: 'inherit' });
    return readFileSync(destination, 'utf8');
  } catch (error) {
    rmSync(destination, { force: true });
    if (attempt >= 2) throw new Error('Falha ao consultar API oficial do DivulgaCandContas: ' + (error instanceof Error ? error.message : String(error)));
    return new Promise(resolve => setTimeout(resolve, 2000 * attempt)).then(() => downloadText(url, destination, attempt + 1));
  }
}

function parseJsonPayload(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    const objectStart = raw.indexOf('{');
    const objectEnd = raw.lastIndexOf('}');
    if (objectStart >= 0 && objectEnd > objectStart) return JSON.parse(raw.slice(objectStart, objectEnd + 1));
    const arrayStart = raw.indexOf('[');
    const arrayEnd = raw.lastIndexOf(']');
    if (arrayStart >= 0 && arrayEnd > arrayStart) return JSON.parse(raw.slice(arrayStart, arrayEnd + 1));
    throw new Error('Resposta oficial não contém JSON reconhecível.');
  }
}

function findCandidateArray(value, depth = 0) {
  if (!value || depth > 5) return null;
  if (Array.isArray(value)) {
    if (value.some(item => item && typeof item === 'object' && (
      'nomeUrna' in item || 'nomeCompleto' in item || 'NM_URNA_CANDIDATO' in item || 'nomeCandidato' in item
    ))) return value;
    for (const item of value) {
      const nested = findCandidateArray(item, depth + 1);
      if (nested) return nested;
    }
    return null;
  }
  if (typeof value === 'object') {
    for (const child of Object.values(value)) {
      const nested = findCandidateArray(child, depth + 1);
      if (nested) return nested;
    }
  }
  return null;
}

function firstString(value, keys, depth = 0) {
  if (!value || depth > 5 || typeof value !== 'object') return null;
  for (const key of keys) {
    const candidate = value[key];
    if (typeof candidate === 'string' && candidate.trim()) return candidate;
  }
  for (const child of Object.values(value)) {
    const nested = firstString(child, keys, depth + 1);
    if (nested) return nested;
  }
  return null;
}

function firstScalar(value, keys, depth = 0) {
  if (!value || depth > 5 || typeof value !== 'object') return null;
  for (const key of keys) {
    const candidate = value[key];
    if ((typeof candidate === 'string' || typeof candidate === 'number') && String(candidate).trim()) return candidate;
  }
  for (const child of Object.values(value)) {
    const nested = firstScalar(child, keys, depth + 1);
    if (nested !== null) return nested;
  }
  return null;
}

function tokenPhraseIncluded(candidateName, expectedName) {
  const candidateTokens = normalize(candidateName).split(' ').filter(Boolean);
  const expectedTokens = normalize(expectedName).split(' ').filter(Boolean);
  return expectedTokens.length > 0 && expectedTokens.every(token => candidateTokens.includes(token));
}

function buildApiRecord(item, expectedName, previousRecord) {
  const apiName = firstString(item, ['nomeUrna', 'nome_urna', 'NM_URNA_CANDIDATO', 'nomeCandidato', 'nomeCompleto', 'NM_CANDIDATO', 'nome']);
  const sq = firstScalar(item, ['id', 'sqCandidato', 'sqCandidate', 'SQ_CANDIDATO', 'idCandidato', 'codigoCandidato']);
  const ballot = firstScalar(item, ['numero', 'nrCandidato', 'NR_CANDIDATO']);

  return {
    sqCandidate: sq == null ? previousRecord?.sqCandidate ?? ('api-surrogate-' + createHash('sha256').update(JSON.stringify(item)).digest('hex').slice(0, 16)) : String(sq),
    ballotNumber: ballot == null ? previousRecord?.ballotNumber ?? null : Number(ballot),
    name: apiName || previousRecord?.name || expectedName,
    fullName: firstString(item, ['nomeCompleto', 'NM_CANDIDATO']) || previousRecord?.fullName || null,
    party: firstString(item, ['sgPartido', 'siglaPartido', 'partidoSigla', 'sigla']) || previousRecord?.party || null,
    office: firstString(item, ['descricaoCargo', 'nomeCargo', 'cargo']) || previousRecord?.office || null,
    status: firstString(item, ['descricaoSituacao', 'descricaoSituacaoCandidato', 'situacao', 'status']) || previousRecord?.status || null,
    federation: firstString(item, ['nomeFederacao', 'nmFederacao', 'federacao']) || previousRecord?.federation || null,
    generationDate: firstString(item, ['dtGeracao', 'dataGeracao']) || previousRecord?.generationDate || null,
    generationTime: firstString(item, ['hhGeracao']) || previousRecord?.generationTime || null,
    candidateIdKind: sq == null ? (previousRecord?.candidateIdKind ?? 'tse_api_surrogate') : 'tse_api_id',
    municipality: previousRecord?.municipality ?? null,
    municipalityCodeTse: previousRecord?.municipalityCodeTse ?? null,
    photoUrl: previousRecord?.photoUrl ?? null,
    instagramUrl: previousRecord?.instagramUrl ?? null,
    photoAvailableInTseArchive: previousRecord?.photoAvailableInTseArchive ?? false,
    photoArchiveUrl: previousRecord?.photoArchiveUrl ?? null,
    watchlistName: previousRecord?.watchlistName ?? expectedName,
    localEvidence: previousRecord?.localEvidence ?? null,
    evidenceSourceUrls: previousRecord?.evidenceSourceUrls ?? [],
    sourceResource: API_URL,
  };
}

async function updateFromApiFallback(previous, watchlist, work) {
  const apiJson = join(work, 'tse-candidatos-api.json');
  const rawApi = downloadText(API_URL, apiJson);
  const parsedApi = parseJsonPayload(rawApi);
  const records = findCandidateArray(parsedApi);
  if (!records?.length) throw new Error('API oficial respondeu sem uma lista reconhecível de candidaturas.');

  const normalizedPrevious = new Map(previous.matched.map(candidate => [normalize(candidate.name), candidate]));
  const matched = [];
  const missingWatchlist = [];

  for (const expectedName of watchlist) {
    const previousRecord = previous.matched.find(candidate =>
      normalize(candidate.watchlistName ?? candidate.name) === normalize(expectedName),
    );
    const candidate = records.find(item => {
      const apiName = firstString(item, ['nomeUrna', 'nome_urna', 'NM_URNA_CANDIDATO', 'nomeCandidato', 'nomeCompleto', 'NM_CANDIDATO', 'nome']);
      return tokenPhraseIncluded(apiName ?? '', expectedName)
        || (previousRecord && tokenPhraseIncluded(apiName ?? '', previousRecord.name));
    });

    if (!candidate) {
      missingWatchlist.push(expectedName);
      continue;
    }

    const record = buildApiRecord(candidate, expectedName, previousRecord);
    if (!record.sqCandidate) {
      missingWatchlist.push(expectedName);
      continue;
    }
    matched.push(record);
  }

  if (missingWatchlist.length) {
    throw new Error('API oficial não encontrou toda a watchlist validada: ' + missingWatchlist.join(', '));
  }
  if (matched.length !== watchlist.length) {
    throw new Error('API oficial retornou recorte incompleto: esperado ' + watchlist.length + ' e recebido ' + matched.length + '.');
  }

  const diff = diffRecords(previous.matched, matched);
  const now = new Date();
  const snapshotId = 'tse-candidatos-2026-local-mapeado-' + now.toISOString().slice(0, 10);
  const payload = {
    schemaVersion: 3,
    meta: {
      ...previous.meta,
      snapshotId,
      downloadedAt: now.toISOString(),
      sourceFileSha256: createHash('sha256').update(rawApi, 'utf8').digest('hex'),
      sourceHashKind: 'api_response_utf8',
      workflowRunId: process.env.GITHUB_RUN_ID || previous.meta?.workflowRunId || undefined,
      gitCommit: process.env.GITHUB_SHA || previous.meta?.gitCommit || undefined,
      state: diff.length ? 'changed' : 'unchanged',
      retrievalMethod: 'official_tse_divulgacandcontas_api',
      resourceUrl: API_URL,
      captureTransport: 'official_tse_snapshot_plus_documentary_local_evidence',
    },
    coverage: 'state_watchlist',
    watchlist,
    matched,
    diff: {
      state: diff.length ? 'changed' : 'unchanged',
      added: diff.filter(item => item.type === 'added').length,
      removed: diff.filter(item => item.type === 'removed').length,
      changed: diff.filter(item => item.type === 'changed').length,
      records: diff,
    },
  };

  writeFileSync(OUTPUT, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  writeFileSync(DIFF_OUTPUT, JSON.stringify(payload.diff, null, 2) + '\n', 'utf8');
  writeFileSync(join(HISTORY_DIR, snapshotId + '.json'), JSON.stringify(payload, null, 2) + '\n', 'utf8');
  markWorkflowStatus('ok');
  console.log(JSON.stringify({
    valid: true,
    state: payload.meta.state,
    snapshotId,
    sourceRows: records.length,
    matched: matched.length,
    watchlist: watchlist.length,
    retrievalMethod: 'official_tse_divulgacandcontas_api',
  }, null, 2));
}

function loadPrevious() {
  if (!existsSync(OUTPUT)) return null;
  try {
    const payload = JSON.parse(readFileSync(OUTPUT, 'utf8'));
    if (
      payload?.schemaVersion !== 3 ||
      payload?.coverage !== 'state_watchlist' ||
      !Array.isArray(payload?.watchlist) ||
      payload.watchlist.length < 1 ||
      !Array.isArray(payload?.matched) ||
      payload?.meta?.candidateUniverseScope !== 'GO' ||
      payload?.meta?.localFilterType !== 'local_evidence'
    ) return null;
    return payload;
  } catch {
    return null;
  }
}

function diffRecords(before, after) {
  const key = candidate => candidate.sqCandidate || String(candidate.ballotNumber ?? candidate.name);
  const previous = new Map(before.map(candidate => [key(candidate), candidate]));
  const current = new Map(after.map(candidate => [key(candidate), candidate]));
  const records = [];

  for (const [id, candidate] of current) {
    const old = previous.get(id);
    if (!old) records.push({ key: id, type: 'added', after: candidate });
    else {
      const changedFields = Object.keys(candidate).filter(field => JSON.stringify(candidate[field]) !== JSON.stringify(old[field]));
      if (changedFields.length) records.push({ key: id, type: 'changed', before: old, after: candidate, changedFields });
    }
  }
  for (const [id, candidate] of previous) {
    if (!current.has(id)) records.push({ key: id, type: 'removed', before: candidate });
  }
  return records;
}

let selectedSourceUrl = ZIP_URLS[0];

async function main() {
  markWorkflowStatus('starting');
  mkdirSync(OUTPUT_DIR, { recursive: true });
  mkdirSync(HISTORY_DIR, { recursive: true });

  const previous = loadPrevious();
  if (!previous) throw new Error('Snapshot state_watchlist/local_evidence válido é necessário para atualizar o cadastro sem alterar o modelo editorial.');

  const watchlist = previous.watchlist;
  const previousBySq = new Map(previous.matched.map(candidate => [candidate.sqCandidate, candidate]));
  const previousByName = new Map(previous.matched.map(candidate => [normalize(candidate.name), candidate]));

  const work = mkdtempSync(join(tmpdir(), 'tse-2026-watchlist-'));
  const zip = join(work, 'consulta_cand_2026.zip');
  const extracted = join(work, 'csv');
  mkdirSync(extracted, { recursive: true });

  try {
    let lastError = null;
    for (const candidateUrl of ZIP_URLS) {
      try {
        selectedSourceUrl = candidateUrl;
        download(candidateUrl, zip);
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
        console.warn('[TSE] fonte indisponível: ' + candidateUrl);
      }
    }
    if (lastError) {
      console.warn('[TSE] Pacotes oficiais indisponíveis; tentando API oficial do DivulgaCandContas.');
      try {
        await updateFromApiFallback(previous, watchlist, work);
        return;
      } catch (apiError) {
        throw new AggregateError([lastError, apiError], 'Pacotes oficiais e API oficial do TSE indisponíveis.');
      }
    }

    validateZipArchive(zip);
    execFileSync('unzip', ['-qq', '-n', zip, '-d', extracted], { stdio: 'ignore' });
    const csvPath = execFileSync('find', [extracted, '-type', 'f', '-iname', '*GO.csv'], { encoding: 'utf8' }).split(/\r?\n/).find(Boolean);
    if (!csvPath) throw new Error('Arquivo estadual de candidatos de GO não encontrado no pacote oficial.');

    const rows = parseCsv(readFileSync(csvPath, 'utf8'));
    if (rows.length < 2) throw new Error('Arquivo CSV de candidatos de GO está vazio ou inválido.');

    const header = headerMap(rows[0]);
    for (const key of ['SQ_CANDIDATO', 'NM_URNA_CANDIDATO', 'NM_CANDIDATO']) {
      if (header[key] === undefined) throw new Error('Coluna essencial ausente no CSV TSE: ' + key);
    }

    const sourceRows = rows.length - 1;
    const currentBySq = new Map();

    for (const row of rows.slice(1)) {
      if (!row.length || row.every(value => !String(value).trim())) continue;
      const sqCandidate = valueOf(row, header, ['SQ_CANDIDATO']);
      const name = valueOf(row, header, ['NM_URNA_CANDIDATO', 'NM_URNA']) || valueOf(row, header, ['NM_CANDIDATO']);
      if (!sqCandidate || !name) continue;

      const previousRecord = previousBySq.get(sqCandidate) ?? previousByName.get(normalize(name));
      if (!previousRecord) continue;

      const record = toTseRecord(row, header, previousRecord);
      currentBySq.set(record.sqCandidate, record);
    }

    const matched = [];
    const missingWatchlist = [];
    for (const expectedName of watchlist) {
      const previousRecord = previous.matched.find(candidate =>
        normalize(candidate.watchlistName ?? candidate.name) === normalize(expectedName),
      );
      const current = previousRecord
        ? currentBySq.get(previousRecord.sqCandidate) ?? currentBySq.get(
          [...currentBySq.values()].find(candidate => normalize(candidate.name) === normalize(previousRecord.name))?.sqCandidate,
        )
        : null;

      if (current) {
        matched.push({
          ...current,
          watchlistName: previousRecord.watchlistName ?? expectedName,
          localEvidence: previousRecord.localEvidence ?? null,
          evidenceSourceUrls: previousRecord.evidenceSourceUrls ?? [],
        });
      } else {
        missingWatchlist.push(expectedName);
      }
    }

    if (missingWatchlist.length) {
      throw new Error('A atualização TSE não encontrou todos os registros da watchlist validada: ' + missingWatchlist.join(', '));
    }

    const diff = diffRecords(previous.matched, matched);
    const sourceFileSha256 = sha256(zip);
    const sourceChanged = previous.meta?.sourceFileSha256 !== sourceFileSha256
      || previous.meta?.sourceRows !== sourceRows
      || previous.meta?.resourceUrl !== selectedSourceUrl;

    if (!diff.length && !sourceChanged) {
      markWorkflowStatus('ok');
      console.log(JSON.stringify({
        valid: true,
        state: 'unchanged',
        sourceRows,
        matched: matched.length,
        watchlist: watchlist.length,
        retrievalMethod: 'official_tse_zip_csv',
        changed: false,
        sourceChanged: false,
      }, null, 2));
      return;
    }

    const now = new Date();
    const snapshotId = 'tse-candidatos-2026-local-mapeado-' + now.toISOString().slice(0, 10);
    const state = diff.length ? 'changed' : 'unchanged';

    const payload = {
      schemaVersion: 3,
      meta: {
        snapshotId,
        source: 'TSE — Candidatos 2026',
        sourceUrl: SOURCE_URL,
        scope: 'GO',
        localFilter: 'Águas Lindas de Goiás',
        downloadedAt: now.toISOString(),
        sourceFileSha256,
        sourceHashKind: 'source_zip',
        sourceRows,
        originalMatchedRows: matched.length,
        matchedRows: matched.length,
        workflowRunId: process.env.GITHUB_RUN_ID || undefined,
        gitCommit: process.env.GITHUB_SHA || undefined,
        state,
        retrievalMethod: 'official_tse_zip_csv',
        resourceUrl: selectedSourceUrl,
        captureTransport: 'official_tse_snapshot_plus_documentary_local_evidence',
        selection: 'local_evidence_watchlist',
        candidateUniverseScope: 'GO',
        localFilterType: 'local_evidence',
        filterNote: 'Recorte acompanhado de candidaturas estaduais do TSE com evidência documental de vínculo local. O vínculo local é mantido da base editorial validada e não é inferido do cadastro estadual.',
        photoArchive: previous.meta?.photoArchive ?? { resourceUrl: PHOTO_ARCHIVE_URL, sourceUrl: PHOTO_ARCHIVE_URL, verifiedCandidateIds: [] },
      },
      coverage: 'state_watchlist',
      watchlist,
      matched,
      diff: {
        state,
        added: diff.filter(item => item.type === 'added').length,
        removed: diff.filter(item => item.type === 'removed').length,
        changed: diff.filter(item => item.type === 'changed').length,
        records: diff,
      },
    };

    writeFileSync(OUTPUT, JSON.stringify(payload, null, 2) + '\n', 'utf8');
    writeFileSync(DIFF_OUTPUT, JSON.stringify(payload.diff, null, 2) + '\n', 'utf8');
    writeFileSync(join(HISTORY_DIR, snapshotId + '.json'), JSON.stringify(payload, null, 2) + '\n', 'utf8');

    markWorkflowStatus('ok');
    console.log(JSON.stringify({
      valid: true,
      state,
      snapshotId,
      sourceRows,
      matched: matched.length,
      watchlist: watchlist.length,
      retrievalMethod: 'official_tse_zip_csv',
    }, null, 2));
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

main().catch(error => {
  const previous = loadPrevious();
  if (previous?.meta?.snapshotId && Array.isArray(previous?.matched)) {
    markWorkflowStatus('unavailable');
    const upstreamMessage = JSON.stringify({
    valid: false,
    state: 'upstream_unavailable',
    message: 'A origem oficial do TSE está temporariamente indisponível. O último snapshot validado foi preservado e não será sobrescrito.',
    snapshotId: previous?.meta?.snapshotId ?? null,
    sourceUrl: previous?.meta?.sourceUrl ?? SOURCE_URL,
    lastState: previous?.meta?.state ?? null,
    matched: previous?.matched?.length ?? 0,
    watchlist: previous?.watchlist?.length ?? 0,
    error: error instanceof Error ? error.message : String(error),
  }, null, 2);

  if (process.env.REQUIRE_TSE_FRESH === 'true') {
    console.error(upstreamMessage);
    process.exitCode = 1;
    return;
  }

  console.warn(upstreamMessage);
  process.exitCode = 0;
  return;
  }
  markWorkflowStatus('failed');
  console.error(error);
  process.exitCode = 1;
});
