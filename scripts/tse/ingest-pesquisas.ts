import { join } from 'node:path';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { TSEPesquisasFileSchema } from '../../src/schemas/tse-enriched.schema.ts';
import { extractZip, findFile, downloadFile, parseDate, readCsv, sha256File, valueOf, writeJson } from './common.ts';

const SOURCE_URL = 'https://cdn.tse.jus.br/estatistica/sead/odsele/pesquisa_eleitoral/pesquisa_eleitoral_2026.zip';
const tmpRoot = join(process.cwd(), '.tmp', 'tse-pesquisas');
const zipPath = join(tmpRoot, 'pesquisas-2026.zip');
const extractDir = join(tmpRoot, 'unzipped');
const outputPath = join(process.cwd(), 'generated', 'tse2026-pesquisas.json');
const municipios = new Set(['Águas Lindas de Goiás', 'Valparaíso de Goiás', 'Santo Antônio do Descoberto', 'Novo Gama', 'Planaltina']);

mkdirSync(tmpRoot, { recursive: true });
if (existsSync(extractDir)) rmSync(extractDir, { recursive: true, force: true });

await downloadFile(SOURCE_URL, zipPath);
extractZip(zipPath, extractDir);

const pesquisaPath = findFile(extractDir, /pesquisa.*\.csv$/i);
const rows = readCsv(pesquisaPath);
const capture = new Date().toISOString();

const pesquisas = rows.map(row => {
  const municipality = valueOf(row, ['NM_MUNICIPIO', 'MUNICIPIO']);
  return {
    idPesquisa: valueOf(row, ['NR_PESQUISA', 'ID_PESQUISA', 'SQ_PESQUISA']),
    registroTSE: valueOf(row, ['NR_REGISTRO', 'REGISTRO_TSE', 'NR_REGISTRO_TSE']),
    instituto: valueOf(row, ['NM_INSTITUTO', 'INSTITUTO']),
    contratante: valueOf(row, ['NM_CONTRATANTE', 'CONTRATANTE']),
    pagante: valueOf(row, ['NM_PAGANTE', 'PAGANTE'], false) || undefined,
    municipio: municipality,
    uf: valueOf(row, ['SG_UF', 'UF']),
    dataRegistro: parseDate(valueOf(row, ['DT_REGISTRO', 'DATA_REGISTRO'])),
    periodoColeta: {
      inicio: parseDate(valueOf(row, ['DT_INICIO_COLETA', 'DT_INICIO'])),
      fim: parseDate(valueOf(row, ['DT_FIM_COLETA', 'DT_FIM'])),
    },
    amostra: Number(valueOf(row, ['QT_ENTREVISTAS', 'NR_ENTREVISTAS', 'AMOSTRA'])),
    margemErro: Number(valueOf(row, ['VR_MARGEM_ERRO', 'MARGEM_ERRO']).replace(',', '.')),
    nivelConfianca: Number(valueOf(row, ['VR_NIVEL_CONFIANCA', 'NIVEL_CONFIANCA']).replace(',', '.')),
    tipo: valueOf(row, ['TP_PESQUISA', 'DS_TIPO_PESQUISA', 'TIPO_PESQUISA']),
    detalhamentoBairro: true,
    proveniencia: {
      fonte: 'TSE - Pesquisas Eleitorais 2026',
      urlOriginal: SOURCE_URL,
      capturaEm: capture,
      snapshotId: sha256File(zipPath),
      arquivoOrigem: zipPath,
    },
  };
}).filter(pesquisa => municipios.has(pesquisa.municipio));

const output = TSEPesquisasFileSchema.parse({
  versao: '1.0.0',
  estado: 'synced',
  geradoEm: capture,
  sourceUrl: SOURCE_URL,
  sourceHash: sha256File(zipPath),
  totalPesquisas: pesquisas.length,
  pesquisas,
});

writeJson(outputPath, output);
console.log('pesquisas: ' + output.totalPesquisas + ' registros');
