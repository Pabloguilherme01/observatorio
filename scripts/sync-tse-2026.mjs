import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { request } from 'node:https';

const ROOT = new URL('..', import.meta.url).pathname;
const OUTPUT_DIR = join(ROOT, 'src', 'data', 'generated');
const OUTPUT = join(OUTPUT_DIR, 'tse2026-candidates.json');
const ZIP_URL = 'https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2026.zip';
const WATCHLIST = ['Keké', 'Anderson Teodoro', 'Zé da Imperial', 'Baiano dos Cocos', 'Cambão', 'Abadyas Damasceno', 'Pábio Mossoró', 'Felipe Galdino', 'Ribeiro do Túlio', 'André do Premium'];

function download(url, destination) {
  return new Promise((resolve, reject) => {
    const file = require('node:fs').createWriteStream(destination);
    request(url, response => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        return download(new URL(response.headers.location, url).href, destination).then(resolve, reject);
      }
      if (response.statusCode !== 200) return reject(new Error('TSE respondeu HTTP ' + response.statusCode));
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

function normalize(value = '') {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const header = lines.shift().split(';').map(value => value.replace(/^"|"$/g, ''));
  return lines.map(line => {
    const cells = line.split(';');
    return Object.fromEntries(header.map((key, index) => [key, (cells[index] ?? '').replace(/^"|"$/g, '')]));
  });
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const work = mkdtempSync(join(tmpdir(), 'tse-2026-'));
  const zip = join(work, 'consulta_cand_2026.zip');
  const extracted = join(work, 'csv');
  mkdirSync(extracted);

  await download(ZIP_URL, zip);
  execFileSync('unzip', ['-o', zip, '-d', extracted], { stdio: 'ignore' });

  const csvPath = execFileSync('find', [extracted, '-type', 'f', '-iname', '*GO.csv'], { encoding: 'utf8' }).split(/\r?\n/).find(Boolean);
  if (!csvPath) throw new Error('Arquivo de candidatos de GO não encontrado no pacote TSE.');

  const raw = readFileSync(csvPath, 'latin1');
  const rows = parseCsv(raw);
  const matched = rows.filter(row => {
    const candidateName = normalize(row.NM_URNA_CANDIDATO || row.NM_CANDIDATO || '');
    return WATCHLIST.some(name => candidateName.includes(normalize(name)));
  }).map(row => ({
    sqCandidate: row.SQ_CANDIDATO || null,
    ballotNumber: row.NR_CANDIDATO ? Number(row.NR_CANDIDATO) : null,
    name: row.NM_URNA_CANDIDATO || row.NM_CANDIDATO || null,
    fullName: row.NM_CANDIDATO || null,
    party: row.SG_PARTIDO || null,
    office: row.DS_CARGO || null,
    status: row.DS_SIT_TOT_TURNO || row.DS_SITUACAO_CANDIDATO || null,
    federation: row.NM_FEDERACAO || null,
    generationDate: row.DT_GERACAO || null,
    generationTime: row.HH_GERACAO || null,
  }));

  const payload = {
    schemaVersion: 1,
    source: 'TSE — Candidatos 2026',
    sourceUrl: 'https://dadosabertos.tse.jus.br/dataset/candidatos-2026',
    downloadedAt: new Date().toISOString(),
    scope: 'GO',
    watchlist: WATCHLIST,
    matched,
    counts: { rowsRead: rows.length, matched: matched.length },
  };

  writeFileSync(OUTPUT, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  rmSync(work, { recursive: true, force: true });
  console.log(JSON.stringify(payload.counts));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
