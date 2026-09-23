import { join, basename } from 'node:path';
import { existsSync, mkdirSync, readdirSync, copyFileSync, rmSync } from 'node:fs';
import { extractZip, findFile, downloadFile, normalizeLabel, readCsv, readJson, sourceBasename, sha256File, valueOf, writeJson } from './common.ts';

const ROOT = process.cwd();
const TARGET_NAME = 'Águas Lindas de Goiás';
const TARGET_NORMALIZED = normalizeLabel(TARGET_NAME);
const TARGET_TSE_CODE = '92737';
const TARGET_IBGE_CODE = '5200258';

const WORK = join(ROOT, '.tmp', 'tse-candidates-local');
const CAND_ZIP = join(WORK, 'candidatos.zip');
const SOCIAL_ZIP = join(WORK, 'redes.zip');
const PHOTO_ZIP = join(WORK, 'fotos.zip');
const CAND_EXTRACT = join(WORK, 'candidatos');
const SOCIAL_EXTRACT = join(WORK, 'redes');
const PHOTO_EXTRACT = join(WORK, 'fotos');

const CAND_SOURCE = 'https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2026.zip';
const SOCIAL_SOURCE = 'https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/rede_social_candidato_2026.zip';
const PHOTO_SOURCE = 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2026/fotos/foto_cand2026_GO_div.zip';

const INPUT = join(ROOT, 'src', 'data', 'generated', 'tse2026-candidates.json');
const OUTPUT = join(ROOT, 'src', 'data', 'generated', 'tse2026-candidates.json');
const API_OUTPUT = join(ROOT, 'public', 'api', 'v1', 'candidatos.json');
const PUBLIC_PHOTO_DIR = join(ROOT, 'public', 'img', 'candidatos');

const WATCHLIST_FALLBACK = [
  'Keké',
  'Anderson Teodoro',
  'Zé da Imperial',
  'Baiano dos Cocos',
  'Cambão',
  'Abadyas Damasceno',
  'Pábio Mossoró',
  'Felipe Galdino',
  'Ribeiro do Túlio',
  'André do Premium',
];

const WATCHLIST_ALIASES: Record<string, readonly string[]> = {
  'Keké': ['KEKE', 'KEKE DA VULKANIC'],
  'Anderson Teodoro': ['ANDERSON TEODORO'],
  'Zé da Imperial': ['ZE DA IMPERIAL', 'JOSE IMPERIAL'],
  'Baiano dos Cocos': ['BAIANO DOS COCOS', 'BAIANO DO COCOS', 'BAIANO COCOS'],
  'Cambão': ['CAMBAO', 'WILDE CAMBAO'],
  'Abadyas Damasceno': ['ABADYAS DAMASCENO'],
  'Pábio Mossoró': ['PABIO MOSSORO'],
  'Felipe Galdino': ['FELIPE GALDINO'],
  'Ribeiro do Túlio': ['RIBEIRO DO TULIO', 'RIBEIRO DO TULLIO', 'RIBEIRO TULLIO'],
  'André do Premium': ['ANDRE DO PREMIUM'],
};

mkdirSync(WORK, { recursive: true });
for (const dir of [CAND_EXTRACT, SOCIAL_EXTRACT, PHOTO_EXTRACT]) {
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
}
mkdirSync(PUBLIC_PHOTO_DIR, { recursive: true });

const current = readJson<{
  meta: Record<string, unknown>;
  watchlist: readonly string[];
  matched: readonly Record<string, unknown>[];
}>(INPUT);

const watchlist = current.watchlist.length ? [...current.watchlist] : WATCHLIST_FALLBACK;
const currentWatchlist = new Set(watchlist.map(normalizeLabel));

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
  if (sq && current.matched.some(item => String(item.sqCandidate ?? '') === sq)) return true;
  if (!urn) return false;

  return [...currentWatchlist].some(name => {
    if (urn === name) return true;
    const aliases = WATCHLIST_ALIASES[name] ?? [name];
    return aliases.some(alias => normalizeLabel(alias) === urn);
  });
}

const localRows = candidateRows.filter(row => isLocal(row) && watchlisted(row));

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
  };
});

const snapshot = {
  ...current,
  meta: {
    ...current.meta,
    source: 'TSE — Candidatos 2026',
    sourceUrl: 'https://dadosabertos.tse.jus.br/dataset/candidatos-2026',
    sourceFileSha256: sha256File(CAND_ZIP),
    sourceHashKind: 'source_zip',
    sourceRows: candidateRows.length,
    originalMatchedRows: current.meta.originalMatchedRows ?? current.matched.length,
    matchedRows: merged.length,
    state: 'synced',
    downloadedAt: new Date().toISOString(),
    retrievalMethod: 'official_tse_zip_csv',
    municipalityFilter: TARGET_NAME,
    municipalityCodeTse: TARGET_TSE_CODE,
    municipalityCodeIbge: TARGET_IBGE_CODE,
    socialSourceUrl: SOCIAL_SOURCE,
    photoSourceUrl: PHOTO_SOURCE,
    mediaAvailable: photoAvailable,
    filterNote: 'Recorte municipal validado pelo código TSE/IBGE e pelos campos de município do arquivo oficial.',
  },
  watchlist,
  coverage: 'municipality',
  matched: merged,
};

writeJson(OUTPUT, snapshot);
writeJson(API_OUTPUT, snapshot);

console.log('[TSE] candidatos municipais:', merged.length);
console.log('[TSE] fotos disponíveis:', photoAvailable);
console.log('[TSE] Instagram declarado no TSE:', merged.filter(row => row.instagramUrl).length);
console.log('[TSE] filtro municipal:', TARGET_NAME, TARGET_TSE_CODE, TARGET_IBGE_CODE);
console.log('[TSE] arquivo:', basename(candidatesPath), '· linhas:', candidateRows.length);
console.log('[TSE] mídia social:', basename(socialPath));
