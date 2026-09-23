import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const path = resolve(process.cwd(), process.env.RESULTS_FEED_FILE ?? 'public/data/tse-results.json');
const requireFeed = process.env.REQUIRE_RESULTS_FEED === 'true';
const SCHEMA_VERSION = 3;
const OFFICIAL_HOST = 'resultados.tse.jus.br';
const MUNICIPALITY_CODE = '93343';
const MUNICIPALITY_NAME = 'Águas Lindas de Goiás';

function officialUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === OFFICIAL_HOST;
  } catch {
    return false;
  }
}

if (!existsSync(path)) {
  const beforeWindow = Date.now() < new Date('2026-10-04T17:00:00-03:00').getTime();
  const message = beforeWindow
    ? 'Feed TSE ainda não presente; a ausência é esperada antes da janela oficial de resultados.'
    : 'Feed TSE ausente.';
  console.log(JSON.stringify({ valid: true, present: false, warnings: [message] }, null, 2));
  if (requireFeed) process.exit(1);
  process.exit(0);
}

const payload = JSON.parse(readFileSync(path, 'utf8'));
const errors = [];
const warnings = [];
const fail = message => errors.push(message);
const isDate = value => typeof value === 'string' && Number.isFinite(Date.parse(value));

if (payload.schemaVersion !== SCHEMA_VERSION) fail('schemaVersion deve ser 3.');
if (payload.environment !== 'official') fail('environment deve ser official.');
if (payload.scope !== 'municipality') fail('scope deve ser municipality.');
if (payload.pleito !== 3220) fail('pleito deve ser 3220.');
if (!['pending', 'live', 'complete'].includes(payload.state)) fail('state inválido.');
if (payload.source !== 'official-tse') fail('source deve ser official-tse.');
if (!officialUrl(payload.sourceBaseUrl)) fail('sourceBaseUrl deve apontar exatamente para https://resultados.tse.jus.br.');
if (![1, 2].includes(payload.turn)) fail('turn deve ser 1 ou 2.');
if (payload.uf !== 'GO') fail('uf deve ser GO.');
if (payload.municipalityCode !== MUNICIPALITY_CODE) fail('municipalityCode não corresponde a Águas Lindas de Goiás (93343).');
if (payload.municipalityName !== MUNICIPALITY_NAME) fail('municipalityName fora do escopo municipal.');
if (!isDate(payload.referenceDate)) fail('referenceDate inválida.');
if (!isDate(payload.capturedAt)) fail('capturedAt inválida.');
if (Date.parse(payload.capturedAt) > Date.now() + 5 * 60 * 1000) fail('capturedAt está no futuro.');
if (!Array.isArray(payload.entries)) fail('entries deve ser array.');

for (const [index, entry] of (payload.entries ?? []).entries()) {
  if (!entry || typeof entry !== 'object') {
    fail(`entry ${index} inválida.`);
    continue;
  }
  if (!Number.isInteger(entry.electionCode) || entry.electionCode < 1) fail(`entry ${index}: electionCode inválido.`);
  if (typeof entry.cargo !== 'string' || !entry.cargo.trim()) fail(`entry ${index}: cargo ausente.`);
  if (typeof entry.sourceFile !== 'string' || !entry.sourceFile.endsWith('.json')) fail(`entry ${index}: sourceFile inválido.`);
  if (!isDate(entry.referenceDate) || !isDate(entry.updatedAt)) fail(`entry ${index}: data inválida.`);
  if (!Array.isArray(entry.items)) fail(`entry ${index}: items deve ser array.`);

  for (const [itemIndex, item] of (entry.items ?? []).entries()) {
    if (!item || typeof item !== 'object') {
      fail(`entry ${index} item ${itemIndex}: inválido.`);
      continue;
    }
    if (typeof item.candidateId !== 'string' || !item.candidateId.trim()) fail(`entry ${index} item ${itemIndex}: candidateId ausente.`);
    if (typeof item.candidate !== 'string' || !item.candidate.trim()) fail(`entry ${index} item ${itemIndex}: candidate ausente.`);
    if (item.cargo !== entry.cargo) fail(`entry ${index} item ${itemIndex}: cargo divergente.`);
    if (typeof item.votes !== 'number' || !Number.isFinite(item.votes) || item.votes < 0) fail(`entry ${index} item ${itemIndex}: votes inválido.`);
  }
}

if (payload.integrity !== undefined) {
  if (!payload.integrity || typeof payload.integrity !== 'object') fail('integrity inválido.');
  const files = payload.integrity.files;
  if (!Array.isArray(files)) fail('integrity.files deve ser array.');
  if (Array.isArray(files)) {
    if (files.length !== payload.entries.length) fail('integrity.files deve ter uma prova por arquivo de cargo.');
    const entryFiles = new Set((payload.entries ?? []).map(entry => entry.sourceFile));
    const proofFiles = new Set((files ?? []).map(file => file?.sourceFile));
    if (entryFiles.size !== proofFiles.size || [...entryFiles].some(file => !proofFiles.has(file))) fail('integrity.files não corresponde exatamente aos sourceFile das entradas.');
    for (const [index, file] of files.entries()) {
      if (typeof file.sourceFile !== 'string' || typeof file.sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(file.sha256)) fail(`integrity.files[${index}]: hash inválido.`);
      if (!/^[a-f0-9]{64}$/i.test(file.jwsProofSha256 ?? '')) fail(`integrity.files[${index}]: jwsProofSha256 inválido.`);
      if (file.signatureStatus !== 'verified') fail(`integrity.files[${index}]: assinatura não verificada.`);
      if (file.verificationMethod !== 'tse-official-jwk-ed25519') fail(`integrity.files[${index}]: método de verificação inválido.`);
      if (file.algorithm !== 'EdDSA' || file.curve !== 'Ed25519') fail(`integrity.files[${index}]: algoritmo/curva inválidos.`);
      if (file.kid !== 'sNbt9Q_fLS65zE1_ZLNV-XRRwPY') fail(`integrity.files[${index}]: kid oficial inesperado.`);
      if (!/^[a-f0-9]{64}$/i.test(file.keyFingerprint ?? '')) fail(`integrity.files[${index}]: keyFingerprint inválido.`);
      if (!isDate(file.verifiedAt)) fail(`integrity.files[${index}]: verifiedAt inválido.`);
    }
  }
  if (payload.integrity.allVerified !== true) fail('integrity.allVerified deve ser true para publicar um feed oficial.');
} else {
  if (payload.state !== 'pending') fail('Feed não-pendente precisa carregar prova de integridade.');
}

if (payload.entries.length === 0 && payload.state !== 'pending') warnings.push('Feed não finalizado sem registros.');
if (payload.state === 'live' && Date.parse(payload.capturedAt) < Date.now() - 15 * 60 * 1000) warnings.push('Feed live com mais de 15 minutos: a UI deve tratá-lo como stale.');

if (errors.length) {
  console.error(JSON.stringify({ valid: false, present: true, errors, warnings }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ valid: true, present: true, errors: [], warnings }, null, 2));
