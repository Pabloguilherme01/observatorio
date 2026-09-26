import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { request } from 'node:https';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyCompactJws } from './verify-jws.mjs';

const BASE = 'https://resultados.tse.jus.br/oficial';
const OUTPUT = resolve(process.cwd(), 'public/data/tse-results.json');
const HTTP_STATE = resolve(process.cwd(), 'public/data/tse-results-http-state.json');
const PLEITO = 3220;
const UF = 'go';
const MUNICIPALITY_NAME = 'Águas Lindas de Goiás';
const MUNICIPALITY_CODE = '93343';
const TURN = Number(process.env.RESULTS_TURN ?? '1');
const ALLOW_PENDING = process.env.REQUIRE_RESULTS_SYNC !== 'true';

export const CARGO_SPECS = [
  { cargo: 'Presidente', electionCode: 6257, cargoCode: '1' },
  { cargo: 'Governador', electionCode: 6259, cargoCode: '3' },
  { cargo: 'Senador', electionCode: 6259, cargoCode: '5' },
  { cargo: 'Deputado Federal', electionCode: 6259, cargoCode: '6' },
  { cargo: 'Deputado Estadual', electionCode: 6259, cargoCode: '7' },
];

export function cargoSpecsForTurn(turn) {
  if (turn === 1) return CARGO_SPECS;
  if (turn === 2) return CARGO_SPECS.filter(spec => ['Presidente', 'Governador'].includes(spec.cargo));
  throw new Error('Turno inválido.');
}

function httpGet(url, headers = {}) {
  return new Promise((resolvePromise, reject) => {
    const req = request(url, { headers }, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => resolvePromise({ status: response.statusCode ?? 0, headers: response.headers, body }));
    });
    req.setTimeout(15000, () => req.destroy(new Error('timeout')));
    req.on('error', reject);
    req.end();
  });
}

function parseJson(label, response) {
  if (response.status !== 200) throw new Error(`${label}: HTTP ${response.status}`);
  try { return JSON.parse(response.body); } catch { throw new Error(`${label}: JSON inválido`); }
}

function normalize(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
}

function pad(value, size = 6) {
  return String(value).padStart(size, '0');
}

function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
  return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + stableStringify(value[key])).join(',') + '}';
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function findElection(config, firstTurnCode, turn = TURN) {
  const pleito = (config.pl ?? []).find(item => String(item.cd) === String(PLEITO));
  if (!pleito) throw new Error(`Pleito ${PLEITO} não encontrado no ele-c.json.`);
  const first = (pleito.e ?? []).find(election => String(election.cd) === String(firstTurnCode) && Number(election.t ?? 1) === 1);
  if (!first) throw new Error(`Eleição base ${firstTurnCode} não encontrada no ele-c.json.`);
  if (turn === 1) return { election: first, electionCode: Number(first.cd) };
  const secondCode = String(first.cdt2 ?? '').trim();
  if (!secondCode) return null;
  const second = (pleito.e ?? []).find(election => String(election.cd) === secondCode && Number(election.t ?? 0) === 2);
  if (!second) throw new Error(`Eleição de segundo turno ${secondCode} não encontrada no ele-c.json.`);
  return { election: second, electionCode: Number(second.cd) };
}

function findMunicipality(config) {
  for (const state of config.abr ?? []) {
    if (String(state.cd).toLowerCase() !== UF) continue;
    for (const municipality of state.mu ?? []) {
      if (String(municipality.cd) === MUNICIPALITY_CODE) return municipality;
      if (normalize(municipality.nm) === normalize(MUNICIPALITY_NAME)) return municipality;
    }
  }
  throw new Error('Município de Águas Lindas de Goiás não encontrado na configuração oficial.');
}

function numberFrom(value) {
  const parsed = Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function extractCandidates(payload, cargoName) {
  const candidates = [];
  const seen = new Set();
  const cargoBlocks = (payload.carg ?? []).filter(cargo => normalize(cargo.nmn || cargo.nm || cargo.nmf || '') === normalize(cargoName));
  if (!cargoBlocks.length) throw new Error(`Payload não contém o cargo ${cargoName}.`);
  for (const cargo of cargoBlocks) {
    for (const group of cargo.agr ?? []) {
      for (const party of group.par ?? []) {
        for (const candidate of party.cand ?? []) {
          const id = String(candidate.sqcand ?? candidate.n ?? '').trim();
          if (!id || seen.has(id)) continue;
          seen.add(id);
          candidates.push({
            candidateId: id,
            candidate: candidate.nmu || candidate.nm || 'Nome não informado',
            party: party.sg || party.nm || undefined,
            cargo: cargoName,
            votes: numberFrom(candidate.vap),
            status: candidate.st || candidate.dvt || undefined,
          });
        }
      }
    }
  }
  return candidates;
}

function entryFromPayload(payload, sourceFile, spec) {
  if (String(payload.ele) !== String(spec.electionCode)) throw new Error(`${sourceFile}: código de eleição divergente no payload.`);
  if (Number(payload.t ?? 0) !== TURN) throw new Error(`${sourceFile}: turno divergente no payload.`);
  if (String(payload.tpabr ?? '').toLowerCase() !== 'mu') throw new Error(`${sourceFile}: abrangência não é municipal.`);
  if (String(payload.cdabr ?? '') !== MUNICIPALITY_CODE) throw new Error(`${sourceFile}: município divergente no payload.`);
  const sections = payload.s ?? {};
  const electors = payload.e ?? {};
  const votes = payload.v ?? {};
  return {
    electionCode: spec.electionCode,
    cargo: spec.cargo,
    sourceFile,
    referenceDate: payload.dt ? new Date(payload.dt.split('/').reverse().join('-') + 'T00:00:00-03:00').toISOString() : new Date().toISOString(),
    updatedAt: payload.hg && payload.dg
      ? new Date(payload.dg.split('/').reverse().join('-') + 'T' + payload.hg + '-03:00').toISOString()
      : new Date().toISOString(),
    sectionsTotal: numberFrom(sections.ts),
    sectionsCounted: numberFrom(sections.st),
    totalVotes: numberFrom(votes.tv),
    validVotes: numberFrom(votes.vv),
    blankVotes: numberFrom(votes.vb),
    nullVotes: numberFrom(votes.vn),
    abstentions: numberFrom(electors.a),
    items: extractCandidates(payload, spec.cargo),
  };
}

function readJsonFile(path, fallback) {
  if (!existsSync(path)) return fallback;
  try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return fallback; }
}

async function fetchPair(jsonUrl, jwsUrl, label, sourceFile, previousEntry, previousProof, httpState) {
  const previousHttp = httpState.files?.[sourceFile] ?? {};
  const jsonHeaders = { Accept: 'application/json', ...(previousHttp.etag ? { 'If-None-Match': previousHttp.etag } : {}), ...(previousHttp.lastModified ? { 'If-Modified-Since': previousHttp.lastModified } : {}) };
  const jwsHeaders = { Accept: 'text/plain', ...(previousHttp.jwsEtag ? { 'If-None-Match': previousHttp.jwsEtag } : {}), ...(previousHttp.jwsLastModified ? { 'If-Modified-Since': previousHttp.jwsLastModified } : {}) };
  let [jsonResponse, jwsResponse] = await Promise.all([httpGet(jsonUrl, jsonHeaders), httpGet(jwsUrl, jwsHeaders)]);
  if (jsonResponse.status === 404 || jwsResponse.status === 404) {
    const error = new Error(`${label}: arquivo ainda não disponível (HTTP 404)`);
    error.code = 'NOT_READY';
    throw error;
  }
  if (jsonResponse.status === 304 && jwsResponse.status === 304) {
    if (!previousEntry || !previousProof) throw new Error(`${label}: TSE retornou 304 sem snapshot local verificado para reaproveitar.`);
    return { unchanged: true, entry: previousEntry, proof: previousProof };
  }
  if (jsonResponse.status === 304 || jwsResponse.status === 304) {
    [jsonResponse, jwsResponse] = await Promise.all([httpGet(jsonUrl, { Accept: 'application/json' }), httpGet(jwsUrl, { Accept: 'text/plain' })]);
  }
  const json = parseJson(label + ' JSON', jsonResponse);
  if (jwsResponse.status !== 200) throw new Error(`${label} JWS: HTTP ${jwsResponse.status}`);
  const proof = verifyCompactJws(jwsResponse.body);
  if (!proof.valid) throw new Error(`${label}: assinatura JWS inválida`);
  if (stableStringify(proof.payload) !== stableStringify(json)) throw new Error(`${label}: payload JWS difere do JSON correspondente`);
  return {
    unchanged: false,
    json,
    proof,
    jsonSha256: sha256(jsonResponse.body),
    jsonEtag: jsonResponse.headers.etag ?? null,
    jsonLastModified: jsonResponse.headers['last-modified'] ?? null,
    jwsEtag: jwsResponse.headers.etag ?? null,
    jwsLastModified: jwsResponse.headers['last-modified'] ?? null,
  };
}

async function main() {
  if (![1, 2].includes(TURN)) throw new Error('RESULTS_TURN deve ser 1 ou 2.');

  const electionConfigUrl = `${BASE}/comum/config/ele-c.json`;
  const configResponse = await httpGet(electionConfigUrl, { Accept: 'application/json' });
  const electionConfig = parseJson('ele-c.json', configResponse);
  const pleitoConfig = (electionConfig.pl ?? []).find(item => String(item.cd) === String(PLEITO));
  if (!pleitoConfig) throw new Error(`Pleito ${PLEITO} não encontrado no ele-c.json.`);
  const cycle = String(pleitoConfig.c ?? '').trim();
  if (!cycle) throw new Error('Ciclo eleitoral ausente no ele-c.json.');

  // A configuração municipal do primeiro turno existe mesmo quando GO não tem segundo turno.
  const stateElectionRef = findElection(electionConfig, 6259, 1);
  const municipalityConfigUrl = `${BASE}/${cycle}/${stateElectionRef.electionCode}/config/mun-e${pad(stateElectionRef.electionCode)}-cm.json`;
  const municipalityResponse = await httpGet(municipalityConfigUrl, { Accept: 'application/json' });
  const municipalityConfig = parseJson('configuração de municípios', municipalityResponse);
  const municipality = findMunicipality(municipalityConfig);
  if (String(municipality.cd) !== MUNICIPALITY_CODE) throw new Error('Código municipal resolvido diverge de 93343.');

  mkdirSync(resolve(process.cwd(), 'public/data'), { recursive: true });
  const previousFeed = readJsonFile(OUTPUT, null);
  const httpState = readJsonFile(HTTP_STATE, { schemaVersion: 1, files: {} });
  const entries = [];
  const proofs = [];
  let changed = false;
  let pendingCargos = 0;

  for (const spec of cargoSpecsForTurn(TURN)) {
    const electionRef = findElection(electionConfig, spec.electionCode);
    if (!electionRef) continue;
    const election = electionRef.election;
    const configuredCargo = (election.abr ?? []).flatMap(item => item.cp ?? []).find(item => String(item.cd) === String(spec.cargoCode));
    if (!configuredCargo || normalize(configuredCargo.ds) !== normalize(spec.cargo)) {
      throw new Error(`Configuração TSE incompatível para ${spec.cargo}: código ${spec.cargoCode}.`);
    }

    const actualElectionCode = electionRef.electionCode;
    const electionSegment = pad(actualElectionCode);
    const cargoSegment = 'c' + String(spec.cargoCode).padStart(4, '0');
    const sourceFile = `${UF}${MUNICIPALITY_CODE}-${cargoSegment}-e${electionSegment}-u.json`;
    const basePath = `${BASE}/${cycle}/${actualElectionCode}/dados/${UF}/${sourceFile}`;
    try {
      const previousEntry = previousFeed?.entries?.find(entry => entry.sourceFile === sourceFile);
      const previousProof = previousFeed?.integrity?.files?.find(file => file.sourceFile === sourceFile);
      const pair = await fetchPair(basePath, basePath.replace(/\.json$/, '.jws'), spec.cargo, sourceFile, previousEntry, previousProof, httpState);
      if (pair.unchanged) {
        entries.push(pair.entry);
        proofs.push(pair.proof);
      } else {
        changed = true;
        entries.push(entryFromPayload(pair.json, sourceFile, { ...spec, electionCode: actualElectionCode }));
        proofs.push({ sourceFile, sha256: pair.jsonSha256, jwsProofSha256: pair.proof.proofSha256, signatureStatus: 'verified', verificationMethod: 'tse-official-jwk-ed25519', verifiedAt: pair.proof.verifiedAt, algorithm: 'EdDSA', curve: 'Ed25519', kid: pair.proof.kid, keyFingerprint: pair.proof.keyFingerprint, etag: pair.jsonEtag, lastModified: pair.jsonLastModified, jwsEtag: pair.jwsEtag, jwsLastModified: pair.jwsLastModified });
        httpState.files[sourceFile] = { etag: pair.jsonEtag, lastModified: pair.jsonLastModified, jwsEtag: pair.jwsEtag, jwsLastModified: pair.jwsLastModified, capturedAt: new Date().toISOString() };
      }
    } catch (error) {
      if (error?.code === 'NOT_READY' && ALLOW_PENDING) {
        console.log(JSON.stringify({ valid: true, pending: true, cargo: spec.cargo, reason: error.message }, null, 2));
        pendingCargos += 1;
        continue;
      }
      throw error;
    }
  }

  if (!entries.length) {
    console.log(JSON.stringify({ valid: true, pending: true, reason: 'Nenhum cargo deste turno disponível.' }, null, 2));
    return;
  }
  if (!changed && previousFeed && previousFeed.turn === TURN) {
    console.log(JSON.stringify({ valid: true, unchanged: true, state: previousFeed.state, capturedAt: previousFeed.capturedAt, entries: previousFeed.entries.length }, null, 2));
    return;
  }
  writeFileSync(HTTP_STATE, JSON.stringify({ ...httpState, schemaVersion: 1 }, null, 2) + '\n', 'utf8');
  const now = new Date();
  const complete = pendingCargos === 0 && entries.every(entry => entry.sectionsTotal > 0 && entry.sectionsCounted >= entry.sectionsTotal);
  const payload = {
    schemaVersion: 3,
    environment: 'official',
    scope: 'municipality',
    state: complete ? 'complete' : 'live',
    source: 'official-tse',
    sourceBaseUrl: BASE,
    pleito: PLEITO,
    turn: TURN,
    uf: 'GO',
    municipalityCode: MUNICIPALITY_CODE,
    municipalityName: MUNICIPALITY_NAME,
    referenceDate: now.toISOString(),
    capturedAt: now.toISOString(),
    entries,
    integrity: {
      files: proofs,
      allVerified: proofs.length === entries.length && proofs.every(proof => proof.signatureStatus === 'verified'),
    },
  };

  writeFileSync(OUTPUT, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log(JSON.stringify({ valid: true, state: payload.state, capturedAt: payload.capturedAt, entries: entries.length, verifiedFiles: proofs.length, output: OUTPUT }, null, 2));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) main().catch(error => {
  console.error(JSON.stringify({ valid: false, error: String(error) }, null, 2));
  process.exit(1);
});
