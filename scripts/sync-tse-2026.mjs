import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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

const SOURCE_URL = 'https://dadosabertos.tse.jus.br/dataset/candidatos-2026';
const PHOTO_ARCHIVE_URL = 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2026/fotos/foto_cand2026_GO_div.zip';

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
    if (lastError) throw lastError;

    execFileSync('unzip', ['-o', zip, '-d', extracted], { stdio: 'ignore' });
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
