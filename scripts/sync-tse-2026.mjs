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
const MUNICIPALITY_CODE = '5200258';
const MUNICIPALITY_NAME = 'Águas Lindas de Goiás';
const MUNICIPALITY_NORMALIZED = normalize(MUNICIPALITY_NAME);


function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('pt-BR');
}

function headerMap(headerRow) {
  return Object.fromEntries(
    headerRow.map((name, index) => [String(name).replace(/^\\uFEFF/, '').trim(), index]),
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

    if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\\r') {
      field += char;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    if (row.some(value => value.length)) rows.push(row);
  }

  return rows;
}

function municipalityMatch(row, header) {
  const code = valueOf(row, header, ['CD_MUNICIPIO', 'CD_MUNICIPIO_TSE', 'NR_MUNICIPIO']);
  const name = valueOf(row, header, ['NM_MUNICIPIO']);
  return code === MUNICIPALITY_CODE || normalize(name) === MUNICIPALITY_NORMALIZED;
}

function toRecord(row, header, previousRecord) {
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
    municipality: MUNICIPALITY_NAME,
    municipalityCodeTse: MUNICIPALITY_CODE,
    photoUrl: previousRecord?.photoUrl ?? null,
    instagramUrl: previousRecord?.instagramUrl ?? null,
    sourceResource: selectedSourceUrl,
  };
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function download(url, destination) {
  try {
    execFileSync('curl', [
      '--fail',
      '--location',
      '--http1.1',
      '--retry', '2',
      '--retry-delay', '2',
      '--retry-all-errors',
      '--connect-timeout', '20',
      '--max-time', '120',
      '--user-agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/153 Safari/537.36',
      '--header', 'Accept: application/zip, application/octet-stream;q=0.9, */*;q=0.8',
      '--header', 'Accept-Language: pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      '--referer', 'https://dadosabertos.tse.jus.br/dataset/candidatos-2026',
      '--header', 'Sec-Fetch-Dest: document',
      '--header', 'Sec-Fetch-Mode: navigate',
      '--header', 'Sec-Fetch-Site: same-site',
      '--output', destination,
      url,
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
      payload?.schemaVersion !== 3
      || !['municipality_required', 'state_watchlist'].includes(payload?.coverage)
      || !Array.isArray(payload?.matched)
      || !['first_capture', 'synced', 'unchanged', 'changed', 'local_filter_pending'].includes(payload?.meta?.state)
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
    if (!old) {
      records.push({ key: id, type: 'added', after: candidate });
      continue;
    }
    const changedFields = Object.keys(candidate).filter(field => candidate[field] !== old[field]);
    if (changedFields.length) {
      records.push({ key: id, type: 'changed', before: old, after: candidate, changedFields });
    }
  }

  for (const [id, candidate] of previous) {
    if (!current.has(id)) records.push({ key: id, type: 'removed', before: candidate });
  }

  return records;
}

let selectedSourceUrl = ZIP_URLS[0];

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  mkdirSync(HISTORY_DIR, { recursive: true });

  const work = mkdtempSync(join(tmpdir(), 'tse-2026-municipal-'));
  const zip = join(work, 'consulta_cand_2026.zip');
  const extracted = join(work, 'csv');
  mkdirSync(extracted, { recursive: true });

  try {
    const previous = loadPrevious();
    const previousBySq = new Map((previous?.matched ?? []).map(candidate => [candidate.sqCandidate, candidate]));
    let sourceRows = 0;
    let municipalityRows = 0;

    // Para o recorte completo do município, usamos exclusivamente o CSV oficial do TSE.
    // O endpoint estadual do DivulgaCandContas não contém município no registro retornado.
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

    const csvPath = execFileSync(
      'find',
      [extracted, '-type', 'f', '-iname', '*GO.csv'],
      { encoding: 'utf8' },
    ).split(/\r?\n/).find(Boolean);

    if (!csvPath) throw new Error('Arquivo estadual de candidatos de GO não encontrado no pacote oficial.');

    const rows = parseCsv(readFileSync(csvPath, 'utf8'));
    if (rows.length < 2) throw new Error('Arquivo CSV de candidatos de GO está vazio ou inválido.');

    const header = headerMap(rows[0]);
    const requiredColumns = ['SQ_CANDIDATO', 'NM_URNA_CANDIDATO', 'NM_CANDIDATO'];
    const missingColumns = requiredColumns.filter(key => header[key] === undefined);
    if (missingColumns.length) {
      throw new Error('Colunas essenciais ausentes no CSV TSE: ' + missingColumns.join(', '));
    }

    const matched = [];
    const seen = new Set();

    for (const row of rows.slice(1)) {
      if (!row.length || row.every(value => !String(value).trim())) continue;
      sourceRows += 1;
      if (!municipalityMatch(row, header)) continue;
      municipalityRows += 1;

      const record = toRecord(row, header, previousBySq.get(valueOf(row, header, ['SQ_CANDIDATO'])));
      if (!record.sqCandidate) throw new Error('Registro municipal sem SQ_CANDIDATO.');
      if (seen.has(record.sqCandidate)) throw new Error('SQ_CANDIDATO duplicado no recorte municipal: ' + record.sqCandidate);

      matched.push(record);
      seen.add(record.sqCandidate);
    }

    if (municipalityRows <= 0) throw new Error('Nenhum registro municipal encontrado no CSV oficial do TSE para Águas Lindas de Goiás.');
    if (matched.length <= 0) throw new Error('Nenhuma candidatura foi validada no recorte municipal oficial do TSE.');

    const diff = diffRecords(previous?.matched ?? [], matched);
    const state = previous ? (diff.length ? 'changed' : 'unchanged') : 'first_capture';
    if (state === 'unchanged') {
      console.log(JSON.stringify({
        valid: true,
        state,
        sourceRows,
        municipalityRows,
        matched: matched.length,
        retrievalMethod: 'official_tse_zip_csv',
        changed: false,
      }, null, 2));
      return;
    }

    const now = new Date();
    const snapshotId = 'tse-candidatos-2026-local-' + now.toISOString().replace(/[:.]/g, '-');

    const payload = {
      schemaVersion: 3,
      meta: {
        snapshotId,
        source: 'TSE — Candidatos 2026',
        sourceUrl: SOURCE_URL,
        scope: 'GO',
        localFilter: MUNICIPALITY_NAME,
        municipalityCodeTse: MUNICIPALITY_CODE,
        downloadedAt: now.toISOString(),
        sourceFileSha256: sha256(zip),
        sourceHashKind: 'source_zip',
        sourceRows,
        municipalityRows,
        originalMatchedRows: matched.length,
        matchedRows: matched.length,
        workflowRunId: process.env.GITHUB_RUN_ID || undefined,
        gitCommit: process.env.GITHUB_SHA || undefined,
        state,
        retrievalMethod: 'official_tse_zip_csv',
        resourceUrl: selectedSourceUrl,
        selection: 'all_municipality',
        filterNote: 'Recorte municipal completo pelo código TSE do município. O snapshot publica todas as candidaturas encontradas no arquivo oficial para Águas Lindas de Goiás, sem watchlist editorial.',
      },
      coverage: 'municipality_required',
      watchlist: [],
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

    console.log(JSON.stringify({
      valid: true,
      state,
      snapshotId,
      sourceRows,
      municipalityRows,
      matched: matched.length,
      retrievalMethod: 'official_tse_zip_csv',
    }, null, 2));
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

main().catch(error => {
  const previous = loadPrevious();
  if (previous?.meta?.snapshotId && Array.isArray(previous?.matched)) {
    console.warn(JSON.stringify({
      valid: true,
      state: 'upstream_unavailable',
      message: 'A origem oficial do TSE está temporariamente indisponível para o runner. O último snapshot validado foi preservado e não será sobrescrito.',
      snapshotId: previous.meta.snapshotId,
      sourceUrl: previous.meta.sourceUrl,
      lastState: previous.meta.state,
      matched: previous.matched.length,
      error: error instanceof Error ? error.message : String(error),
    }, null, 2));
    process.exitCode = 0;
    return;
  }
  console.error(error);
  process.exitCode = 1;
});
