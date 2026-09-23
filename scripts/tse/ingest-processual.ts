import { join } from 'node:path';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { TSEProcessualFileSchema } from '../../src/schemas/tse-enriched.schema.ts';
import { extractZip, findFile, downloadFile, parseDate, readCsv, sha256File, valueOf, writeJson } from './common.ts';

const SOURCE_URL = 'https://cdn.tse.jus.br/estatistica/sead/odsele/processual/processo_eleitoral_2026.zip';
const DECISIONS_SOURCE_URL = 'https://cdn.tse.jus.br/estatistica/sead/odsele/processual/processos_eleitorais_decisoes_2026.zip';
const tmpRoot = join(process.cwd(), '.tmp', 'tse-processual');
const zipPath = join(tmpRoot, 'processual-2026.zip');
const decisionsZipPath = join(tmpRoot, 'decisoes-2026.zip');
const extractDir = join(tmpRoot, 'unzipped');
const decisionsExtractDir = join(tmpRoot, 'decisoes-unzipped');
const outputPath = join(process.cwd(), 'generated', 'tse2026-processual.json');
const municipios = new Set(['Águas Lindas de Goiás', 'Valparaíso de Goiás', 'Santo Antônio do Descoberto', 'Novo Gama', 'Planaltina'].map(value => value.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toUpperCase()));

mkdirSync(tmpRoot, { recursive: true });
if (existsSync(extractDir)) rmSync(extractDir, { recursive: true, force: true });
if (existsSync(decisionsExtractDir)) rmSync(decisionsExtractDir, { recursive: true, force: true });

await downloadFile(SOURCE_URL, zipPath);
extractZip(zipPath, extractDir);
await downloadFile(DECISIONS_SOURCE_URL, decisionsZipPath);
extractZip(decisionsZipPath, decisionsExtractDir);

const processoPath = findFile(extractDir, /processo.*eleitoral.*\.csv$/i);
const decisaoPath = findFile(decisionsExtractDir, /decis.*\.csv$/i);
const processos = readCsv(processoPath);
const decisoes = readCsv(decisaoPath);
const capture = new Date().toISOString();
const hash = sha256File(zipPath) + ':' + sha256File(decisionsZipPath);

const decisionByProcess = new Map<string, Array<{ data: string; descricao: string; tipo: string }>>();
for (const row of decisoes) {
  const number = valueOf(row, ['NR_PROCESSO', 'NUMERO_PROCESSO', 'PROCESSO']);
  const bucket = decisionByProcess.get(number) ?? [];
  bucket.push({
    data: parseDate(valueOf(row, ['DT_DECISAO', 'DT_MOVIMENTO', 'DATA'])),
    descricao: valueOf(row, ['DS_DECISAO', 'DESCRICAO', 'EMENTA'], false) || 'Movimentação registrada no arquivo oficial.',
    tipo: 'DECISAO',
  });
  decisionByProcess.set(number, bucket);
}

const outputRows = processos.map(row => {
  const municipio = valueOf(row, ['NM_MUNICIPIO', 'MUNICIPIO'], false);
  const municipioNormalizado = municipio.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').trim().replace(/\\s+/g, ' ').toUpperCase();
  if (!municipios.has(municipioNormalizado)) return null;
  const numeroProcesso = valueOf(row, ['NR_PROCESSO', 'NUMERO_PROCESSO', 'PROCESSO']);
  const baseDate = parseDate(valueOf(row, ['DT_AUTUACAO', 'DT_DISTRIBUICAO', 'DATA_DISTRIBUICAO']));
  const timeline = [
    {
      data: new Date(baseDate + 'T12:00:00Z').toISOString(),
      tipo: 'DISTRIBUICAO',
      descricao: 'Processo presente no arquivo oficial do PJE 2026.',
    },
    ...(decisionByProcess.get(numeroProcesso) ?? []).map(evento => ({
      data: new Date(evento.data + 'T12:00:00Z').toISOString(),
      tipo: evento.tipo,
      descricao: evento.descricao,
    })),
  ].sort((a, b) => a.data.localeCompare(b.data));
  const lastEvent = timeline[timeline.length - 1];
  return {
    numeroProcesso,
    classe: valueOf(row, ['DS_CLASSE', 'CLASSE']),
    assunto: valueOf(row, ['DS_ASSUNTO', 'ASSUNTO'], false) || 'Não informado',
    candidatoId: valueOf(row, ['SQ_CANDIDATO', 'CANDIDATO_ID'], false) || undefined,
    municipio,
    status: valueOf(row, ['DS_STATUS', 'STATUS'], false) || 'EM_TRAMITACAO',
    ultimaMovimentacaoEm: lastEvent.data,
    timeline,
    pjeUrl: 'https://pje.tse.jus.br/',
    proveniencia: {
      fonte: 'TSE - Processual 2026',
      urlOriginal: SOURCE_URL,
      capturaEm: capture,
      snapshotId: hash,
      arquivoOrigem: zipPath,
    },
  };
}).filter((row): row is NonNullable<typeof row> => row !== null);

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
console.log('processual: ' + output.totalProcessos + ' registros');
