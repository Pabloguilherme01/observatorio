import { createHash } from 'node:crypto';
import { createWriteStream, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createReadStream } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { request } from 'node:https';

const ROOT = new URL('..', import.meta.url).pathname;
const OUTPUT_DIR = join(ROOT, 'src', 'data', 'generated');
const OUTPUT = join(OUTPUT_DIR, 'tse2026-candidates.json');
const DIFF_OUTPUT = join(OUTPUT_DIR, 'tse2026-diff.json');
const HISTORY_DIR = join(OUTPUT_DIR, 'history');
const ZIP_URL = 'https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2026.zip';
const SOURCE_URL = 'https://dadosabertos.tse.jus.br/dataset/candidatos-2026';
const WATCHLIST = ['Keké', 'Anderson Teodoro', 'Zé da Imperial', 'Baiano dos Cocos', 'Cambão', 'Abadyas Damasceno', 'Pábio Mossoró', 'Felipe Galdino', 'Ribeiro do Túlio', 'André do Premium'];

function download(url, destination) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(destination);
    const get = target => request(target, response => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        return get(new URL(response.headers.location, target).href);
      }
      if (response.statusCode !== 200) {
        response.resume();
        return reject(new Error('TSE respondeu HTTP ' + response.statusCode));
      }
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    });
    get(url).on('error', reject);
  });
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function normalize(value = '') {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
}

function parseCsvLineStreaming(filePath, onRow) {
  return new Promise((resolve, reject) => {
    const stream = createReadStream(filePath, { encoding: 'latin1', highWaterMark: 1024 * 1024 });
    let field = '';
    let row = [];
    let inQuotes = false;
    let quotePending = false;
    let rows = 0;

    const emit = () => {
      if (row.length === 1 && row[0] === '') return;
      onRow(row);
      rows += 1;
      row = [];
    };

    const consume = chunk => {
      for (let i = 0; i < chunk.length; i += 1) {
        const ch = chunk[i];
        if (inQuotes) {
          if (quotePending) {
            if (ch === '"') {
              field += '"';
              quotePending = false;
              continue;
            }
            inQuotes = false;
            quotePending = false;
          } else if (ch === '"') {
            quotePending = true;
            continue;
          } else {
            field += ch;
            continue;
          }
        }

        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ';') {
          row.push(field);
          field = '';
        } else if (ch === '\n') {
          row.push(field.replace(/\r$/, ''));
          field = '';
          emit();
        } else {
          field += ch;
        }
      }
    };

    stream.on('data', consume);
    stream.on('end', () => {
      if (quotePending) {
        inQuotes = false;
        quotePending = false;
      }
      if (field.length || row.length) {
        row.push(field);
        emit();
      }
      resolve(rows);
    });
    stream.on('error', reject);
  });
}

function toRecord(row, index) {
  const value = key => row[index[key]] ?? '';
  const sq = value('SQ_CANDIDATO').trim();
  return {
    sqCandidate: sq,
    ballotNumber: value('NR_CANDIDATO') ? Number(value('NR_CANDIDATO')) : null,
    name: value('NM_URNA_CANDIDATO') || value('NM_CANDIDATO') || '',
    fullName: value('NM_CANDIDATO') || null,
    party: value('SG_PARTIDO') || null,
    office: value('DS_CARGO') || null,
    status: value('DS_SIT_TOT_TURNO') || value('DS_SITUACAO_CANDIDATO') || null,
    federation: value('NM_FEDERACAO') || null,
    generationDate: value('DT_GERACAO') || null,
    generationTime: value('HH_GERACAO') || null,
  };
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
    const fields = Object.keys(candidate).filter(field => candidate[field] !== old[field]);
    if (fields.length) records.push({ key: id, type: 'changed', before: old, after: candidate, changedFields: fields });
  }
  for (const [id, candidate] of previous) {
    if (!current.has(id)) records.push({ key: id, type: 'removed', before: candidate });
  }
  return records;
}

function loadPrevious() {
  if (!existsSync(OUTPUT)) return null;
  try {
    const previous = JSON.parse(readFileSync(OUTPUT, 'utf8'));
    if (!previous.meta || !Array.isArray(previous.matched) || previous.meta.state === 'not_synced') return null;
    return previous;
  } catch {
    return null;
  }
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  mkdirSync(HISTORY_DIR, { recursive: true });
  const work = mkdtempSync(join(tmpdir(), 'tse-2026-'));
  const zip = join(work, 'consulta_cand_2026.zip');
  const extracted = join(work, 'csv');
  mkdirSync(extracted);

  try {
    await download(ZIP_URL, zip);
    const sourceFileSha256 = sha256(zip);
    execFileSync('unzip', ['-o', zip, '-d', extracted], { stdio: 'ignore' });
    const csvPath = execFileSync('find', [extracted, '-type', 'f', '-iname', '*GO.csv'], { encoding: 'utf8' }).split(/\r?\n/).find(Boolean);
    if (!csvPath) throw new Error('Arquivo de candidatos de GO não encontrado no pacote TSE.');

    let header;
    let rowsRead = 0;
    const allMatches = [];
    const seen = new Set();

    await parseCsvLineStreaming(csvPath, row => {
      if (!header) {
        header = Object.fromEntries(row.map((name, index) => [name.replace(/^\uFEFF/, '').trim(), index]));
        return;
      }
      rowsRead += 1;
      const candidateName = normalize(row[header.NM_URNA_CANDIDATO] || row[header.NM_CANDIDATO] || '');
      if (!WATCHLIST.some(name => candidateName.includes(normalize(name)))) return;
      const record = toRecord(row, header);
      if (!record.sqCandidate) throw new Error('Registro monitorado sem SQ_CANDIDATO.');
      if (seen.has(record.sqCandidate)) throw new Error('SQ_CANDIDATO duplicado no recorte: ' + record.sqCandidate);
      seen.add(record.sqCandidate);
      allMatches.push(record);
    });

    if (!rowsRead) throw new Error('Snapshot inválido: nenhum registro de candidato foi lido.');

    const previous = loadPrevious();
    const diff = diffRecords(previous?.matched ?? [], allMatches);
    const state = previous ? (diff.length ? 'changed' : 'unchanged') : 'first_capture';
    const now = new Date();
    const snapshotId = 'tse-candidatos-2026-' + now.toISOString().replace(/[:.]/g, '-');
    const payload = {
      schemaVersion: 2,
      meta: {
        snapshotId,
        source: 'TSE — Candidatos 2026',
        sourceUrl: SOURCE_URL,
        scope: 'GO',
        downloadedAt: now.toISOString(),
        sourceFileSha256,
        sourceRows: rowsRead,
        matchedRows: allMatches.length,
        workflowRunId: process.env.GITHUB_RUN_ID || undefined,
        gitCommit: process.env.GITHUB_SHA || undefined,
        schemaVersion: 2,
        state,
      },
      watchlist: WATCHLIST,
      matched: allMatches,
      diff: {
        state,
        added: diff.filter(item => item.type === 'added').length,
        removed: diff.filter(item => item.type === 'removed').length,
        changed: diff.filter(item => item.type === 'changed').length,
        records: diff,
      },
    };

    const json = JSON.stringify(payload, null, 2) + '\n';
    writeFileSync(OUTPUT, json, 'utf8');
    writeFileSync(DIFF_OUTPUT, JSON.stringify(payload.diff, null, 2) + '\n', 'utf8');

    const historyName = snapshotId + '.json';
    writeFileSync(join(HISTORY_DIR, historyName), json, 'utf8');
    console.log(JSON.stringify({
      state,
      snapshotId,
      rowsRead,
      matched: allMatches.length,
      added: payload.diff.added,
      removed: payload.diff.removed,
      changed: payload.diff.changed,
    }));
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
