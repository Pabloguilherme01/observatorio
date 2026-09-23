import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const path = resolve(process.cwd(), process.env.RESULTS_FEED_FILE ?? 'public/data/tse-results.json');
const requireFeed = process.env.REQUIRE_RESULTS_FEED === 'true';

if (!existsSync(path)) {
  const beforeWindow = Date.now() < new Date('2026-09-30T00:00:00-03:00').getTime();
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

if (payload.schemaVersion !== 2) fail('schemaVersion deve ser 2.');
if (payload.environment !== 'official') fail('environment deve ser official.');
if (payload.scope !== 'municipality') fail('scope deve ser municipality.');
if (payload.pleito !== 3220) fail('pleito deve ser 3220.');

if (!['pending', 'live', 'complete'].includes(payload.state)) fail('state inválido.');
if (payload.source !== 'official-tse') fail('source deve ser official-tse.');
if (typeof payload.sourceUrl !== 'string' || !payload.sourceUrl.startsWith('https://resultados.tse.jus.br')) fail('sourceUrl não aponta para o domínio oficial de resultados do TSE.');
if (typeof payload.sourceFile !== 'string' || !payload.sourceFile.trim()) fail('sourceFile ausente.');
if (![6257, 6259, 6261].includes(payload.electionCode)) fail('electionCode fora do conjunto documentado pelo TSE para 04/10/2026.');
if (payload.electionCode === 6257 && payload.cargo !== 'Presidente') fail('6257 deve corresponder a Presidente.');
if (payload.electionCode === 6259 && (payload.uf === 'DF' || payload.cargo === 'Presidente' || payload.cargo === 'Deputado Distrital')) fail('6259 incompatível com UF/cargo informado.');
if (payload.electionCode === 6261 && (payload.uf !== 'DF' || payload.cargo !== 'Deputado Distrital')) fail('6261 deve corresponder ao Distrito Federal e Deputado Distrital.');
if (payload.turn !== 1 && payload.turn !== 2) fail('turn deve ser 1 ou 2.');
if (payload.uf !== 'GO') fail('uf deve ser GO.');
if (typeof payload.municipalityCode !== 'string' || !/^\d{5}$/.test(payload.municipalityCode)) fail('municipalityCode deve ter 5 dígitos.');
if (typeof payload.municipalityName !== 'string' || !payload.municipalityName.trim()) fail('municipalityName ausente.');
if (typeof payload.cargo !== 'string' || !payload.cargo.trim()) fail('cargo ausente.');
if (payload.scope === 'municipality' && payload.municipalityName !== 'Águas Lindas de Goiás') fail('municipalityName fora do escopo municipal declarado.');
if (typeof payload.referenceDate !== 'string' || !Number.isFinite(Date.parse(payload.referenceDate))) fail('referenceDate inválida.');
if (typeof payload.capturedAt !== 'string' || !Number.isFinite(Date.parse(payload.capturedAt))) fail('capturedAt inválida.');
if (Date.parse(payload.capturedAt) > Date.now() + 5 * 60 * 1000) fail('capturedAt está no futuro.');
if (!Array.isArray(payload.items)) fail('items deve ser array.');

if (payload.environment === 'official' && typeof payload.sourceUrl === 'string' && !payload.sourceUrl.startsWith('https://resultados.tse.jus.br')) fail('feed de produção deve apontar para resultados.tse.jus.br.');
if (payload.integrity !== undefined) {
  if (!payload.integrity || typeof payload.integrity !== 'object') fail('integrity inválido.');
  const { sha256, jwsVerified } = payload.integrity ?? {};
  if (sha256 !== undefined && (typeof sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(sha256))) fail('integrity.sha256 inválido.');
  if (jwsVerified !== undefined && typeof jwsVerified !== 'boolean') fail('integrity.jwsVerified deve ser booleano.');
  if (payload.integrity.signatureStatus !== undefined && !['verified', 'not_verified', 'unavailable'].includes(payload.integrity.signatureStatus)) fail('integrity.signatureStatus inválido.');
}

for (const [index, item] of (payload.items ?? []).entries()) {
  if (!item || typeof item !== 'object') {
    fail(`item ${index} inválido.`);
    continue;
  }
  for (const key of ['validVotes', 'totalVotes']) {
    if (item[key] !== undefined && (typeof item[key] !== 'number' || !Number.isFinite(item[key]) || item[key] < 0)) {
      fail(`item ${index}: ${key} inválido.`);
    }
  }
  if (typeof item.validVotes === 'number' && typeof item.totalVotes === 'number' && item.validVotes > item.totalVotes) fail(`item ${index}: validVotes maior que totalVotes.`);
  if (item.municipality !== undefined && typeof item.municipality !== 'string') fail(`item ${index}: municipality inválido.`);
  if (item.candidateId !== undefined && typeof item.candidateId !== 'string') fail(`item ${index}: candidateId inválido.`);
  if (item.candidate !== undefined && typeof item.candidate !== 'string') fail(`item ${index}: candidate inválido.`);
  if (item.cargo !== undefined && typeof item.cargo !== 'string') fail(`item ${index}: cargo inválido.`);
  if (item.updatedAt !== undefined && !Number.isFinite(Date.parse(item.updatedAt))) fail(`item ${index}: updatedAt inválido.`);
}

if (payload.items.length === 0 && payload.state !== 'pending') warnings.push('Feed não finalizado sem registros: revisar captura antes de publicar.');
if (payload.state === 'live' && Date.parse(payload.capturedAt) < Date.now() - 15 * 60 * 1000) warnings.push('Feed marcado como live, mas a captura tem mais de 15 minutos; a UI deve tratá-lo como desatualizado.');

if (errors.length) {
  console.error(JSON.stringify({ valid: false, present: true, errors, warnings }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ valid: true, present: true, errors: [], warnings }, null, 2));
