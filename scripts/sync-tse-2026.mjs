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
const WATCHLIST = [
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

const MUNICIPALITY_CODE = '5200258';
const MUNICIPALITY_NAME = 'Águas Lindas de Goiás';
const MUNICIPALITY_NORMALIZED = normalize(MUNICIPALITY_NAME);


const API_BASE_URL = 'https://divulgacandcontas.tse.jus.br/divulga/rest/v1';
const ELECTION_ID = '20322002026';
const API_CARGOS = [
  // A watchlist atual é composta por nomes monitorados como deputado estadual.
  // Evitamos chamadas desnecessárias a cargos que não podem produzir matches.
  { code: '7', label: 'deputado-estadual-distrital' },
];

// O TSE pode bloquear o IP compartilhado dos runners do GitHub Actions (HTTP 403).
// Nesses casos, o conteúdo continua sendo solicitado ao endpoint oficial do TSE,
// mas o transporte pode passar por um reader/proxy público somente para contornar
// a barreira de rede. O snapshot registra esse transporte explicitamente.
const API_READER_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?url=',
];

function curlJson(url) {
  const output = execFileSync('curl', [
    '--fail', '--location', '--http1.1',
    '--retry', '1', '--retry-delay', '1', '--retry-all-errors',
    '--connect-timeout', '15', '--max-time', '20',
    '--user-agent', 'observatorio-eleitoral/44.9 (dados oficiais TSE)',
    '--header', 'Accept: application/json',
    '--header', 'Accept-Language: pt-BR,pt;q=0.9',
    '--referer', 'https://divulgacandcontas.tse.jus.br/divulga/',
    url,
  ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
  return JSON.parse(output);
}

function encodeProxyTarget(url) {
  return encodeURIComponent(url);
}

function fetchApi(url) {
  try {
    return { payload: curlJson(url), transport: 'direct_official', requestUrl: url };
  } catch (directError) {
    console.warn('[TSE] acesso direto bloqueado/indisponível; tentando transporte intermediado.');
    for (const proxy of API_READER_PROXIES) {
      const requestUrl = proxy + encodeProxyTarget(url);
      try {
        return { payload: curlJson(requestUrl), transport: 'reader_proxy', requestUrl };
      } catch (proxyError) {
        console.warn('[TSE] proxy indisponível: ' + proxy + ' (' + (proxyError instanceof Error ? proxyError.message : String(proxyError)) + ')');
      }
    }
    throw directError;
  }
}

function apiCandidateToRecord(candidate, cargoLabel, previousRecord) {
  const id = String(candidate.id ?? candidate.sq_CANDIDATO ?? '');
  const name = String(candidate.nomeUrna ?? candidate.nm_URNA ?? candidate.nome ?? '').trim();
  const fullName = String(candidate.nomeCompleto ?? candidate.nm_CANDIDATO ?? '').trim();
  const ballot = Number(candidate.numero ?? candidate.nr_CANDIDATO);
  return {
    sqCandidate: id,
    ballotNumber: Number.isFinite(ballot) ? ballot : null,
    name,
    fullName: fullName || null,
    party: candidate.partido?.sigla ?? candidate.sg_PARTIDO ?? null,
    office: candidate.cargo?.nome ?? candidate.ds_CARGO ?? cargoLabel,
    status: candidate.descricaoSituacao ?? candidate.situacaoCandidato ?? null,
    federation: candidate.nomeColigacao ?? null,
    generationDate: null,
    generationTime: null,
    candidateIdKind: 'tse_divulgacand_api',
    municipality: MUNICIPALITY_NAME,
    municipalityCodeTse: MUNICIPALITY_CODE,
    photoUrl: candidate.fotoUrl ?? candidate.urlFoto ?? previousRecord?.photoUrl ?? null,
    instagramUrl: previousRecord?.instagramUrl ?? null,
    sourceResource: selectedSourceUrl,
    apiCargo: cargoLabel,
  };
}

function collectApiCandidates() {
  const candidates = [];
  const sources = [];
  for (const cargo of API_CARGOS) {
    const url = API_BASE_URL + '/candidatura/listar/2026/' + MUNICIPALITY_CODE + '/' + ELECTION_ID + '/' + cargo.code + '/candidatos';
    try {
      const response = fetchApi(url);
      const rows = Array.isArray(response.payload?.candidatos) ? response.payload.candidatos : [];
      sources.push({ url, cargo: cargo.label, count: rows.length, transport: response.transport });
      for (const candidate of rows) candidates.push({ candidate, cargo, url, transport: response.transport });
    } catch (error) {
      console.warn('[TSE] API indisponível para ' + cargo.label + ': ' + (error instanceof Error ? error.message : String(error)));
    }
  }
  if (!sources.some(source => source.count > 0)) return null;
  return { candidates, sources };
}

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

function normalize(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim();
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

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
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
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') {
      field += char;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    if (row.some(value => value.length)) rows.push(row);
  }

  return rows;
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

function municipalityMatch(row, header) {
  const code = valueOf(row, header, ['CD_MUNICIPIO', 'CD_MUNICIPIO_TSE', 'NR_MUNICIPIO']);
  const name = valueOf(row, header, ['NM_MUNICIPIO']);
  return code === MUNICIPALITY_CODE || normalize(name) === MUNICIPALITY_NORMALIZED;
}

function watchlisted(row, header) {
  const urn = valueOf(row, header, ['NM_URNA_CANDIDATO', 'NM_URNA']);
  if (!urn) return false;
  return WATCHLIST.some(name => {
    const aliases = WATCHLIST_ALIASES[name] ?? [name];
    return matchesAlias(urn, aliases);
  });
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
      || payload?.coverage !== 'municipality_required'
      || !Array.isArray(payload?.matched)
      || !['first_capture', 'synced', 'unchanged', 'changed'].includes(payload?.meta?.state)
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

    const apiResult = collectApiCandidates();
    if (apiResult) {
      selectedSourceUrl = apiResult.sources.map(source => source.url).join('|');
      const apiTransport = apiResult.sources.some(source => source.transport === 'reader_proxy') ? 'reader_proxy' : 'direct_official';
      const matched = [];
      const seen = new Set();
      for (const item of apiResult.candidates) {
        if (!item.candidate) continue;
        const name = String(item.candidate.nomeUrna ?? item.candidate.nm_URNA ?? '').trim();
        if (!name) continue;
        const watchlistName = WATCHLIST.find(expected => matchesAlias(name, WATCHLIST_ALIASES[expected] ?? [expected]));
        if (!watchlistName) continue;
        selectedSourceUrl = item.url;
        const record = apiCandidateToRecord(item.candidate, item.cargo.label, previousBySq.get(String(item.candidate.id ?? item.candidate.sq_CANDIDATO ?? '')));
        if (!record.sqCandidate) throw new Error('Registro municipal da API sem identificador de candidato.');
        if (seen.has(record.sqCandidate)) continue;
        record.watchlistName = watchlistName;
        matched.push(record);
        seen.add(record.sqCandidate);
      }
      municipalityRows = apiResult.candidates.length;
      sourceRows = apiResult.candidates.length;
      if (matched.length <= 0) throw new Error('A API oficial DivulgaCandContas respondeu para o município, mas nenhuma candidatura da watchlist foi encontrada.');
      const diff = diffRecords(previous?.matched ?? [], matched);
      const state = previous ? (diff.length ? 'changed' : 'unchanged') : 'first_capture';
      if (state === 'unchanged') {
        console.log(JSON.stringify({ valid:true, state, sourceRows, municipalityRows, matched:matched.length, retrievalMethod:'official_tse_divulgacandcontas_api', missingWatchlist:WATCHLIST.filter(name=>!matched.some(candidate=>candidate.watchlistName===name)), changed:false }, null, 2));
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
          sourceFileSha256: createHash('sha256').update(JSON.stringify(apiResult.candidates)).digest('hex'),
          sourceHashKind: 'official_api_payload',
          sourceRows,
          municipalityRows,
          originalMatchedRows: matched.length,
          matchedRows: matched.length,
          workflowRunId: process.env.GITHUB_RUN_ID || undefined,
          gitCommit: process.env.GITHUB_SHA || undefined,
          state,
          retrievalMethod: apiTransport === 'reader_proxy' ? 'official_tse_divulgacandcontas_api_via_reader_proxy' : 'official_tse_divulgacandcontas_api',
          captureTransport: apiTransport,
          resourceUrl: selectedSourceUrl,
          selection: 'watchlist_only',
          filterNote: apiTransport === 'reader_proxy'
            ? 'Recorte municipal validado pelo conteúdo do endpoint oficial DivulgaCandContas do TSE. O runner do GitHub recebeu HTTP 403 no acesso direto e usou transporte intermediado apenas para obter o mesmo endpoint oficial; o transporte está registrado no snapshot. O snapshot publica apenas a watchlist configurada; ele não representa a lista completa de candidaturas do município.'
            : 'Recorte municipal validado diretamente pela API oficial DivulgaCandContas do TSE. O snapshot publica apenas a watchlist configurada; ele não representa a lista completa de candidaturas do município.',
          missingWatchlist: WATCHLIST.filter(name=>!matched.some(candidate=>candidate.watchlistName===name)),
          apiCargos: apiResult.sources,
        },
        coverage: 'municipality_required',
        watchlist: WATCHLIST,
        matched,
        diff: { state, added:diff.filter(item=>item.type==='added').length, removed:diff.filter(item=>item.type==='removed').length, changed:diff.filter(item=>item.type==='changed').length, records:diff },
      };
      writeFileSync(OUTPUT, JSON.stringify(payload,null,2)+'\n','utf8');
      writeFileSync(DIFF_OUTPUT, JSON.stringify(payload.diff,null,2)+'\n','utf8');
      writeFileSync(join(HISTORY_DIR,snapshotId+'.json'),JSON.stringify(payload,null,2)+'\n','utf8');
      console.log(JSON.stringify({valid:true,state,snapshotId,sourceRows,municipalityRows,matched:matched.length,retrievalMethod:'official_tse_divulgacandcontas_api'},null,2));
      return;
    }

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
      if (!watchlisted(row, header)) continue;

      const record = toRecord(row, header, previousBySq.get(valueOf(row, header, ['SQ_CANDIDATO'])));
      if (!record.sqCandidate) throw new Error('Registro municipal sem SQ_CANDIDATO.');
      if (seen.has(record.sqCandidate)) throw new Error('SQ_CANDIDATO duplicado no recorte municipal: ' + record.sqCandidate);

      record.watchlistName = WATCHLIST.find(name => matchesAlias(record.name, WATCHLIST_ALIASES[name] ?? [name])) ?? record.name;
      matched.push(record);
      seen.add(record.sqCandidate);
    }

    const missingWatchlist = WATCHLIST.filter(name => !matched.some(candidate => candidate.watchlistName === name));
    if (municipalityRows <= 0) throw new Error('Nenhum registro municipal encontrado no CSV oficial do TSE para Águas Lindas de Goiás.');
    if (matched.length <= 0) throw new Error('Nenhuma candidatura da watchlist foi validada no recorte municipal oficial do TSE.');

    const diff = diffRecords(previous?.matched ?? [], matched);
    const state = previous ? (diff.length ? 'changed' : 'unchanged') : 'first_capture';
    if (state === 'unchanged') {
      console.log(JSON.stringify({
        valid: true,
        state,
        sourceRows,
        municipalityRows,
        matched: matched.length,
        missingWatchlist,
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
        selection: 'watchlist_only',
        filterNote: 'Recorte municipal validado pelo código TSE do município. O snapshot publica apenas a watchlist configurada; ele não representa a lista completa de candidaturas do município.',
        missingWatchlist,
      },
      coverage: 'municipality_required',
      watchlist: WATCHLIST,
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
      missingWatchlist,
      retrievalMethod: 'official_tse_zip_csv',
    }, null, 2));
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
