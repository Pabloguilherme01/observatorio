import { join, basename } from 'node:path';
import { existsSync, mkdirSync, readdirSync, copyFileSync, rmSync } from 'node:fs';
import { extractZip, findFile, downloadFile, normalizeLabel, readCsv, readJson, sha256File, valueOf, writeJson } from './common.ts';

const ROOT = process.cwd();
const TARGET_NAME = 'Águas Lindas de Goiás';
const TARGET_NORMALIZED = normalizeLabel(TARGET_NAME);
const TARGET_TSE_CODE = '92737';
const TARGET_IBGE_CODE = '5200258';

const WORK = join(ROOT, '.tmp', 'tse-candidates-local');
const CAND_ZIP = join(WORK, 'candidatos.zip');
const SOCIAL_ZIP = join(WORK, 'redes.zip');
const PHOTO_ZIP = join(WORK, 'fotos.zip');
const COMPLEMENT_ZIP = join(WORK, 'complementar.zip');
const ASSETS_ZIP = join(WORK, 'bens.zip');
const CAND_EXTRACT = join(WORK, 'candidatos');
const SOCIAL_EXTRACT = join(WORK, 'redes');
const PHOTO_EXTRACT = join(WORK, 'fotos');
const COMPLEMENT_EXTRACT = join(WORK, 'complementar');
const ASSETS_EXTRACT = join(WORK, 'bens');

const CAND_SOURCE = 'https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2026.zip';
const SOCIAL_SOURCE = 'https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/rede_social_candidato_2026.zip';
const PHOTO_SOURCE = 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2026/fotos/foto_cand2026_GO_div.zip';
const COMPLEMENT_SOURCE = 'https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand_complementar/consulta_cand_complementar_2026.zip';
const ASSETS_SOURCE = 'https://cdn.tse.jus.br/estatistica/sead/odsele/bem_candidato/bem_candidato_2026.zip';

const INPUT = join(ROOT, 'src', 'data', 'generated', 'tse2026-candidates.json');
const API_OUTPUT = join(ROOT, 'public', 'api', 'v1', 'candidatos.json');
const PUBLIC_PHOTO_DIR = join(ROOT, 'public', 'img', 'candidatos');

mkdirSync(WORK, { recursive: true });
for (const dir of [CAND_EXTRACT, SOCIAL_EXTRACT, PHOTO_EXTRACT, COMPLEMENT_EXTRACT, ASSETS_EXTRACT]) {
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
}
mkdirSync(PUBLIC_PHOTO_DIR, { recursive: true });

const current = readJson<{
  meta: Record<string, unknown>;
  watchlist: readonly string[];
  matched: readonly Record<string, unknown>[];
}>(INPUT);

const currentWatchlist = new Set(current.watchlist.map(normalizeLabel));

await downloadFile(CAND_SOURCE, CAND_ZIP);
extractZip(CAND_ZIP, CAND_EXTRACT);
const candidatesPath = findFile(CAND_EXTRACT, /consulta_cand.*GO.*\.csv$/i);
const candidateRows = readCsv(candidatesPath);

const municipalityKeys = ['CD_MUNICIPIO', 'CD_MUNICIPIO_TSE', 'NR_MUNICIPIO', 'NM_MUNICIPIO'];
const cargoKeys = ['DS_CARGO', 'NM_CARGO'];
const ballotKeys = ['NR_CANDIDATO', 'NR_CANDIDATURA'];
const sqKeys = ['SQ_CANDIDATO', 'SQ_CANDIDATO_'];
const urnKeys = ['NM_URNA_CANDIDATO', 'NM_URNA'];

function isLocal(row: Readonly<Record<string, string>>) {
  const municipalityCode = valueOf(row, municipalityKeys, false);
  const municipalityName = valueOf(row, ['NM_MUNICIPIO'], false);
  return municipalityCode === TARGET_TSE_CODE ||
    municipalityCode === TARGET_IBGE_CODE ||
    normalizeLabel(municipalityName) === TARGET_NORMALIZED;
}

function watchlisted(row: Readonly<Record<string, string>>) {
  const urn = normalizeLabel(valueOf(row, urnKeys, false));
  const sq = valueOf(row, sqKeys, false);
  return Boolean(sq && current.matched.some(item => String(item.sqCandidate ?? '') === sq)) ||
    Boolean(urn && currentWatchlist.has(urn));
}

const localRows = candidateRows.filter(row => isLocal(row) && watchlisted(row));

await downloadFile(COMPLEMENT_SOURCE, COMPLEMENT_ZIP);
extractZip(COMPLEMENT_ZIP, COMPLEMENT_EXTRACT);
const complementPath = findFile(COMPLEMENT_EXTRACT, /consulta_cand_complementar.*GO.*\\.csv$/i);
const complementRows = readCsv(complementPath);

const complementByCandidate = new Map<string, Readonly<Record<string, string>>>();
for (const row of complementRows) {
  const sq = valueOf(row, sqKeys, false);
  if (sq) complementByCandidate.set(sq, row);
}

await downloadFile(ASSETS_SOURCE, ASSETS_ZIP);
extractZip(ASSETS_ZIP, ASSETS_EXTRACT);
const assetsPath = findFile(ASSETS_EXTRACT, /bem_candidato.*GO.*\\.csv$/i);
const assetRows = readCsv(assetsPath);

const assetsByCandidate = new Map<string, number>();
for (const row of assetRows) {
  const sq = valueOf(row, sqKeys, false);
  if (!sq) continue;
  const rawValue = valueOf(row, ['VR_BEM_CANDIDATO', 'VR_BEM'], false);
  if (!rawValue) continue;
  const value = Number(rawValue.replace(/\\./g, '').replace(',', '.'));
  if (Number.isFinite(value)) assetsByCandidate.set(sq, (assetsByCandidate.get(sq) ?? 0) + value);
}


await downloadFile(SOCIAL_SOURCE, SOCIAL_ZIP);
extractZip(SOCIAL_ZIP, SOCIAL_EXTRACT);
const socialPath = findFile(SOCIAL_EXTRACT, /rede_social_candidato.*\.csv$/i);
const socialRows = readCsv(socialPath);

const instagramByCandidate = new Map<string, string>();
for (const row of socialRows) {
  const sq = valueOf(row, sqKeys, false);
  const network = normalizeLabel(valueOf(row, ['NM_REDE_SOCIAL', 'DS_REDE_SOCIAL'], false));
  const url = valueOf(row, ['DS_URL', 'URL_REDE_SOCIAL'], false);
  if (!sq || !url || !network.includes('INSTAGRAM')) continue;
  instagramByCandidate.set(sq, url);
}

let photoAvailable = 0;
try {
  await downloadFile(PHOTO_SOURCE, PHOTO_ZIP);
  extractZip(PHOTO_ZIP, PHOTO_EXTRACT);
} catch (error) {
  console.warn('[TSE] fotos não puderam ser baixadas nesta execução:', error);
}

function findPhoto(id: string): string | null {
  const stack = [PHOTO_EXTRACT];
  while (stack.length) {
    const dir = stack.pop();
    if (!dir || !existsSync(dir)) continue;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (/\.jpe?g$/i.test(entry.name) && entry.name.includes(id)) return full;
    }
  }
  return null;
}

const merged = localRows.map(row => {
  const sqCandidate = valueOf(row, sqKeys);
  const photo = findPhoto(sqCandidate);
  let photoUrl: string | null = null;

  if (photo) {
    const destination = join(PUBLIC_PHOTO_DIR, sqCandidate + '.jpg');
    copyFileSync(photo, destination);
    photoAvailable += 1;
    photoUrl = '/observatorio/img/candidatos/' + sqCandidate + '.jpg';
  }

  const complement = complementByCandidate.get(sqCandidate);
  const assets = assetsByCandidate.get(sqCandidate);
  return {
    sqCandidate,
    ballotNumber: Number(valueOf(row, ballotKeys, false)) || null,
    name: valueOf(row, urnKeys) || valueOf(row, ['NM_CANDIDATO']),
    fullName: valueOf(row, ['NM_CANDIDATO'], false) || null,
    party: valueOf(row, ['SG_PARTIDO'], false) || null,
    office: valueOf(row, cargoKeys, false) || null,
    status: valueOf(row, ['DS_SITUACAO_CANDIDATURA', 'DS_SITUACAO'], false) || null,
    federation: valueOf(row, ['NM_FEDERACAO', 'SG_FEDERACAO'], false) || null,
    generationDate: valueOf(row, ['DT_GERACAO'], false) || null,
    generationTime: valueOf(row, ['HH_GERACAO'], false) || null,
    candidateIdKind: 'tse_csv_sq_candidate',
    municipality: TARGET_NAME,
    municipalityCodeTse: TARGET_TSE_CODE,
    municipalityCodeIbge: TARGET_IBGE_CODE,
    photoUrl,
    instagramUrl: instagramByCandidate.get(sqCandidate) ?? null,
    sourceResource: CAND_SOURCE,
    occupation: valueOf(complement ?? {}, ['DS_OCUPACAO', 'NM_OCUPACAO'], false) || null,
    education: valueOf(complement ?? {}, ['DS_GRAU_INSTRUCAO', 'DS_ESCOLARIDADE'], false) || null,
    naturalidade: valueOf(complement ?? {}, ['NM_MUNICIPIO_NASCIMENTO', 'NM_NATURALIDADE'], false) || null,
    declaredAssetsBrl: assets ?? null,
  };
});

if (!merged.length) {
  throw new Error('Nenhuma candidatura da watchlist passou pelo filtro municipal do TSE.');
}

const snapshot = {
  ...current,
  meta: {
    ...current.meta,
    source: 'TSE — Candidatos 2026',
    sourceUrl: 'https://dadosabertos.tse.jus.br/dataset/candidatos-2026',
    sourceFileSha256: sha256File(CAND_ZIP),
    sourceRows: candidateRows.length,
    matchedRows: merged.length,
    state: 'synced',
    downloadedAt: new Date().toISOString(),
    retrievalMethod: 'official_tse_zip_csv',
    municipalityFilter: TARGET_NAME,
    municipalityCodeTse: TARGET_TSE_CODE,
    municipalityCodeIbge: TARGET_IBGE_CODE,
    socialSourceUrl: SOCIAL_SOURCE,
    photoSourceUrl: PHOTO_SOURCE,
    complementarySourceUrl: COMPLEMENT_SOURCE,
    assetsSourceUrl: ASSETS_SOURCE,
    mediaAvailable: photoAvailable,
  },
  coverage: 'municipality',
  matched: merged,
};

writeJson(INPUT, snapshot);
writeJson(API_OUTPUT, snapshot);

console.log('[TSE] candidatos municipais:', merged.length);
console.log('[TSE] fotos disponíveis:', photoAvailable);
console.log('[TSE] Instagram declarado no TSE:', merged.filter(row => row.instagramUrl).length);
console.log('[TSE] filtro municipal:', TARGET_NAME, TARGET_TSE_CODE, TARGET_IBGE_CODE);
console.log('[TSE] arquivo:', basename(candidatesPath), '· linhas:', candidateRows.length);
console.log('[TSE] mídia social:', basename(socialPath));
