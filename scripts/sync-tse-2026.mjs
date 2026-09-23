import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createReadStream } from 'node:fs';
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
const API_URL = 'https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura/listar/2026/GO/20322002026/7/candidatos';
const API_PROXY_URL = 'https://r.jina.ai/https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura/listar/2026/GO/20322002026/7/candidatos';
const WATCHLIST = ['Keké', 'Anderson Teodoro', 'Zé da Imperial', 'Baiano dos Cocos', 'Cambão', 'Abadyas Damasceno', 'Pábio Mossoró', 'Felipe Galdino', 'Ribeiro do Túlio', 'André do Premium'];

const WATCHLIST_ALIASES = {
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function download(url, destination, attempt = 1) {
  try {
    execFileSync('curl', [
      '--fail',
      '--location',
      '--http1.1',
      '--retry', '0',
      '--connect-timeout', '20',
      '--max-time', '90',
      '--user-agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/153 Safari/537.36',
      '--header', 'Accept: application/zip, application/octet-stream;q=0.9, */*;q=0.8',
      '--output', destination,
      url,
    ], { stdio: 'inherit' });
  } catch (error) {
    rmSync(destination, { force: true });
    if (attempt >= 1) {
      throw new Error('Falha ao baixar pacote TSE via curl: ' + (error instanceof Error ? error.message : String(error)));
    }
    return download(url, destination, attempt + 1);
  }
}
function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function normalize(value = '') {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
}

function matchesAlias(candidateName, aliases) {
  const candidateTokens = normalize(candidateName).split(' ').filter(Boolean);
  return aliases.some(alias => {
    const aliasTokens = normalize(alias).split(' ').filter(Boolean);
    if (!aliasTokens.length || aliasTokens.length > candidateTokens.length) return false;
    for (let start = 0; start <= candidateTokens.length - aliasTokens.length; start += 1) {
      if (aliasTokens.every((token, index) => candidateTokens[start + index] === token)) return true;
    }
    return false;
  });
}

function downloadText(url, destination, attempt = 1) {
  try {
    execFileSync('curl', [
      '--fail',
      '--location',
      '--http1.1',
      '--retry', '2',
      '--retry-delay', '2',
      '--retry-all-errors',
      '--connect-timeout', '30',
      '--max-time', '120',
      '--user-agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/153 Safari/537.36',
      '--header', 'Accept: application/json, text/plain, */*',
      '--header', 'Referer: https://divulgacandcontas.tse.jus.br/divulga/',
      '--output', destination,
      url,
    ], { stdio: 'inherit' });
    return readFileSync(destination, 'utf8');
  } catch (error) {
    rmSync(destination, { force: true });
    if (attempt >= 2) throw new Error('Falha ao consultar API oficial do DivulgaCandContas: ' + (error instanceof Error ? error.message : String(error)));
    const waitMs = 2000 * attempt;
    console.warn('[TSE API] tentativa ' + attempt + ' falhou. Nova tentativa em ' + waitMs + 'ms.');
    return sleep(waitMs).then(() => downloadText(url, destination, attempt + 1));
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
    throw new Error('Resposta do proxy não contém JSON reconhecível.');
  }
}

function findCandidateArray(value, depth = 0) {
  if (!value || depth > 4) return null;
  if (Array.isArray(value)) {
    if (value.some(item => item && typeof item === 'object' && ('nomeUrna' in item || 'nomeCompleto' in item || 'NM_URNA_CANDIDATO' in item))) return value;
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

function collectStrings(value, output = [], depth = 0) {
  if (depth > 5 || value == null) return output;
  if (typeof value === 'string') {
    if (value.trim()) output.push(value);
    return output;
  }
  if (Array.isArray(value)) {
    value.forEach(item => collectStrings(item, output, depth + 1));
    return output;
  }
  if (typeof value === 'object') {
    Object.values(value).forEach(child => collectStrings(child, output, depth + 1));
  }
  return output;
}

function firstString(value, keys, depth = 0) {
  if (!value || depth > 5 || typeof value !== 'object') return null;
  for (const key of keys) {
    const candidate = value[key];
    if (typeof candidate === 'string' && candidate.trim()) return candidate;
    if (candidate && typeof candidate === 'object') {
      const nested = firstString(candidate, keys, depth + 1);
      if (nested) return nested;
    }
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

function apiCandidateToRecord(item, watchlistName) {
  const sq = firstScalar(item, ['id', 'sqCandidato', 'sqCandidate', 'SQ_CANDIDATO', 'idCandidato', 'codigoCandidato']);
  const name = firstString(item, ['nomeUrna', 'nome_urna', 'NM_URNA_CANDIDATO', 'nomeCandidato', 'nomeCompleto', 'NM_CANDIDATO', 'nome']) || watchlistName;
  const ballot = firstScalar(item, ['numero', 'nrCandidato', 'NR_CANDIDATO']);
  return {
    sqCandidate: sq == null ? 'api-surrogate-' + createHash('sha256').update(JSON.stringify(item)).digest('hex').slice(0, 16) : String(sq),
    ballotNumber: ballot == null ? null : Number(ballot),
    name: String(name),
    fullName: firstString(item, ['nomeCompleto', 'NM_CANDIDATO']) || null,
    party: firstString(item, ['sgPartido', 'siglaPartido', 'partidoSigla', 'sigla']) || null,
    office: firstString(item, ['descricaoCargo', 'nomeCargo', 'cargo']) || 'DEPUTADO ESTADUAL',
    status: firstString(item, ['descricaoSituacao', 'descricaoSituacaoCandidato', 'situacao', 'status']) || null,
    federation: firstString(item, ['nomeFederacao', 'nmFederacao', 'federacao']) || null,
    generationDate: firstString(item, ['dtGeracao', 'dataGeracao']) || null,
    generationTime: firstString(item, ['hhGeracao']) || null,
    candidateIdKind: sq == null ? 'surrogate_hash' : 'tse_api_id',
  };
}

function selectWatchlist(records) {
  const matches = [];
  const seen = new Set();
  for (const item of records) {
    const itemText = collectStrings(item).join(' ');
    const matchedWatchName = WATCHLIST.find(name => matchesAlias(itemText, WATCHLIST_ALIASES[name] ?? [normalize(name)]));
    if (!matchedWatchName) continue;
    const record = apiCandidateToRecord(item, matchedWatchName);
    if (seen.has(record.sqCandidate)) continue;
    seen.add(record.sqCandidate);
    record.watchlistName = matchedWatchName;
    matches.push(record);
  }
  console.log('[TSE API] registros recebidos=' + records.length + ' | watchlist=' + matches.map(item => item.watchlistName).join(', '));
  if (matches.length < WATCHLIST.length) {
    console.warn('[TSE API] amostra de chaves: ' + JSON.stringify(Object.keys(records[0] ?? {})));
    console.warn('[TSE API] amostra de strings: ' + JSON.stringify(collectStrings(records[0] ?? {}).slice(0, 12)));
  }
  return matches;
}


async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  mkdirSync(HISTORY_DIR, { recursive: true });
  const work = mkdtempSync(join(tmpdir(), 'tse-2026-'));
  const zip = join(work, 'consulta_cand_2026.zip');
  const apiJson = join(work, 'divulgacandcontas-2026-go-deputado-estadual.json');
  const extracted = join(work, 'csv');
  mkdirSync(extracted);

  try {
    let sourceFileSha256;
    let sourceRows;
    let retrievalMethod;
    let resourceUrl;
    let allMatches = [];

    try {
      let lastZipError = null;
      let selectedZipUrl = null;
      for (const candidateUrl of ZIP_URLS) {
        try {
          await download(candidateUrl, zip);
          selectedZipUrl = candidateUrl;
          break;
        } catch (error) {
          lastZipError = error;
          console.warn('[TSE] download falhou para ' + candidateUrl + ': ' + error.message);
          rmSync(zip, { force: true });
        }
      }
      if (!selectedZipUrl) throw lastZipError ?? new Error('Nenhum recurso oficial TSE de candidatos respondeu.');
      sourceFileSha256 = sha256(zip);
      retrievalMethod = 'official_tse_open_data_csv';
      resourceUrl = selectedZipUrl;
      execFileSync('unzip', ['-o', zip, '-d', extracted], { stdio: 'ignore' });
      const csvPath = execFileSync('find', [extracted, '-type', 'f', '-iname', '*GO.csv'], { encoding: 'utf8' }).split(/\r?\n/).find(Boolean);
      if (!csvPath) throw new Error('Arquivo de candidatos de GO não encontrado no pacote TSE.');

      let header;
      let rowsRead = 0;
      const seen = new Set();
      await parseCsvLineStreaming(csvPath, row => {
        if (!header) {
          header = Object.fromEntries(row.map((name, index) => [name.replace(/^\uFEFF/, '').trim(), index]));
          return;
        }
        rowsRead += 1;
        const candidateName = normalize(row[header.NM_URNA_CANDIDATO] || row[header.NM_CANDIDATO] || '');
        const matchedWatchName = WATCHLIST.find(name => matchesAlias(candidateName, WATCHLIST_ALIASES[name] ?? [normalize(name)]));
        if (!matchedWatchName) return;
        const record = toRecord(row, header);
        record.watchlistName = matchedWatchName;
        if (!record.sqCandidate) throw new Error('Registro monitorado sem SQ_CANDIDATO.');
        if (seen.has(record.sqCandidate)) throw new Error('SQ_CANDIDATO duplicado no recorte: ' + record.sqCandidate);
        seen.add(record.sqCandidate);
        allMatches.push(record);
      });
      sourceRows = rowsRead;
    } catch (cdnError) {
      console.warn('[TSE] Pacotes oficiais indisponíveis; tentando DivulgaCandContas direto e por proxy:', cdnError.message);
      const apiAttempts = [
        { url: API_URL, retrievalMethod: 'official_tse_divulgacandcontas_api', proxyUrl: null },
        { url: API_PROXY_URL, retrievalMethod: 'official_tse_divulgacandcontas_api_via_reader_proxy', proxyUrl: API_PROXY_URL },
      ];
      let apiError = null;
      let rawApi = null;
      let apiRetrievalMethod = null;
      let apiProxyUrl = null;

      for (const attempt of apiAttempts) {
        try {
          rawApi = await downloadText(attempt.url, apiJson);
          apiRetrievalMethod = attempt.retrievalMethod;
          apiProxyUrl = attempt.proxyUrl;
          break;
        } catch (error) {
          apiError = error;
          console.warn('[TSE API] falha em ' + attempt.url + ': ' + error.message);
        }
      }

      if (!rawApi || !apiRetrievalMethod) throw apiError ?? new Error('Nenhuma rota oficial de candidatos respondeu.');
      const parsedApi = parseJsonPayload(rawApi);
      const records = findCandidateArray(parsedApi);
      if (!records?.length) throw new Error('API oficial respondeu sem uma lista reconhecível de candidaturas.');
      sourceFileSha256 = createHash('sha256').update(rawApi, 'utf8').digest('hex');
      sourceRows = records.length;
      retrievalMethod = apiRetrievalMethod;
      resourceUrl = API_URL;
      allMatches = selectWatchlist(records);
      var sourceProxyUrl = apiProxyUrl;
    }
    if (!sourceRows) throw new Error('Snapshot inválido: nenhum registro de candidato foi lido.');

    const missingWatchlist = WATCHLIST.filter(name => !allMatches.some(candidate => candidate.watchlistName === name));
    if (missingWatchlist.length) {
      throw new Error('Captura TSE incompleta; watchlist sem correspondência: ' + missingWatchlist.join(', '));
    }

    if (!allMatches.length || allMatches.length !== WATCHLIST.length) {
      throw new Error('Recorte TSE inválido: esperado ' + WATCHLIST.length + ' candidatos e recebido ' + allMatches.length + '.');
    }

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
        sourceHashKind: retrievalMethod === 'official_tse_divulgacandcontas_api' ? 'api_response_utf8' : 'source_zip',
        sourceRows,
        matchedRows: allMatches.length,
        workflowRunId: process.env.GITHUB_RUN_ID || undefined,
        gitCommit: process.env.GITHUB_SHA || undefined,
        schemaVersion: 2,
        state,
        retrievalMethod,
        resourceUrl,
        ...(sourceProxyUrl ? { sourceProxyUrl } : {}),
      },
      coverage: 'watchlist',
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

    if (state === 'unchanged') {
      console.log(JSON.stringify({ state, snapshotId, sourceRows, matched: allMatches.length, retrievalMethod, added: 0, removed: 0, changed: 0 }));
      return;
    }

    const json = JSON.stringify(payload, null, 2) + '\n';
    writeFileSync(OUTPUT, json, 'utf8');
    writeFileSync(DIFF_OUTPUT, JSON.stringify(payload.diff, null, 2) + '\n', 'utf8');

    const historyName = snapshotId + '.json';
    writeFileSync(join(HISTORY_DIR, historyName), json, 'utf8');
    console.log(JSON.stringify({
      state,
      snapshotId,
      sourceRows,
      matched: allMatches.length,
      retrievalMethod,
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
