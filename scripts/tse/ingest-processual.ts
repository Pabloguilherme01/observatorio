import { join } from 'node:path';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { TSEProcessualFileSchema } from '../../src/schemas/tse-enriched.schema.ts';
import { extractZip, findFile, downloadFile, normalizeLabel, parseDate, readCsv, readJson, sha256Files, valueOf, writeJson } from './common.ts';

interface CandidateRecord {
  readonly sqCandidate: string;
  readonly name: string;
}

interface CandidateSnapshot {
  readonly matched: readonly CandidateRecord[];
}

const SOURCE_URL = 'https://cdn.tse.jus.br/estatistica/sead/odsele/processual/processo_eleitoral_2026.zip';
const PARTS_SOURCE_URL = 'https://cdn.tse.jus.br/estatistica/sead/odsele/processual/processos_eleitorais_partes_2026.zip';
const DECISIONS_SOURCE_URL = 'https://cdn.tse.jus.br/estatistica/sead/odsele/processual/processos_eleitorais_decisoes_2026.zip';

const tmpRoot = join(process.cwd(), '.tmp', 'tse-processual');
const zipPath = join(tmpRoot, 'processual-2026.zip');
const partsZipPath = join(tmpRoot, 'partes-2026.zip');
const decisionsZipPath = join(tmpRoot, 'decisoes-2026.zip');
const extractDir = join(tmpRoot, 'unzipped');
const partsExtractDir = join(tmpRoot, 'partes-unzipped');
const decisionsExtractDir = join(tmpRoot, 'decisoes-unzipped');
const outputPath = join(process.cwd(), 'generated', 'tse2026-processual.json');

mkdirSync(tmpRoot, { recursive: true });
for (const directory of [extractDir, partsExtractDir, decisionsExtractDir]) {
  if (existsSync(directory)) rmSync(directory, { recursive: true, force: true });
}

await downloadFile(SOURCE_URL, zipPath);
extractZip(zipPath, extractDir);
await downloadFile(PARTS_SOURCE_URL, partsZipPath);
extractZip(partsZipPath, partsExtractDir);
await downloadFile(DECISIONS_SOURCE_URL, decisionsZipPath);
extractZip(decisionsZipPath, decisionsExtractDir);

const processoPath = findFile(extractDir, /processo.*eleitoral.*\.csv$/i);
const partsPath = findFile(partsExtractDir, /parte.*\.csv$/i);
const decisaoPath = findFile(decisionsExtractDir, /decis.*\.csv$/i);

const processos = readCsv(processoPath);
const partes = readCsv(partsPath);
const decisoes = readCsv(decisaoPath);

const processHeaders = Object.keys(processos[0] ?? {}).sort();
const partsHeaders = Object.keys(partes[0] ?? {}).sort();
console.log('[TSE] headers processo:', processHeaders.join(', '));
console.log('[TSE] headers partes:', partsHeaders.join(', '));

const candidateSnapshot = readJson<CandidateSnapshot>('src/data/generated/tse2026-candidates.json');
const watchById = new Map(candidateSnapshot.matched.map(candidate => [candidate.sqCandidate, candidate]));
const watchByName = new Map(candidateSnapshot.matched.map(candidate => [normalizeLabel(candidate.name), candidate]));

const processNumbersByCandidate = new Map<string, Set<string>>();

for (const row of partes) {
  const processNumber = valueOf(row, ['NR_PROCESSO', 'NUMERO_PROCESSO', 'PROCESSO'], false);
  if (!processNumber) continue;

  const candidateId = valueOf(row, ['SQ_CANDIDATO', 'CANDIDATO_ID', 'ID_CANDIDATO'], false);
  const partyName = valueOf(row, ['NM_PARTE', 'NOME_PARTE', 'NM_PARTE_ORIGEM', 'NM_PARTE_PRINCIPAL'], false);
  const candidate = watchById.get(candidateId) ?? watchByName.get(normalizeLabel(partyName));

  if (!candidate) continue;

  const set = processNumbersByCandidate.get(candidate.sqCandidate) ?? new Set<string>();
  set.add(processNumber);
  processNumbersByCandidate.set(candidate.sqCandidate, set);
}

console.log('[TSE] processos associados à watchlist:', [...processNumbersByCandidate.values()].reduce((sum, set) => sum + set.size, 0));

if (processNumbersByCandidate.size === 0) {
  throw new Error(
    'Nenhum processo foi associado à watchlist. Cabeçalhos partes=' +
      partsHeaders.join(', ') +
      '. Não é permitido promover um snapshot processual sem ligação documental verificável.'
  );
}

const allWatchProcessNumbers = new Set<string>();
for (const numbers of processNumbersByCandidate.values()) {
  for (const number of numbers) allWatchProcessNumbers.add(number);
}

const capture = new Date().toISOString();
const hash = sha256Files([zipPath, partsZipPath, decisionsZipPath]);

const decisionByProcess = new Map<string, Array<{ data: string; descricao: string; tipo: string }>>();
for (const row of decisoes) {
  const number = valueOf(row, ['NR_PROCESSO', 'NUMERO_PROCESSO', 'PROCESSO'], false);
  if (!number) continue;
  const bucket = decisionByProcess.get(number) ?? [];
  bucket.push({
    data: parseDate(valueOf(row, ['DT_DECISAO', 'DT_MOVIMENTO', 'DATA'])),
    descricao: valueOf(row, ['DS_DECISAO', 'DESCRICAO', 'EMENTA'], false) || 'Movimentação registrada no arquivo oficial.',
    tipo: 'DECISAO',
  });
  decisionByProcess.set(number, bucket);
}

const outputRows = processos
  .map(row => {
    const numeroProcesso = valueOf(row, ['NR_PROCESSO', 'NUMERO_PROCESSO', 'PROCESSO'], false);
    if (!numeroProcesso || !allWatchProcessNumbers.has(numeroProcesso)) return null;

    const baseDate = parseDate(valueOf(row, ['DT_AUTUACAO', 'DT_DISTRIBUICAO', 'DATA_DISTRIBUICAO']));
    const timeline = [
      {
        data: new Date(baseDate + 'T12:00:00Z').toISOString(),
        tipo: 'DISTRIBUICAO',
        descricao: 'Processo presente no arquivo oficial do PJE 2026 e ligado à watchlist por registro de partes.',
      },
      ...(decisionByProcess.get(numeroProcesso) ?? []).map(evento => ({
        data: new Date(evento.data + 'T12:00:00Z').toISOString(),
        tipo: evento.tipo,
        descricao: evento.descricao,
      })),
    ].sort((a, b) => a.data.localeCompare(b.data));

    const lastEvent = timeline[timeline.length - 1];
    const candidateId = [...processNumbersByCandidate.entries()]
      .find(([, numbers]) => numbers.has(numeroProcesso))?.[0];

    return {
      numeroProcesso,
      classe: valueOf(row, ['DS_CLASSE', 'CLASSE'], false) || valueOf(row, ['SG_CLASSE'], false) || 'Não informado',
      assunto: valueOf(row, ['DS_ASSUNTO_PRINCIPAL', 'DS_ASSUNTO', 'ASSUNTO'], false) || 'Não informado',
      candidatoId: candidateId,
      municipio: undefined,
      escopo: 'GO · processos associados à watchlist operacional',
      status: valueOf(row, ['DS_STATUS', 'STATUS', 'ST_RECURSAL'], false) || 'EM_TRAMITACAO',
      ultimaMovimentacaoEm: lastEvent.data,
      timeline,
      pjeUrl: valueOf(row, ['DS_URL_PROCESSO'], false) || 'https://pje.tse.jus.br/',
      proveniencia: {
        fonte: 'TSE - Processual 2026',
        urlOriginal: SOURCE_URL,
        capturaEm: capture,
        snapshotId: hash,
        arquivoOrigem: zipPath,
      },
    };
  })
  .filter((row): row is NonNullable<typeof row> => row !== null);

if (outputRows.length === 0) {
  throw new Error('A ligação entre processos e watchlist não produziu registros no arquivo principal.');
}

const output = TSEProcessualFileSchema.parse({
  versao: '1.0.0',
  estado: 'synced',
  geradoEm: capture,
  sourceUrl: SOURCE_URL,
  sourceHash: hash,
  totalProcessos: outputRows.length,
  processos: outputRows,
});

writeJson(outputPath, output);
console.log('processual: ' + output.totalProcessos + ' registros · sha256 ' + hash);
